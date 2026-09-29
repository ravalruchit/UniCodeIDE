import React, { useState } from 'react';
import { Building2, Monitor, Lock, Mail, ArrowRight, AlertCircle, Shield } from 'lucide-react';

export default function DesktopLogin({ deviceInfo, labInfo, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please provide student email and password');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Call desktop IPC bridge
      if (window.desktopAPI?.session?.login) {
        const sessionData = await window.desktopAPI.session.login({
          email: email.trim().toLowerCase(),
          password,
        });
        onLoginSuccess(sessionData);
      } else {
        // Direct API fallback
        const res = await fetch('http://localhost:5000/api/lab/sessions/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            deviceId: deviceInfo?.deviceId,
            deviceSecret: deviceInfo?.deviceSecret,
            studentEmail: email.trim().toLowerCase(),
            studentPassword: password,
          }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Login failed');
        onLoginSuccess(data.data);
      }
    } catch (err) {
      setError(err.message || 'Student login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between p-8 text-slate-100 select-none">
      {/* Top Institutional Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md">
            U
          </div>
          <div>
            <div className="font-bold text-white text-sm">UniCodeIDE</div>
            <div className="text-[11px] text-slate-400">Institutional Workstation</div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>{labInfo?.name || 'Computer Lab'}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 font-mono text-slate-300">
            <Monitor className="w-3.5 h-3.5 text-slate-400" />
            <span>{deviceInfo?.deviceName || 'WORKSTATION'}</span>
          </div>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Student Workstation Login</h2>
          <p className="text-xs text-slate-400 mt-1">
            Sign in with your university account to access your cloud workspaces and assignments.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-300 mb-1.5">
              University Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="student@meridian.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 pl-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 pl-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-lg shadow-indigo-600/25"
          >
            {loading ? (
              'Authenticating with University...'
            ) : (
              <>
                <span>Begin Lab Session</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-slate-500" />
            All work is automatically synchronized to your cloud account.
          </p>
        </div>
      </div>

      {/* Bottom Footer Notice */}
      <div className="text-center text-[11px] text-slate-500">
        UniCodeIDE Lab Workstation Client • Version 1.0.0 • Protected by Institutional RBAC
      </div>
    </div>
  );
}
