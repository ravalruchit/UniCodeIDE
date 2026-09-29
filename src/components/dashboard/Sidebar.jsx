import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../common/Logo';
import { ROLES, ROLE_CONFIG } from '../../auth/roles';
import {
  LayoutDashboard,
  Building2,
  Users,
  BarChart3,
  Activity,
  Settings,
  GraduationCap,
  BookOpen,
  Calendar,
  FileCheck2,
  Code2,
  Award,
  User,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  FolderGit2,
  Monitor,
} from 'lucide-react';
import { ROUTES } from '../../routes/routePaths';

const NAV_ITEMS_BY_ROLE = {
  [ROLES.SUPER_ADMIN]: [
    { label: 'Dashboard', path: ROUTES.SUPER_ADMIN.DASHBOARD, icon: LayoutDashboard },
    { label: 'Universities', path: ROUTES.SUPER_ADMIN.UNIVERSITIES, icon: Building2 },
    { label: 'Users & Roles', path: ROUTES.SUPER_ADMIN.USERS, icon: Users },
    { label: 'Platform Analytics', path: ROUTES.SUPER_ADMIN.ANALYTICS, icon: BarChart3 },
    { label: 'System Health', path: ROUTES.SUPER_ADMIN.HEALTH, icon: Activity },
    { label: 'Settings', path: ROUTES.SUPER_ADMIN.SETTINGS, icon: Settings },
    { label: 'Profile', path: ROUTES.SUPER_ADMIN.PROFILE, icon: User },
  ],
  [ROLES.UNIVERSITY_ADMIN]: [
    { label: 'Dashboard', path: ROUTES.UNIVERSITY_ADMIN.DASHBOARD, icon: LayoutDashboard },
    { label: 'Departments', path: ROUTES.UNIVERSITY_ADMIN.DEPARTMENTS, icon: Layers },
    { label: 'Faculty & Teachers', path: ROUTES.UNIVERSITY_ADMIN.TEACHERS, icon: Users },
    { label: 'Students Roster', path: ROUTES.UNIVERSITY_ADMIN.STUDENTS, icon: GraduationCap },
    { label: 'Academic Batches', path: ROUTES.UNIVERSITY_ADMIN.BATCHES, icon: Calendar },
    { label: 'Curriculum & Courses', path: ROUTES.UNIVERSITY_ADMIN.COURSES, icon: BookOpen },
    { label: 'Computer Labs', path: ROUTES.UNIVERSITY_ADMIN.LABS, icon: Monitor },
    { label: 'Reports & Audits', path: ROUTES.UNIVERSITY_ADMIN.REPORTS, icon: BarChart3 },
    { label: 'Institution Settings', path: ROUTES.UNIVERSITY_ADMIN.SETTINGS, icon: Settings },
    { label: 'Profile', path: ROUTES.UNIVERSITY_ADMIN.PROFILE, icon: User },
  ],
  [ROLES.TEACHER]: [
    { label: 'Dashboard', path: ROUTES.TEACHER.DASHBOARD, icon: LayoutDashboard },
    { label: 'My Courses', path: ROUTES.TEACHER.COURSES, icon: BookOpen },
    { label: 'Assignments', path: ROUTES.TEACHER.ASSIGNMENTS, icon: FileCheck2 },
    { label: 'Coding Exams', path: ROUTES.TEACHER.EXAMS, icon: ShieldCheck },
    { label: 'Students', path: ROUTES.TEACHER.STUDENTS, icon: GraduationCap },
    { label: 'Submissions', path: ROUTES.TEACHER.SUBMISSIONS, icon: FolderGit2 },
    { label: 'Analytics', path: ROUTES.TEACHER.REPORTS, icon: BarChart3 },
    { label: 'Settings', path: ROUTES.TEACHER.SETTINGS, icon: Settings },
    { label: 'Profile', path: ROUTES.TEACHER.PROFILE, icon: User },
  ],
  [ROLES.STUDENT]: [
    { label: 'Dashboard', path: ROUTES.STUDENT.DASHBOARD, icon: LayoutDashboard },
    { label: 'Enrolled Courses', path: ROUTES.STUDENT.COURSES, icon: BookOpen },
    { label: 'Assignments', path: ROUTES.STUDENT.ASSIGNMENTS, icon: FileCheck2 },
    { label: 'Coding Exams', path: ROUTES.STUDENT.EXAMS, icon: ShieldCheck },
    { label: 'IDE Workspace', path: ROUTES.STUDENT.WORKSPACE, icon: Code2 },
    { label: 'Grades & Marks', path: ROUTES.STUDENT.GRADES, icon: BarChart3 },
    { label: 'Certificates', path: ROUTES.STUDENT.CERTIFICATES, icon: Award },
    { label: 'Profile', path: ROUTES.STUDENT.PROFILE, icon: User },
  ],
};

export function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const { user, role } = useAuth();
  const navItems = NAV_ITEMS_BY_ROLE[role] || NAV_ITEMS_BY_ROLE[ROLES.STUDENT];
  const roleConfig = ROLE_CONFIG[role] || ROLE_CONFIG[ROLES.STUDENT];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-card border-r border-border text-card-foreground select-none">
      {/* Brand Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-border">
        {!collapsed ? (
          <Logo size="default" />
        ) : (
          <div className="mx-auto">
            <Logo size="default" />
          </div>
        )}

        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Tenant & Role Identification Banner */}
      {!collapsed && (
        <div className="p-3 border-b border-border bg-muted/20">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Current Workspace
            </span>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border font-semibold ${roleConfig.badgeColor}`}>
              {roleConfig.shortName}
            </span>
          </div>
          <div className="text-xs font-semibold text-foreground truncate">
            {user?.university?.name || (role === ROLES.SUPER_ADMIN ? 'Global Infrastructure' : 'UniCodeIDE Campus')}
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen && setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
                } ${collapsed ? 'justify-center px-2' : ''}`
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Sandbox / Help Notice */}
      {!collapsed && (
        <div className="p-3 m-3 rounded-lg border border-border bg-muted/30 text-xs">
          <div className="flex items-center space-x-1.5 text-primary font-semibold mb-1">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Piston Engine v2</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Multi-language container isolation ready.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop/Tablet Sidebar */}
      <aside
        className={`hidden md:block transition-all duration-200 shrink-0 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="sticky top-0 h-screen">{sidebarContent}</div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl z-10 animate-fade-up">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
