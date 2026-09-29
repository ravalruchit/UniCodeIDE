import React, { useState } from 'react';
import { AlertCircle, RefreshCw, Check, ArrowRight, Eye, Code2 } from 'lucide-react';

export function SyncConflictModal({
  conflictInfo,
  localFiles = [],
  onReloadServer,
  onKeepLocal,
}) {
  const [selectedFilePath, setSelectedFilePath] = useState(
    localFiles[0]?.path || 'main.py'
  );
  const [showFilePreview, setShowFilePreview] = useState(false);

  if (!conflictInfo) return null;

  const activeLocalFile = localFiles.find((f) => f.path === selectedFilePath);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 text-left">
      <div className="w-full max-w-2xl bg-card border border-rose-500/40 rounded-xl shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-full bg-rose-500/10 text-rose-500 shrink-0">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-base text-foreground">
              Workspace Changed on Another Device
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This project was modified in another session. To prevent silent data loss, UniCodeIDE paused synchronization until you select how to proceed.
            </p>
          </div>
        </div>

        {/* Revision Comparison Badges */}
        <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/40 border border-border text-xs font-mono">
          <div className="space-y-1">
            <span className="text-muted-foreground block text-[11px]">Your Local Unsynced Copy</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-amber-500">Revision r{conflictInfo.localRevision || '?'}</span>
              <span className="text-[10px] text-muted-foreground font-sans">({localFiles.length} files in editor)</span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground block text-[11px]">Authoritative Cloud Version</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-emerald-500">Revision r{conflictInfo.serverRevision || '?'}</span>
              <span className="text-[10px] text-muted-foreground font-sans">(Latest on server)</span>
            </div>
          </div>
        </div>

        {/* Local Copy Inspector Toggle */}
        <div className="space-y-2">
          <button
            onClick={() => setShowFilePreview(!showFilePreview)}
            className="flex items-center gap-1.5 text-xs text-primary font-medium hover:underline"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>{showFilePreview ? 'Hide Local Code Preview' : 'Inspect My Local Code Before Deciding'}</span>
          </button>

          {showFilePreview && (
            <div className="rounded-lg border border-border bg-background p-3 space-y-2 max-h-56 overflow-hidden flex flex-col">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                {localFiles.map((f) => (
                  <button
                    key={f.path}
                    onClick={() => setSelectedFilePath(f.path)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono shrink-0 ${
                      selectedFilePath === f.path
                        ? 'bg-primary text-primary-foreground font-semibold'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
              <pre className="flex-1 overflow-y-auto font-mono text-[11px] p-2 bg-muted/30 rounded text-foreground/90 whitespace-pre-wrap leading-relaxed">
                {activeLocalFile?.content || '(Empty file)'}
              </pre>
            </div>
          )}
        </div>

        {/* Recovery Action Buttons */}
        <div className="pt-2 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[11px] text-muted-foreground">
            A recovery backup of your local copy is automatically saved.
          </span>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={onReloadServer}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-medium border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              Load Cloud Version (r{conflictInfo.serverRevision || '?'})
            </button>
            <button
              onClick={onKeepLocal}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
            >
              Keep My Local Version
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
