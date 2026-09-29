import React from 'react';

export function SubmissionStatusBadge({ status, isLate = false }) {
  const getBadgeStyle = () => {
    switch (status) {
      case 'EVALUATED':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
      case 'SUBMITTED':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30';
      case 'UNDER_REVIEW':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30';
      case 'RETURNED':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'DRAFT':
        return 'bg-muted text-muted-foreground border-border';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="inline-flex items-center gap-1.5">
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-medium border ${getBadgeStyle()}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
        {status === 'DRAFT' ? 'Work In Progress' : status || 'NOT_SUBMITTED'}
      </span>
      {isLate && (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-destructive/10 text-destructive border border-destructive/20">
          LATE
        </span>
      )}
    </div>
  );
}
