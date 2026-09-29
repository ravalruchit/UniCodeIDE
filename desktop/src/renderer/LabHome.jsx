import React, { useState, useEffect } from 'react';
import {
  Code2,
  FileCode,
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  Shield,
  CheckCircle2,
  AlertCircle,
  Play,
} from 'lucide-react';
import DesktopHeader from './DesktopHeader';

export default function LabHome({
  deviceInfo,
  labInfo,
  student,
  session,
  token,
  onLaunchWorkspace,
  onLaunchExam,
  onLogout,
}) {
  const [recentWorkspaces, setRecentWorkspaces] = useState([]);
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch student's real cloud workspaces and exams
    async function fetchStudentData() {
      try {
        setLoading(true);
        const headers = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        };

        const [wsRes, examRes] = await Promise.all([
          fetch('http://localhost:5000/api/workspaces', { headers }).then((r) => r.json()),
          fetch('http://localhost:5000/api/exams', { headers }).then((r) => r.json()),
        ]);

        if (wsRes.success) setRecentWorkspaces(wsRes.data || []);
        if (examRes.success) setUpcomingExams(examRes.data || []);
      } catch (err) {
        console.warn('[LabHome] Failed to load student data:', err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchStudentData();
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100 select-none">
      <DesktopHeader
        deviceInfo={deviceInfo}
        labInfo={labInfo}
        student={student}
        onLogout={onLogout}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto p-8 space-y-8">
        {/* Welcome Banner */}
        <div className="flex items-center justify-between bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-900/40 rounded-2xl p-6 shadow-xl">
          <div>
            <div className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">
              Computer Lab Session Active
            </div>
            <h1 className="text-2xl font-bold text-white mt-1">
              Welcome, {student?.name || 'Student'}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              All code written on this computer automatically syncs to your persistent cloud account.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <div className="p-3 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400">
              <Shield className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Main Grid: Workspaces & Exams */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Cloud Workspaces */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Code2 className="w-4 h-4 text-indigo-400" />
                Continue Cloud Workspace
              </h2>
              <span className="text-xs text-slate-400">Synced to Server</span>
            </div>

            {recentWorkspaces.length === 0 ? (
              <div className="p-8 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                <FileCode className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <div className="text-xs font-semibold text-slate-300">No Active Workspaces</div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Open an assignment to initialize a cloud programming workspace.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentWorkspaces.slice(0, 3).map((ws) => (
                  <div
                    key={ws._id}
                    className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/40 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-semibold text-white text-xs flex items-center gap-2">
                        <span>{ws.name || 'Programming Workspace'}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 uppercase font-mono">
                          {ws.programmingLanguage}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        <span>Revision r{ws.revision || 1} • {ws.files?.length || 1} files</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onLaunchWorkspace(ws)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Open</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Today's Examination Center */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                Examination Center
              </h2>
              <span className="text-xs text-amber-400/80">Secure Assessment</span>
            </div>

            {upcomingExams.length === 0 ? (
              <div className="p-8 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                <Shield className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <div className="text-xs font-semibold text-slate-300">No Scheduled Exams</div>
                <p className="text-[11px] text-slate-500 mt-1">
                  You have no pending coding assessments for this workstation session.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingExams.slice(0, 3).map((exam) => (
                  <div
                    key={exam._id}
                    className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/40 transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-white text-xs flex items-center gap-2">
                        <span>{exam.title}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
                          {exam.durationMinutes} min
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Status: <strong className="text-slate-300">{exam.status}</strong> • Proctoring: {exam.proctoringMode}
                      </div>
                    </div>
                    <button
                      onClick={() => onLaunchExam(exam)}
                      className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Shield className="w-3 h-3" />
                      <span>Enter Exam</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Workstation Security Guarantees */}
        <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-white">Workstation Reset</div>
              <div className="text-slate-400 text-[11px] mt-0.5">
                Logging out wipes all local session data. Next student cannot access your work.
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-white">Server Authority</div>
              <div className="text-slate-400 text-[11px] mt-0.5">
                The cloud server is always the authoritative source of truth for code and exam timing.
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-white">Continuous Sync</div>
              <div className="text-slate-400 text-[11px] mt-0.5">
                Pick up immediately where you left off from your laptop at home.
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
