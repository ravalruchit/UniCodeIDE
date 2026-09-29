import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { lmsService } from '../../../services/lmsService';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { CourseStatusBadge } from '../../../components/lms/CourseStatusBadge';
import { ModuleAccordion } from '../../../components/lms/ModuleAccordion';
import { ProgressBar } from '../../../components/lms/ProgressBar';
import {
  ArrowLeft,
  BookOpen,
  Users,
  Layers,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trash2,
  GraduationCap,
  Calendar,
  ExternalLink,
} from 'lucide-react';

export default function CourseDetailsAdmin() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [curriculum, setCurriculum] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('curriculum'); // 'curriculum' | 'students' | 'overview'
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [cRes, currRes, sRes] = await Promise.all([
        lmsService.getCourse(courseId),
        lmsService.getCourseCurriculum(courseId),
        lmsService.getCourseStudents(courseId),
      ]);

      if (cRes.success) setCourse(cRes.course);
      if (currRes.success) setCurriculum(currRes.curriculum || []);
      if (sRes.success) setStudents(sRes.students || []);
    } catch (err) {
      setError(err.message || 'Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      await lmsService.updateCourseStatus(courseId, newStatus);
      setCourse((prev) => ({ ...prev, status: newStatus }));
    } catch (err) {
      alert(err.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete "${course?.title}" and all its curriculum data?`)) {
      return;
    }
    try {
      await lmsService.deleteCourse(courseId);
      navigate('/app/university-admin/courses');
    } catch (err) {
      alert(err.message || 'Failed to delete course');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 w-36 bg-muted rounded" />
        <div className="h-32 bg-card rounded-xl border border-border" />
        <div className="h-64 bg-card rounded-xl border border-border" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="p-8 text-center rounded-xl border border-destructive/30 bg-destructive/5 text-destructive space-y-3">
        <AlertCircle className="w-8 h-8 mx-auto" />
        <p className="text-sm font-semibold">{error || 'Course not found'}</p>
        <Link to="/app/university-admin/courses">
          <Button variant="outline" size="sm">
            Back to Courses
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
          to="/app/university-admin/courses"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Course Catalog</span>
        </Link>
      </div>

      {/* Course Hero Banner */}
      <Card className="p-6 bg-gradient-to-br from-card via-card to-muted/20 border-border">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono font-bold text-xs px-2.5 py-1 rounded bg-primary/10 text-primary border border-primary/20">
                {course.code}
              </span>
              <span className="text-xs px-2 py-0.5 rounded font-mono font-medium border border-border bg-muted/30">
                {course.level}
              </span>
              <CourseStatusBadge status={course.status} />
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" />
                {course.departmentId?.name || 'Department'}
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {course.title}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
              {course.description || 'No description provided.'}
            </p>

            {/* Quick Metrics */}
            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-primary" />
                <span>{course.duration}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-primary" />
                <span>{course.modulesCount || curriculum.length} Modules</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-primary" />
                <span>{students.length} Enrolled Students</span>
              </div>
              <div className="flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-primary" />
                <span>{course.credits} Credits</span>
              </div>
            </div>
          </div>

          {/* Action Panel */}
          <div className="flex flex-col gap-2 shrink-0 md:min-w-[180px]">
            <label className="text-[11px] font-mono text-muted-foreground uppercase">
              Course Status
            </label>
            <select
              value={course.status}
              disabled={updatingStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-md border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50"
            >
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteCourse}
              className="mt-2 text-destructive hover:bg-destructive/10 border-destructive/30 gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Course</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border">
        <button
          type="button"
          onClick={() => setActiveTab('curriculum')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'curriculum'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Curriculum Modules ({curriculum.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('students')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'students'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Enrolled Students ({students.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Syllabus & Faculty</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'curriculum' && (
        <div className="space-y-4">
          <ModuleAccordion curriculum={curriculum} />
        </div>
      )}

      {activeTab === 'students' && (
        <Card className="overflow-hidden">
          {students.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Users className="w-8 h-8 text-muted-foreground mx-auto opacity-50" />
              <p className="text-sm font-semibold text-foreground">No students enrolled yet</p>
              <p className="text-xs text-muted-foreground">
                Once students enroll from their course catalog, their progress will be tracked here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/30 border-b border-border text-muted-foreground font-mono uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Student</th>
                    <th className="px-5 py-3 font-semibold">Student ID</th>
                    <th className="px-5 py-3 font-semibold">Enrollment Date</th>
                    <th className="px-5 py-3 font-semibold">Lessons Completed</th>
                    <th className="px-5 py-3 font-semibold">Progress</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {students.map((entry) => (
                    <tr key={entry.enrollmentId} className="hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-foreground">{entry.student?.name}</div>
                        <div className="text-[11px] text-muted-foreground">{entry.student?.email}</div>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-muted-foreground">
                        {entry.student?.studentId || 'N/A'}
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground">
                        {new Date(entry.enrolledAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5 text-foreground font-medium">
                        {entry.completedLessons} / {entry.totalLessons}
                      </td>
                      <td className="px-5 py-3.5 w-44">
                        <ProgressBar value={entry.progressPercentage} size="sm" />
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
                          {entry.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card className="p-5 space-y-3">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider font-mono">
                Official Syllabus
              </h3>
              <div className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed">
                {course.syllabus || 'No detailed syllabus text added yet.'}
              </div>
            </Card>

            <Card className="p-5 space-y-3">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider font-mono">
                Prerequisites
              </h3>
              {course.prerequisites?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {course.prerequisites.map((p, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-md text-xs font-mono bg-muted border border-border text-foreground"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No prerequisites required.</p>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-5 space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider font-mono">
                Assigned Instructors
              </h3>
              <div className="space-y-3">
                {course.instructors?.length > 0 ? (
                  course.instructors.map((inst) => (
                    <div key={inst._id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                        {inst.name?.charAt(0) || 'F'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{inst.name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{inst.email}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">No faculty members assigned yet.</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
