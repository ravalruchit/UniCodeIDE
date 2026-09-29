import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { assignmentService } from '../../../services/assignmentService';
import { submissionService } from '../../../services/submissionService';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { SubmissionStatusBadge } from '../../../components/assignment/SubmissionStatusBadge';
import { LanguageBadge } from '../../../components/assignment/LanguageBadge';
import {
  ArrowLeft,
  Users,
  Search,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Calendar,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export default function TeacherSubmissionsList() {
  const { assignmentId } = useParams();

  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      if (assignmentId) {
        const [asgRes, subRes] = await Promise.all([
          assignmentService.getAssignment(assignmentId),
          submissionService.getSubmissions({ assignmentId }),
        ]);

        if (asgRes.success) setAssignment(asgRes.assignment);
        if (subRes.success) setSubmissions(subRes.submissions || []);
      } else {
        const subRes = await submissionService.getSubmissions({});
        if (subRes.success) setSubmissions(subRes.submissions || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [assignmentId]);

  const filtered = submissions.filter((s) => {
    const term = searchTerm.toLowerCase();
    const nameMatch = s.studentId?.name?.toLowerCase().includes(term);
    const emailMatch = s.studentId?.email?.toLowerCase().includes(term);
    const idMatch = s.studentId?.studentId?.toLowerCase().includes(term);
    const asgMatch = s.assignmentId?.title?.toLowerCase().includes(term);

    const matchesSearch = !searchTerm || nameMatch || emailMatch || idMatch || asgMatch;
    const matchesStatus = !statusFilter || s.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const evaluatedList = submissions.filter((s) => s.status === 'EVALUATED' && s.score !== null);
  const avgScore =
    evaluatedList.length > 0
      ? Math.round(
          (evaluatedList.reduce((acc, curr) => acc + (curr.score / (curr.maxScore || 100)) * 100, 0) /
            evaluatedList.length) *
            10
        ) / 10
      : null;

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-6">
        <div className="h-6 w-36 bg-muted rounded" />
        <div className="h-32 bg-card rounded-xl border border-border" />
        <div className="h-64 bg-card rounded-xl border border-border" />
      </div>
    );
  }

  if (error || (assignmentId && !assignment)) {
    return (
      <div className="p-8 text-center rounded-xl border border-destructive/30 bg-destructive/5 text-destructive space-y-3">
        <AlertCircle className="w-8 h-8 mx-auto" />
        <p className="text-sm font-semibold">{error || 'Assignment not found'}</p>
        <Link to="/app/teacher/assignments">
          <Button variant="outline" size="sm">
            Back to Assignments
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/app/teacher/assignments"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Assignments</span>
        </Link>
      </div>

      {/* Hero Header */}
      <Card className="p-6 bg-gradient-to-br from-card via-card to-muted/20 border-border">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-2 flex-1">
            {assignment ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                    {assignment.courseId?.code}
                  </span>
                  <LanguageBadge language={assignment.programmingLanguage} />
                  <span className="text-xs text-muted-foreground font-mono">
                    Total: {assignment.totalMarks} pts (Passing: {assignment.passingMarks})
                  </span>
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {assignment.title}
                </h1>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">
                  {assignment.description || 'Student submission management and grading.'}
                </p>

                <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    Due: {new Date(assignment.dueDate).toLocaleDateString()}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                    FACULTY HUB
                  </span>
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Student Coding Submissions
                </h1>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">
                  Review, evaluate, and provide marks and feedback on student programming solutions across all active courses.
                </p>
              </>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            className="gap-2 self-start"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>
        </div>
      </Card>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold font-mono text-foreground">
            {submissions.length}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">Total Submissions</div>
        </Card>

        <Card className="p-4 text-center">
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {submissions.filter((s) => s.status === 'EVALUATED').length}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">Evaluated</div>
        </Card>

        <Card className="p-4 text-center">
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
            {submissions.filter((s) => s.status === 'SUBMITTED' || s.status === 'UNDER_REVIEW').length}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">Pending Review</div>
        </Card>

        <Card className="p-4 text-center">
          <div className="text-2xl font-bold font-mono text-primary">
            {avgScore !== null ? `${avgScore}%` : 'N/A'}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">Average Score</div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search student by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-lg border border-border bg-card text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value="">All Submission Statuses</option>
          <option value="SUBMITTED">Submitted (Pending)</option>
          <option value="EVALUATED">Evaluated</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="RETURNED">Returned</option>
        </select>
      </div>

      {/* Submissions Table / Cards */}
      <Card className="overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Users className="w-8 h-8 text-muted-foreground mx-auto opacity-50" />
            <p className="text-sm font-semibold text-foreground">No submissions found</p>
            <p className="text-xs text-muted-foreground">
              {searchTerm || statusFilter
                ? 'No student submissions match your filter.'
                : 'Enrolled students have not submitted work for this assignment yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/30 border-b border-border text-muted-foreground font-mono uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 font-semibold">Student</th>
                  {!assignment && <th className="px-5 py-3 font-semibold">Assignment</th>}
                  <th className="px-5 py-3 font-semibold">Attempt</th>
                  <th className="px-5 py-3 font-semibold">Submitted At</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Score</th>
                  <th className="px-5 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((sub) => {
                  const passingScore =
                    assignment?.passingMarks ||
                    sub.assignmentId?.passingMarks ||
                    Math.round((sub.maxScore || 100) * 0.4);
                  return (
                    <tr key={sub._id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-foreground">{sub.studentId?.name}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {sub.studentId?.studentId ? `${sub.studentId.studentId} • ` : ''}
                          {sub.studentId?.email}
                        </div>
                      </td>

                      {!assignment && (
                        <td className="px-5 py-3.5 font-medium text-foreground">
                          {sub.assignmentId?.title || 'Coding Assignment'}
                        </td>
                      )}

                      <td className="px-5 py-3.5 font-mono text-muted-foreground">
                        Attempt {sub.attemptNumber}
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="text-foreground">
                          {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : 'N/A'}
                        </div>
                        {sub.isLate && (
                          <span className="text-[10px] font-mono text-destructive font-bold">
                            LATE SUBMISSION
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3.5">
                        <SubmissionStatusBadge status={sub.status} isLate={sub.isLate} />
                      </td>

                      <td className="px-5 py-3.5 font-mono font-medium">
                        {sub.score !== null ? (
                          <span
                            className={
                              sub.score >= passingScore
                                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                                : 'text-destructive font-bold'
                            }
                          >
                            {sub.score} / {sub.maxScore}
                          </span>
                        ) : (
                          <span className="text-muted-foreground italic">Not graded</span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <Link to={`/app/teacher/submissions/${sub._id}`}>
                          <Button size="sm" variant="outline" className="text-xs gap-1">
                            <span>{sub.status === 'EVALUATED' ? 'View / Re-grade' : 'Review & Grade'}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
