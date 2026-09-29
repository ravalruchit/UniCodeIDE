import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { assignmentService } from '../../../services/assignmentService';
import { submissionService } from '../../../services/submissionService';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { LanguageBadge } from '../../../components/assignment/LanguageBadge';
import { DifficultyBadge } from '../../../components/assignment/DifficultyBadge';
import { SubmissionStatusBadge } from '../../../components/assignment/SubmissionStatusBadge';
import {
  ArrowLeft,
  Save,
  Send,
  Code2,
  BookOpen,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Award,
  X,
  Sparkles,
  Info,
} from 'lucide-react';

export default function StudentAssignmentWorkspace() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState(null);
  const [sourceCode, setSourceCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingDraft, setSavingDraft] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState('instructions'); // 'instructions' | 'history'

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const fetchAssignmentData = async () => {
    try {
      setLoading(true);
      const res = await assignmentService.getAssignment(assignmentId);
      if (res.success) {
        const asg = res.assignment;
        setAssignment(asg);

        // Preload active draft code, or starter code
        if (asg.activeDraft?.sourceCode) {
          setSourceCode(asg.activeDraft.sourceCode);
        } else if (asg.starterCode) {
          setSourceCode(asg.starterCode);
        }
      }
    } catch (err) {
      showNotification(err.message || 'Failed to load assignment', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignmentData();
  }, [assignmentId]);

  const handleSaveDraft = async () => {
    try {
      setSavingDraft(true);
      const res = await submissionService.saveDraft(assignmentId, {
        sourceCode,
        programmingLanguage: assignment?.programmingLanguage || 'PYTHON',
      });
      if (res.success) {
        showNotification('Work-in-progress draft saved successfully');
      }
    } catch (err) {
      showNotification(err.message || 'Failed to save draft', 'error');
    } finally {
      setSavingDraft(false);
    }
  };

  const handleConfirmSubmit = async () => {
    if (!sourceCode.trim()) {
      showNotification('Cannot submit an empty solution', 'error');
      setShowConfirmModal(false);
      return;
    }

    try {
      setSubmitting(true);
      const res = await submissionService.submitSolution(assignmentId, {
        sourceCode,
        programmingLanguage: assignment?.programmingLanguage || 'PYTHON',
      });
      if (res.success) {
        setShowConfirmModal(false);
        showNotification('Solution submitted successfully!');
        await fetchAssignmentData();
      }
    } catch (err) {
      showNotification(err.message || 'Submission failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-6">
        <div className="h-6 w-36 bg-muted rounded" />
        <div className="h-24 bg-card rounded-xl border border-border" />
        <div className="h-96 bg-card rounded-xl border border-border" />
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="p-8 text-center rounded-xl border border-destructive/30 bg-destructive/5 text-destructive space-y-3">
        <p className="text-sm font-semibold">Assignment not found or enrollment required.</p>
        <Link to="/app/student/assignments">
          <Button variant="outline" size="sm">
            Back to Assignments
          </Button>
        </Link>
      </div>
    );
  }

  const submissions = assignment.submissions || [];
  const attemptsUsed = assignment.attemptsUsed || 0;
  const maxAttempts = assignment.maxAttempts || 3;
  const canSubmit = assignment.canSubmit;
  const isOverdue = assignment.isOverdue;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-4 rounded-lg flex items-center justify-between border ${
            notification.type === 'error'
              ? 'bg-destructive/10 border-destructive/30 text-destructive'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
          }`}
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            {notification.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            <span>{notification.msg}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Back button */}
      <div>
        <Link
          to="/app/student/assignments"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Assignments</span>
        </Link>
      </div>

      {/* Top Banner */}
      <Card className="p-5 border-border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                {assignment.courseId?.code}
              </span>
              <LanguageBadge language={assignment.programmingLanguage} />
              <DifficultyBadge difficulty={assignment.difficulty} />
              {isOverdue && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-destructive/10 text-destructive border border-destructive/20 font-bold">
                  DEADLINE PASSED
                </span>
              )}
            </div>

            <h1 className="text-xl font-bold tracking-tight text-foreground">
              {assignment.title}
            </h1>
            <p className="text-xs text-muted-foreground">
              {assignment.description || 'Follow instructions and implement required algorithms.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-xs font-mono text-muted-foreground">
            <div className="text-left md:text-right">
              <div>Due: {new Date(assignment.dueDate).toLocaleString()}</div>
              <div>
                Attempts: <span className="font-semibold text-foreground">{attemptsUsed}</span> of {maxAttempts}
              </div>
              <div>Points: <span className="font-semibold text-foreground">{assignment.totalMarks}</span> (Pass: {assignment.passingMarks})</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Coding Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Instructions & Submission History */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-border">
            <button
              type="button"
              onClick={() => setActiveTab('instructions')}
              className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'instructions'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Problem Statement</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Submission History ({submissions.length})</span>
            </button>
          </div>

          {activeTab === 'instructions' ? (
            <Card className="p-5 space-y-4">
              <div className="prose prose-neutral dark:prose-invert max-w-none text-xs leading-relaxed whitespace-pre-wrap">
                {assignment.instructions || assignment.description}
              </div>

              {assignment.testCases?.filter((tc) => !tc.isHidden).length > 0 && (
                <div className="pt-4 border-t border-border space-y-2">
                  <h4 className="text-xs font-mono font-semibold uppercase text-muted-foreground">
                    Public Test Cases
                  </h4>
                  <div className="space-y-2">
                    {assignment.testCases
                      .filter((tc) => !tc.isHidden)
                      .map((tc, idx) => (
                        <div key={idx} className="p-3 rounded bg-muted/30 border border-border text-xs">
                          <div className="font-semibold text-foreground flex items-center justify-between">
                            <span>{tc.name}</span>
                            <span className="font-mono text-[10px] text-muted-foreground">{tc.points} pts</span>
                          </div>
                          {tc.input && (
                            <div className="font-mono text-[11px] text-muted-foreground mt-1">
                              Input: <code>{tc.input}</code>
                            </div>
                          )}
                          <div className="font-mono text-[11px] text-muted-foreground mt-0.5">
                            Expected: <code>{tc.expectedOutput}</code>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </Card>
          ) : (
            <Card className="p-5 space-y-3">
              {submissions.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground italic">
                  No submitted attempts recorded yet.
                </div>
              ) : (
                submissions.map((sub) => (
                  <div
                    key={sub._id}
                    className="p-3.5 rounded-lg border border-border bg-muted/20 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-foreground">
                          Attempt {sub.attemptNumber}
                        </span>
                        <SubmissionStatusBadge status={sub.status} isLate={sub.isLate} />
                      </div>

                      {sub.score !== null && (
                        <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          {sub.score} / {sub.maxScore} pts
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-muted-foreground font-mono">
                      Submitted: {new Date(sub.submittedAt).toLocaleString()}
                    </div>

                    {sub.feedback?.general && (
                      <div className="p-2.5 rounded bg-background border border-border text-xs space-y-1">
                        <div className="font-semibold text-foreground text-[11px] flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-primary" />
                          <span>Instructor Feedback</span>
                        </div>
                        <p className="text-muted-foreground leading-relaxed text-[11px]">
                          {sub.feedback.general}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </Card>
          )}

          {/* Architecture notice: No fake code execution */}
          <div className="p-3.5 rounded-lg border border-border bg-muted/30 text-xs text-muted-foreground flex items-start gap-2.5">
            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Phase 4 Manual Evaluation:</strong> You can save drafts and submit solutions for teacher grading. Full Docker execution sandboxes with instant automated test runner will connect in Phase 7.
            </p>
          </div>
        </div>

        {/* Right Column: Code Editor & Submission Bar */}
        <div className="lg:col-span-7 space-y-4">
          {/* Cloud Workspace Banner */}
          <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-foreground font-semibold text-xs">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Full Cloud Programming Workspace</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Work across multiple files, edit with Monaco, and sync your code in the cloud across all your devices.
              </p>
            </div>
            <Link
              to={`/app/student/assignments/${assignmentId}/workspace`}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm text-center shrink-0 flex items-center justify-center gap-1.5"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Launch Cloud IDE</span>
            </Link>
          </div>

          <Card className="overflow-hidden border-border bg-card">
            <div className="px-4 py-2.5 bg-muted/40 border-b border-border flex items-center justify-between text-xs font-mono text-muted-foreground">
              <span>solution.{assignment.programmingLanguage === 'PYTHON' ? 'py' : 'js'}</span>
              <span>{assignment.programmingLanguage}</span>
            </div>

            <textarea
              rows={20}
              value={sourceCode}
              onChange={(e) => setSourceCode(e.target.value)}
              placeholder="# Write your program solution here..."
              className="w-full p-4 font-mono text-xs rounded-none border-0 bg-background text-foreground focus:outline-hidden leading-relaxed resize-none min-h-[420px]"
            />

            {/* Editor Action Footer */}
            <div className="p-4 bg-muted/20 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-[11px] text-muted-foreground font-mono">
                {canSubmit ? (
                  <span>Ready to submit Attempt {attemptsUsed + 1} of {maxAttempts}</span>
                ) : (
                  <span className="text-destructive font-bold">
                    {attemptsUsed >= maxAttempts ? 'All attempts consumed' : 'Submission window closed'}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSaveDraft}
                  disabled={savingDraft || !canSubmit}
                  className="gap-1.5 text-xs flex-1 sm:flex-initial"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingDraft ? 'Saving Draft...' : 'Save Draft'}</span>
                </Button>

                <Button
                  type="button"
                  size="sm"
                  onClick={() => setShowConfirmModal(true)}
                  disabled={submitting || !canSubmit}
                  className="gap-1.5 text-xs shadow-xs flex-1 sm:flex-initial"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Solution</span>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-fade-up">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-foreground text-base">
                Confirm Solution Submission
              </h3>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                You are about to submit <strong>Attempt {attemptsUsed + 1}</strong> of {maxAttempts}.
              </p>

              <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4">
                <li>Your submission snapshot will be stored on the server.</li>
                <li>Your instructor will be notified to review and grade your code.</li>
                {isOverdue && (
                  <li className="text-destructive font-semibold">
                    This submission will be marked as LATE (Penalty: {assignment.latePenaltyPercent}%).
                  </li>
                )}
                <li>Attempt {attemptsUsed + 1} will be consumed.</li>
              </ul>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleConfirmSubmit}
                  disabled={submitting}
                  className="shadow-xs"
                >
                  {submitting ? 'Submitting...' : 'Yes, Submit Solution'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
