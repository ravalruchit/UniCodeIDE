import React from 'react';
import {
  X,
  Cloud,
  CheckCircle2,
  HardDrive,
  Wifi,
  WifiOff,
  RefreshCw,
  Download,
} from 'lucide-react';
import { SYNC_STATES } from '../../utils/workspaceSyncUtils';

export function SaveRecoveryPanel({
  isOpen,
  onClose,
  syncState,
  revision = 1,
  lastSavedAt,
  isOnline,
  files = [],
  onManualSync,
  isSaving,
}) {
  if (!isOpen) return null;

  const handleDownloadBackup = () => {
    const backupData = {
      revision,
      exportedAt: new Date().toISOString(),
      files,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `unicodeide_workspace_backup_r${revision}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-left">
      <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Cloud className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm text-foreground">Cloud Sync & Telemetry</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 space-y-3.5 text-xs">
          {/* Status Row */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 border border-border">
            <span className="text-muted-foreground">Sync State</span>
            <span className="font-mono font-bold text-foreground uppercase">{syncState}</span>
          </div>

          {/* Cloud Revision */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 border border-border">
            <span className="text-muted-foreground">Cloud Revision</span>
            <span className="font-mono font-bold text-primary">r{revision}</span>
          </div>

          {/* Last Saved */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 border border-border">
            <span className="text-muted-foreground">Last Successful Cloud Sync</span>
            <span className="font-mono text-foreground">
              {lastSavedAt ? new Date(lastSavedAt).toLocaleString() : 'Pending initial sync'}
            </span>
          </div>

          {/* Network Reachability */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 border border-border">
            <span className="text-muted-foreground">Network & API Connection</span>
            <div className="flex items-center gap-1.5 font-medium">
              {isOnline ? (
                <>
                  <Wifi className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-emerald-500">Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-amber-500">Offline / Unreachable</span>
                </>
              )}
            </div>
          </div>

          {/* Local Recovery */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 border border-border">
            <span className="text-muted-foreground">Local Recovery Buffer</span>
            <div className="flex items-center gap-1.5 text-emerald-500 font-medium">
              <HardDrive className="h-3.5 w-3.5" />
              <span>Active</span>
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="p-3 bg-muted/30 border-t border-border flex items-center justify-between gap-2">
          <button
            onClick={handleDownloadBackup}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download Backup</span>
          </button>

          <button
            onClick={onManualSync}
            disabled={isSaving || !isOnline}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSaving ? 'animate-spin' : ''}`} />
            <span>{isSaving ? 'Syncing...' : 'Sync Now'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
