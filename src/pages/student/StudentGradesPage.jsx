import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { submissionService } from '../../services/submissionService';
import { examService } from '../../services/examService';
import {
  Award,
  BarChart3,
  CheckCircle2,
  Clock,
  FileCheck2,
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { SubmissionStatusBadge } from '../../components/assignment/SubmissionStatusBadge';

export default function StudentGradesPage() {
  const [submissions, setSubmissions] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('assignments'); // 'assignments' | 'exams'
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subRes, examRes] = await Promise.all([
        submissionService.getSubmissions(),
        examService.getExams().catch(() => ({ exams: [] })),
      ]);

      if (subRes.success) {
        setSubmissions(subRes.submissions || []);
      }
      if (examRes.exams) {
        setExams(examRes.exams || []);
      }
    } catch (err) {
      console.error('Failed to load academic grades:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute grade metrics
  const evaluatedSubmissions = submissions.filter((s) => s.status === 'EVALUATED');
  const totalEarnedPoints = evaluatedSubmissions.reduce((acc, s) => acc + (s.score || 0), 0);
  const totalPossiblePoints = evaluatedSubmissions.reduce(
    (acc, s) => acc + (s.maxScore || s.assignmentId?.totalMarks || 10),
    0
  );
  const averagePercentage =
    totalPossiblePoints > 0 ? Math.round((totalEarnedPoints / totalPossiblePoints) * 100) : 0;

  const filteredSubmissions = submissions.filter((s) => {
    const title = s.assignmentId?.title?.toLowerCase() || '';
    const course = s.courseId?.title?.toLowerCase() || '';
    return title.includes(searchTerm.toLowerCase()) || course.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-indigo-400" />
            Academic Grades & Evaluation Records
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Official coursework performance, verified evaluation marks, and coding assessment results.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg hover:bg-slate-750 transition-colors w-fit"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Cumulative GPA / Score</div>
          <div className="text-2xl font-bold text-white mt-1">
            {averagePercentage > 0 ? `${averagePercentage}%` : '—'}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">Across evaluated problem sets</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Points Earned</div>
          <div className="text-2xl font-bold text-white mt-1">
            {totalEarnedPoints} / {totalPossiblePoints}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Total academic marks</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Completed Solutions</div>
          <div className="text-2xl font-bold text-white mt-1">{submissions.length}</div>
          <div className="text-[11px] text-indigo-400 mt-1">
            {evaluatedSubmissions.length} evaluated by faculty
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Assessed Exams</div>
          <div className="text-2xl font-bold text-white mt-1">{exams.length}</div>
          <div className="text-[11px] text-amber-400 mt-1">Scheduled or completed</div>
        </div>
      </div>

      {/* Tab Switcher & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('assignments')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'assignments'
                ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Assignments ({submissions.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('exams')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'exams'
                ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Coding Examinations ({exams.length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search by title or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 pl-8 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
        </div>
      </div>

      {/* Main List */}
      {activeTab === 'assignments' ? (
        filteredSubmissions.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 rounded-xl border border-slate-800">
            <Award className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-300">No Grades Recorded</h3>
            <p className="text-xs text-slate-500 mt-1">
              Submit programming assignments to receive automated test scores and instructor marks.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Assignment / Course</th>
                  <th className="py-3 px-4">Submitted At</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Earned Score</th>
                  <th className="py-3 px-4 text-right">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredSubmissions.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-850/40 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-semibold text-white">
                          {s.assignmentId?.title || 'Assignment Solution'}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {s.courseId?.title || 'Coursework'}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      {s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <SubmissionStatusBadge status={s.status} />
                    </td>
                    <td className="py-3 px-4">
                      {s.score !== undefined && s.score !== null ? (
                        <div className="font-mono font-bold text-white">
                          <span className="text-emerald-400">{s.score}</span> /{' '}
                          {s.maxScore || s.assignmentId?.totalMarks || 10}
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Under Evaluation</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/app/student/submissions/${s._id}`}
                        className="px-2.5 py-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 hover:bg-slate-800 rounded transition-colors inline-flex items-center gap-1"
                      >
                        <span>Details</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exams.map((exam) => (
            <div
              key={exam._id}
              className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-semibold text-white text-sm">{exam.title}</h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                    {exam.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-4 line-clamp-2">{exam.instructions}</p>
                <div className="text-[11px] text-slate-500 space-y-1">
                  <div>Duration: {exam.durationMinutes} minutes</div>
                  <div>Proctoring Mode: {exam.proctoringMode}</div>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {exam.status === 'LIVE' ? 'Active Assessment' : 'Scheduled'}
                </span>
                <Link
                  to="/app/student/exams"
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  View Exam
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
