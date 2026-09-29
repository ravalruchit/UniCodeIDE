import React from 'react';

export function CourseStatusBadge({ status }) {
  const getBadgeStyle = () => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
      case 'DRAFT':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'ARCHIVED':
        return 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/30';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-medium border ${getBadgeStyle()}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
      {status || 'DRAFT'}
    </span>
  );
}
