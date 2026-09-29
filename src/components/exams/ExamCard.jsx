import React from 'react';
import {
  Calendar,
  Clock,
  Award,
  Shield,
  FileCode2,
  ArrowRight,
  Eye,
  CheckCircle2,
} from 'lucide-react';

export function ExamCard({
  exam,
  userRole = 'STUDENT',
  onBegin,
  onResume,
  onViewDetails,
  onMonitor,
}) {
  const isStudent = userRole === 'STUDENT';
  const isScheduled = exam.status === 'SCHEDULED';
  const isLive = exam.status === 'LIVE';
  const isEnded = exam.status === 'ENDED';

  const hasActiveSession = Boolean(exam.hasActiveSession);
  const maxAttempts = exam.maxAttempts || 1;
  const attemptsUsed = exam.attemptsUsed || 0;
  const isAttemptsExhausted = attemptsUsed >= maxAttempts && !hasActiveSession;

  return (
    <div className="rounded-xl border border-border bg-card/60 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-medium">
            {exam.courseId?.code || 'CS EXAM'}
          </span>

          <div className="flex items-center gap-1.5">
            {isStudent && isAttemptsExhausted && (
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                COMPLETED
              </span>
            )}
            {isStudent && hasActiveSession && (
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse">
                IN PROGRESS
              </span>
            )}
            <span
              className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                isLive
                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                  : isScheduled
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {exam.status}
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="font-semibold text-base text-foreground line-clamp-1">{exam.title}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
            {exam.description || 'Timed programming examination on UniCodeIDE.'}
          </p>
        </div>

        {/* Metadata Details */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono text-muted-foreground pt-1">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span>{exam.durationMinutes} Minutes</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Award className="h-3.5 w-3.5 text-amber-500" />
            <span>{exam.totalMarks || 100} Marks</span>
          </div>

          <div className="flex items-center gap-1.5">
            <FileCode2 className="h-3.5 w-3.5 text-emerald-500" />
            <span>{exam.questions?.length || 0} Problems</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-blue-500" />
            <span>{exam.proctoringMode || 'Basic'} Monitored</span>
          </div>

          {isStudent && (
            <div className="flex items-center justify-between col-span-2 text-[11px] font-mono text-muted-foreground pt-1 border-t border-border/50">
              <span>
                Attempts: <strong className="text-foreground">{attemptsUsed}</strong> / {maxAttempts}
              </span>
              {exam.studentSession?.finalGrade !== undefined ? (
                <span className="text-emerald-500 font-semibold">
                  Score: {exam.studentSession.finalGrade} / {exam.studentSession.maxScore || exam.totalMarks}
                </span>
              ) : exam.studentSession?.totalScore !== undefined ? (
                <span className="text-emerald-500 font-semibold">
                  Score: {exam.studentSession.totalScore} / {exam.studentSession.maxScore || exam.totalMarks}
                </span>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
        {isStudent ? (
          hasActiveSession ? (
            <button
              onClick={() => (onResume ? onResume(exam.studentSession?.id) : onBegin(exam._id))}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-amber-500 text-black hover:bg-amber-400 transition-colors shadow-sm"
            >
              <span>Resume Examination</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : isAttemptsExhausted ? (
            <div className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium border border-border bg-muted/40 text-muted-foreground">
              <span className="flex items-center gap-1.5 text-emerald-500 font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                <span>Exam Submitted</span>
              </span>
              <span className="font-mono text-[11px] text-muted-foreground">
                {attemptsUsed}/{maxAttempts} Attempts
              </span>
            </div>
          ) : isLive ? (
            <button
              onClick={() => onBegin(exam._id)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
            >
              <span>Begin Examination</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : isEnded ? (
            <div className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-medium border border-border bg-muted/30 text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              <span>Exam Ended</span>
            </div>
          ) : (
            <div className="w-full text-center text-xs text-muted-foreground py-1">
              <span>Scheduled for {exam.startAt ? new Date(exam.startAt).toLocaleString() : 'TBD'}</span>
            </div>
          )
        ) : (
          <div className="w-full flex items-center gap-2">
            <button
              onClick={() => onViewDetails(exam._id)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border bg-background hover:bg-muted text-foreground transition-colors"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Details</span>
            </button>

            {isLive && onMonitor && (
              <button
                onClick={() => onMonitor(exam._id)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
              >
                <span>Live Monitor</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
