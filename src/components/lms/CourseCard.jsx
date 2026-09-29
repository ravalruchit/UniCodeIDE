import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import { CourseStatusBadge } from './CourseStatusBadge';
import { ProgressBar } from './ProgressBar';
import {
  BookOpen,
  Clock,
  Users,
  Layers,
  ArrowRight,
  GraduationCap,
  PlayCircle,
  Settings,
} from 'lucide-react';

const LEVEL_COLORS = {
  BEGINNER: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  INTERMEDIATE: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  ADVANCED: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
};

export function CourseCard({
  course,
  role = 'STUDENT',
  progress = null,
  onEnroll = null,
  isEnrolling = false,
}) {
  const {
    _id,
    title,
    code,
    description,
    departmentId,
    instructors = [],
    level = 'BEGINNER',
    duration = '12 Weeks',
    modulesCount = 0,
    lessonsCount = 0,
    enrolledStudentsCount = 0,
    status = 'PUBLISHED',
  } = course;

  const leadInstructor = instructors?.[0];
  const levelStyle = LEVEL_COLORS[level] || LEVEL_COLORS.BEGINNER;

  return (
    <Card className="flex flex-col h-full overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-lg group">
      {/* Visual Header / Cover Banner */}
      <div className="h-36 relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-muted/20 border-b border-border p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between z-10">
          <span className="font-mono font-bold text-xs px-2.5 py-1 rounded bg-background/90 text-foreground border border-border shadow-xs backdrop-blur-xs">
            {code}
          </span>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded border ${levelStyle}`}>
              {level}
            </span>
            {role !== 'STUDENT' && <CourseStatusBadge status={status} />}
          </div>
        </div>

        <div className="z-10">
          <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-primary" />
            {departmentId?.name || 'Department of Computing'}
          </span>
        </div>

        {/* Decorative background grid pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#808080_1px,transparent_1px)] [background-size:16px_16px]" />
      </div>

      {/* Main Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-base text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-1">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {description || 'Comprehensive curriculum with hands-on coding modules and direct instructor oversight.'}
          </p>
        </div>

        {/* Instructor Info */}
        <div className="flex items-center gap-2.5 pt-2 border-t border-border/60">
          <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
            {leadInstructor?.name ? leadInstructor.name.charAt(0) : 'T'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-foreground truncate">
              {leadInstructor?.name || 'Course Faculty'}
            </p>
            <p className="text-[10px] text-muted-foreground truncate">
              {leadInstructor?.email || 'Instructor'}
            </p>
          </div>
        </div>

        {/* Metadata Badges */}
        <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-md bg-muted/30 border border-border/50 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 shrink-0 text-muted-foreground/80" />
            <span className="truncate">{duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 shrink-0 text-muted-foreground/80" />
            <span className="truncate">{lessonsCount} Lessons</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5 shrink-0 text-muted-foreground/80" />
            <span className="truncate">{enrolledStudentsCount}</span>
          </div>
        </div>

        {/* Dynamic Progress if Enrolled */}
        {progress && (
          <div className="space-y-1">
            <ProgressBar value={progress.percentage || 0} size="sm" />
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>{progress.completedLessons || 0} / {progress.totalLessons || lessonsCount} completed</span>
              <span className="font-semibold text-foreground">{progress.percentage || 0}%</span>
            </div>
          </div>
        )}

        {/* Action Button Area */}
        <div className="pt-2">
          {role === 'STUDENT' ? (
            progress ? (
              <Link
                to={`/app/student/courses/${_id}/learn`}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-xs"
              >
                <PlayCircle className="w-4 h-4" />
                <span>Continue Learning</span>
              </Link>
            ) : course.isEnrolled ? (
              <Link
                to={`/app/student/courses/${_id}/learn`}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-xs"
              >
                <PlayCircle className="w-4 h-4" />
                <span>Enter Course</span>
              </Link>
            ) : onEnroll ? (
              <button
                type="button"
                onClick={() => onEnroll(_id)}
                disabled={isEnrolling}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
              >
                <GraduationCap className="w-4 h-4" />
                <span>{isEnrolling ? 'Enrolling...' : 'Enroll in Course'}</span>
              </button>
            ) : (
              <Link
                to={`/app/student/courses/${_id}`}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-border bg-card hover:bg-accent text-foreground text-xs font-medium transition-colors"
              >
                <span>View Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )
          ) : role === 'TEACHER' ? (
            <div className="flex items-center gap-2">
              <Link
                to={`/app/teacher/courses/${_id}/builder`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-xs"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Course Builder</span>
              </Link>
              <Link
                to={`/app/teacher/courses/${_id}/students`}
                className="inline-flex items-center justify-center px-3 py-2 rounded-md border border-border bg-card hover:bg-accent text-foreground text-xs font-medium transition-colors"
                title="Student Roster"
              >
                <Users className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            // UNIVERSITY_ADMIN & SUPER_ADMIN
            <div className="flex items-center gap-2">
              <Link
                to={`/app/university-admin/courses/${_id}`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md border border-border bg-card hover:bg-accent text-foreground text-xs font-medium transition-colors"
              >
                <span>Manage Course</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
