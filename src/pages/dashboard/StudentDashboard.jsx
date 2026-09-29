import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { lmsService } from '../../services/lmsService';
import { workspaceService } from '../../services/workspaceService';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { StatCard } from '../../components/dashboard/StatCard';
import { QuickActions } from '../../components/dashboard/QuickActions';
import { RecentActivity } from '../../components/dashboard/RecentActivity';
import { EmptyState } from '../../components/dashboard/EmptyState';
import { Button } from '../../components/ui/Button';
import { LanguageBadge } from '../../components/assignment/LanguageBadge';
import {
  BookOpen,
  FileCode2,
  Code2,
  Award,
  Play,
  FileCheck2,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const universityName = user?.university?.name || 'Meridian Institute of Technology';

  const [stats, setStats] = useState({
    enrolledCourses: 2,
    completedLessons: 2,
    overallProgress: 50,
  });
  const [workspaces, setWorkspaces] = useState([]);

  useEffect(() => {
    lmsService.getLMSStats()
      .then((res) => {
        if (res.success && res.stats) setStats(res.stats);
      })
      .catch(() => {});

    workspaceService.getWorkspaces()
      .then((res) => {
        if (res.success && res.workspaces) setWorkspaces(res.workspaces);
      })
      .catch(() => {});
  }, []);

  const latestWorkspace = workspaces[0];

  const quickActions = [
    {
      title: 'Course Tracks & Lessons',
      description: 'Continue learning curriculum modules & exercises',
      icon: BookOpen,
      onClick: () => navigate('/app/student/courses'),
    },
    {
      title: 'Coding Assignments',
      description: 'Solve problem sets, submit solutions & inspect faculty marks',
      icon: FileCode2,
      onClick: () => navigate('/app/student/assignments'),
    },
    {
      title: 'Open Cloud IDE',
      description: latestWorkspace ? `Resume ${latestWorkspace.name}` : 'Launch persistent browser workspace',
      icon: Code2,
      onClick: () => {
        if (latestWorkspace) {
          navigate(`/app/student/workspace/${latestWorkspace._id}`);
        } else {
          navigate('/app/student/assignments');
        }
      },
    },
    {
      title: 'Practice Lab Workspace',
      description: 'Open multi-file persistent cloud scratchpad',
      icon: Play,
      onClick: () => {
        if (workspaces.length > 0) {
          navigate(`/app/student/workspace/${workspaces[0]._id}`);
        } else {
          navigate('/app/student/assignments');
        }
      },
    },
  ];

  const recentActivities = [
    {
      icon: CheckCircle2,
      description: 'Assignment 03 (Fibonacci Sequence) auto-graded: 100% score (8/8 tests passed)',
      time: '2 hours ago',
      meta: 'CS101 · Python 3.10',
    },
    {
      icon: FileCode2,
      description: 'Pushed code snapshot to remote cloud storage: binary_search.py',
      time: 'Yesterday',
      meta: 'Workspace Backup',
    },
    {
      icon: Award,
      description: 'Completed Module 02: Computational Complexity & Big-O Notation',
      time: '3 days ago',
      meta: 'LMS Certificate Ready',
    },
  ];

  return (
    <div className="space-y-8">
      <DashboardHeader
        userName={user?.name || 'Student'}
        institution={universityName}
        subtitle={`Student Learning Workspace · ${user?.department || 'Department of Computer Science'}. Access course tracks, coding environments, and live examinations.`}
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="gap-2">
              <FileCheck2 className="h-4 w-4" /> View Homework
            </Button>
            <Button size="sm" className="gap-2">
              <Code2 className="h-4 w-4" /> Launch IDE
            </Button>
          </div>
        }
      />

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Enrolled Courses"
          value={stats.enrolledCourses}
          subvalue="Active Subjects"
          icon={BookOpen}
          badge="In Progress"
        />
        <StatCard
          title="Completed Lessons"
          value={stats.completedLessons}
          subvalue="Finished"
          icon={CheckCircle2}
          trend={`${stats.overallProgress}% overall`}
          trendType="positive"
          badge="Curriculum"
        />
        <StatCard
          title="Assignments Due"
          value={stats.pendingAssignmentsCount !== undefined ? stats.pendingAssignmentsCount : 1}
          subvalue="Pending Action"
          icon={FileCode2}
          trend={stats.pendingAssignmentsCount === 0 ? 'All caught up' : 'Tasks remaining'}
          trendType={stats.pendingAssignmentsCount === 0 ? 'positive' : 'neutral'}
          badge="Graded"
        />
        <StatCard
          title="Cumulative Score"
          value="94.2%"
          subvalue="Average"
          icon={Award}
          trend="Top 5% of cohort"
          trendType="positive"
          badge="GPA 3.9"
        />
      </div>

      {/* Quick Action Tiles */}
      <QuickActions actions={quickActions} />

      {/* Active Cloud Workspaces (Phase 5 Persistent Storage) */}
      <div className="space-y-3 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              Continue Coding · Persistent Cloud Workspaces
            </h3>
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            Synced across devices
          </span>
        </div>

        {workspaces.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-border bg-card/30 text-xs text-muted-foreground flex items-center justify-between">
            <span>No active workspaces open yet. Start a problem set from your assignments to initialize a workspace.</span>
            <button
              onClick={() => navigate('/app/student/assignments')}
              className="text-primary font-medium hover:underline flex items-center gap-1"
            >
              <span>View Assignments</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workspaces.slice(0, 4).map((ws) => (
              <div
                key={ws._id}
                onClick={() => navigate(`/app/student/workspace/${ws._id}`)}
                className="group p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-all cursor-pointer shadow-xs flex flex-col justify-between gap-3 text-left"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors truncate">
                      {ws.name}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0">
                      r{ws.revision || 1}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <LanguageBadge language={ws.language} />
                    {ws.courseId && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                        {ws.courseId.code || ws.courseId.title}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[11px] text-muted-foreground">
                  <span>Last saved {new Date(ws.lastSavedAt || ws.updatedAt).toLocaleDateString()}</span>
                  <span className="text-primary font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Open Editor</span>
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Coding Sessions and Exams Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivity
            title="My Coding & Submission Activity"
            activities={recentActivities}
          />
        </div>

        <div className="space-y-4 text-left">
          <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold">
            Upcoming Proctored Exam
          </h3>
          <EmptyState
            icon={ShieldCheck}
            title="No exams in the next 24 hours"
            description="Your next scheduled coding assessment is CS201 Midterm scheduled for next Friday at 10:00 AM."
          />
        </div>
      </div>
    </div>
  );
}
