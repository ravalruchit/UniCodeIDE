import React from 'react';
import { WifiOff, ShieldCheck } from 'lucide-react';

export function OfflineBanner({ isOffline }) {
  if (!isOffline) return null;

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between text-xs text-amber-500 shrink-0 select-none animate-in slide-in-from-top-2 duration-200">
      <div className="flex items-center gap-2">
        <WifiOff className="h-4 w-4 shrink-0" />
        <span className="font-semibold">You are working offline.</span>
        <span className="text-muted-foreground hidden sm:inline">
          Your code is actively saved in local recovery storage and will sync automatically when your connection returns.
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-[11px] font-medium bg-amber-500/20 px-2 py-0.5 rounded text-amber-600 dark:text-amber-400">
        <ShieldCheck className="h-3.5 w-3.5" />
        <span>Local Recovery Active</span>
      </div>
    </div>
  );
}
