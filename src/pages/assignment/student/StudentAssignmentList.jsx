import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { assignmentService } from '../../../services/assignmentService';
import { lmsService } from '../../../services/lmsService';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { SubmissionStatusBadge } from '../../../components/assignment/SubmissionStatusBadge';
import { DifficultyBadge } from '../../../components/assignment/DifficultyBadge';
import { LanguageBadge } from '../../../components/assignment/LanguageBadge';
import {
  FileCode2,
  Search,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  FileCheck2,
  Calendar,
  Sparkles,
  ChevronRight,
  Award,
} from 'lucide-react';

export default function StudentAssignmentList() {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'completed'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [asgRes, cRes] = await Promise.all([
        assignmentService.getAssignments(),
        lmsService.getMyEnrolledCourses('ACTIVE'),
      ]);

      if (asgRes.success) setAssignments(asgRes.assignments || []);
      if (cRes.success) {
        setCourses(cRes.enrollments?.map((e) => e.course).filter(Boolean) || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const pendingList = assignments.filter((a) => {
    const status = a.studentStatus?.latestSubmission?.status;
    return !status || status === 'DRAFT';
  });

  const completedList = assignments.filter((a) => {
    const status = a.studentStatus?.latestSubmission?.status;
    return status && status !== 'DRAFT';
  });

  const displayedList = (activeTab === 'pending' ? pendingList : completedList).filter((a) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      a.title.toLowerCase().includes(term) ||
      (a.description && a.description.toLowerCase().includes(term)) ||
      (a.courseId?.code && a.courseId.code.toLowerCase().includes(term));

    const matchesCourse = !selectedCourse || a.courseId?._id === selectedCourse;

    return matchesSearch && matchesCourse;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileCode2 className="w-6 h-6 text-primary" />
            Course Assignments
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Complete programming tasks, submit code solutions, and inspect faculty evaluations.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchData}
          disabled={loading}
          className="gap-2 self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 border-b md:border-b-0 border-border">
          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'pending'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>To Do / In Progress ({pendingList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'completed'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Submitted & Graded ({completedList.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search assignment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-border bg-card text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">All Courses</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.code}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-32 rounded-xl bg-card border border-border animate-pulse p-5 space-y-3">
              <div className="h-5 w-1/3 bg-muted rounded" />
              <div className="h-4 w-1/2 bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center rounded-xl border border-destructive/30 bg-destructive/5 text-destructive space-y-3">
          <AlertCircle className="w-8 h-8 mx-auto" />
          <p className="text-sm font-semibold">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchData}>
            Retry
          </Button>
        </div>
      ) : displayedList.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-dashed border-border bg-card space-y-3">
          <Sparkles className="w-10 h-10 text-muted-foreground mx-auto opacity-40" />
          <h3 className="text-base font-semibold text-foreground">
            {activeTab === 'pending' ? 'All caught up!' : 'No completed submissions'}
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {activeTab === 'pending'
              ? 'You have no outstanding assignments to submit at this time.'
              : 'Assignments you submit will be shown here along with teacher marks and feedback.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedList.map((asg) => {
            const studentStatus = asg.studentStatus;
            const sub = studentStatus?.latestSubmission;
            const hasDraft = studentStatus?.hasDraft;
            const isDue = asg.isOverdue;

            return (
              <Card
                key={asg._id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:border-primary/40 transition-colors"
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                      {asg.courseId?.code}
                    </span>
                    <LanguageBadge language={asg.programmingLanguage} />
                    <DifficultyBadge difficulty={asg.difficulty} />
                    {sub ? (
                      <SubmissionStatusBadge status={sub.status} isLate={sub.isLate} />
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-muted text-muted-foreground border border-border">
                        Not Submitted
                      </span>
                    )}
                    {isDue && !sub && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-destructive/10 text-destructive border border-destructive/20 font-bold">
                        DUE DATE PASSED
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-foreground leading-snug truncate">
                      {asg.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      {asg.description || 'Complete programming solution according to problem instructions.'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-5 text-xs text-muted-foreground pt-1">
                    <div className="flex items-center gap-1.5 font-mono">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      <span>Due: {new Date(asg.dueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono">
                      <FileCheck2 className="w-3.5 h-3.5 text-primary" />
                      <span>{asg.totalMarks} Points</span>
                    </div>
                    <div className="text-[11px] font-mono text-muted-foreground">
                      Attempts: {studentStatus?.attemptsUsed || 0} / {asg.maxAttempts}
                    </div>
                  </div>
                </div>

                {/* Score & Action Button Area */}
                <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 border-t md:border-t-0 pt-4 md:pt-0">
                  {sub?.status === 'EVALUATED' && (
                    <div className="text-right pr-2">
                      <div className="text-xs text-muted-foreground">Score</div>
                      <div
                        className={`text-lg font-mono font-bold ${
                          sub.score >= asg.passingMarks
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-destructive'
                        }`}
                      >
                        {sub.score} / {asg.totalMarks}
                      </div>
                    </div>
                  )}

                  {sub?.status === 'EVALUATED' ? (
                    <Link to={`/app/student/submissions/${sub._id}`}>
                      <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                        <Award className="w-3.5 h-3.5" />
                        <span>View Result</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  ) : (
                    <Link to={`/app/student/assignments/${asg._id}`}>
                      <Button size="sm" className="gap-1.5 text-xs shadow-xs">
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>{hasDraft ? 'Resume Solution' : 'Start Solution'}</span>
                      </Button>
                    </Link>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
