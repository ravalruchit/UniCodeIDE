import React from 'react';
import { CheckCircle2, Clock, Circle } from 'lucide-react';

export function ExamQuestionNavigator({
  questions = [],
  currentIndex = 0,
  onSelectQuestion,
}) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-2">
      {questions.map((q, idx) => {
        const isCurrent = idx === currentIndex;
        const isAnswered = q.status === 'ANSWERED';
        const isInProgress = q.status === 'IN_PROGRESS';

        let statusStyle = 'border-border bg-card/60 text-muted-foreground hover:bg-muted';
        if (isCurrent) {
          statusStyle = 'border-primary bg-primary/10 text-primary font-bold shadow-sm';
        } else if (isAnswered) {
          statusStyle = 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500 font-medium';
        } else if (isInProgress) {
          statusStyle = 'border-amber-500/30 bg-amber-500/10 text-amber-500 font-medium';
        }

        return (
          <button
            key={q.questionId || idx}
            onClick={() => onSelectQuestion(idx)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-all shrink-0 ${statusStyle}`}
            title={`Question ${idx + 1} (${q.maxPoints || 10} Marks)`}
          >
            {isAnswered ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            ) : isInProgress ? (
              <Clock className="h-3.5 w-3.5 text-amber-500" />
            ) : (
              <Circle className="h-3 w-3 text-muted-foreground/60" />
            )}
            <span>Q{idx + 1}</span>
            <span className="text-[10px] text-muted-foreground font-mono">({q.maxPoints || 10}m)</span>
          </button>
        );
      })}
    </div>
  );
}
