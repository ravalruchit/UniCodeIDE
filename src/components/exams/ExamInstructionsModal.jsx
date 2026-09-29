import React from 'react';
import { createPortal } from 'react-dom';
import { Shield, Clock, Award, FileCode2, Check, AlertCircle, X } from 'lucide-react';

export function ExamInstructionsModal({
  isOpen,
  exam,
  isStarting = false,
  onClose,
  onAgreeAndStart,
}) {
  if (!isOpen || !exam) return null;

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto text-left">
      <div className="relative w-full max-w-lg my-auto bg-card border border-border rounded-xl shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border pb-3">
          <div>
            <div className="flex items-center gap-2 text-primary font-mono text-xs font-semibold uppercase">
              <Shield className="h-4 w-4" />
              <span>Examination Policy & Proctoring Consent</span>
            </div>
            <h2 className="text-lg font-bold text-foreground mt-1">{exam.title}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{exam.description}</p>
          </div>
          <button
            onClick={onClose}
            disabled={isStarting}
            className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Examination Parameters Grid */}
        <div className="grid grid-cols-3 gap-3 p-3 rounded-lg bg-muted/40 border border-border text-center text-xs font-mono">
          <div>
            <span className="text-muted-foreground block text-[10px]">DURATION</span>
            <span className="font-bold text-foreground text-sm">{exam.durationMinutes} min</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px]">TOTAL MARKS</span>
            <span className="font-bold text-foreground text-sm">{exam.totalMarks || 100}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px]">PROBLEMS</span>
            <span className="font-bold text-foreground text-sm">{exam.questions?.length || 0}</span>
          </div>
        </div>

        {/* Proctoring & Integrity Disclosure */}
        <div className="space-y-2 text-xs text-muted-foreground">
          <h4 className="font-semibold text-foreground flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <span>Technical Proctoring Signals Monitored</span>
          </h4>
          <p className="text-[11px] leading-relaxed">
            In accordance with institutional assessment policy, this platform records factual session telemetry during your examination:
          </p>
          <ul className="list-disc list-inside space-y-1 text-[11px] pl-1 font-mono text-muted-foreground/90">
            <li>Browser tab visibility and focus transitions</li>
            {exam.requireFullscreen && <li>Fullscreen enter and exit events</li>}
            <li>Network connectivity and session recovery events</li>
            <li>Code execution runs and test case evaluations</li>
          </ul>
          <p className="text-[10px] text-muted-foreground/75 italic pt-1">
            Proctoring telemetry records observable technical signals. It is not used for automated cheating accusations and is reviewed directly by your instructor.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <button
            onClick={onClose}
            disabled={isStarting}
            className="px-4 py-2 rounded-lg text-xs font-medium border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onAgreeAndStart}
            disabled={isStarting}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
            <span>{isStarting ? 'Launching Exam Session...' : 'I Acknowledge & Begin Exam'}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
