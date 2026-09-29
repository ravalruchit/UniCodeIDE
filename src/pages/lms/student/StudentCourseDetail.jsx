import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { lmsService } from '../../../services/lmsService';
import { assignmentService } from '../../../services/assignmentService';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { ProgressBar } from '../../../components/lms/ProgressBar';
import { ModuleAccordion } from '../../../components/lms/ModuleAccordion';
import { LanguageBadge } from '../../../components/assignment/LanguageBadge';
import { DifficultyBadge } from '../../../components/assignment/DifficultyBadge';
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Layers,
  GraduationCap,
  PlayCircle,
  AlertCircle,
  CheckCircle2,
  Users,
  FileCode2,
  ChevronRight,
} from 'lucide-react';

export default function StudentCourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [curriculum, setCurriculum] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolling, setEnrolling] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const [cRes, currRes, asgRes] = await Promise.all([
        lmsService.getCourse(courseId),
        lmsService.getCourseCurriculum(courseId),
        assignmentService.getAssignments({ courseId }),
      ]);

      if (cRes.success) setCourse(cRes.course);
      if (currRes.success) setCurriculum(currRes.curriculum || []);
      if (asgRes.success) setAssignments(asgRes.assignments || []);
    } catch (err) {
      setError(err.message || 'Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [courseId]);

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      const res = await lmsService.enrollInCourse(courseId);
      if (res.success) {
        navigate(`/app/student/courses/${courseId}/learn`);
      }
    } catch (err) {
      alert(err.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 w-36 bg-muted rounded" />
        <div className="h-44 bg-card rounded-xl border border-border" />
        <div className="h-80 bg-card rounded-xl border border-border" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="p-8 text-center rounded-xl border border-destructive/30 bg-destructive/5 text-destructive space-y-3">
        <AlertCircle className="w-8 h-8 mx-auto" />
        <p className="text-sm font-semibold">{error || 'Course not found'}</p>
        <Link to="/app/student/courses">
          <Button variant="outline" size="sm">
            Back to Courses
          </Button>
        </Link>
      </div>
    );
  }

  const isEnrolled = course.isEnrolled;
  const progress = course.userProgress;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/app/student/courses"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Courses</span>
        </Link>
      </div>

      {/* Hero Banner */}
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
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" />
                {course.departmentId?.name || 'Department'}
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {course.title}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
              {course.description || 'Comprehensive curriculum with hands-on coding modules and direct instructor oversight.'}
            </p>

            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-primary" />
                <span>{course.duration}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-primary" />
                <span>{curriculum.length} Modules</span>
              </div>
              <div className="flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-primary" />
                <span>{course.credits} Academic Credits</span>
              </div>
            </div>
          </div>

          {/* Action Box */}
          <div className="flex flex-col gap-3 shrink-0 md:min-w-[220px] p-4 rounded-xl border border-border bg-card">
            {isEnrolled ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Your Progress</span>
                    <span className="font-bold text-foreground font-mono">
                      {progress?.percentage || 0}%
                    </span>
                  </div>
                  <ProgressBar value={progress?.percentage || 0} size="sm" />
                </div>

                <Link
                  to={`/app/student/courses/${courseId}/learn`}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-xs"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>Resume Course</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground leading-normal">
                  Open enrollment for all verified students in your university.
                </p>
                <Button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="w-full gap-2 shadow-xs"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>{enrolling ? 'Enrolling...' : 'Enroll in Course'}</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Main Content: Curriculum & Instructor Bios */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Syllabus & Course Modules
            </h2>
            <span className="text-xs text-muted-foreground font-mono">
              {curriculum.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)} Total Lessons
            </span>
          </div>

          <ModuleAccordion curriculum={curriculum} showProgress={isEnrolled} />

          {/* Connected Assignments */}
          {assignments.length > 0 && (
            <div className="pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <FileCode2 className="w-5 h-5 text-primary" />
                  <span>Programming Assignments ({assignments.length})</span>
                </h3>
              </div>

              <div className="space-y-2.5">
                {assignments.map((asg) => (
                  <Card
                    key={asg._id}
                    className="p-4 flex items-center justify-between gap-4 hover:border-primary/40 transition-colors"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <LanguageBadge language={asg.programmingLanguage} />
                        <DifficultyBadge difficulty={asg.difficulty} />
                        <span className="text-xs font-mono text-muted-foreground">
                          {asg.totalMarks} Points
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-foreground truncate">
                        {asg.title}
                      </h4>
                      <div className="text-[11px] text-muted-foreground font-mono">
                        Due: {new Date(asg.dueDate).toLocaleDateString()}
                      </div>
                    </div>

                    <Link to={`/app/student/assignments/${asg._id}`}>
                      <Button size="sm" variant="outline" className="text-xs gap-1">
                        <span>Open</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Prerequisites */}
          <Card className="p-5 space-y-3">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
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
              <p className="text-xs text-muted-foreground">None. Beginners welcome!</p>
            )}
          </Card>

          {/* Instructors */}
          <Card className="p-5 space-y-4">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
              Lead Faculty
            </h3>
            <div className="space-y-3">
              {course.instructors?.length > 0 ? (
                course.instructors.map((inst) => (
                  <div key={inst._id} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                      {inst.name?.charAt(0) || 'P'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{inst.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{inst.email}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">Course instructor assigned per cohort.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
