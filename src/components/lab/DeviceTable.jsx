import React from 'react';
import { Monitor, User, Power, ShieldAlert, RefreshCw, Trash2 } from 'lucide-react';
import DeviceStatusBadge from './DeviceStatusBadge';

export default function DeviceTable({
  devices = [],
  onEnable,
  onDisable,
  onForceLogout,
  onRotateCredential,
  onRevoke,
}) {
  if (devices.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-900/40 rounded-xl border border-slate-800">
        <Monitor className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <h4 className="text-sm font-semibold text-slate-300">No Devices Enrolled</h4>
        <p className="text-xs text-slate-500 mt-1">
          Generate an enrollment token and install the Desktop Lab Client on lab computers.
        </p>
      </div>
    );
  }

  const isRecentlyActive = (heartbeatDate) => {
    if (!heartbeatDate) return false;
    const diffMs = Date.now() - new Date(heartbeatDate).getTime();
    return diffMs < 90000; // 90 seconds
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800">
          <tr>
            <th className="py-3 px-4">Device</th>
            <th className="py-3 px-4">Lab / Location</th>
            <th className="py-3 px-4">OS / Client</th>
            <th className="py-3 px-4">Current Session</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 text-slate-300">
          {devices.map((device) => {
            const online = isRecentlyActive(device.lastHeartbeatAt);
            const activeUser = device.activeStudentId;

            return (
              <tr key={device._id} className="hover:bg-slate-850/40 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded bg-slate-800 text-slate-300">
                      <Monitor className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">{device.deviceName}</div>
                      <div className="text-[11px] font-mono text-slate-500">{device.deviceId}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div>
                    <div className="font-medium text-slate-200">
                      {device.labId?.name || 'Unassigned'}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {device.location || device.labId?.room || 'Main Lab'}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="capitalize">{device.operatingSystem}</div>
                  <div className="text-[11px] text-slate-500">v{device.clientVersion}</div>
                </td>
                <td className="py-3 px-4">
                  {activeUser ? (
                    <div className="flex items-center gap-1.5 text-blue-300">
                      <User className="w-3.5 h-3.5" />
                      <span>{activeUser.name}</span>
                    </div>
                  ) : (
                    <span className="text-slate-500">Idle / Ready</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <DeviceStatusBadge
                    status={device.status}
                    isOnline={online}
                    activeStudent={activeUser}
                  />
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {activeUser && (
                      <button
                        onClick={() => onForceLogout(device)}
                        className="p-1.5 text-amber-400 hover:bg-amber-500/10 rounded transition-colors"
                        title="Force Logout Student"
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {device.status === 'ACTIVE' ? (
                      <button
                        onClick={() => onDisable(device)}
                        className="p-1.5 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                        title="Disable Device"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => onEnable(device)}
                        className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors"
                        title="Enable Device"
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => onRotateCredential(device)}
                      className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded transition-colors"
                      title="Rotate Device Secret"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onRevoke(device)}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
                      title="Revoke Device"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
