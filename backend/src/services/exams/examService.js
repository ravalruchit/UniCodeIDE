import { Exam } from '../../models/Exam.js';
import { QuestionBank } from '../../models/QuestionBank.js';
import { Enrollment } from '../../models/Enrollment.js';
import { ExamSession } from '../../models/ExamSession.js';

function getUniversityId(user) {
  return (user?.universityId?._id || user?.universityId)?.toString();
}

function getUserId(user) {
  return (user?._id || user?.id)?.toString();
}

export class ExamService {
  // ===================== QUESTION BANK =====================

  async createQuestion(user, data) {
    const universityId = getUniversityId(user);
    const userId = getUserId(user);

    const question = await QuestionBank.create({
      ...data,
      universityId,
      createdBy: userId,
    });

    return question;
  }

  async getQuestions(user, filters = {}) {
    const universityId = getUniversityId(user);
    const query = { universityId, isArchived: false };

    if (filters.courseId) query.courseId = filters.courseId;
    if (filters.difficulty) query.difficulty = filters.difficulty;
    if (filters.type) query.type = filters.type;
    if (filters.tag) query.tags = filters.tag;

    return QuestionBank.find(query).sort({ createdAt: -1 });
  }

  async getQuestionById(user, questionId) {
    const universityId = getUniversityId(user);
    const question = await QuestionBank.findById(questionId);

    if (!question || question.universityId.toString() !== universityId) {
      const err = new Error('Question not found');
      err.statusCode = 404;
      throw err;
    }

    return question;
  }

  async updateQuestion(user, questionId, data) {
    const universityId = getUniversityId(user);
    const question = await QuestionBank.findById(questionId);

    if (!question || question.universityId.toString() !== universityId) {
      const err = new Error('Question not found');
      err.statusCode = 404;
      throw err;
    }

    Object.assign(question, data);
    return question.save();
  }

  // ===================== EXAMS =====================

  async createExam(user, data) {
    const universityId = getUniversityId(user);
    const userId = getUserId(user);

    const exam = await Exam.create({
      ...data,
      universityId,
      createdBy: userId,
      status: 'DRAFT',
    });

    return exam;
  }

  async updateExam(user, examId, data) {
    const universityId = getUniversityId(user);
    const exam = await Exam.findById(examId);

    if (!exam || exam.universityId.toString() !== universityId) {
      const err = new Error('Exam not found');
      err.statusCode = 404;
      throw err;
    }

    if (exam.status === 'ARCHIVED' || exam.status === 'ENDED') {
      const err = new Error(`Cannot modify exam in ${exam.status} state`);
      err.statusCode = 400;
      throw err;
    }

    // Update fields
    const allowedUpdates = [
      'title',
      'description',
      'instructions',
      'type',
      'startAt',
      'endAt',
      'durationMinutes',
      'passingMarks',
      'maxAttempts',
      'randomizeQuestions',
      'allowLateEntry',
      'lateEntryMinutes',
      'autoSubmit',
      'showResultsAfterSubmit',
      'allowStudentExecution',
      'allowTerminal',
      'allowCopyPaste',
      'requireFullscreen',
      'requireCamera',
      'requireMicrophone',
      'proctoringMode',
      'questions',
    ];

    for (const key of allowedUpdates) {
      if (data[key] !== undefined) {
        exam[key] = data[key];
      }
    }

    if (data.questions) {
      exam.totalMarks = exam.questions.reduce((sum, q) => sum + (q.marks || 10), 0);
    }

    return exam.save();
  }

  async getExams(user, filters = {}) {
    const universityId = getUniversityId(user);
    const userId = getUserId(user);
    const query = { universityId };

    if (filters.courseId) query.courseId = filters.courseId;
    if (filters.status) query.status = filters.status;

    // If student, only return published/scheduled/live exams for enrolled courses
    if (user.role === 'STUDENT') {
      const enrollments = await Enrollment.find({ studentId: userId, status: 'ACTIVE' }).select('courseId');
      const enrolledCourseIds = enrollments.map((e) => e.courseId);

      query.courseId = { $in: enrolledCourseIds };
      query.status = { $in: ['SCHEDULED', 'LIVE', 'ENDED'] };
    }

    const exams = await Exam.find(query).populate('courseId', 'name code').sort({ createdAt: -1 });

    if (user.role === 'STUDENT') {
      const examIds = exams.map((e) => e._id);
      const sessions = await ExamSession.find({
        examId: { $in: examIds },
        studentId: userId,
      }).sort({ createdAt: -1 });

      const sessionsByExam = {};
      sessions.forEach((s) => {
        const eid = s.examId.toString();
        if (!sessionsByExam[eid]) sessionsByExam[eid] = [];
        sessionsByExam[eid].push(s);
      });

      return exams.map((exam) => {
        const examObj = exam.toObject();
        const studentExamSessions = sessionsByExam[exam._id.toString()] || [];
        const activeSession = studentExamSessions.find((s) => s.status === 'IN_PROGRESS');
        const completedSessions = studentExamSessions.filter((s) =>
          ['SUBMITTED', 'AUTO_SUBMITTED', 'TERMINATED'].includes(s.status)
        );

        const attemptsUsed = completedSessions.length;
        const maxAttempts = exam.maxAttempts || 1;
        const isExpired = activeSession?.deadlineAt && new Date(activeSession.deadlineAt).getTime() <= Date.now();
        const hasActiveSession = Boolean(activeSession && !isExpired);

        examObj.studentSession = activeSession
          ? {
              id: activeSession._id,
              status: activeSession.status,
              attemptNumber: activeSession.attemptNumber,
              startedAt: activeSession.startedAt,
              deadlineAt: activeSession.deadlineAt,
            }
          : studentExamSessions[0]
          ? {
              id: studentExamSessions[0]._id,
              status: studentExamSessions[0].status,
              attemptNumber: studentExamSessions[0].attemptNumber,
              totalScore: studentExamSessions[0].totalScore,
              maxScore: studentExamSessions[0].maxScore,
              finalGrade: studentExamSessions[0].finalGrade,
              submittedAt: studentExamSessions[0].submittedAt,
            }
          : null;

        examObj.attemptsUsed = attemptsUsed;
        examObj.maxAttempts = maxAttempts;
        examObj.hasActiveSession = hasActiveSession;
        examObj.canAttempt = (exam.status === 'LIVE') && (hasActiveSession || attemptsUsed < maxAttempts);

        return examObj;
      });
    }

    return exams;
  }

  async getExamById(user, examId) {
    const universityId = getUniversityId(user);
    const userId = getUserId(user);
    const exam = await Exam.findById(examId).populate('courseId', 'name code');

    if (!exam || exam.universityId.toString() !== universityId) {
      const err = new Error('Exam not found');
      err.statusCode = 404;
      throw err;
    }

    const examObj = exam.toObject();

    // If student, mask hidden test cases in question snapshots and enrich with attempt info
    if (user.role === 'STUDENT') {
      if (examObj.questions) {
        examObj.questions.forEach((q) => {
          if (q.snapshot?.testCases) {
            q.snapshot.testCases = q.snapshot.testCases.map((tc) => ({
              name: tc.name,
              points: tc.points,
              isHidden: tc.isHidden,
              input: tc.isHidden ? '[HIDDEN_TEST_CASE]' : tc.input,
              expectedOutput: tc.isHidden ? '[HIDDEN_TEST_CASE]' : tc.expectedOutput,
            }));
          }
        });
      }

      const sessions = await ExamSession.find({
        examId,
        studentId: userId,
      }).sort({ createdAt: -1 });

      const activeSession = sessions.find((s) => s.status === 'IN_PROGRESS');
      const completedSessions = sessions.filter((s) =>
        ['SUBMITTED', 'AUTO_SUBMITTED', 'TERMINATED'].includes(s.status)
      );

      const attemptsUsed = completedSessions.length;
      const maxAttempts = exam.maxAttempts || 1;
      const isExpired = activeSession?.deadlineAt && new Date(activeSession.deadlineAt).getTime() <= Date.now();
      const hasActiveSession = Boolean(activeSession && !isExpired);

      examObj.studentSession = activeSession
        ? {
            id: activeSession._id,
            status: activeSession.status,
            attemptNumber: activeSession.attemptNumber,
            startedAt: activeSession.startedAt,
            deadlineAt: activeSession.deadlineAt,
          }
        : sessions[0]
        ? {
            id: sessions[0]._id,
            status: sessions[0].status,
            attemptNumber: sessions[0].attemptNumber,
            totalScore: sessions[0].totalScore,
            maxScore: sessions[0].maxScore,
            finalGrade: sessions[0].finalGrade,
            submittedAt: sessions[0].submittedAt,
          }
        : null;

      examObj.attemptsUsed = attemptsUsed;
      examObj.maxAttempts = maxAttempts;
      examObj.hasActiveSession = hasActiveSession;
      examObj.canAttempt = (exam.status === 'LIVE') && (hasActiveSession || attemptsUsed < maxAttempts);
    }

    return examObj;
  }

  async publishExam(user, examId) {
    const universityId = getUniversityId(user);
    const exam = await Exam.findById(examId);

    if (!exam || exam.universityId.toString() !== universityId) {
      const err = new Error('Exam not found');
      err.statusCode = 404;
      throw err;
    }

    if (!exam.questions || exam.questions.length === 0) {
      const err = new Error('Cannot publish an exam with no questions attached');
      err.statusCode = 400;
      throw err;
    }

    // Snapshot all questions from QuestionBank to freeze them
    for (let i = 0; i < exam.questions.length; i++) {
      const eq = exam.questions[i];
      const qbItem = await QuestionBank.findById(eq.questionId);
      if (qbItem) {
        eq.snapshot = {
          title: qbItem.title,
          description: qbItem.description,
          instructions: qbItem.instructions,
          inputDescription: qbItem.inputDescription,
          outputDescription: qbItem.outputDescription,
          constraints: qbItem.constraints,
          difficulty: qbItem.difficulty,
          allowedLanguages: qbItem.allowedLanguages,
          starterCode: qbItem.starterCode,
          testCases: qbItem.testCases,
        };
      }
    }

    exam.totalMarks = exam.questions.reduce((sum, q) => sum + (q.marks || 10), 0);
    exam.publishedAt = new Date();

    // Determine initial status based on schedule
    const now = Date.now();
    if (exam.startAt && new Date(exam.startAt).getTime() > now) {
      exam.status = 'SCHEDULED';
    } else {
      exam.status = 'LIVE';
    }

    return exam.save();
  }

  async closeExam(user, examId) {
    const universityId = getUniversityId(user);
    const exam = await Exam.findById(examId);

    if (!exam || exam.universityId.toString() !== universityId) {
      const err = new Error('Exam not found');
      err.statusCode = 404;
      throw err;
    }

    exam.status = 'ENDED';
    return exam.save();
  }
}

export const examService = new ExamService();
