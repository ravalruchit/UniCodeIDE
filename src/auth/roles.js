export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  UNIVERSITY_ADMIN: 'UNIVERSITY_ADMIN',
  TEACHER: 'TEACHER',
  STUDENT: 'STUDENT',
};

export const ROLE_CONFIG = {
  [ROLES.SUPER_ADMIN]: {
    name: 'Super Admin',
    shortName: 'Super Admin',
    description: 'Global SaaS platform administrator with system-wide oversight.',
    dashboardPath: '/app/super-admin/dashboard',
    badgeVariant: 'default',
    badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  },
  [ROLES.UNIVERSITY_ADMIN]: {
    name: 'University Admin',
    shortName: 'Institution Admin',
    description: 'Campus administrator managing departments, faculties, and batches.',
    dashboardPath: '/app/university-admin/dashboard',
    badgeVariant: 'secondary',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  [ROLES.TEACHER]: {
    name: 'Teacher',
    shortName: 'Faculty',
    description: 'Course instructor managing assignments, live exams, and grading.',
    dashboardPath: '/app/teacher/dashboard',
    badgeVariant: 'outline',
    badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  },
  [ROLES.STUDENT]: {
    name: 'Student',
    shortName: 'Student',
    description: 'Enrolled learner accessing coursework, coding IDE, and exams.',
    dashboardPath: '/app/student/dashboard',
    badgeVariant: 'default',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
};
