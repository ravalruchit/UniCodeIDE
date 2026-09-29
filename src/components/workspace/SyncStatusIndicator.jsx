import React from 'react';
import {
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  WifiOff,
  AlertCircle,
  Clock,
  Lock,
} from 'lucide-react';
import { SYNC_STATES } from '../../utils/workspaceSyncUtils';

export function SyncStatusIndicator({
  syncState,
  revision = 1,
  lastSavedAt,
  retryAttempt = 0,
  onClick,
}) {
  const formatTime = (date) => {
    if (!date) return '';
    const diff = Math.round((new Date() - new Date(date)) / 1000);
    if (diff < 5) return 'just now';
    if (diff < 60) return `${diff}s ago`;
    const mins = Math.floor(diff / 60);
    return `${mins}m ago`;
  };

  let content = null;

  switch (syncState) {
    case SYNC_STATES.SYNCED:
      content = (
        <div
          onClick={onClick}
          className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium px-2 py-0.5 rounded hover:bg-emerald-500/10 cursor-pointer transition-colors"
          title={`Synced to cloud at revision r${revision}`}
        >
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          <span>Saved {formatTime(lastSavedAt)}</span>
          <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">r{revision}</span>
        </div>
      );
      break;

    case SYNC_STATES.SAVING:
      content = (
        <div className="flex items-center gap-1.5 text-xs text-primary font-medium px-2 py-0.5 rounded bg-primary/10">
          <RefreshCw className="h-3.5 w-3.5 animate-spin shrink-0" />
          <span>Saving to cloud...</span>
        </div>
      );
      break;

    case SYNC_STATES.PENDING:
      content = (
        <div
          onClick={onClick}
          className="flex items-center gap-1.5 text-xs text-amber-500 font-medium px-2 py-0.5 rounded hover:bg-amber-500/10 cursor-pointer transition-colors"
          title="Changes queued for cloud synchronization"
        >
          <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
          <span>Unsynced changes</span>
        </div>
      );
      break;

    case SYNC_STATES.OFFLINE:
      content = (
        <div
          onClick={onClick}
          className="flex items-center gap-1.5 text-xs text-amber-500 font-medium px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 cursor-pointer"
          title="Network disconnected. Changes stored in local recovery."
        >
          <WifiOff className="h-3.5 w-3.5 shrink-0" />
          <span>Offline (Saved locally)</span>
        </div>
      );
      break;

    case SYNC_STATES.RETRYING:
      content = (
        <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-medium px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
          <RefreshCw className="h-3.5 w-3.5 animate-spin shrink-0" />
          <span>Reconnecting ({retryAttempt}/4)...</span>
        </div>
      );
      break;

    case SYNC_STATES.CONFLICT:
      content = (
        <div
          onClick={onClick}
          className="flex items-center gap-1.5 text-xs text-rose-500 font-semibold px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 cursor-pointer animate-pulse"
          title="Workspace updated on another device. Click to resolve."
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>Revision conflict</span>
        </div>
      );
      break;

    case SYNC_STATES.AUTH_EXPIRED:
      content = (
        <div
          onClick={onClick}
          className="flex items-center gap-1.5 text-xs text-orange-500 font-medium px-2 py-0.5 rounded bg-orange-500/10 border border-orange-500/20 cursor-pointer"
          title="Authentication expired. Click to re-authenticate."
        >
          <Lock className="h-3.5 w-3.5 shrink-0" />
          <span>Auth required</span>
        </div>
      );
      break;

    case SYNC_STATES.ERROR:
    default:
      content = (
        <div
          onClick={onClick}
          className="flex items-center gap-1.5 text-xs text-rose-500 font-medium px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 cursor-pointer"
          title="Sync paused due to connection error. Click for details."
        >
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span>Sync paused</span>
        </div>
      );
      break;
  }

  return <div className="inline-flex items-center select-none">{content}</div>;
}
