import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { examService } from '../../services/examService';
import {
  Activity,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
  Shield,
  Wifi,
  WifiOff,
} from 'lucide-react';

export function ExamMonitoringPage() {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [examRes, sessionsRes] = await Promise.all([
        examService.getExamById(examId),
        examService.getLiveExamSessions(examId),
      ]);

      if (examRes?.exam) setExam(examRes.exam);
      if (sessionsRes?.sessions) setSessions(sessionsRes.sessions);
    } catch (err) {
      setError(err.message || 'Failed to load monitoring data');
    } finally {
      setLoading(false);
    }
  }, [examId]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, [loadData]);

  const total = sessions.length;
  const inProgress = sessions.filter((s) => s.status === 'IN_PROGRESS').length;
  const submitted = sessions.filter((s) => s.status === 'SUBMITTED' || s.status === 'AUTO_SUBMITTED').length;
  const disconnected = sessions.filter((s) => s.connectionStatus === 'DISCONNECTED').length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-left">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/app/teacher/exams')}
            className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-500 animate-pulse" />
              <h1 className="text-xl font-bold text-foreground">Live Exam Monitor</h1>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Live
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">{exam?.title || 'Examination'}</p>
          </div>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border bg-background hover:bg-muted text-foreground transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Real-time KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card/60">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>Enrolled Candidates</span>
            <Users className="h-4 w-4" />
          </div>
          <p className="text-2xl font-bold text-foreground font-mono mt-2">{total}</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card/60">
          <div className="flex items-center justify-between text-emerald-500 text-xs font-semibold">
            <span>In Progress</span>
            <Clock className="h-4 w-4" />
          </div>
          <p className="text-2xl font-bold text-emerald-500 font-mono mt-2">{inProgress}</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card/60">
          <div className="flex items-center justify-between text-primary text-xs font-semibold">
            <span>Finalized Submissions</span>
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <p className="text-2xl font-bold text-foreground font-mono mt-2">{submitted}</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card/60">
          <div className="flex items-center justify-between text-amber-500 text-xs font-semibold">
            <span>Disconnected</span>
            <WifiOff className="h-4 w-4" />
          </div>
          <p className="text-2xl font-bold text-amber-500 font-mono mt-2">{disconnected}</p>
        </div>
      </div>

      {/* Candidate Sessions Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
          <h3 className="font-semibold text-sm text-foreground">Candidate Sessions</h3>
          <span className="text-xs font-mono text-muted-foreground">Auto-refreshing every 15s</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/30 border-b border-border text-[11px] font-mono text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Connection</th>
                <th className="px-4 py-3">Progress</th>
                <th className="px-4 py-3">Remaining Time</th>
                <th className="px-4 py-3">Proctoring Signals</th>
                <th className="px-4 py-3 text-right">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sessions.length > 0 ? (
                sessions.map((s) => {
                  const minutes = Math.floor(s.remainingSeconds / 60);
                  const seconds = s.remainingSeconds % 60;
                  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

                  return (
                    <tr key={s.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">
                        <div>{s.student?.name || 'Candidate'}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{s.student?.email}</div>
                      </td>
                      <td className="px-4 py-3 font-mono">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            s.status === 'IN_PROGRESS'
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : s.status === 'SUBMITTED'
                              ? 'bg-primary/10 text-primary'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono">
                        {s.connectionStatus === 'ONLINE' ? (
                          <span className="flex items-center gap-1 text-emerald-500">
                            <Wifi className="h-3.5 w-3.5" />
                            <span>Online</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-amber-500">
                            <WifiOff className="h-3.5 w-3.5" />
                            <span>Disconnected</span>
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono">
                        {s.answeredCount} / {s.totalQuestions} Problems
                      </td>
                      <td className="px-4 py-3 font-mono">{s.status === 'IN_PROGRESS' ? timeFormatted : '—'}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">
                        <span>Tabs: {s.proctoringStats?.tabHiddenCount || 0}</span>
                        <span className="mx-1.5">•</span>
                        <span>Fullscreen: {s.proctoringStats?.fullscreenExitCount || 0}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-right font-semibold text-foreground">
                        {s.score} / {s.maxScore}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    No candidates currently in examination session.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
