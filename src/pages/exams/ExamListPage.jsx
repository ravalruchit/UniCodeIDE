import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { examService } from '../../services/examService';
import { ExamCard } from '../../components/exams/ExamCard';
import { ExamInstructionsModal } from '../../components/exams/ExamInstructionsModal';
import {
  GraduationCap,
  Plus,
  RefreshCw,
  Search,
  Filter,
  AlertCircle,
  FileCode2,
  X,
} from 'lucide-react';

export function ExamListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Selected exam for instructions modal
  const [selectedExam, setSelectedExam] = useState(null);
  const [isStarting, setIsStarting] = useState(false);

  const isTeacher = user?.role === 'TEACHER' || user?.role === 'UNIVERSITY_ADMIN' || user?.role === 'SUPER_ADMIN';

  const loadExams = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await examService.getExams();
      if (res && res.exams) {
        setExams(res.exams);
      }
    } catch (err) {
      setError(err.message || 'Failed to load examinations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExams();
  }, []);

  const handleResumeExam = (sessionId) => {
    if (sessionId) {
      navigate(`/app/exam-session/${sessionId}`);
    }
  };

  const handleBeginExam = (examId) => {
    const exam = exams.find((e) => e._id === examId);
    if (!exam) return;

    // If there's an active in-progress session, navigate directly to it
    if (exam.hasActiveSession && exam.studentSession?.id) {
      navigate(`/app/exam-session/${exam.studentSession.id}`);
      return;
    }

    // If attempts are exhausted (and no active session), block and show info
    if (exam.attemptsUsed >= (exam.maxAttempts || 1) && !exam.hasActiveSession) {
      setError(`You have used all ${exam.maxAttempts || 1} attempt(s) for this examination. No further attempts are permitted.`);
      return;
    }

    setError(null);
    setSelectedExam(exam);
  };

  const handleAgreeAndStart = async () => {
    if (!selectedExam) return;
    setIsStarting(true);
    setError(null);
    try {
      const res = await examService.startExam(selectedExam._id);
      if (res && res.session) {
        setSelectedExam(null);
        navigate(`/app/exam-session/${res.session.id}`);
      }
    } catch (err) {
      setError(err.message || 'Unable to launch examination session');
      setSelectedExam(null);
    } finally {
      setIsStarting(false);
    }
  };

  const filteredExams = exams.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.courseId?.code?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span>Coding Examinations</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isTeacher
              ? 'Manage, schedule, and live-monitor secure proctored coding assessments.'
              : 'Timed examinations with server-enforced deadlines and isolated Docker code execution.'}
          </p>
        </div>

        {isTeacher && (
          <button
            onClick={() => navigate('/app/teacher/exams/new')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Exam</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search exams by title or course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-muted-foreground hidden sm:inline" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">All Statuses</option>
            <option value="LIVE">Live Now</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="ENDED">Ended</option>
            {isTeacher && <option value="DRAFT">Draft</option>}
          </select>

          <button
            onClick={loadExams}
            disabled={loading}
            className="p-2 rounded-lg border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Refresh List"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="p-1 rounded hover:bg-rose-500/20 text-rose-400 hover:text-rose-200 transition-colors"
            title="Dismiss error"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Exam Grid */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground space-y-2">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-xs">Loading examinations...</p>
        </div>
      ) : filteredExams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredExams.map((exam) => (
            <ExamCard
              key={exam._id}
              exam={exam}
              userRole={user?.role}
              onBegin={handleBeginExam}
              onResume={handleResumeExam}
              onViewDetails={() => {}}
              onMonitor={(id) => navigate(`/app/teacher/exams/${id}/monitoring`)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 rounded-xl border border-dashed border-border p-8 space-y-2 text-muted-foreground">
          <FileCode2 className="h-10 w-10 mx-auto text-muted-foreground/60" />
          <p className="text-sm font-semibold text-foreground">No examinations found</p>
          <p className="text-xs">
            {isTeacher
              ? 'Click "Create New Exam" to author coding questions and set schedules.'
              : 'There are no active or scheduled examinations in your enrolled courses.'}
          </p>
        </div>
      )}

      {/* Pre-Exam Instructions & Consent Modal */}
      <ExamInstructionsModal
        isOpen={Boolean(selectedExam)}
        exam={selectedExam}
        isStarting={isStarting}
        onClose={() => {
          if (!isStarting) setSelectedExam(null);
        }}
        onAgreeAndStart={handleAgreeAndStart}
      />
    </div>
  );
}
