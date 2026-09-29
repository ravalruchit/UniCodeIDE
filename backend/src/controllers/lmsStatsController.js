import { Course } from '../models/Course.js';
import { Department } from '../models/Department.js';
import { Lesson } from '../models/Lesson.js';
import { Enrollment } from '../models/Enrollment.js';
import { LessonProgress } from '../models/LessonProgress.js';
import { User } from '../models/User.js';
import { Assignment } from '../models/Assignment.js';
import { Submission } from '../models/Submission.js';

export const getLMSStats = async (req, res) => {
  try {
    const role = req.user.role;
    const userId = req.user._id || req.user.id;
    const universityId = req.user.universityId?._id || req.user.universityId;

    if (role === 'STUDENT') {
      const enrollments = await Enrollment.find({ studentId: userId });
      const enrolledCount = enrollments.length;
      const completedCount = enrollments.filter((e) => e.status === 'COMPLETED').length;
      const activeCount = enrollments.filter((e) => e.status === 'ACTIVE').length;

      const courseIds = enrollments.map((e) => e.courseId);
      const [totalLessonsInEnrolled, completedLessonsCount, totalAssignments, mySubmissions] =
        await Promise.all([
          Lesson.countDocuments({ courseId: { $in: courseIds }, status: 'PUBLISHED' }),
          LessonProgress.countDocuments({ studentId: userId, completed: true }),
          Assignment.countDocuments({ courseId: { $in: courseIds }, status: 'PUBLISHED' }),
          Submission.find({ studentId: userId, status: { $ne: 'DRAFT' } }),
        ]);

      const submittedAssignmentIds = new Set(mySubmissions.map((s) => s.assignmentId.toString()));
      const pendingAssignmentsCount = Math.max(0, totalAssignments - submittedAssignmentIds.size);

      const evaluatedSubmissions = mySubmissions.filter((s) => s.status === 'EVALUATED' && s.score !== null);
      const avgScore =
        evaluatedSubmissions.length > 0
          ? Math.round(
              (evaluatedSubmissions.reduce((acc, curr) => acc + (curr.score / curr.maxScore) * 100, 0) /
                evaluatedSubmissions.length) *
                10
            ) / 10
          : null;

      const overallProgress =
        totalLessonsInEnrolled > 0
          ? Math.round((completedLessonsCount / totalLessonsInEnrolled) * 100)
          : 0;

      return res.json({
        success: true,
        role,
        stats: {
          enrolledCourses: enrolledCount,
          activeCourses: activeCount,
          completedCourses: completedCount,
          completedLessons: completedLessonsCount,
          overallProgress,
          totalAssignments,
          pendingAssignmentsCount,
          submittedCount: submittedAssignmentIds.size,
          averageScore: avgScore,
        },
      });
    }

    if (role === 'TEACHER') {
      const myCourses = await Course.find({
        universityId,
        instructors: userId,
      });
      const courseIds = myCourses.map((c) => c._id);

      const [
        totalStudents,
        totalLessons,
        publishedCount,
        totalAssignments,
        pendingEvaluations,
        evaluatedSubmissions,
      ] = await Promise.all([
        Enrollment.countDocuments({ courseId: { $in: courseIds }, status: 'ACTIVE' }),
        Lesson.countDocuments({ courseId: { $in: courseIds } }),
        Course.countDocuments({ _id: { $in: courseIds }, status: 'PUBLISHED' }),
        Assignment.countDocuments({ courseId: { $in: courseIds } }),
        Submission.countDocuments({
          courseId: { $in: courseIds },
          status: { $in: ['SUBMITTED', 'UNDER_REVIEW'] },
        }),
        Submission.countDocuments({ courseId: { $in: courseIds }, status: 'EVALUATED' }),
      ]);

      return res.json({
        success: true,
        role,
        stats: {
          assignedCourses: myCourses.length,
          publishedCourses: publishedCount,
          totalStudentsEnrolled: totalStudents,
          totalLessonsCreated: totalLessons,
          totalAssignments,
          pendingEvaluations,
          evaluatedSubmissions,
        },
      });
    }

    if (role === 'UNIVERSITY_ADMIN') {
      const [
        totalDepartments,
        totalCourses,
        publishedCourses,
        totalStudents,
        totalTeachers,
        totalEnrollments,
        totalAssignments,
        totalSubmissions,
        pendingEvaluations,
      ] = await Promise.all([
        Department.countDocuments({ universityId }),
        Course.countDocuments({ universityId }),
        Course.countDocuments({ universityId, status: 'PUBLISHED' }),
        User.countDocuments({ universityId, role: 'STUDENT', status: 'ACTIVE' }),
        User.countDocuments({ universityId, role: 'TEACHER', status: 'ACTIVE' }),
        Enrollment.countDocuments({ universityId, status: 'ACTIVE' }),
        Assignment.countDocuments({ universityId }),
        Submission.countDocuments({ universityId, status: { $ne: 'DRAFT' } }),
        Submission.countDocuments({
          universityId,
          status: { $in: ['SUBMITTED', 'UNDER_REVIEW'] },
        }),
      ]);

      return res.json({
        success: true,
        role,
        stats: {
          totalDepartments,
          totalCourses,
          publishedCourses,
          draftCourses: totalCourses - publishedCourses,
          totalStudents,
          totalTeachers,
          totalEnrollments,
          totalAssignments,
          totalSubmissions,
          pendingEvaluations,
        },
      });
    }

    // Default / SUPER_ADMIN
    const [allCourses, allDepartments, allEnrollments, allLessons, allAssignments, allSubmissions] =
      await Promise.all([
        Course.countDocuments(),
        Department.countDocuments(),
        Enrollment.countDocuments(),
        Lesson.countDocuments(),
        Assignment.countDocuments(),
        Submission.countDocuments({ status: { $ne: 'DRAFT' } }),
      ]);

    return res.json({
      success: true,
      role,
      stats: {
        totalCourses: allCourses,
        totalDepartments: allDepartments,
        totalEnrollments: allEnrollments,
        totalLessons: allLessons,
        totalAssignments: allAssignments,
        totalSubmissions: allSubmissions,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
