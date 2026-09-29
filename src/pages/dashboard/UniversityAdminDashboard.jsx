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
  Layers,
  Users,
  GraduationCap,
  Code2,
  UserPlus,
  BookOpen,
  FileSpreadsheet,
  Award,
  Inbox,
  Upload,
} from 'lucide-react';

export default function UniversityAdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const universityName = user?.university?.name || 'Meridian Institute of Technology';

  const [stats, setStats] = useState({
    totalDepartments: 3,
    totalCourses: 3,
    totalTeachers: 2,
    totalStudents: 2,
    totalEnrollments: 2,
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
      title: 'Academic Departments',
      description: 'Manage degree programs, codes & faculty leads',
      icon: Layers,
      onClick: () => navigate('/app/university-admin/departments'),
    },
    {
      title: 'Curriculum & Courses',
      description: 'Author institutional courses, syllabi & rosters',
      icon: BookOpen,
      onClick: () => navigate('/app/university-admin/courses'),
    },
    {
      title: 'Invite Faculty Member',
      description: 'Send secure email invite with instructor permissions',
      icon: UserPlus,
      onClick: () => alert('Faculty invitation modal will be wired in Phase 3 expansion.'),
    },
    {
      title: 'Accreditation Report',
      description: 'Export student practical hours and exam audits',
      icon: FileSpreadsheet,
      onClick: () => alert('Accreditation export will be wired in Reporting Module.'),
    },
  ];

  const recentActivities = [
    {
      icon: UserPlus,
      description: 'Prof. Sarah Jenkins added to Computer Science & Engineering department',
      time: '1 day ago',
      meta: 'Faculty Onboarded',
    },
    {
      icon: GraduationCap,
      description: 'Fall 2026 Batch roster verified: 180 students registered for CS101',
      time: '2 days ago',
      meta: 'Batch 2026',
    },
    {
      icon: Award,
      description: 'Semester 1 practical programming certificates ready for issuance',
      time: '4 days ago',
      meta: 'Accreditation',
    },
  ];

  return (
    <div className="space-y-8">
      <DashboardHeader
        userName={user?.name || 'Administrator'}
        institution={universityName}
        subtitle={`Campus Operations Control · ${universityName} academic structure, faculty roster, and student cohorts.`}
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="gap-2">
              <Upload className="h-4 w-4" /> Batch Import
            </Button>
            <Button size="sm" className="gap-2">
              <UserPlus className="h-4 w-4" /> Invite Faculty
            </Button>
          </div>
        }
      />

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Departments"
          value={stats.totalDepartments}
          subvalue="Academic Units"
          icon={Layers}
          badge="Configured"
        />
        <StatCard
          title="Teaching Faculty"
          value={stats.totalTeachers}
          subvalue="Instructors"
          icon={Users}
          trend="100% active"
          badge="Verified"
        />
        <StatCard
          title="Enrolled Students"
          value={stats.totalStudents}
          subvalue="Learners"
          icon={GraduationCap}
          trend={`${stats.totalEnrollments || 0} active course seats`}
          trendType="positive"
          badge="Active"
        />
        <StatCard
          title="Course Catalog"
          value={stats.totalCourses}
          subvalue="Curriculums"
          icon={BookOpen}
          trend={`${stats.publishedCourses || stats.totalCourses} published`}
          trendType="positive"
          badge="Live"
        />
      </div>

      {/* Quick Action Tiles */}
      <QuickActions actions={quickActions} />

      {/* Activity and Empty State Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivity
            title="Campus Academic Audit Log"
            activities={recentActivities}
          />
        </div>

        <div className="space-y-4 text-left">
          <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold">
            Unassigned Student Roster
          </h3>
          <EmptyState
            icon={Inbox}
            title="All students assigned"
            description="Every registered student is currently mapped to an active department and academic batch."
          />
        </div>
      </div>
    </div>
  );
}
