import { Course } from '../models/Course.js';
import { Module } from '../models/Module.js';
import { Lesson } from '../models/Lesson.js';
import { Enrollment } from '../models/Enrollment.js';
import { LessonProgress } from '../models/LessonProgress.js';

export const getCourses = async (req, res) => {
  try {
    const universityId = req.user.role === 'SUPER_ADMIN' && req.query.universityId
      ? req.query.universityId
      : req.user.universityId?._id || req.user.universityId;

    const filter = universityId ? { universityId } : {};

    // Role-specific constraints
    if (req.user.role === 'STUDENT') {
      filter.status = 'PUBLISHED';
    } else if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.departmentId) {
      filter.departmentId = req.query.departmentId;
    }

    if (req.query.level) {
      filter.level = req.query.level;
    }

    if (req.query.instructorId) {
      filter.instructors = req.query.instructorId;
    } else if (req.user.role === 'TEACHER' && req.query.myCourses === 'true') {
      filter.instructors = req.user._id || req.user.id;
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search.trim(), 'i');
      filter.$or = [{ title: searchRegex }, { code: searchRegex }, { description: searchRegex }];
    }

    const courses = await Course.find(filter)
      .populate('departmentId', 'name code')
      .populate('instructors', 'name email avatar')
      .sort({ createdAt: -1 });

    const courseIds = courses.map((c) => c._id);

    // Aggregate lesson & module counts
    const [moduleCounts, lessonCounts, enrollmentCounts] = await Promise.all([
      Module.aggregate([
        { $match: { courseId: { $in: courseIds } } },
        { $group: { _id: '$courseId', count: { $sum: 1 } } },
      ]),
      Lesson.aggregate([
        { $match: { courseId: { $in: courseIds } } },
        { $group: { _id: '$courseId', count: { $sum: 1 } } },
      ]),
      Enrollment.aggregate([
        { $match: { courseId: { $in: courseIds }, status: 'ACTIVE' } },
        { $group: { _id: '$courseId', count: { $sum: 1 } } },
      ]),
    ]);

    const moduleMap = {};
    moduleCounts.forEach((m) => { moduleMap[m._id.toString()] = m.count; });

    const lessonMap = {};
    lessonCounts.forEach((l) => { lessonMap[l._id.toString()] = l.count; });

    const enrollmentMap = {};
    enrollmentCounts.forEach((e) => { enrollmentMap[e._id.toString()] = e.count; });

    // Check student enrollments
    let studentEnrollmentMap = {};
    if (req.user.role === 'STUDENT') {
      const studentId = req.user._id || req.user.id;
      const myEnrollments = await Enrollment.find({
        studentId,
        courseId: { $in: courseIds },
      });
      myEnrollments.forEach((e) => {
        studentEnrollmentMap[e.courseId.toString()] = e.status;
      });
    }

    const enrichedCourses = courses.map((course) => {
      const cObj = course.toObject();
      return {
        ...cObj,
        modulesCount: moduleMap[course._id.toString()] || 0,
        lessonsCount: lessonMap[course._id.toString()] || 0,
        enrolledStudentsCount: enrollmentMap[course._id.toString()] || 0,
        enrollmentStatus: studentEnrollmentMap[course._id.toString()] || null,
      };
    });

    res.json({
      success: true,
      count: enrichedCourses.length,
      courses: enrichedCourses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve courses',
      error: error.message,
    });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('departmentId', 'name code description')
      .populate('instructors', 'name email avatar title bio');

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const userUni = req.user.universityId?._id?.toString() || req.user.universityId?.toString();
    if (req.user.role !== 'SUPER_ADMIN' && course.universityId.toString() !== userUni) {
      return res.status(403).json({ success: false, message: 'Unauthorized course access' });
    }

    const [modulesCount, lessonsCount, enrolledCount] = await Promise.all([
      Module.countDocuments({ courseId: course._id }),
      Lesson.countDocuments({ courseId: course._id }),
      Enrollment.countDocuments({ courseId: course._id, status: 'ACTIVE' }),
    ]);

    let userProgress = null;
    let enrollment = null;
    if (req.user.role === 'STUDENT') {
      const studentId = req.user._id || req.user.id;
      enrollment = await Enrollment.findOne({ studentId, courseId: course._id });
      if (enrollment && lessonsCount > 0) {
        const completedCount = await LessonProgress.countDocuments({
          studentId,
          courseId: course._id,
          completed: true,
        });
        userProgress = {
          completedLessons: completedCount,
          totalLessons: lessonsCount,
          percentage: Math.round((completedCount / lessonsCount) * 100),
        };
      }
    }

    res.json({
      success: true,
      course: {
        ...course.toObject(),
        modulesCount,
        lessonsCount,
        enrolledStudentsCount: enrolledCount,
        isEnrolled: !!enrollment,
        enrollment,
        userProgress,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCourse = async (req, res) => {
  try {
    const universityId = req.user.role === 'SUPER_ADMIN' && req.body.universityId
      ? req.body.universityId
      : req.user.universityId?._id || req.user.universityId;

    if (!universityId) {
      return res.status(400).json({
        success: false,
        message: 'University association required to create course',
      });
    }

    const {
      title,
      code,
      description,
      departmentId,
      instructors,
      level,
      semester,
      academicYear,
      credits,
      duration,
      prerequisites,
      syllabus,
      coverImage,
    } = req.body;

    const existing = await Course.findOne({
      universityId,
      code: code.trim().toUpperCase(),
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Course with code ${code} already exists in this university`,
      });
    }

    const course = await Course.create({
      universityId,
      title: title.trim(),
      code: code.trim().toUpperCase(),
      description: description || '',
      departmentId,
      instructors: instructors || (req.user.role === 'TEACHER' ? [req.user._id || req.user.id] : []),
      level: level || 'BEGINNER',
      semester: semester || 'Fall',
      academicYear: academicYear || new Date().getFullYear().toString(),
      credits: credits || 3,
      duration: duration || '12 Weeks',
      prerequisites: prerequisites || [],
      syllabus: syllabus || '',
      coverImage: coverImage || '',
      status: 'DRAFT',
      createdBy: req.user._id || req.user.id,
    });

    const populated = await Course.findById(course._id)
      .populate('departmentId', 'name code')
      .populate('instructors', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      course: populated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create course',
      error: error.message,
    });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const userUni = req.user.universityId?._id?.toString() || req.user.universityId?.toString();
    if (req.user.role !== 'SUPER_ADMIN' && course.universityId.toString() !== userUni) {
      return res.status(403).json({ success: false, message: 'Unauthorized course access' });
    }

    // If teacher, verify they are assigned or university admin
    if (req.user.role === 'TEACHER') {
      const isAssigned = course.instructors.some(
        (instId) => instId.toString() === (req.user._id || req.user.id).toString()
      );
      if (!isAssigned) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You are not assigned as an instructor for this course',
        });
      }
    }

    const allowedUpdates = [
      'title',
      'description',
      'departmentId',
      'instructors',
      'level',
      'semester',
      'academicYear',
      'credits',
      'duration',
      'prerequisites',
      'syllabus',
      'coverImage',
      'status',
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        course[field] = req.body[field];
      }
    });

    await course.save();

    const populated = await Course.findById(course._id)
      .populate('departmentId', 'name code')
      .populate('instructors', 'name email avatar');

    res.json({
      success: true,
      message: 'Course updated successfully',
      course: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCourseStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be DRAFT, PUBLISHED, or ARCHIVED',
      });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const userUni = req.user.universityId?._id?.toString() || req.user.universityId?.toString();
    if (req.user.role !== 'SUPER_ADMIN' && course.universityId.toString() !== userUni) {
      return res.status(403).json({ success: false, message: 'Unauthorized course access' });
    }

    course.status = status;
    await course.save();

    res.json({
      success: true,
      message: `Course status changed to ${status}`,
      course,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const userUni = req.user.universityId?._id?.toString() || req.user.universityId?.toString();
    if (req.user.role !== 'SUPER_ADMIN' && course.universityId.toString() !== userUni) {
      return res.status(403).json({ success: false, message: 'Unauthorized course access' });
    }

    // Cascade delete modules, lessons, enrollments, lesson progress
    await Promise.all([
      Module.deleteMany({ courseId: course._id }),
      Lesson.deleteMany({ courseId: course._id }),
      Enrollment.deleteMany({ courseId: course._id }),
      LessonProgress.deleteMany({ courseId: course._id }),
      course.deleteOne(),
    ]);

    res.json({
      success: true,
      message: 'Course and related content deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
