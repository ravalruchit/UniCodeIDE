import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { submissionService } from '../../../services/submissionService';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { SubmissionStatusBadge } from '../../../components/assignment/SubmissionStatusBadge';
import { LanguageBadge } from '../../../components/assignment/LanguageBadge';
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Code2,
  Clock,
  MessageSquare,
  Sparkles,
  RotateCcw,
} from 'lucide-react';

export default function StudentSubmissionDetail() {
  const { submissionId } = useParams();

  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchSub = async () => {
      try {
        setLoading(true);
        const res = await submissionService.getSubmission(submissionId);
        if (res.success) setSubmission(res.submission);
      } catch (err) {
        setError(err.message || 'Failed to load submission');
      } finally {
        setLoading(false);
      }
    };

    fetchSub();
  }, [submissionId]);

  const handleCopyCode = () => {
    if (!submission?.sourceCode) return;
    navigator.clipboard.writeText(submission.sourceCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-6">
        <div className="h-6 w-36 bg-muted rounded" />
        <div className="h-32 bg-card rounded-xl border border-border" />
        <div className="h-64 bg-card rounded-xl border border-border" />
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="p-8 text-center rounded-xl border border-destructive/30 bg-destructive/5 text-destructive space-y-3">
        <AlertCircle className="w-8 h-8 mx-auto" />
        <p className="text-sm font-semibold">{error || 'Submission not found'}</p>
        <Link to="/app/student/assignments">
          <Button variant="outline" size="sm">
            Back to Assignments
          </Button>
        </Link>
      </div>
    );
  }

  const assignment = submission.assignmentId;
  const isPassed = submission.score !== null && submission.score >= (assignment?.passingMarks || 40);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
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

      {/* Result Hero Banner */}
      <Card
        className={`p-6 border ${
          isPassed
            ? 'bg-gradient-to-br from-emerald-500/10 via-card to-card border-emerald-500/30'
            : 'bg-card border-border'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                Attempt {submission.attemptNumber}
              </span>
              <LanguageBadge language={submission.programmingLanguage} />
              <SubmissionStatusBadge status={submission.status} isLate={submission.isLate} />
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {assignment?.title}
            </h1>

            <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
              <span>Submitted: {new Date(submission.submittedAt).toLocaleString()}</span>
              {submission.evaluatedBy && (
                <span>• Graded by {submission.evaluatedBy.name}</span>
              )}
            </div>
          </div>

          {/* Big Score Box */}
          <div className="text-left sm:text-right shrink-0 p-4 rounded-xl bg-card border border-border">
            <div className="text-xs text-muted-foreground font-mono">Final Grade</div>
            <div
              className={`text-3xl font-mono font-bold ${
                isPassed ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'
              }`}
            >
              {submission.score !== null ? submission.score : '--'}
              <span className="text-sm font-normal text-muted-foreground"> / {submission.maxScore}</span>
            </div>
            <div className="text-[11px] font-mono mt-0.5">
              {isPassed ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Passed</span>
              ) : (
                <span className="text-muted-foreground">Pending / Review</span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Instructor Feedback Cards */}
      {submission.feedback && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            <span>Faculty Review & Feedback</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {submission.feedback.general && (
              <Card className="p-5 md:col-span-2 space-y-2">
                <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                  General Remarks
                </h3>
                <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {submission.feedback.general}
                </p>
              </Card>
            )}

            {submission.feedback.strengths && (
              <Card className="p-5 space-y-2 border-emerald-500/20 bg-emerald-500/5">
                <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Key Strengths
                </h3>
                <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {submission.feedback.strengths}
                </p>
              </Card>
            )}

            {submission.feedback.improvements && (
              <Card className="p-5 space-y-2 border-amber-500/20 bg-amber-500/5">
                <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Areas for Improvement
                </h3>
                <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {submission.feedback.improvements}
                </p>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Submitted Source Code Viewer */}
      <Card className="overflow-hidden border-border bg-card space-y-0">
        <div className="px-5 py-3 bg-muted/30 border-b border-border flex items-center justify-between text-xs font-mono text-muted-foreground">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-primary" />
            <span>Submitted Code Snapshot</span>
          </div>
          <button
            type="button"
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Code'}</span>
          </button>
        </div>

        <div className="p-5 overflow-x-auto bg-background/50 font-mono text-xs leading-relaxed">
          <pre className="text-foreground whitespace-pre-wrap">
            {submission.sourceCode || '# No code content stored.'}
          </pre>
        </div>
      </Card>
    </div>
  );
}
