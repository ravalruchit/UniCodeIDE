import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { examSessionService } from '../../services/examSessionService';
import { workspaceService } from '../../services/workspaceService';
import { useExamTimer } from '../../hooks/useExamTimer';
import { useProctoring } from '../../hooks/useProctoring';
import { ExamTimer } from '../../components/exams/ExamTimer';
import { ExamQuestionNavigator } from '../../components/exams/ExamQuestionNavigator';
import { ExamSubmitModal } from '../../components/exams/ExamSubmitModal';
import { CodeEditor } from '../../components/workspace/CodeEditor';
import { WorkspaceOutputPanel } from '../../components/workspace/WorkspaceOutputPanel';
import {
  Shield,
  Send,
  Play,
  FlaskConical,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Lock,
  ArrowLeft,
  Wifi,
  WifiOff,
} from 'lucide-react';

export function ExamSessionPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  // Session & Exam State
  const [session, setSession] = useState(null);
  const [exam, setExam] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [currentFileContent, setCurrentFileContent] = useState('');
  const [activeFilePath, setActiveFilePath] = useState('main.py');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Execution & Submission State
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [execErrorMessage, setExecErrorMessage] = useState(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [submissionData, setSubmissionData] = useState(null);

  // Heartbeat Ref
  const heartbeatIntervalRef = useRef(null);

  // 1. Initial Load of Exam Session
  const loadSession = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await examSessionService.getSession(sessionId);
      if (res && res.session) {
        setSession(res.session);
        setExam(res.exam);

        if (res.session.status === 'SUBMITTED' || res.session.status === 'AUTO_SUBMITTED') {
          setIsCompleted(true);
        } else {
          // Load workspace for first question
          const firstQ = res.session.questions?.[0];
          if (firstQ?.workspaceId) {
            await loadQuestionWorkspace(firstQ.workspaceId);
          }
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load examination session');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  const loadQuestionWorkspace = async (workspaceId) => {
    try {
      const res = await workspaceService.getWorkspaceById(workspaceId);
      if (res && res.workspace) {
        setCurrentWorkspace(res.workspace);
        const entryFile = res.workspace.files?.find((f) => f.isEntry) || res.workspace.files?.[0];
        if (entryFile) {
          setActiveFilePath(entryFile.path);
          setCurrentFileContent(entryFile.content || '');
        }
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  // 2. Periodic Heartbeat (every 20 seconds)
  useEffect(() => {
    if (!sessionId || isCompleted) return;

    heartbeatIntervalRef.current = setInterval(async () => {
      try {
        const hb = await examSessionService.sendHeartbeat(sessionId);
        if (hb?.isExpired) {
          setIsCompleted(true);
        }
      } catch {
        // network interruption
      }
    }, 20000);

    return () => {
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
    };
  }, [sessionId, isCompleted]);

  // 3. Proctoring Signals Hook
  const { eventCounts, enterFullscreen } = useProctoring({
    sessionId,
    isActive: !isCompleted && Boolean(session && session.status === 'IN_PROGRESS'),
    proctoringMode: exam?.proctoringMode || 'BASIC',
    requireFullscreen: exam?.requireFullscreen || false,
  });

  // 4. Auto-submit on server deadline expiry
  const handleTimeExpired = useCallback(async () => {
    if (isCompleted) return;
    try {
      const res = await examSessionService.submitExam(sessionId, 'AUTO_SUBMITTED');
      setSubmissionData(res);
      setIsCompleted(true);
    } catch {
      setIsCompleted(true);
    }
  }, [sessionId, isCompleted]);

  // 5. Switch Active Question
  const handleSelectQuestion = async (index) => {
    if (index === currentQuestionIndex) return;
    // Auto-save current workspace first
    if (currentWorkspace?._id) {
      await saveCurrentWorkspace();
    }

    setCurrentQuestionIndex(index);
    setExecutionResult(null);
    setExecErrorMessage(null);

    const targetQ = session?.questions?.[index];
    if (targetQ?.workspaceId) {
      await loadQuestionWorkspace(targetQ.workspaceId);
    }
  };

  // 6. Code Editor Change Handler & Autosave
  const handleEditorChange = (newContent) => {
    setCurrentFileContent(newContent);
    if (currentWorkspace) {
      const updatedFiles = (currentWorkspace.files || []).map((f) =>
        f.path === activeFilePath ? { ...f, content: newContent } : f
      );
      setCurrentWorkspace((prev) => ({ ...prev, files: updatedFiles }));
    }
  };

  const saveCurrentWorkspace = async () => {
    if (!currentWorkspace?._id) return;
    try {
      await workspaceService.saveWorkspace(currentWorkspace._id, {
        files: currentWorkspace.files,
        revision: currentWorkspace.revision,
      });
    } catch {
      // offline buffer handles recovery
    }
  };

  // 7. Execute Code inside Docker Sandbox
  const handleRunCode = async (mode = 'RUN') => {
    const currentQ = session?.questions?.[currentQuestionIndex];
    if (!currentQ || !currentWorkspace) return;

    await saveCurrentWorkspace();
    setIsExecuting(true);
    setExecErrorMessage(null);

    try {
      const res = await examSessionService.executeQuestion(sessionId, currentQ.questionId, {
        mode,
      });

      if (res && res.result) {
        setExecutionResult(res.result);
      }
    } catch (err) {
      setExecErrorMessage(err.message || 'Execution failed');
    } finally {
      setIsExecuting(false);
    }
  };

  // 8. Confirm Submission Modal Action
  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    try {
      await saveCurrentWorkspace();
      const res = await examSessionService.submitExam(sessionId, 'MANUAL');
      setSubmissionData(res);
      setIsSubmitModalOpen(false);
      setIsCompleted(true);
    } catch (err) {
      alert(err.message || 'Failed to submit examination');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Active question metadata
  const currentQ = session?.questions?.[currentQuestionIndex];

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background text-foreground space-y-3">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs font-mono text-muted-foreground">Initializing secure exam workspace...</p>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="h-screen flex items-center justify-center bg-background text-foreground p-4">
        <div className="max-w-md w-full p-8 rounded-2xl border border-border bg-card shadow-2xl text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Examination Submitted</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your examination attempt #{session?.attemptNumber || 1} has been securely finalized and recorded. All question code was snapshotted for official academic review.
          </p>
          <div className="p-3 rounded-lg bg-muted/40 border border-border text-xs font-mono text-left space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span className="text-emerald-500 font-semibold">{session?.status || 'SUBMITTED'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Submission Time:</span>
              <span className="text-foreground">{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/app/student/courses')}
            className="w-full py-2.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
          >
            Return to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden select-none">
      {/* 1. Secure Exam Navigation Header */}
      <header className="h-14 border-b border-border bg-card/80 backdrop-blur-md px-4 flex items-center justify-between gap-4 shrink-0 z-30">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="font-bold text-sm text-foreground truncate max-w-[200px] sm:max-w-[300px]">
              {exam?.title || 'Exam Session'}
            </span>
          </div>

          <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground">
            Attempt #{session?.attemptNumber || 1}
          </span>
        </div>

        {/* Center: Question Pills Navigator */}
        <div className="hidden md:flex items-center justify-center">
          <ExamQuestionNavigator
            questions={session?.questions || []}
            currentIndex={currentQuestionIndex}
            onSelectQuestion={handleSelectQuestion}
          />
        </div>

        {/* Right: Timer & Submit Action */}
        <div className="flex items-center gap-2 shrink-0">
          {session?.deadlineAt && (
            <ExamTimer
              deadlineAt={session.deadlineAt}
              onTimeExpired={handleTimeExpired}
            />
          )}

          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Send className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Submit Exam</span>
          </button>
        </div>
      </header>

      {/* 2. Main Workspace Split (Question Problem Statement + Monaco Code Editor) */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left: Problem Statement & Instructions Panel */}
        <div className="w-80 lg:w-96 border-r border-border bg-card/40 flex flex-col overflow-y-auto p-4 text-xs space-y-4 text-left">
          <div className="border-b border-border pb-2">
            <span className="text-[10px] font-mono font-bold text-primary uppercase">
              Question {currentQuestionIndex + 1} of {session?.questions?.length || 1}
            </span>
            <h2 className="text-base font-bold text-foreground mt-0.5">{currentQ?.title || 'Problem Title'}</h2>
            <div className="flex items-center gap-2 text-muted-foreground font-mono text-[11px] mt-1">
              <span>{currentQ?.maxPoints || 10} Marks</span>
              <span>•</span>
              <span className="uppercase">{currentWorkspace?.language || 'PYTHON'}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-foreground text-xs">Problem Description</h4>
            <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {currentQ?.description || 'No description provided.'}
            </p>
          </div>

          {currentQ?.instructions && (
            <div className="space-y-1">
              <h4 className="font-semibold text-foreground text-xs">Instructions</h4>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{currentQ.instructions}</p>
            </div>
          )}

          {currentQ?.constraints && (
            <div className="space-y-1 p-2.5 rounded-lg bg-muted/40 border border-border">
              <h4 className="font-semibold text-foreground text-[11px]">Constraints</h4>
              <pre className="text-[11px] text-muted-foreground whitespace-pre-wrap font-mono">
                {currentQ.constraints}
              </pre>
            </div>
          )}

          {/* Test cases preview (visible tests only) */}
          {currentQ?.testCases?.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border">
              <h4 className="font-semibold text-foreground text-xs">Sample Test Cases</h4>
              {currentQ.testCases.map((tc, idx) => (
                <div key={idx} className="p-2 rounded border border-border bg-card/60 space-y-1 font-mono text-[10px]">
                  <span className="font-bold text-foreground">{tc.name || `Sample ${idx + 1}`}</span>
                  {!tc.isHidden ? (
                    <div>
                      <div className="text-muted-foreground">Input: {tc.input || '(empty)'}</div>
                      <div className="text-emerald-500">Expected: {tc.expectedOutput}</div>
                    </div>
                  ) : (
                    <div className="text-muted-foreground italic flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      <span>Hidden Test Case</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Code Editor & Execution Output Panel */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {/* Editor Action Bar */}
          <div className="h-10 border-b border-border bg-muted/20 px-4 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
              <FileText className="h-3.5 w-3.5 text-primary" />
              <span className="text-foreground font-medium">{activeFilePath}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleRunCode('RUN')}
                disabled={isExecuting || !exam?.allowStudentExecution}
                className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm"
              >
                <Play className="h-3 w-3 fill-current" />
                <span>Run</span>
              </button>

              <button
                onClick={() => handleRunCode('TEST')}
                disabled={isExecuting || !exam?.allowStudentExecution}
                className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium border border-border bg-background hover:bg-muted disabled:opacity-50 transition-colors shadow-sm"
              >
                <FlaskConical className="h-3 w-3 text-primary" />
                <span>Run Tests</span>
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 min-h-0">
            <CodeEditor
              filePath={activeFilePath}
              content={currentFileContent}
              onChange={handleEditorChange}
              settings={{ fontSize: 14, tabSize: 4, minimap: true, theme: 'vs-dark' }}
              onSave={saveCurrentWorkspace}
            />
          </div>

          {/* Phase 7 Docker Output Panel */}
          <WorkspaceOutputPanel
            workspace={currentWorkspace}
            files={currentWorkspace?.files || []}
            executionState={isExecuting ? 'RUNNING' : 'IDLE'}
            isRunning={isExecuting}
            executionResult={executionResult}
            errorMessage={execErrorMessage}
            onRunCode={() => handleRunCode('RUN')}
            onRunTests={() => handleRunCode('TEST')}
          />
        </div>
      </div>

      {/* 3. Submit Confirmation Modal */}
      <ExamSubmitModal
        isOpen={isSubmitModalOpen}
        isSubmitting={isSubmitting}
        questions={session?.questions || []}
        onClose={() => setIsSubmitModalOpen(false)}
        onConfirm={handleConfirmSubmit}
      />
    </div>
  );
}
