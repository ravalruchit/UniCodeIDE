import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { submissionService } from '../../../services/submissionService';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { SubmissionStatusBadge } from '../../../components/assignment/SubmissionStatusBadge';
import { LanguageBadge } from '../../../components/assignment/LanguageBadge';
import {
  ArrowLeft,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Code2,
  BookOpen,
  Clock,
  User,
  GraduationCap,
  MessageSquare,
  Sparkles,
  X,
} from 'lucide-react';

export default function TeacherSubmissionReview() {
  const { submissionId } = useParams();
  const navigate = useNavigate();

  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('code'); // 'code' | 'instructions'
  const [copied, setCopied] = useState(false);
  const [notification, setNotification] = useState(null);

  // Form State
  const [score, setScore] = useState('');
  const [status, setStatus] = useState('EVALUATED');
  const [feedback, setFeedback] = useState({
    general: '',
    strengths: '',
    improvements: '',
  });

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const fetchSubmission = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await submissionService.getSubmission(submissionId);
      if (res.success) {
        const sub = res.submission;
        setSubmission(sub);
        setScore(sub.score !== null ? sub.score.toString() : '');
        setStatus(sub.status === 'DRAFT' ? 'EVALUATED' : sub.status);
        setFeedback({
          general: sub.feedback?.general || '',
          strengths: sub.feedback?.strengths || '',
          improvements: sub.feedback?.improvements || '',
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to load submission');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmission();
  }, [submissionId]);

  const handleCopyCode = () => {
    if (!submission?.sourceCode) return;
    navigator.clipboard.writeText(submission.sourceCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEvaluation = async () => {
    const numScore = Number(score);
    const maxScore = submission.maxScore || submission.assignmentId?.totalMarks || 100;

    if (score === '' || isNaN(numScore) || numScore < 0 || numScore > maxScore) {
      showNotification(`Score must be between 0 and ${maxScore}`, 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await submissionService.evaluateSubmission(submissionId, {
        score: numScore,
        status,
        feedback,
      });

      if (res.success) {
        showNotification('Evaluation and marks saved successfully');
        setSubmission(res.submission);
      }
    } catch (err) {
      showNotification(err.message || 'Failed to save evaluation', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturnSubmission = async () => {
    if (!window.confirm('Return this submission to the student for revision?')) return;
    try {
      setSubmitting(true);
      const res = await submissionService.returnSubmission(submissionId, { feedback });
      if (res.success) {
        showNotification('Submission returned to student');
        setSubmission(res.submission);
      }
    } catch (err) {
      showNotification(err.message || 'Failed to return submission', 'error');
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

  if (error || !submission) {
    return (
      <div className="p-8 text-center rounded-xl border border-destructive/30 bg-destructive/5 text-destructive space-y-3">
        <AlertCircle className="w-8 h-8 mx-auto" />
        <p className="text-sm font-semibold">{error || 'Submission not found'}</p>
        <Link to="/app/teacher/assignments">
          <Button variant="outline" size="sm">
            Back to Assignments
          </Button>
        </Link>
      </div>
    );
  }

  const assignment = submission.assignmentId;
  const maxScore = submission.maxScore || assignment?.totalMarks || 100;
  const passingMarks = assignment?.passingMarks || 40;

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
          to={`/app/teacher/assignments/${assignment?._id}/submissions`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Submissions Roster</span>
        </Link>
      </div>

      {/* Top Student Submission Metadata Bar */}
      <Card className="p-5 border-border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                Attempt {submission.attemptNumber}
              </span>
              <LanguageBadge language={submission.programmingLanguage} />
              <SubmissionStatusBadge status={submission.status} isLate={submission.isLate} />
            </div>

            <h1 className="text-xl font-bold tracking-tight text-foreground">
              {submission.studentId?.name}
            </h1>
            <p className="text-xs text-muted-foreground font-mono">
              {submission.studentId?.studentId ? `${submission.studentId.studentId} • ` : ''}
              {submission.studentId?.email}
            </p>
          </div>

          <div className="text-xs font-mono text-muted-foreground text-left md:text-right space-y-1">
            <div>Assignment: <span className="font-semibold text-foreground">{assignment?.title}</span></div>
            <div>
              Submitted: {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : 'In Progress'}
            </div>
            {submission.evaluatedBy && (
              <div className="text-emerald-600 dark:text-emerald-400">
                Graded by {submission.evaluatedBy.name} on {new Date(submission.evaluatedAt).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Source Code Viewer & Instructions Tab */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-2 border-b border-border">
            <button
              type="button"
              onClick={() => setActiveTab('code')}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'code'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Student Solution Code</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('instructions')}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'instructions'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Problem Statement & Test Criteria</span>
            </button>
          </div>

          {activeTab === 'code' ? (
            <Card className="overflow-hidden border-border bg-card">
              <div className="px-4 py-2.5 bg-muted/40 border-b border-border flex items-center justify-between text-xs font-mono text-muted-foreground">
                <span>solution.{submission.programmingLanguage === 'PYTHON' ? 'py' : 'js'}</span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>

              <div className="p-4 overflow-x-auto bg-background/50 font-mono text-xs leading-relaxed min-h-[380px]">
                <pre className="text-foreground whitespace-pre-wrap">
                  {submission.sourceCode || '# No code submitted.'}
                </pre>
              </div>
            </Card>
          ) : (
            <Card className="p-6 space-y-4">
              <h3 className="text-sm font-bold text-foreground">
                {assignment?.title}
              </h3>
              <div className="prose prose-neutral dark:prose-invert max-w-none text-xs leading-relaxed whitespace-pre-wrap">
                {assignment?.instructions || assignment?.description}
              </div>

              {assignment?.testCases?.length > 0 && (
                <div className="pt-4 border-t border-border space-y-3">
                  <h4 className="text-xs font-mono font-semibold uppercase text-muted-foreground">
                    Defined Test Cases (For Reference)
                  </h4>
                  <div className="space-y-2">
                    {assignment.testCases.map((tc, idx) => (
                      <div key={idx} className="p-3 rounded bg-muted/30 border border-border text-xs">
                        <div className="font-semibold text-foreground flex items-center justify-between">
                          <span>{tc.name}</span>
                          <span className="font-mono text-[10px] text-muted-foreground">{tc.points} pts</span>
                        </div>
                        <div className="font-mono text-[11px] text-muted-foreground mt-1">
                          Expected: {tc.expectedOutput}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Right Column: Grading & Feedback Panel */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-primary" />
                <span>Evaluation & Marks</span>
              </h3>
              <span className="text-xs font-mono text-muted-foreground">
                Passing: {passingMarks} / {maxScore}
              </span>
            </div>

            {/* Score Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono">
                  Awarded Score *
                </label>
                <span className="text-xs font-mono text-muted-foreground">
                  Out of {maxScore} pts
                </span>
              </div>

              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max={maxScore}
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  placeholder="0"
                  className="w-full pl-4 pr-16 py-2.5 text-lg font-mono font-bold rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-muted-foreground">
                  / {maxScore}
                </span>
              </div>
            </div>

            {/* Evaluation Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono">
                Submission Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="EVALUATED">Evaluated & Released</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="RETURNED">Return to Student</option>
              </select>
            </div>

            {/* Feedback Breakdown */}
            <div className="space-y-4 pt-2 border-t border-border">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-primary" />
                  <span>General Feedback</span>
                </label>
                <textarea
                  rows={3}
                  value={feedback.general}
                  onChange={(e) => setFeedback({ ...feedback, general: e.target.value })}
                  placeholder="Overall thoughts on algorithmic approach and code quality..."
                  className="w-full p-2.5 text-xs rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Key Strengths
                </label>
                <textarea
                  rows={2}
                  value={feedback.strengths}
                  onChange={(e) => setFeedback({ ...feedback, strengths: e.target.value })}
                  placeholder="Clean code patterns, optimal time complexity, edge cases handled..."
                  className="w-full p-2.5 text-xs rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                  Areas for Improvement
                </label>
                <textarea
                  rows={2}
                  value={feedback.improvements}
                  onChange={(e) => setFeedback({ ...feedback, improvements: e.target.value })}
                  placeholder="Memory efficiency, variable naming, documentation..."
                  className="w-full p-2.5 text-xs rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-border flex flex-col gap-2">
              <Button
                type="button"
                onClick={handleSaveEvaluation}
                disabled={submitting}
                className="w-full gap-2 shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>{submitting ? 'Saving Marks...' : 'Save Evaluation & Score'}</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleReturnSubmission}
                disabled={submitting}
                className="w-full gap-2 text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Return for Revision</span>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
