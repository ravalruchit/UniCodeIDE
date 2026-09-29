import React from 'react';
import { Building2, Monitor, LogOut, Shield, Wifi } from 'lucide-react';

export default function DesktopHeader({
  deviceInfo,
  labInfo,
  student,
  kioskActive = false,
  onLogout,
}) {
  return (
    <header className="h-14 bg-slate-950 border-b border-slate-800 px-5 flex items-center justify-between text-xs select-none">
      {/* Institutional Lab & Device Context */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 font-semibold text-white">
          <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-white text-[11px] font-bold">
            U
          </div>
          <span>UniCodeIDE Lab</span>
        </div>

        <div className="h-4 w-[1px] bg-slate-800" />

        <div className="flex items-center gap-2 text-slate-300">
          <Building2 className="w-3.5 h-3.5 text-indigo-400" />
          <span>{labInfo?.name || 'Computer Laboratory'}</span>
          <span className="font-mono text-slate-500">({labInfo?.code || 'LAB'})</span>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
          <Monitor className="w-3 h-3 text-slate-500" />
          <span className="font-mono text-[11px] text-slate-300">{deviceInfo?.deviceName || 'WORKSTATION'}</span>
        </div>
      </div>

      {/* Right Controls: Student Info, Kiosk Status, Logout */}
      <div className="flex items-center gap-3">
        {kioskActive && (
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-medium text-[11px]">
            <Shield className="w-3 h-3" />
            <span>Restricted Exam Mode</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 text-emerald-400 text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Connected</span>
        </div>

        {student && (
          <>
            <div className="h-4 w-[1px] bg-slate-800" />
            <div className="text-right">
              <div className="font-semibold text-white">{student.name}</div>
              <div className="text-[10px] text-slate-500">{student.email}</div>
            </div>
            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 font-medium transition-colors flex items-center gap-1.5"
              title="Logout and Reset Workstation"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Leave Lab</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
}
