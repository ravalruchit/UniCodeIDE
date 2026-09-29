import React, { useState } from 'react';
import { Key, Copy, Check, AlertCircle, X } from 'lucide-react';
import labService from '../../services/labService';

export default function EnrollmentTokenModal({ lab, onClose }) {
  const [loading, setLoading] = useState(false);
  const [tokenData, setTokenData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [expiresInHours, setExpiresInHours] = useState(24);
  const [maxUses, setMaxUses] = useState(1);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await labService.createEnrollmentToken({
        labId: lab._id,
        expiresInHours,
        maxUses,
      });
      setTokenData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to generate token');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (tokenData?.token) {
      navigator.clipboard.writeText(tokenData.token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Enroll Lab Workstation</h3>
            <p className="text-xs text-slate-400">{lab.name} ({lab.code})</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {!tokenData ? (
          <div className="space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed">
              Generate a temporary enrollment token to register a physical computer lab workstation with UniCodeIDE.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Validity
                </label>
                <select
                  value={expiresInHours}
                  onChange={(e) => setExpiresInHours(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value={2}>2 Hours</option>
                  <option value={8}>8 Hours</option>
                  <option value={24}>24 Hours</option>
                  <option value={72}>3 Days</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Max Uses
                </label>
                <select
                  value={maxUses}
                  onChange={(e) => setMaxUses(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value={1}>Single Workstation</option>
                  <option value={5}>Batch (5 Computers)</option>
                  <option value={25}>Full Room (25 Computers)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Generating...' : 'Generate Token'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
                Enrollment Code
              </span>
              <span className="font-mono text-xl font-bold text-indigo-400 tracking-wider select-all">
                {tokenData.token}
              </span>
              <div className="text-[11px] text-slate-400 mt-2">
                Expires in {expiresInHours}h • Max {tokenData.maxUses} uses
              </div>
            </div>

            <button
              onClick={handleCopy}
              className="w-full py-2.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-2 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  Copied to Clipboard!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Enrollment Code
                </>
              )}
            </button>

            <p className="text-[11px] text-slate-400 text-center">
              Paste this code into the UniCodeIDE Desktop Lab Client setup wizard on the target computer.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
