/**
 * UniCodeIDE Canonical Route Paths
 * Single authoritative source of truth for application routing & navigation.
 */
export const ROUTES = {
  // Public
  HOME: '/',
  ABOUT: '/about',
  CONTACT: '/contact',
  FEATURES: '/features',
  PRICING: '/pricing',
  FAQ: '/faq',
  DOCS: '/docs',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',

  // Shared Authenticated Base
  APP: '/app',
  PROFILE: '/app/profile',

  // Student Routes
  STUDENT: {
    DASHBOARD: '/app/student/dashboard',
    COURSES: '/app/student/courses',
    COURSE_DETAIL: (courseId = ':courseId') => `/app/student/courses/${courseId}`,
    LEARN: (courseId = ':courseId') => `/app/student/courses/${courseId}/learn`,
    ASSIGNMENTS: '/app/student/assignments',
    ASSIGNMENT_WORKSPACE: (assignmentId = ':assignmentId') =>
      `/app/student/assignments/${assignmentId}/workspace`,
    ASSIGNMENT_DETAIL: (assignmentId = ':assignmentId') =>
      `/app/student/assignments/${assignmentId}`,
    WORKSPACE: '/app/student/workspace',
    WORKSPACE_DETAIL: (workspaceId = ':workspaceId') =>
      `/app/student/workspace/${workspaceId}`,
    SUBMISSION_DETAIL: (submissionId = ':submissionId') =>
      `/app/student/submissions/${submissionId}`,
    EXAMS: '/app/student/exams',
    EXAM_SESSION: (sessionId = ':sessionId') => `/app/exam-session/${sessionId}`,
    GRADES: '/app/student/grades',
    CERTIFICATES: '/app/student/certificates',
    PROFILE: '/app/student/profile',
  },

  // Teacher Routes
  TEACHER: {
    DASHBOARD: '/app/teacher/dashboard',
    COURSES: '/app/teacher/courses',
    COURSE_BUILDER: (courseId = ':courseId') => `/app/teacher/courses/${courseId}/builder`,
    ASSIGNMENTS: '/app/teacher/assignments',
    ASSIGNMENT_NEW: '/app/teacher/assignments/new',
    ASSIGNMENT_EDIT: (assignmentId = ':assignmentId') =>
      `/app/teacher/assignments/${assignmentId}/edit`,
    ASSIGNMENT_SUBMISSIONS: (assignmentId = ':assignmentId') =>
      `/app/teacher/assignments/${assignmentId}/submissions`,
    SUBMISSIONS: '/app/teacher/submissions',
    SUBMISSION_REVIEW: (submissionId = ':submissionId') =>
      `/app/teacher/submissions/${submissionId}`,
    EXAMS: '/app/teacher/exams',
    EXAM_NEW: '/app/teacher/exams/new',
    EXAM_EDIT: (examId = ':examId') => `/app/teacher/exams/${examId}/edit`,
    EXAM_MONITORING: (examId = ':examId') => `/app/teacher/exams/${examId}/monitoring`,
    STUDENTS: '/app/teacher/students',
    REPORTS: '/app/teacher/reports',
    SETTINGS: '/app/teacher/settings',
    PROFILE: '/app/teacher/profile',
  },

  // University Admin Routes
  UNIVERSITY_ADMIN: {
    DASHBOARD: '/app/university-admin/dashboard',
    DEPARTMENTS: '/app/university-admin/departments',
    TEACHERS: '/app/university-admin/teachers',
    STUDENTS: '/app/university-admin/students',
    BATCHES: '/app/university-admin/batches',
    COURSES: '/app/university-admin/courses',
    COURSE_DETAIL: (courseId = ':courseId') =>
      `/app/university-admin/courses/${courseId}`,
    LABS: '/app/university-admin/labs',
    LAB_AUDIT: '/app/university-admin/lab-audit',
    REPORTS: '/app/university-admin/reports',
    SETTINGS: '/app/university-admin/settings',
    PROFILE: '/app/university-admin/profile',
  },

  // Super Admin Routes
  SUPER_ADMIN: {
    DASHBOARD: '/app/super-admin/dashboard',
    UNIVERSITIES: '/app/super-admin/universities',
    USERS: '/app/super-admin/users',
    ANALYTICS: '/app/super-admin/analytics',
    HEALTH: '/app/super-admin/health',
    SETTINGS: '/app/super-admin/settings',
    PROFILE: '/app/super-admin/profile',
  },
};

export default ROUTES;
