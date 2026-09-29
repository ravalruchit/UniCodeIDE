import React, { useState, useEffect } from 'react';
import { History, Shield, RefreshCw, Filter, Monitor, User } from 'lucide-react';
import labService from '../../services/labService';

export default function LabAuditPage() {
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [error, setError] = useState(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await labService.getAuditEvents({
        eventType: filterType || undefined,
        limit: 50,
      });
      setEvents(res.data?.events || []);
      setTotal(res.data?.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to fetch audit events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [filterType]);

  const getEventBadgeClass = (eventType) => {
    if (eventType.includes('DISABLED') || eventType.includes('FORCE_LOGOUT') || eventType.includes('REVOKED')) {
      return 'bg-red-500/10 text-red-400 border-red-500/20';
    }
    if (eventType.includes('ROTATED') || eventType.includes('KIOSK')) {
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
    if (eventType.includes('LOGIN') || eventType.includes('ENROLLED') || eventType.includes('ENABLED')) {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
    return 'bg-slate-800 text-slate-300 border-slate-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <History className="w-6 h-6 text-indigo-400" />
            Laboratory Audit Log
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Factual chronological telemetry and workstation session activity.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent text-white focus:outline-none"
            >
              <option value="">All Event Types</option>
              <option value="STUDENT_LOGIN">STUDENT_LOGIN</option>
              <option value="STUDENT_LOGOUT">STUDENT_LOGOUT</option>
              <option value="SESSION_FORCE_LOGOUT">SESSION_FORCE_LOGOUT</option>
              <option value="DEVICE_ENROLLED">DEVICE_ENROLLED</option>
              <option value="DEVICE_DISABLED">DEVICE_DISABLED</option>
              <option value="DEVICE_CREDENTIAL_ROTATED">DEVICE_CREDENTIAL_ROTATED</option>
              <option value="KIOSK_ENTERED">KIOSK_ENTERED</option>
              <option value="EXAM_MODE_ENTERED">EXAM_MODE_ENTERED</option>
            </select>
          </div>
          <button
            onClick={fetchEvents}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg hover:bg-slate-750"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Device</th>
              <th className="py-3 px-4">Student</th>
              <th className="py-3 px-4">Event Type</th>
              <th className="py-3 px-4">Source</th>
              <th className="py-3 px-4">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {events.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-slate-500">
                  No laboratory audit events recorded
                </td>
              </tr>
            ) : (
              events.map((evt) => (
                <tr key={evt._id} className="hover:bg-slate-850/40 transition-colors">
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                    {new Date(evt.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-indigo-300 font-semibold">
                      {evt.deviceId}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {evt.studentId ? (
                      <div className="flex items-center gap-1.5 text-slate-200">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{evt.studentId.name}</span>
                      </div>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-mono border ${getEventBadgeClass(
                        evt.eventType
                      )}`}
                    >
                      {evt.eventType}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-[11px] uppercase">
                    {evt.source}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-400 max-w-xs truncate">
                    {evt.metadata ? JSON.stringify(evt.metadata) : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
