import { Assignment } from '../models/Assignment.js';
import { Course } from '../models/Course.js';
import { Module } from '../models/Module.js';
import { Lesson } from '../models/Lesson.js';
import { Enrollment } from '../models/Enrollment.js';
import { Submission } from '../models/Submission.js';

export const getAssignments = async (req, res) => {
  try {
    const universityId =
      req.user.role === 'SUPER_ADMIN' && req.query.universityId
        ? req.query.universityId
        : req.user.universityId?._id || req.user.universityId;

    const filter = universityId ? { universityId } : {};

    if (req.query.courseId) {
      filter.courseId = req.query.courseId;
    }
    if (req.query.difficulty) {
      filter.difficulty = req.query.difficulty;
    }
    if (req.query.search) {
      filter.title = new RegExp(req.query.search.trim(), 'i');
    }

    // Role-specific constraints
    if (req.user.role === 'STUDENT') {
      const studentId = req.user._id || req.user.id;
      // Get all enrolled courses
      const enrollments = await Enrollment.find({ studentId, status: 'ACTIVE' });
      const enrolledCourseIds = enrollments.map((e) => e.courseId);

      // Student can only see PUBLISHED assignments in enrolled courses
      filter.courseId = { $in: enrolledCourseIds };
      filter.status = 'PUBLISHED';
    } else if (req.user.role === 'TEACHER') {
      if (req.query.status) {
        filter.status = req.query.status;
      }
      if (req.query.myAssignments === 'true') {
        filter.createdBy = req.user._id || req.user.id;
      }
    } else if (req.query.status) {
      filter.status = req.query.status;
    }

    const assignments = await Assignment.find(filter)
      .populate('courseId', 'title code departmentId')
      .populate('moduleId', 'title order')
      .populate('lessonId', 'title order')
      .populate('createdBy', 'name email avatar')
      .sort({ dueDate: 1, createdAt: -1 });

    const assignmentIds = assignments.map((a) => a._id);

    // Aggregate submission stats for teachers/admins
    let submissionStatsMap = {};
    if (req.user.role !== 'STUDENT') {
      const stats = await Submission.aggregate([
        { $match: { assignmentId: { $in: assignmentIds } } },
        {
          $group: {
            _id: '$assignmentId',
            totalSubmissions: {
              $sum: { $cond: [{ $ne: ['$status', 'DRAFT'] }, 1, 0] },
            },
            evaluatedCount: {
              $sum: { $cond: [{ $eq: ['$status', 'EVALUATED'] }, 1, 0] },
            },
            pendingCount: {
              $sum: { $cond: [{ $in: ['$status', ['SUBMITTED', 'UNDER_REVIEW']] }, 1, 0] },
            },
          },
        },
      ]);
      stats.forEach((s) => {
        submissionStatsMap[s._id.toString()] = s;
      });
    }

    // For students: check their own submission status and attempts
    let studentSubmissionsMap = {};
    if (req.user.role === 'STUDENT') {
      const studentId = req.user._id || req.user.id;
      const mySubmissions = await Submission.find({
        studentId,
        assignmentId: { $in: assignmentIds },
      }).sort({ attemptNumber: -1 });

      mySubmissions.forEach((sub) => {
        const aId = sub.assignmentId.toString();
        if (!studentSubmissionsMap[aId]) {
          studentSubmissionsMap[aId] = {
            latestSubmission: sub,
            attemptsUsed: sub.status === 'DRAFT' ? sub.attemptNumber - 1 : sub.attemptNumber,
            hasDraft: sub.status === 'DRAFT',
            draftId: sub.status === 'DRAFT' ? sub._id : null,
          };
        }
      });
    }

    const enriched = assignments.map((a) => {
      const aObj = a.toObject();
      const now = new Date();
      const isOverdue = new Date(a.dueDate) < now;

      return {
        ...aObj,
        isOverdue,
        submissionStats: submissionStatsMap[a._id.toString()] || {
          totalSubmissions: 0,
          evaluatedCount: 0,
          pendingCount: 0,
        },
        studentStatus: studentSubmissionsMap[a._id.toString()] || null,
      };
    });

    res.json({
      success: true,
      count: enriched.length,
      assignments: enriched,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve assignments',
      error: error.message,
    });
  }
};

export const getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('courseId', 'title code departmentId instructors')
      .populate('moduleId', 'title order')
      .populate('lessonId', 'title order')
      .populate('createdBy', 'name email avatar');

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    // Tenant check
    const userUni = req.user.universityId?._id?.toString() || req.user.universityId?.toString();
    if (req.user.role !== 'SUPER_ADMIN' && assignment.universityId.toString() !== userUni) {
      return res.status(403).json({ success: false, message: 'Unauthorized assignment access' });
    }

    // Role checks
    if (req.user.role === 'STUDENT') {
      const studentId = req.user._id || req.user.id;
      // Check enrollment
      const enrolled = await Enrollment.findOne({
        studentId,
        courseId: assignment.courseId._id || assignment.courseId,
        status: 'ACTIVE',
      });

      if (!enrolled) {
        return res.status(403).json({
          success: false,
          message: 'You must be enrolled in the course to view this assignment',
        });
      }

      if (assignment.status !== 'PUBLISHED') {
        return res.status(404).json({ success: false, message: 'Assignment is not currently available' });
      }

      // Fetch student submissions for this assignment
      const submissions = await Submission.find({
        assignmentId: assignment._id,
        studentId,
      }).sort({ attemptNumber: 1 });

      const activeDraft = submissions.find((s) => s.status === 'DRAFT');
      const submittedAttempts = submissions.filter((s) => s.status !== 'DRAFT');

      const isOverdue = new Date(assignment.dueDate) < new Date();
      const canSubmit =
        (!isOverdue || assignment.allowLateSubmission) &&
        submittedAttempts.length < assignment.maxAttempts;

      return res.json({
        success: true,
        assignment: {
          ...assignment.toObject(),
          isOverdue,
          canSubmit,
          attemptsUsed: submittedAttempts.length,
          activeDraft,
          submissions: submittedAttempts,
        },
      });
    }

    // For Teacher / Admin: include total submissions count and overview
    const [totalSubmissions, evaluatedCount, pendingCount, enrolledCount] = await Promise.all([
      Submission.countDocuments({ assignmentId: assignment._id, status: { $ne: 'DRAFT' } }),
      Submission.countDocuments({ assignmentId: assignment._id, status: 'EVALUATED' }),
      Submission.countDocuments({ assignmentId: assignment._id, status: { $in: ['SUBMITTED', 'UNDER_REVIEW'] } }),
      Enrollment.countDocuments({ courseId: assignment.courseId._id || assignment.courseId, status: 'ACTIVE' }),
    ]);

    res.json({
      success: true,
      assignment: {
        ...assignment.toObject(),
        stats: {
          enrolledCount,
          totalSubmissions,
          evaluatedCount,
          pendingCount,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createAssignment = async (req, res) => {
  try {
    const universityId =
      req.user.role === 'SUPER_ADMIN' && req.body.universityId
        ? req.body.universityId
        : req.user.universityId?._id || req.user.universityId;

    if (!universityId) {
      return res.status(400).json({ success: false, message: 'University context required' });
    }

    const {
      courseId,
      moduleId,
      lessonId,
      title,
      description,
      instructions,
      type,
      programmingLanguage,
      difficulty,
      totalMarks,
      passingMarks,
      dueDate,
      allowLateSubmission,
      latePenaltyPercent,
      starterCode,
      maxAttempts,
      testCases,
      resources,
      status,
    } = req.body;

    // Validate course exists in same university
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    if (course.universityId.toString() !== universityId.toString()) {
      return res.status(403).json({ success: false, message: 'Cross-tenant course access forbidden' });
    }

    // Verify teacher assignment if teacher role
    if (req.user.role === 'TEACHER') {
      const isAssigned = course.instructors.some(
        (id) => id.toString() === (req.user._id || req.user.id).toString()
      );
      if (!isAssigned) {
        return res.status(403).json({
          success: false,
          message: 'You are not assigned as an instructor for this course',
        });
      }
    }

    // Validate module and lesson relationships if provided
    if (moduleId) {
      const mod = await Module.findById(moduleId);
      if (!mod || mod.courseId.toString() !== courseId.toString()) {
        return res.status(400).json({ success: false, message: 'Module does not belong to specified course' });
      }
    }

    if (lessonId) {
      const les = await Lesson.findById(lessonId);
      if (!les || les.courseId.toString() !== courseId.toString()) {
        return res.status(400).json({ success: false, message: 'Lesson does not belong to specified course' });
      }
    }

    // Validate marks
    const totMarks = Number(totalMarks) || 100;
    const passMarks = Number(passingMarks) || 40;
    if (passMarks > totMarks) {
      return res.status(400).json({
        success: false,
        message: 'Passing marks cannot exceed total marks',
      });
    }

    if (!dueDate || isNaN(new Date(dueDate).getTime())) {
      return res.status(400).json({ success: false, message: 'Valid due date is required' });
    }

    const assignment = await Assignment.create({
      universityId,
      courseId,
      moduleId: moduleId || null,
      lessonId: lessonId || null,
      title: title.trim(),
      description: description || '',
      instructions: instructions || '',
      type: type || 'CODING',
      programmingLanguage: programmingLanguage || 'PYTHON',
      difficulty: difficulty || 'MEDIUM',
      totalMarks: totMarks,
      passingMarks: passMarks,
      dueDate: new Date(dueDate),
      status: status || 'DRAFT',
      allowLateSubmission: !!allowLateSubmission,
      latePenaltyPercent: Number(latePenaltyPercent) || 0,
      starterCode: starterCode || '',
      maxAttempts: Number(maxAttempts) || 3,
      testCases: testCases || [],
      resources: resources || [],
      createdBy: req.user._id || req.user.id,
      publishedAt: status === 'PUBLISHED' ? new Date() : null,
    });

    const populated = await Assignment.findById(assignment._id)
      .populate('courseId', 'title code')
      .populate('moduleId', 'title')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      assignment: populated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create assignment',
      error: error.message,
    });
  }
};

export const updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    const userUni = req.user.universityId?._id?.toString() || req.user.universityId?.toString();
    if (req.user.role !== 'SUPER_ADMIN' && assignment.universityId.toString() !== userUni) {
      return res.status(403).json({ success: false, message: 'Unauthorized assignment access' });
    }

    // If teacher, verify creator or course instructor
    if (req.user.role === 'TEACHER') {
      const isCreator = assignment.createdBy.toString() === (req.user._id || req.user.id).toString();
      const course = await Course.findById(assignment.courseId);
      const isInstructor = course?.instructors.some(
        (id) => id.toString() === (req.user._id || req.user.id).toString()
      );
      if (!isCreator && !isInstructor) {
        return res.status(403).json({ success: false, message: 'Permission denied to edit this assignment' });
      }
    }

    const allowedFields = [
      'title',
      'description',
      'instructions',
      'type',
      'programmingLanguage',
      'difficulty',
      'totalMarks',
      'passingMarks',
      'dueDate',
      'allowLateSubmission',
      'latePenaltyPercent',
      'starterCode',
      'maxAttempts',
      'testCases',
      'resources',
      'status',
      'moduleId',
      'lessonId',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        assignment[field] = req.body[field];
      }
    });

    if (req.body.status === 'PUBLISHED' && !assignment.publishedAt) {
      assignment.publishedAt = new Date();
    }

    if (assignment.passingMarks > assignment.totalMarks) {
      return res.status(400).json({ success: false, message: 'Passing marks cannot exceed total marks' });
    }

    await assignment.save();

    const populated = await Assignment.findById(assignment._id)
      .populate('courseId', 'title code')
      .populate('moduleId', 'title')
      .populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Assignment updated successfully',
      assignment: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAssignmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid assignment status' });
    }

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    const userUni = req.user.universityId?._id?.toString() || req.user.universityId?.toString();
    if (req.user.role !== 'SUPER_ADMIN' && assignment.universityId.toString() !== userUni) {
      return res.status(403).json({ success: false, message: 'Unauthorized assignment access' });
    }

    assignment.status = status;
    if (status === 'PUBLISHED' && !assignment.publishedAt) {
      assignment.publishedAt = new Date();
    }
    await assignment.save();

    res.json({
      success: true,
      message: `Assignment status changed to ${status}`,
      assignment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    const userUni = req.user.universityId?._id?.toString() || req.user.universityId?.toString();
    if (req.user.role !== 'SUPER_ADMIN' && assignment.universityId.toString() !== userUni) {
      return res.status(403).json({ success: false, message: 'Unauthorized assignment access' });
    }

    // Cascade delete submissions
    await Promise.all([
      Submission.deleteMany({ assignmentId: assignment._id }),
      assignment.deleteOne(),
    ]);

    res.json({
      success: true,
      message: 'Assignment and related submissions deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
