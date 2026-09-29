import React from 'react';
import { Monitor, Building2, Shield, Settings, Key } from 'lucide-react';

export default function LabCard({ lab, onGenerateToken, onManageDevices, onEditPolicies }) {
  const policies = lab.policies || {};

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg text-white">{lab.name}</h3>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                {lab.code}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
              <Building2 className="w-3.5 h-3.5" />
              <span>
                {lab.building || 'Main Campus'} {lab.room ? `• Room ${lab.room}` : ''}
              </span>
            </div>
          </div>
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
              lab.status === 'ACTIVE'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}
          >
            {lab.status}
          </span>
        </div>

        {lab.description && (
          <p className="text-xs text-slate-400 line-clamp-2 mb-4">{lab.description}</p>
        )}

        <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-slate-950/40 rounded-lg border border-slate-800/60">
          <div>
            <div className="text-[11px] text-slate-400">Enrolled Devices</div>
            <div className="text-base font-semibold text-white flex items-center gap-1.5 mt-0.5">
              <Monitor className="w-4 h-4 text-indigo-400" />
              {lab.deviceCount || 0} / {lab.capacity || 30}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Idle Timeout</div>
            <div className="text-base font-semibold text-white mt-0.5">
              {policies.idleTimeoutMinutes || 30} min
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {policies.allowExamWorkspace && (
            <span className="text-[10px] px-2 py-0.5 bg-indigo-500/10 text-indigo-300 rounded border border-indigo-500/20 flex items-center gap-1">
              <Shield className="w-2.5 h-2.5" /> Exam Ready
            </span>
          )}
          {policies.disableDevTools && (
            <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded">
              Locked DevTools
            </span>
          )}
          {policies.clearLocalCacheOnLogout && (
            <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded">
              Auto-Wipe Cache
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-slate-800/80">
        <button
          onClick={() => onManageDevices(lab)}
          className="flex-1 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-750 hover:text-white rounded-lg transition-colors flex items-center justify-center gap-1.5"
        >
          <Monitor className="w-3.5 h-3.5" />
          View Devices
        </button>
        <button
          onClick={() => onGenerateToken(lab)}
          className="px-3 py-1.5 text-xs font-medium text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-lg transition-colors flex items-center gap-1.5 border border-indigo-500/20"
          title="Generate Device Enrollment Token"
        >
          <Key className="w-3.5 h-3.5" />
          Enroll
        </button>
        {onEditPolicies && (
          <button
            onClick={() => onEditPolicies(lab)}
            className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-800/60 rounded-lg hover:bg-slate-800"
            title="Lab Policies"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
