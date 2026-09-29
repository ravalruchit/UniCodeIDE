import React from 'react';
import { createPortal } from 'react-dom';
import { Send, AlertTriangle, CheckCircle2, X } from 'lucide-react';

export function ExamSubmitModal({
  isOpen,
  isSubmitting,
  questions = [],
  onClose,
  onConfirm,
}) {
  if (!isOpen) return null;

  const total = questions.length;
  const answered = questions.filter((q) => q.status === 'ANSWERED').length;
  const unanswered = total - answered;

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto text-left">
      <div className="relative w-full max-w-md my-auto bg-card border border-border rounded-xl shadow-xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Send className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm text-foreground">Submit Examination</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Question Completion Summary */}
        <div className="p-3 rounded-lg bg-muted/40 border border-border space-y-2 text-xs font-mono">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total Coding Problems:</span>
            <span className="font-semibold text-foreground">{total}</span>
          </div>
          <div className="flex justify-between items-center text-emerald-500">
            <span>Answered Problems:</span>
            <span className="font-semibold">{answered}</span>
          </div>
          {unanswered > 0 && (
            <div className="flex justify-between items-center text-amber-500 font-semibold">
              <span>Unanswered Problems:</span>
              <span>{unanswered}</span>
            </div>
          )}
        </div>

        {unanswered > 0 && (
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              You still have {unanswered} unanswered problem{unanswered > 1 ? 's' : ''}. Unanswered problems will receive 0 marks upon submission.
            </span>
          </div>
        )}

        <p className="text-xs text-muted-foreground leading-relaxed">
          Submitting creates a permanent, immutable file snapshot of all your question workspaces. After submission, your session will lock and answers cannot be modified.
        </p>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            Return to Exam
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{isSubmitting ? 'Finalizing...' : 'Confirm & Submit Exam'}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
