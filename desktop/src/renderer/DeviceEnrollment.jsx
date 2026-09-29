import React, { useState } from 'react';
import { Monitor, Key, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

export default function DeviceEnrollment({ onEnrolled }) {
  const [deviceName, setDeviceName] = useState('');
  const [enrollmentToken, setEnrollmentToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!deviceName.trim() || !enrollmentToken.trim()) {
      setError('Please provide both a Device Name and Enrollment Code');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Call desktop IPC bridge
      if (window.desktopAPI?.device?.enroll) {
        const result = await window.desktopAPI.device.enroll({
          deviceName: deviceName.trim(),
          enrollmentToken: enrollmentToken.trim().toUpperCase(),
        });
        onEnrolled(result);
      } else {
        // Fallback for browser simulation / testing
        const res = await fetch('http://localhost:5000/api/lab/devices/enroll', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            deviceName: deviceName.trim(),
            enrollmentToken: enrollmentToken.trim().toUpperCase(),
          }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Enrollment failed');
        onEnrolled(data.data);
      }
    } catch (err) {
      setError(err.message || 'Device enrollment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-100">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 mx-auto mb-4">
          <Monitor className="w-6 h-6" />
        </div>

        <h2 className="text-xl font-bold text-center text-white">Workstation Provisioning</h2>
        <p className="text-xs text-slate-400 text-center mt-1 mb-6">
          Enroll this physical computer with UniCodeIDE to assign it to an institutional computer laboratory.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-300 mb-1.5">
              Workstation Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. LAB-204-17"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Unique identifier matching the physical computer label
            </span>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1.5">
              Enrollment Code
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="e.g. ENROLL-9AF4B12C"
                value={enrollmentToken}
                onChange={(e) => setEnrollmentToken(e.target.value.toUpperCase())}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono tracking-wider text-indigo-300 placeholder-slate-500 focus:outline-none focus:border-indigo-500 uppercase"
              />
              <Key className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              Provided by your University System Administrator
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-lg shadow-indigo-600/20"
          >
            {loading ? (
              'Enrolling Device...'
            ) : (
              <>
                <span>Complete Workstation Setup</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
