import React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { useExamTimer } from '../../hooks/useExamTimer';

export function ExamTimer({ deadlineAt, onTimeExpired }) {
  const { formattedTime, urgency, remainingSeconds } = useExamTimer(deadlineAt, onTimeExpired);

  let badgeColor = 'bg-muted/80 text-foreground border-border';
  let iconColor = 'text-primary';

  if (urgency === 'critical') {
    badgeColor = 'bg-rose-500/15 text-rose-500 border-rose-500/30 animate-pulse';
    iconColor = 'text-rose-500';
  } else if (urgency === 'urgent') {
    badgeColor = 'bg-amber-500/15 text-amber-500 border-amber-500/30';
    iconColor = 'text-amber-500';
  } else if (urgency === 'warning') {
    badgeColor = 'bg-amber-500/10 text-amber-500/90 border-amber-500/20';
    iconColor = 'text-amber-500';
  }

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono font-semibold text-xs transition-colors shadow-sm ${badgeColor}`}
      title="Server-Authoritative Exam Timer"
    >
      <Clock className={`h-4 w-4 shrink-0 ${iconColor}`} />
      <span className="tracking-wider">{formattedTime}</span>
      {urgency === 'critical' && <span className="text-[10px] uppercase font-bold text-rose-500">Ending Soon</span>}
    </div>
  );
}
