import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { assignmentService } from '../../../services/assignmentService';
import { lmsService } from '../../../services/lmsService';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { AssignmentStatusBadge } from '../../../components/assignment/AssignmentStatusBadge';
import { DifficultyBadge } from '../../../components/assignment/DifficultyBadge';
import { LanguageBadge } from '../../../components/assignment/LanguageBadge';
import {
  FileCode2,
  Plus,
  Search,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  X,
  Edit2,
  Trash2,
  FileCheck2,
  Calendar,
  Layers,
} from 'lucide-react';

export default function TeacherAssignmentList() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [notification, setNotification] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [asgRes, cRes] = await Promise.all([
        assignmentService.getAssignments({ myAssignments: 'true' }),
        lmsService.getCourses({ myCourses: 'true' }),
      ]);

      if (asgRes.success) setAssignments(asgRes.assignments || []);
      if (cRes.success) setCourses(cRes.courses || []);
    } catch (err) {
      setError(err.message || 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await assignmentService.updateAssignmentStatus(id, newStatus);
      showNotification(`Assignment marked as ${newStatus}`);
      setAssignments((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status: newStatus } : a))
      );
    } catch (err) {
      showNotification(err.message || 'Failed to update status', 'error');
    }
  };

  const handleDelete = async (asg) => {
    if (!window.confirm(`Are you sure you want to delete "${asg.title}" and all its student submissions?`)) {
      return;
    }
    try {
      await assignmentService.deleteAssignment(asg._id);
      showNotification('Assignment deleted');
      setAssignments((prev) => prev.filter((a) => a._id !== asg._id));
    } catch (err) {
      showNotification(err.message || 'Failed to delete assignment', 'error');
    }
  };

  const filtered = assignments.filter((a) => {
    const s = searchTerm.toLowerCase();
    const matchSearch =
      a.title.toLowerCase().includes(s) ||
      (a.description && a.description.toLowerCase().includes(s)) ||
      (a.courseId?.code && a.courseId.code.toLowerCase().includes(s));

    const matchCourse = !selectedCourse || a.courseId?._id === selectedCourse;
    const matchStatus = !selectedStatus || a.status === selectedStatus;

    return matchSearch && matchCourse && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-4 rounded-lg flex items-center justify-between border ${
            notification.type === 'error'
              ? 'bg-destructive/10 border-destructive/30 text-destructive'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
          }`}
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            {notification.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            <span>{notification.msg}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileCode2 className="w-6 h-6 text-primary" />
            Programming Assignments
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Author coding problem sets, define starter templates, and evaluate student submissions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link to="/app/teacher/assignments/new">
            <Button size="sm" className="gap-2 shadow-xs">
              <Plus className="w-4 h-4" />
              New Assignment
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search assignments by title or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-border bg-card text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">All Courses</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.code} - {c.title}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-border bg-card text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      {/* Main Assignment List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-36 rounded-xl bg-card border border-border animate-pulse p-5 space-y-3">
              <div className="h-5 w-1/3 bg-muted rounded" />
              <div className="h-4 w-1/2 bg-muted rounded" />
              <div className="h-8 w-full bg-muted/60 rounded" />
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
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-dashed border-border bg-card space-y-3">
          <FileCode2 className="w-10 h-10 text-muted-foreground mx-auto opacity-40" />
          <h3 className="text-base font-semibold text-foreground">No Assignments Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {searchTerm || selectedCourse || selectedStatus
              ? 'No assignments match your search or filter options.'
              : 'Create your first programming assignment with instructions and starter code.'}
          </p>
          {!searchTerm && !selectedCourse && !selectedStatus && (
            <Link to="/app/teacher/assignments/new">
              <Button size="sm" className="mt-2">
                <Plus className="w-4 h-4 mr-1.5" />
                Create First Assignment
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((asg) => {
            const stats = asg.submissionStats || {
              totalSubmissions: 0,
              evaluatedCount: 0,
              pendingCount: 0,
            };
            const isDue = asg.isOverdue;

            return (
              <Card
                key={asg._id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:border-primary/40 transition-colors"
              >
                <div className="space-y-2.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                      {asg.courseId?.code || 'Course'}
                    </span>
                    <LanguageBadge language={asg.programmingLanguage} />
                    <DifficultyBadge difficulty={asg.difficulty} />
                    <AssignmentStatusBadge status={asg.status} />
                    {isDue && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-destructive/10 text-destructive border border-destructive/20 font-bold">
                        DUE PASSED
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-foreground leading-snug truncate">
                      {asg.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      {asg.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-5 text-xs text-muted-foreground pt-1">
                    <div className="flex items-center gap-1.5 font-mono">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      <span>Due: {new Date(asg.dueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono">
                      <FileCheck2 className="w-3.5 h-3.5 text-primary" />
                      <span>Total: {asg.totalMarks} pts (Pass: {asg.passingMarks})</span>
                    </div>
                    {asg.moduleId && (
                      <div className="flex items-center gap-1.5 text-muted-foreground truncate max-w-[200px]">
                        <Layers className="w-3.5 h-3.5" />
                        <span className="truncate">{asg.moduleId.title}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submissions Summary Stats */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 shrink-0 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
                  <div className="flex items-center gap-3 text-xs">
                    <div className="text-center px-3 py-1.5 rounded-lg bg-muted/40 border border-border">
                      <div className="font-bold text-foreground font-mono">{stats.totalSubmissions}</div>
                      <div className="text-[10px] text-muted-foreground">Submitted</div>
                    </div>
                    <div className="text-center px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <div className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        {stats.evaluatedCount}
                      </div>
                      <div className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80">Evaluated</div>
                    </div>
                    <div className="text-center px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <div className="font-bold text-amber-600 dark:text-amber-400 font-mono">
                        {stats.pendingCount}
                      </div>
                      <div className="text-[10px] text-amber-600/80 dark:text-amber-400/80">Pending</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link to={`/app/teacher/assignments/${asg._id}/submissions`}>
                      <Button size="sm" variant="outline" className="text-xs gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        <span>Submissions ({stats.totalSubmissions})</span>
                      </Button>
                    </Link>

                    <Link to={`/app/teacher/assignments/${asg._id}/edit`}>
                      <Button size="sm" variant="outline" className="text-xs p-2" title="Edit Assignment">
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDelete(asg)}
                      className="p-2 rounded-md border border-border hover:bg-destructive/10 text-muted-foreground hover:text-destructive cursor-pointer transition-colors"
                      title="Delete Assignment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
