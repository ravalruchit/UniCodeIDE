import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { lmsService } from '../../services/lmsService';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { StatCard } from '../../components/dashboard/StatCard';
import { QuickActions } from '../../components/dashboard/QuickActions';
import { RecentActivity } from '../../components/dashboard/RecentActivity';
import { EmptyState } from '../../components/dashboard/EmptyState';
import { Button } from '../../components/ui/Button';
import {
  BookOpen,
  GraduationCap,
  FileCheck2,
  ShieldCheck,
  PlusCircle,
  Clock,
  Sparkles,
  Radio,
  FileCode2
} from 'lucide-react';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const universityName = user?.university?.name || 'Meridian Institute of Technology';

  const [stats, setStats] = useState({
    assignedCourses: 2,
    publishedCourses: 2,
    totalStudentsEnrolled: 2,
    totalLessonsCreated: 4,
  });

  useEffect(() => {
    lmsService.getLMSStats()
      .then((res) => {
        if (res.success && res.stats) setStats(res.stats);
      })
      .catch(() => {});
  }, []);

  const quickActions = [
    {
      title: 'Course Curriculum & Builder',
      description: 'Author chapters, modules, and coding lessons',
      icon: BookOpen,
      onClick: () => navigate('/app/teacher/courses'),
    },
    {
      title: 'New Assignment',
      description: 'Define starter code, deadlines & problem statements',
      icon: PlusCircle,
      onClick: () => navigate('/app/teacher/assignments/new'),
    },
    {
      title: 'Schedule Coding Exam',
      description: 'Setup timed environment with anti-cheat lock',
      icon: ShieldCheck,
      onClick: () => alert('Exam room creator will be wired in Phase 8.'),
    },
    {
      title: 'Live Lab Proctoring',
      description: 'Watch real-time student editor screens & keystrokes',
      icon: Radio,
      onClick: () => alert('Live proctoring grid will be wired in Phase 8.'),
    },
  ];

  const recentActivities = [
    {
      icon: FileCode2,
      description: 'Alex Rivera submitted Assignment 03: Fibonacci Sequence (Auto-score: 100%)',
      time: '15 minutes ago',
      meta: 'CS101 · Passed 8/8 tests',
    },
    {
      icon: FileCheck2,
      description: 'Auto-grader evaluated 42 student submissions for Binary Search Lab in 2.1s',
      time: '1 hour ago',
      meta: 'Piston Engine',
    },
    {
      icon: ShieldCheck,
      description: 'Midterm Examination draft configured for CS201 Data Structures',
      time: '3 hours ago',
      meta: 'Draft Saved',
    },
  ];

  return (
    <div className="space-y-8">
      <DashboardHeader
        userName={user?.name || 'Professor'}
        institution={universityName}
        subtitle={`Faculty Instructor Hub · ${user?.department || 'Computer Science'}. Manage programming courses, assignments, and exam rooms.`}
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="gap-2">
              <ShieldCheck className="h-4 w-4" /> Schedule Exam
            </Button>
            <Button size="sm" className="gap-2">
              <PlusCircle className="h-4 w-4" /> New Assignment
            </Button>
          </div>
        }
      />

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Courses"
          value={stats.assignedCourses}
          subvalue="Teaching"
          icon={BookOpen}
          badge={`${stats.publishedCourses || 0} Published`}
        />
        <StatCard
          title="Enrolled Students"
          value={stats.totalStudentsEnrolled}
          subvalue="Cohort Size"
          icon={GraduationCap}
          trend="Active Learners"
          badge="Fall Term"
        />
        <StatCard
          title="Pending Evaluations"
          value={stats.pendingEvaluations !== undefined ? stats.pendingEvaluations : 1}
          subvalue="Submissions"
          icon={FileCheck2}
          trend={stats.pendingEvaluations > 0 ? `${stats.pendingEvaluations} need grading` : 'All graded'}
          trendType={stats.pendingEvaluations > 0 ? 'neutral' : 'positive'}
          badge="Grading"
        />
        <StatCard
          title="Assignments Authored"
          value={stats.totalAssignments !== undefined ? stats.totalAssignments : 3}
          subvalue="Problem Sets"
          icon={FileCode2}
          trend={`${stats.evaluatedSubmissions || 0} evaluated`}
          trendType="positive"
          badge="Live"
        />
      </div>

      {/* Quick Action Tiles */}
      <QuickActions actions={quickActions} />

      {/* Activity and Live Monitoring Empty State */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivity
            title="Classroom Submissions & Grading Feed"
            activities={recentActivities}
          />
        </div>

        <div className="space-y-4 text-left">
          <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold">
            Live Exam Session
          </h3>
          <EmptyState
            icon={Radio}
            title="No active exam in session"
            description="The live proctoring grid and student code activity feeds will activate when an exam room starts."
            actionLabel="Schedule Exam Window"
            onAction={() => alert('Exam scheduler module will be wired in Phase 8.')}
          />
        </div>
      </div>
    </div>
  );
}
