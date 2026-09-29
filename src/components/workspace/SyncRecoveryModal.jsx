import React from 'react';
import { History, Check, X, FileText } from 'lucide-react';

export function SyncRecoveryModal({
  recoverySnapshot,
  onRestore,
  onDiscard,
}) {
  if (!recoverySnapshot) return null;

  const formattedTime = recoverySnapshot.timestamp
    ? new Date(recoverySnapshot.timestamp).toLocaleTimeString()
    : 'earlier session';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 text-left">
      <div className="w-full max-w-md bg-card border border-primary/30 rounded-xl shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-full bg-primary/10 text-primary shrink-0">
            <History className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-sm text-foreground">
              Unsynced Local Work Detected
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We detected unsynchronized edits saved locally at{' '}
              <strong className="text-foreground">{formattedTime}</strong> ({recoverySnapshot.files?.length || 0} files).
            </p>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-muted/40 border border-border text-xs space-y-1.5 font-mono text-[11px]">
          <div className="text-muted-foreground font-sans text-xs font-medium">Recovered Files:</div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {recoverySnapshot.files?.map((f) => (
              <span
                key={f.path}
                className="px-2 py-0.5 rounded bg-background border border-border text-foreground"
              >
                {f.path}
              </span>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-border flex justify-end gap-2.5">
          <button
            onClick={onDiscard}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            Discard
          </button>
          <button
            onClick={onRestore}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
          >
            Restore Unsaved Changes
          </button>
        </div>
      </div>
    </div>
  );
}
