import { Exam } from '../../models/Exam.js';
import { ExamSession } from '../../models/ExamSession.js';
import { ExamSubmission } from '../../models/ExamSubmission.js';
import { Workspace } from '../../models/Workspace.js';
import { Enrollment } from '../../models/Enrollment.js';
import { ProctoringEvent } from '../../models/ProctoringEvent.js';
import { runDockerSandbox } from '../execution/dockerService.js';
import { runAssignmentTests } from '../execution/testRunner.js';
import { maskHiddenTests } from '../execution/executionSecurity.js';
import { LANGUAGE_RUNTIMES } from '../execution/languageRuntimes.js';

function getUniversityId(user) {
  return (user?.universityId?._id || user?.universityId)?.toString();
}

function getUserId(user) {
  return (user?._id || user?.id)?.toString();
}

export class ExamSessionService {
  /**
   * Start or resume an exam session for a student
   */
  async startExam(user, examId) {
    const universityId = getUniversityId(user);
    const userId = getUserId(user);

    const exam = await Exam.findById(examId);
    if (!exam || exam.universityId.toString() !== universityId) {
      const err = new Error('Exam not found');
      err.statusCode = 404;
      throw err;
    }

    if (exam.status === 'DRAFT' || exam.status === 'ARCHIVED') {
      const err = new Error('Exam is not currently open for students');
      err.statusCode = 400;
      throw err;
    }

    // Check enrollment
    const enrollment = await Enrollment.findOne({
      studentId: userId,
      courseId: exam.courseId,
      status: 'ACTIVE',
    });

    if (!enrollment && user.role === 'STUDENT') {
      const err = new Error('You are not enrolled in the course for this examination');
      err.statusCode = 403;
      throw err;
    }

    // Check if student already has an active session (idempotent resume for browser refresh/crash)
    const existingActive = await ExamSession.findOne({
      examId,
      studentId: userId,
      status: 'IN_PROGRESS',
    });

    if (existingActive) {
      // Check if deadline passed while away
      if (existingActive.deadlineAt && new Date(existingActive.deadlineAt).getTime() <= Date.now()) {
        await this.autoSubmitSession(existingActive._id);
        const err = new Error('Your exam deadline has expired. Your work was automatically submitted.');
        err.statusCode = 410;
        throw err;
      }
      return this.formatSessionResponse(existingActive, exam, user);
    }

    // Check attempt limits
    const pastAttemptsCount = await ExamSession.countDocuments({
      examId,
      studentId: userId,
      status: { $in: ['SUBMITTED', 'AUTO_SUBMITTED', 'TERMINATED'] },
    });

    if (pastAttemptsCount >= (exam.maxAttempts || 1)) {
      const err = new Error(`Maximum attempts (${exam.maxAttempts}) reached for this examination`);
      err.statusCode = 400;
      throw err;
    }

    // Server-Authoritative Timing
    const startedAt = new Date();
    const durationMs = (exam.durationMinutes || 60) * 60 * 1000;
    let deadlineTime = startedAt.getTime() + durationMs;

    if (exam.endAt) {
      const examEndTime = new Date(exam.endAt).getTime();
      if (examEndTime < deadlineTime) {
        deadlineTime = examEndTime;
      }
    }
    const deadlineAt = new Date(deadlineTime);

    // Question Ordering & Workspaces Creation
    const questionsList = [...(exam.questions || [])];
    if (exam.randomizeQuestions) {
      questionsList.sort(() => Math.random() - 0.5);
    }

    // Pre-create session to have session._id for workspace associations
    const session = new ExamSession({
      universityId,
      examId,
      studentId: userId,
      attemptNumber: pastAttemptsCount + 1,
      status: 'IN_PROGRESS',
      startedAt,
      deadlineAt,
      lastHeartbeatAt: startedAt,
      connectionStatus: 'ONLINE',
      currentQuestionIndex: 0,
      maxScore: exam.totalMarks || 100,
      proctoringSessionId: `proc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    });

    // Create a dedicated exam workspace for each question in this attempt
    const sessionQuestions = [];
    for (let i = 0; i < questionsList.length; i++) {
      const q = questionsList[i];
      const snapshot = q.snapshot || {};
      const lang = snapshot.allowedLanguages?.[0] || 'PYTHON';
      const initialCode =
        snapshot.starterCode instanceof Map
          ? snapshot.starterCode.get(lang) || ''
          : snapshot.starterCode?.[lang] || '';

      const entryFileName =
        LANGUAGE_RUNTIMES[lang]?.defaultEntryFile ||
        (lang === 'PYTHON' ? 'main.py' : lang === 'JAVASCRIPT' ? 'index.js' : 'Solution.java');

      const ws = await Workspace.create({
        universityId,
        ownerId: userId,
        courseId: exam.courseId,
        name: `${exam.title} - Question ${i + 1}`,
        type: 'EXAM',
        examId: exam._id,
        examSessionId: session._id,
        examQuestionId: q.questionId,
        language: lang,
        files: [
          {
            path: entryFileName,
            name: entryFileName,
            content: initialCode,
            language: lang.toLowerCase(),
            isEntry: true,
          },
          {
            path: 'README.md',
            name: 'README.md',
            content: `# ${snapshot.title || 'Exam Question'}\n\n${snapshot.description || ''}\n\n### Instructions\n${snapshot.instructions || ''}\n\n### Constraints\n${snapshot.constraints || 'Standard constraints apply.'}`,
            language: 'markdown',
            isEntry: false,
          },
        ],
        activeFilePath: entryFileName,
        revision: 1,
      });

      sessionQuestions.push({
        questionId: q.questionId,
        workspaceId: ws._id,
        order: i + 1,
        status: 'NOT_STARTED',
        latestRevision: 1,
        maxPoints: q.marks || 10,
        score: 0,
      });
    }

    session.questions = sessionQuestions;
    await session.save();

    // Log EXAM_STARTED proctoring event
    await ProctoringEvent.create({
      universityId,
      examId,
      sessionId: session._id,
      studentId: userId,
      type: 'EXAM_STARTED',
      severity: 'INFO',
      metadata: { attemptNumber: session.attemptNumber },
    });

    return this.formatSessionResponse(session, exam, user);
  }

  /**
   * Get active exam session with server-authoritative time remaining
   */
  async getSession(user, sessionId) {
    const universityId = getUniversityId(user);
    const userId = getUserId(user);

    const session = await ExamSession.findById(sessionId);
    if (!session || session.universityId.toString() !== universityId) {
      const err = new Error('Exam session not found');
      err.statusCode = 404;
      throw err;
    }

    if (user.role === 'STUDENT' && session.studentId.toString() !== userId) {
      const err = new Error('Unauthorized session access');
      err.statusCode = 403;
      throw err;
    }

    const exam = await Exam.findById(session.examId);

    // Server-Authoritative Timer Expiration Check
    if (session.status === 'IN_PROGRESS' && session.deadlineAt && new Date(session.deadlineAt).getTime() <= Date.now()) {
      await this.autoSubmitSession(session._id);
      session.status = 'AUTO_SUBMITTED';
    }

    return this.formatSessionResponse(session, exam, user);
  }

  /**
   * Periodic heartbeat from exam client to update presence and verify timer
   */
  async recordHeartbeat(user, sessionId) {
    const universityId = getUniversityId(user);
    const userId = getUserId(user);

    const session = await ExamSession.findById(sessionId);
    if (!session || session.universityId.toString() !== universityId) {
      const err = new Error('Session not found');
      err.statusCode = 404;
      throw err;
    }

    if (user.role === 'STUDENT' && session.studentId.toString() !== userId) {
      const err = new Error('Unauthorized session access');
      err.statusCode = 403;
      throw err;
    }

    // Check if deadline passed
    if (session.status === 'IN_PROGRESS' && session.deadlineAt && new Date(session.deadlineAt).getTime() <= Date.now()) {
      await this.autoSubmitSession(session._id);
      return {
        sessionStatus: 'AUTO_SUBMITTED',
        isExpired: true,
        remainingSeconds: 0,
        serverTime: new Date().toISOString(),
      };
    }

    session.lastHeartbeatAt = new Date();
    session.connectionStatus = 'ONLINE';
    await session.save();

    const remainingSeconds = session.deadlineAt
      ? Math.max(0, Math.floor((new Date(session.deadlineAt).getTime() - Date.now()) / 1000))
      : 0;

    return {
      sessionStatus: session.status,
      isExpired: false,
      remainingSeconds,
      serverTime: new Date().toISOString(),
    };
  }

  /**
   * Submit examination answers (manual or auto-submit)
   */
  async submitExam(user, sessionId, submissionType = 'MANUAL') {
    const universityId = getUniversityId(user);
    const userId = getUserId(user);

    const session = await ExamSession.findById(sessionId);
    if (!session || session.universityId.toString() !== universityId) {
      const err = new Error('Exam session not found');
      err.statusCode = 404;
      throw err;
    }

    if (user.role === 'STUDENT' && session.studentId.toString() !== userId) {
      const err = new Error('Unauthorized session submission');
      err.statusCode = 403;
      throw err;
    }

    if (session.status !== 'IN_PROGRESS') {
      const err = new Error(`Exam already submitted or closed (Status: ${session.status})`);
      err.statusCode = 400;
      throw err;
    }

    return this.autoSubmitSession(session._id, submissionType);
  }

  /**
   * Internal auto-submit or finalizer method
   */
  async autoSubmitSession(sessionId, submissionType = 'AUTO_SUBMITTED') {
    const session = await ExamSession.findById(sessionId);
    if (!session || session.status !== 'IN_PROGRESS') {
      return session;
    }

    const exam = await Exam.findById(session.examId);
    const submittedAt = new Date();
    const finalAnswers = [];
    let totalScore = 0;

    // Collect snapshots from each question workspace
    for (const sq of session.questions) {
      const ws = await Workspace.findById(sq.workspaceId);
      const wsFiles = ws ? ws.files.map((f) => ({ path: f.path, content: f.content })) : [];
      const rev = ws ? ws.revision : sq.latestRevision || 1;
      const lang = ws ? ws.language : 'PYTHON';

      totalScore += sq.score || 0;

      finalAnswers.push({
        questionId: sq.questionId,
        workspaceId: sq.workspaceId,
        workspaceRevision: rev,
        files: wsFiles,
        language: lang,
        score: sq.score || 0,
        maxScore: sq.maxPoints || 10,
        executionResult: sq.lastExecutionResult || null,
      });
    }

    // Create immutable historical ExamSubmission
    const examSubmission = await ExamSubmission.create({
      universityId: session.universityId,
      examId: session.examId,
      sessionId: session._id,
      studentId: session.studentId,
      attemptNumber: session.attemptNumber,
      submissionType,
      submittedAt,
      answers: finalAnswers,
      totalAutomatedScore: totalScore,
      maxScore: session.maxScore || 100,
    });

    // Update session status to SUBMITTED or AUTO_SUBMITTED
    session.status = submissionType === 'MANUAL' ? 'SUBMITTED' : 'AUTO_SUBMITTED';
    session.submittedAt = submittedAt;
    session.score = totalScore;
    await session.save();

    // Record submission proctoring event
    await ProctoringEvent.create({
      universityId: session.universityId,
      examId: session.examId,
      sessionId: session._id,
      studentId: session.studentId,
      type: submissionType === 'MANUAL' ? 'EXAM_SUBMITTED' : 'AUTO_SUBMITTED',
      severity: 'INFO',
      metadata: { totalScore, maxScore: session.maxScore },
    });

    return {
      success: true,
      submissionId: examSubmission._id,
      status: session.status,
      submittedAt: session.submittedAt,
      score: totalScore,
      maxScore: session.maxScore,
    };
  }

  /**
   * Execute code for a specific exam question inside Docker sandbox
   */
  async executeQuestion(user, sessionId, questionId, { mode = 'RUN', stdinInput = '' }) {
    const universityId = getUniversityId(user);
    const userId = getUserId(user);

    const session = await ExamSession.findById(sessionId);
    if (!session || session.universityId.toString() !== universityId) {
      const err = new Error('Session not found');
      err.statusCode = 404;
      throw err;
    }

    if (user.role === 'STUDENT' && session.studentId.toString() !== userId) {
      const err = new Error('Unauthorized execution in session');
      err.statusCode = 403;
      throw err;
    }

    if (session.status !== 'IN_PROGRESS') {
      const err = new Error('Cannot execute code: Exam session is not in progress');
      err.statusCode = 400;
      throw err;
    }

    // Check server deadline
    if (session.deadlineAt && new Date(session.deadlineAt).getTime() <= Date.now()) {
      await this.autoSubmitSession(session._id);
      const err = new Error('Exam deadline reached. Execution is disabled.');
      err.statusCode = 410;
      throw err;
    }

    const exam = await Exam.findById(session.examId);
    if (exam && !exam.allowStudentExecution) {
      const err = new Error('Code execution is disabled for this examination');
      err.statusCode = 403;
      throw err;
    }

    const sq = session.questions.find((q) => q.questionId.toString() === questionId.toString());
    if (!sq) {
      const err = new Error('Question not found in session');
      err.statusCode = 404;
      throw err;
    }

    const workspace = await Workspace.findById(sq.workspaceId);
    if (!workspace) {
      const err = new Error('Question workspace not found');
      err.statusCode = 404;
      throw err;
    }

    // Find question snapshot from exam
    const examQ = exam.questions.find((eq) => eq.questionId.toString() === questionId.toString());
    const testCases = examQ?.snapshot?.testCases || [];

    let execResult;

    if (mode === 'TEST' && testCases.length > 0) {
      // Run automated test suite
      execResult = await runAssignmentTests({
        jobId: `exam_${session._id}_${questionId}_${Date.now()}`,
        language: workspace.language,
        files: workspace.files,
        testCases,
        timeoutMs: 5000,
      });

      // Update question score and status
      const earned = execResult.summary.earnedPoints || 0;
      sq.score = earned;
      sq.status = 'ANSWERED';
      sq.lastExecutionResult = execResult;
      await session.save();

      // Mask hidden tests for student
      if (user.role === 'STUDENT') {
        execResult.tests = maskHiddenTests(execResult.tests);
      }
    } else {
      // Single run
      execResult = await runDockerSandbox({
        jobId: `exam_${session._id}_${questionId}_${Date.now()}`,
        language: workspace.language,
        files: workspace.files,
        stdinInput,
        timeoutMs: 5000,
      });
      sq.status = 'IN_PROGRESS';
      await session.save();
    }

    // Record CODE_EXECUTED proctoring event
    await ProctoringEvent.create({
      universityId,
      examId: session.examId,
      sessionId: session._id,
      studentId: userId,
      type: 'CODE_EXECUTED',
      severity: 'INFO',
      metadata: { questionId, mode },
    });

    return {
      success: true,
      result: execResult,
    };
  }

  /**
   * Teacher score override and feedback
   */
  async overrideScore(user, sessionId, { score, feedback, reason }) {
    const universityId = getUniversityId(user);
    const userId = getUserId(user);

    const session = await ExamSession.findById(sessionId);
    if (!session || session.universityId.toString() !== universityId) {
      const err = new Error('Session not found');
      err.statusCode = 404;
      throw err;
    }

    const previousScore = session.finalGrade ?? session.score ?? 0;
    session.finalGrade = score;
    session.isEvaluated = true;
    session.evaluatedBy = userId;
    session.evaluatedAt = new Date();
    if (feedback) session.teacherFeedback = feedback;

    session.teacherOverrides.push({
      teacherId: userId,
      previousScore,
      newScore: score,
      reason: reason || 'Manual instructor adjustment',
      timestamp: new Date(),
    });

    await session.save();

    // Also update ExamSubmission if exists
    await ExamSubmission.findOneAndUpdate(
      { sessionId: session._id },
      {
        finalGrade: score,
        isEvaluated: true,
        evaluatedBy: userId,
        evaluatedAt: new Date(),
        feedback: feedback || '',
      }
    );

    return {
      success: true,
      session,
    };
  }

  /**
   * Formats session response for client with security masking
   */
  formatSessionResponse(session, exam, user) {
    const remainingSeconds = session.deadlineAt
      ? Math.max(0, Math.floor((new Date(session.deadlineAt).getTime() - Date.now()) / 1000))
      : 0;

    const sessionObj = session.toObject();

    // Embed question details from exam snapshot
    const questionDetails = (sessionObj.questions || []).map((sq) => {
      const examQ = exam?.questions?.find((eq) => eq.questionId.toString() === sq.questionId.toString());
      const snapshot = examQ?.snapshot || {};

      let safeTestCases = snapshot.testCases || [];
      if (user.role === 'STUDENT') {
        safeTestCases = safeTestCases.map((tc) => ({
          name: tc.name,
          points: tc.points,
          isHidden: tc.isHidden,
          input: tc.isHidden ? '[HIDDEN_TEST_CASE]' : tc.input,
          expectedOutput: tc.isHidden ? '[HIDDEN_TEST_CASE]' : tc.expectedOutput,
        }));
      }

      return {
        ...sq,
        title: snapshot.title,
        description: snapshot.description,
        instructions: snapshot.instructions,
        inputDescription: snapshot.inputDescription,
        outputDescription: snapshot.outputDescription,
        constraints: snapshot.constraints,
        difficulty: snapshot.difficulty,
        allowedLanguages: snapshot.allowedLanguages,
        testCases: safeTestCases,
      };
    });

    return {
      session: {
        id: sessionObj._id,
        examId: sessionObj.examId,
        studentId: sessionObj.studentId,
        attemptNumber: sessionObj.attemptNumber,
        status: sessionObj.status,
        startedAt: sessionObj.startedAt,
        deadlineAt: sessionObj.deadlineAt,
        submittedAt: sessionObj.submittedAt,
        remainingSeconds,
        serverTime: new Date().toISOString(),
        currentQuestionIndex: sessionObj.currentQuestionIndex,
        questions: questionDetails,
        proctoringStats: sessionObj.proctoringStats,
        score: sessionObj.score,
        maxScore: sessionObj.maxScore,
        finalGrade: sessionObj.finalGrade,
        isEvaluated: sessionObj.isEvaluated,
        teacherFeedback: sessionObj.teacherFeedback,
      },
      exam: {
        id: exam?._id,
        title: exam?.title,
        durationMinutes: exam?.durationMinutes,
        proctoringMode: exam?.proctoringMode,
        requireFullscreen: exam?.requireFullscreen,
        requireCamera: exam?.requireCamera,
        requireMicrophone: exam?.requireMicrophone,
        allowTerminal: exam?.allowTerminal,
        allowCopyPaste: exam?.allowCopyPaste,
        allowStudentExecution: exam?.allowStudentExecution,
        showResultsAfterSubmit: exam?.showResultsAfterSubmit,
      },
    };
  }
}

export const examSessionService = new ExamSessionService();
