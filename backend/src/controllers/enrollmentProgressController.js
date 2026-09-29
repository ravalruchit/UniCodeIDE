import { Enrollment } from '../models/Enrollment.js';
import { LessonProgress } from '../models/LessonProgress.js';
import { Course } from '../models/Course.js';
import { Lesson } from '../models/Lesson.js';

export const enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user._id || req.user.id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const userUni = req.user.universityId?._id?.toString() || req.user.universityId?.toString();
    if (course.universityId.toString() !== userUni) {
      return res.status(403).json({ success: false, message: 'Cannot enroll in course from another university' });
    }

    if (course.status !== 'PUBLISHED') {
      return res.status(400).json({ success: false, message: 'Course is not currently open for enrollment' });
    }

    let enrollment = await Enrollment.findOne({ studentId, courseId });
    if (enrollment) {
      if (enrollment.status === 'DROPPED') {
        enrollment.status = 'ACTIVE';
        enrollment.enrolledAt = new Date();
        await enrollment.save();
      }
      return res.json({
        success: true,
        message: 'Already enrolled in this course',
        enrollment,
      });
    }

    enrollment = await Enrollment.create({
      universityId: course.universityId,
      studentId,
      courseId,
      status: 'ACTIVE',
      enrolledAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Enrolled in course successfully',
      enrollment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const unenrollFromCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user._id || req.user.id;

    const enrollment = await Enrollment.findOne({ studentId, courseId });
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    enrollment.status = 'DROPPED';
    await enrollment.save();

    res.json({
      success: true,
      message: 'Unenrolled from course successfully',
      enrollment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyEnrolledCourses = async (req, res) => {
  try {
    const studentId = req.user._id || req.user.id;
    const status = req.query.status || 'ACTIVE';

    const filter = { studentId };
    if (status !== 'ALL') {
      filter.status = status;
    }

    const enrollments = await Enrollment.find(filter)
      .populate({
        path: 'courseId',
        populate: [
          { path: 'departmentId', select: 'name code' },
          { path: 'instructors', select: 'name email avatar' },
        ],
      })
      .sort({ enrolledAt: -1 });

    const activeEnrollments = enrollments.filter((e) => e.courseId);
    const courseIds = activeEnrollments.map((e) => e.courseId._id);

    // Compute progress for each course
    const [lessonCounts, completedCounts, lastActivity] = await Promise.all([
      Lesson.aggregate([
        { $match: { courseId: { $in: courseIds }, status: 'PUBLISHED' } },
        { $group: { _id: '$courseId', count: { $sum: 1 } } },
      ]),
      LessonProgress.aggregate([
        { $match: { studentId, courseId: { $in: courseIds }, completed: true } },
        { $group: { _id: '$courseId', count: { $sum: 1 } } },
      ]),
      LessonProgress.aggregate([
        { $match: { studentId, courseId: { $in: courseIds } } },
        { $sort: { lastOpenedAt: -1 } },
        { $group: { _id: '$courseId', lastOpened: { $first: '$lastOpenedAt' } } },
      ]),
    ]);

    const totalMap = {};
    lessonCounts.forEach((l) => { totalMap[l._id.toString()] = l.count; });

    const completedMap = {};
    completedCounts.forEach((c) => { completedMap[c._id.toString()] = c.count; });

    const activityMap = {};
    lastActivity.forEach((a) => { activityMap[a._id.toString()] = a.lastOpened; });

    const results = activeEnrollments.map((e) => {
      const c = e.courseId;
      const cId = c._id.toString();
      const totalLessons = totalMap[cId] || 0;
      const completedLessons = completedMap[cId] || 0;
      const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      return {
        enrollmentId: e._id,
        enrollmentStatus: e.status,
        enrolledAt: e.enrolledAt,
        completedAt: e.completedAt,
        lastOpenedAt: activityMap[cId] || e.enrolledAt,
        progress: {
          totalLessons,
          completedLessons,
          percentage,
        },
        course: c,
      };
    });

    res.json({
      success: true,
      count: results.length,
      enrollments: results,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCourseStudents = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const userUni = req.user.universityId?._id?.toString() || req.user.universityId?.toString();
    if (req.user.role !== 'SUPER_ADMIN' && course.universityId.toString() !== userUni) {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    const enrollments = await Enrollment.find({ courseId })
      .populate('studentId', 'name email avatar studentId department')
      .sort({ enrolledAt: -1 });

    const totalLessons = await Lesson.countDocuments({ courseId, status: 'PUBLISHED' });
    const studentIds = enrollments.map((e) => e.studentId?._id).filter(Boolean);

    const progressSummary = await LessonProgress.aggregate([
      { $match: { courseId: course._id, studentId: { $in: studentIds }, completed: true } },
      { $group: { _id: '$studentId', completedCount: { $sum: 1 } } },
    ]);

    const compMap = {};
    progressSummary.forEach((p) => { compMap[p._id.toString()] = p.completedCount; });

    const students = enrollments
      .filter((e) => e.studentId)
      .map((e) => {
        const completed = compMap[e.studentId._id.toString()] || 0;
        const percentage = totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;
        return {
          enrollmentId: e._id,
          student: e.studentId,
          status: e.status,
          enrolledAt: e.enrolledAt,
          completedLessons: completed,
          totalLessons,
          progressPercentage: percentage,
        };
      });

    res.json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleLessonProgress = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const studentId = req.user._id || req.user.id;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    let progress = await LessonProgress.findOne({ studentId, lessonId });

    if (!progress) {
      progress = new LessonProgress({
        universityId: lesson.universityId,
        studentId,
        courseId: lesson.courseId,
        moduleId: lesson.moduleId,
        lessonId: lesson._id,
        completed: true,
        completedAt: new Date(),
        lastOpenedAt: new Date(),
      });
    } else {
      const willBeCompleted = req.body.completed !== undefined ? req.body.completed : !progress.completed;
      progress.completed = willBeCompleted;
      progress.completedAt = willBeCompleted ? new Date() : null;
      progress.lastOpenedAt = new Date();
    }

    await progress.save();

    // Check course overall completion
    const [totalLessons, completedLessons] = await Promise.all([
      Lesson.countDocuments({ courseId: lesson.courseId, status: 'PUBLISHED' }),
      LessonProgress.countDocuments({ studentId, courseId: lesson.courseId, completed: true }),
    ]);

    const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    // If 100% complete, update Enrollment
    if (totalLessons > 0 && completedLessons >= totalLessons) {
      await Enrollment.findOneAndUpdate(
        { studentId, courseId: lesson.courseId },
        { status: 'COMPLETED', completedAt: new Date() }
      );
    }

    res.json({
      success: true,
      message: progress.completed ? 'Lesson marked as complete' : 'Lesson marked as incomplete',
      progress: {
        lessonId: lesson._id,
        completed: progress.completed,
        completedAt: progress.completedAt,
        courseProgress: {
          totalLessons,
          completedLessons,
          percentage,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
