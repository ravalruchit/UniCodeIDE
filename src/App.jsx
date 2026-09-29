import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { ROLES } from './auth/roles';
import { getDefaultDashboardRoute } from './auth/authUtils';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AuthenticatedLayout from './layouts/AuthenticatedLayout';

// Public Pages
import Home from './pages/public/Home';
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import Features from './pages/public/Features';
import Pricing from './pages/public/Pricing';
import Docs from './pages/public/Docs';
import FAQ from './pages/public/FAQ';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Role Dashboards
import SuperAdminDashboard from './pages/dashboard/SuperAdminDashboard';
import UniversityAdminDashboard from './pages/dashboard/UniversityAdminDashboard';
import TeacherDashboard from './pages/dashboard/TeacherDashboard';
import StudentDashboard from './pages/dashboard/StudentDashboard';

// LMS Pages
import DepartmentManagement from './pages/lms/admin/DepartmentManagement';
import CourseManagement from './pages/lms/admin/CourseManagement';
import CourseDetailsAdmin from './pages/lms/admin/CourseDetailsAdmin';
import TeacherCourseList from './pages/lms/teacher/TeacherCourseList';
import CourseBuilder from './pages/lms/teacher/CourseBuilder';
import StudentCourseList from './pages/lms/student/StudentCourseList';
import StudentCourseDetail from './pages/lms/student/StudentCourseDetail';
import StudentLearningExperience from './pages/lms/student/StudentLearningExperience';

// Assignment & Submission Pages
import TeacherAssignmentList from './pages/assignment/teacher/TeacherAssignmentList';
import TeacherAssignmentEditor from './pages/assignment/teacher/TeacherAssignmentEditor';
import TeacherSubmissionsList from './pages/assignment/teacher/TeacherSubmissionsList';
import TeacherSubmissionReview from './pages/assignment/teacher/TeacherSubmissionReview';
import StudentAssignmentList from './pages/assignment/student/StudentAssignmentList';
import StudentAssignmentWorkspace from './pages/assignment/student/StudentAssignmentWorkspace';
import StudentSubmissionDetail from './pages/assignment/student/StudentSubmissionDetail';
import { CloudWorkspacePage } from './pages/workspace/CloudWorkspacePage';

// Examination Pages
import { ExamListPage } from './pages/exams/ExamListPage';
import { ExamBuilderPage } from './pages/exams/ExamBuilderPage';
import { ExamMonitoringPage } from './pages/exams/ExamMonitoringPage';
import { ExamSessionPage } from './pages/exams/ExamSessionPage';

// Computer Lab Management Pages
import LabManagementPage from './pages/admin/LabManagementPage';
import LabAuditPage from './pages/admin/LabAuditPage';

// Student LMS & Certification Pages
import StudentGradesPage from './pages/student/StudentGradesPage';
import StudentCertificatesPage from './pages/student/StudentCertificatesPage';

// Shared User Profile
import UserProfilePage from './pages/profile/UserProfilePage';

// Teacher Management Pages
import TeacherStudentsPage from './pages/teacher/TeacherStudentsPage';
import TeacherReportsPage from './pages/teacher/TeacherReportsPage';
import TeacherSettingsPage from './pages/teacher/TeacherSettingsPage';

// University Admin Management Pages
import UniversityTeachersPage from './pages/admin/UniversityTeachersPage';
import UniversityStudentsPage from './pages/admin/UniversityStudentsPage';
import UniversityBatchesPage from './pages/admin/UniversityBatchesPage';
import UniversityReportsPage from './pages/admin/UniversityReportsPage';
import UniversitySettingsPage from './pages/admin/UniversitySettingsPage';

// Super Admin Management Pages
import SuperAdminUniversitiesPage from './pages/admin/SuperAdminUniversitiesPage';
import SuperAdminUsersPage from './pages/admin/SuperAdminUsersPage';
import SuperAdminAnalyticsPage from './pages/admin/SuperAdminAnalyticsPage';
import SuperAdminHealthPage from './pages/admin/SuperAdminHealthPage';
import SuperAdminSettingsPage from './pages/admin/SuperAdminSettingsPage';

// Error Pages
import NotFound, { ServerError, Unauthorized } from './pages/errors/NotFound';

// Redirect /app root to the user's role-specific dashboard
function AppIndexRedirect() {
  const { role } = useAuth();
  return <Navigate to={getDefaultDashboardRoute(role)} replace />;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Website Routes */}
            <Route
              path="/"
              element={
                <PublicLayout>
                  <Home />
                </PublicLayout>
              }
            />
            <Route
              path="/about"
              element={
                <PublicLayout>
                  <About />
                </PublicLayout>
              }
            />
            <Route
              path="/contact"
              element={
                <PublicLayout>
                  <Contact />
                </PublicLayout>
              }
            />
            <Route
              path="/features"
              element={
                <PublicLayout>
                  <Features />
                </PublicLayout>
              }
            />
            <Route
              path="/pricing"
              element={
                <PublicLayout>
                  <Pricing />
                </PublicLayout>
              }
            />
            <Route
              path="/docs"
              element={
                <PublicLayout>
                  <Docs />
                </PublicLayout>
              }
            />
            <Route
              path="/faq"
              element={
                <PublicLayout>
                  <FAQ />
                </PublicLayout>
              }
            />

            {/* Authentication Flow Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Authenticated Protected SaaS Application Routes */}
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout />
                </ProtectedRoute>
              }
            >
              {/* Index redirect to user role dashboard */}
              <Route index element={<AppIndexRedirect />} />

              {/* Shared Authenticated User Profile */}
              <Route path="profile" element={<UserProfilePage />} />

              {/* Super Admin Protected Routes */}
              <Route
                path="super-admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                    <SuperAdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="super-admin/universities"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                    <SuperAdminUniversitiesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="super-admin/users"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                    <SuperAdminUsersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="super-admin/analytics"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                    <SuperAdminAnalyticsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="super-admin/health"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                    <SuperAdminHealthPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="super-admin/settings"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                    <SuperAdminSettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="super-admin/profile"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                    <UserProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* University Admin Protected Routes */}
              <Route
                path="university-admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.UNIVERSITY_ADMIN]}>
                    <UniversityAdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="university-admin/departments"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.UNIVERSITY_ADMIN, ROLES.SUPER_ADMIN]}>
                    <DepartmentManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="university-admin/teachers"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.UNIVERSITY_ADMIN, ROLES.SUPER_ADMIN]}>
                    <UniversityTeachersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="university-admin/students"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.UNIVERSITY_ADMIN, ROLES.SUPER_ADMIN]}>
                    <UniversityStudentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="university-admin/batches"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.UNIVERSITY_ADMIN, ROLES.SUPER_ADMIN]}>
                    <UniversityBatchesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="university-admin/courses"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.UNIVERSITY_ADMIN, ROLES.SUPER_ADMIN]}>
                    <CourseManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="university-admin/courses/:courseId"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.UNIVERSITY_ADMIN, ROLES.SUPER_ADMIN]}>
                    <CourseDetailsAdmin />
                  </ProtectedRoute>
                }
              />
              <Route
                path="university-admin/labs"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.UNIVERSITY_ADMIN, ROLES.SUPER_ADMIN]}>
                    <LabManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="university-admin/lab-audit"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.UNIVERSITY_ADMIN, ROLES.SUPER_ADMIN]}>
                    <LabAuditPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="university-admin/reports"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.UNIVERSITY_ADMIN, ROLES.SUPER_ADMIN]}>
                    <UniversityReportsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="university-admin/settings"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.UNIVERSITY_ADMIN, ROLES.SUPER_ADMIN]}>
                    <UniversitySettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="university-admin/profile"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.UNIVERSITY_ADMIN, ROLES.SUPER_ADMIN]}>
                    <UserProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Teacher Protected Routes */}
              <Route
                path="teacher/dashboard"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.TEACHER]}>
                    <TeacherDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="teacher/courses"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.TEACHER]}>
                    <TeacherCourseList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="teacher/courses/:courseId/builder"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.TEACHER, ROLES.UNIVERSITY_ADMIN, ROLES.SUPER_ADMIN]}>
                    <CourseBuilder />
                  </ProtectedRoute>
                }
              />
              <Route
                path="teacher/assignments"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.TEACHER, ROLES.UNIVERSITY_ADMIN, ROLES.SUPER_ADMIN]}>
                    <TeacherAssignmentList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="teacher/assignments/new"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.TEACHER, ROLES.UNIVERSITY_ADMIN, ROLES.SUPER_ADMIN]}>
                    <TeacherAssignmentEditor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="teacher/assignments/:assignmentId/edit"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.TEACHER, ROLES.UNIVERSITY_ADMIN, ROLES.SUPER_ADMIN]}>
                    <TeacherAssignmentEditor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="teacher/assignments/:assignmentId/submissions"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.TEACHER, ROLES.UNIVERSITY_ADMIN, ROLES.SUPER_ADMIN]}>
                    <TeacherSubmissionsList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="teacher/submissions"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.TEACHER, ROLES.UNIVERSITY_ADMIN, ROLES.SUPER_ADMIN]}>
                    <TeacherSubmissionsList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="teacher/submissions/:submissionId"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.TEACHER, ROLES.UNIVERSITY_ADMIN, ROLES.SUPER_ADMIN]}>
                    <TeacherSubmissionReview />
                  </ProtectedRoute>
                }
              />
              <Route
                path="teacher/exams"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.TEACHER, ROLES.UNIVERSITY_ADMIN, ROLES.SUPER_ADMIN]}>
                    <ExamListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="teacher/exams/new"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.TEACHER, ROLES.UNIVERSITY_ADMIN, ROLES.SUPER_ADMIN]}>
                    <ExamBuilderPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="teacher/exams/:examId/edit"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.TEACHER, ROLES.UNIVERSITY_ADMIN, ROLES.SUPER_ADMIN]}>
                    <ExamBuilderPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="teacher/exams/:examId/monitoring"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.TEACHER, ROLES.UNIVERSITY_ADMIN, ROLES.SUPER_ADMIN]}>
                    <ExamMonitoringPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="teacher/students"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.TEACHER, ROLES.UNIVERSITY_ADMIN, ROLES.SUPER_ADMIN]}>
                    <TeacherStudentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="teacher/reports"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.TEACHER, ROLES.UNIVERSITY_ADMIN, ROLES.SUPER_ADMIN]}>
                    <TeacherReportsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="teacher/settings"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.TEACHER, ROLES.UNIVERSITY_ADMIN, ROLES.SUPER_ADMIN]}>
                    <TeacherSettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="teacher/profile"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.TEACHER, ROLES.UNIVERSITY_ADMIN, ROLES.SUPER_ADMIN]}>
                    <UserProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Student Protected Routes */}
              <Route
                path="student/dashboard"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="student/courses"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
                    <StudentCourseList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="student/courses/:courseId"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
                    <StudentCourseDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="student/courses/:courseId/learn"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
                    <StudentLearningExperience />
                  </ProtectedRoute>
                }
              />
              <Route
                path="student/assignments"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
                    <StudentAssignmentList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="student/assignments/:assignmentId"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
                    <StudentAssignmentWorkspace />
                  </ProtectedRoute>
                }
              />
              <Route
                path="student/assignments/:assignmentId/workspace"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
                    <CloudWorkspacePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="student/workspace"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
                    <CloudWorkspacePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="student/workspace/:workspaceId"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
                    <CloudWorkspacePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="student/submissions/:submissionId"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
                    <StudentSubmissionDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="student/exams"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
                    <ExamListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="student/grades"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
                    <StudentGradesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="student/certificates"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
                    <StudentCertificatesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="student/profile"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
                    <UserProfilePage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Standalone Fullscreen Exam Session Environment */}
            <Route
              path="/app/exam-session/:sessionId"
              element={
                <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
                  <ExamSessionPage />
                </ProtectedRoute>
              }
            />

            {/* Dedicated error routes */}
            <Route path="/500" element={<ServerError />} />
            <Route path="/403" element={<Unauthorized />} />

            {/* Catch-all route to display 404 error page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
