import { Submission } from '../models/Submission.js';
import { Assignment } from '../models/Assignment.js';
import { Course } from '../models/Course.js';
import { Enrollment } from '../models/Enrollment.js';

export const saveDraft = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const studentId = req.user._id || req.user.id;
    const { sourceCode, programmingLanguage, files } = req.body;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    // Verify tenant
    const userUni = req.user.universityId?._id?.toString() || req.user.universityId?.toString();
    if (assignment.universityId.toString() !== userUni) {
      return res.status(403).json({ success: false, message: 'Unauthorized assignment access' });
    }

    // Verify enrollment
    const enrollment = await Enrollment.findOne({
      studentId,
      courseId: assignment.courseId,
      status: 'ACTIVE',
    });
    if (!enrollment) {
      return res.status(403).json({ success: false, message: 'You must be enrolled to work on this assignment' });
    }

    const completedAttempts = await Submission.countDocuments({
      assignmentId,
      studentId,
      status: { $ne: 'DRAFT' },
    });

    if (completedAttempts >= assignment.maxAttempts) {
      return res.status(400).json({
        success: false,
        message: `Maximum allowed attempts (${assignment.maxAttempts}) reached for this assignment`,
      });
    }

    // Find existing draft or create new
    let draft = await Submission.findOne({
      assignmentId,
      studentId,
      status: 'DRAFT',
    });

    if (draft) {
      draft.sourceCode = sourceCode !== undefined ? sourceCode : draft.sourceCode;
      draft.programmingLanguage = programmingLanguage || draft.programmingLanguage;
      draft.files = files || draft.files;
      await draft.save();
    } else {
      draft = await Submission.create({
        universityId: assignment.universityId,
        assignmentId: assignment._id,
        courseId: assignment.courseId,
        studentId,
        attemptNumber: completedAttempts + 1,
        sourceCode: sourceCode || assignment.starterCode || '',
        programmingLanguage: programmingLanguage || assignment.programmingLanguage || 'PYTHON',
        files: files || [],
        status: 'DRAFT',
        maxScore: assignment.totalMarks,
      });
    }

    res.json({
      success: true,
      message: 'Draft saved successfully',
      submission: draft,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const submitSolution = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const studentId = req.user._id || req.user.id;
    const { sourceCode, programmingLanguage, files } = req.body;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    // Verify tenant
    const userUni = req.user.universityId?._id?.toString() || req.user.universityId?.toString();
    if (assignment.universityId.toString() !== userUni) {
      return res.status(403).json({ success: false, message: 'Unauthorized assignment access' });
    }

    if (assignment.status !== 'PUBLISHED') {
      return res.status(400).json({ success: false, message: 'Assignment is not open for submission' });
    }

    // Verify enrollment
    const enrollment = await Enrollment.findOne({
      studentId,
      courseId: assignment.courseId,
      status: 'ACTIVE',
    });
    if (!enrollment) {
      return res.status(403).json({ success: false, message: 'Must be enrolled to submit this assignment' });
    }

    // Server-side deadline check
    const now = new Date();
    const isLate = now > new Date(assignment.dueDate);
    if (isLate && !assignment.allowLateSubmission) {
      return res.status(400).json({
        success: false,
        message: 'The deadline for this assignment has passed and late submissions are disabled',
      });
    }

    // Check attempts limit
    const completedAttempts = await Submission.countDocuments({
      assignmentId,
      studentId,
      status: { $ne: 'DRAFT' },
    });

    if (completedAttempts >= assignment.maxAttempts) {
      return res.status(400).json({
        success: false,
        message: `Maximum allowed attempts (${assignment.maxAttempts}) reached for this assignment`,
      });
    }

    // Check if upgrading an existing draft
    let submission = await Submission.findOne({
      assignmentId,
      studentId,
      status: 'DRAFT',
    });

    const codeToSubmit = sourceCode !== undefined ? sourceCode : (submission?.sourceCode || '');
    if (!codeToSubmit.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot submit an empty solution. Please provide source code.',
      });
    }

    if (submission) {
      submission.sourceCode = codeToSubmit;
      submission.programmingLanguage = programmingLanguage || submission.programmingLanguage;
      submission.files = files || submission.files;
      submission.status = 'SUBMITTED';
      submission.submittedAt = now;
      submission.isLate = isLate;
      submission.attemptNumber = completedAttempts + 1;
      await submission.save();
    } else {
      submission = await Submission.create({
        universityId: assignment.universityId,
        assignmentId: assignment._id,
        courseId: assignment.courseId,
        studentId,
        attemptNumber: completedAttempts + 1,
        sourceCode: codeToSubmit,
        programmingLanguage: programmingLanguage || assignment.programmingLanguage,
        files: files || [],
        status: 'SUBMITTED',
        submittedAt: now,
        isLate,
        maxScore: assignment.totalMarks,
      });
    }

    const populated = await Submission.findById(submission._id)
      .populate('assignmentId', 'title totalMarks passingMarks')
      .populate('studentId', 'name email studentId');

    res.status(201).json({
      success: true,
      message: isLate
        ? 'Assignment submitted (Recorded as LATE)'
        : 'Assignment submitted successfully',
      submission: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSubmissions = async (req, res) => {
  try {
    const universityId =
      req.user.role === 'SUPER_ADMIN' && req.query.universityId
        ? req.query.universityId
        : req.user.universityId?._id || req.user.universityId;

    const filter = universityId ? { universityId } : {};

    if (req.query.assignmentId) {
      filter.assignmentId = req.query.assignmentId;
    }
    if (req.query.courseId) {
      filter.courseId = req.query.courseId;
    }
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Role filtering: Student can ONLY see their own submissions
    if (req.user.role === 'STUDENT') {
      filter.studentId = req.user._id || req.user.id;
    } else {
      // Teachers and Admins do NOT see unfinished student drafts in general list
      if (!req.query.includeDrafts) {
        filter.status = { $ne: 'DRAFT' };
      }
    }

    const submissions = await Submission.find(filter)
      .populate('studentId', 'name email avatar studentId department')
      .populate('assignmentId', 'title code totalMarks dueDate difficulty programmingLanguage')
      .populate('evaluatedBy', 'name email')
      .select('-files -sourceCode') // Don't load giant source code strings in bulk list
      .sort({ submittedAt: -1, createdAt: -1 });

    res.json({
      success: true,
      count: submissions.length,
      submissions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSubmissionById = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('studentId', 'name email avatar studentId department')
      .populate({
        path: 'assignmentId',
        select: 'title description instructions totalMarks passingMarks dueDate difficulty programmingLanguage allowLateSubmission',
      })
      .populate('courseId', 'title code')
      .populate('evaluatedBy', 'name email avatar');

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    const userUni = req.user.universityId?._id?.toString() || req.user.universityId?.toString();
    if (req.user.role !== 'SUPER_ADMIN' && submission.universityId.toString() !== userUni) {
      return res.status(403).json({ success: false, message: 'Unauthorized submission access' });
    }

    // Ownership check for students
    if (req.user.role === 'STUDENT') {
      const studentId = req.user._id || req.user.id;
      if (submission.studentId._id.toString() !== studentId.toString()) {
        return res.status(403).json({ success: false, message: 'Cannot access another student submission' });
      }
    }

    res.json({
      success: true,
      submission,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const evaluateSubmission = async (req, res) => {
  try {
    const { score, feedback, status } = req.body;
    const submission = await Submission.findById(req.params.id).populate('assignmentId');

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    const userUni = req.user.universityId?._id?.toString() || req.user.universityId?.toString();
    if (req.user.role !== 'SUPER_ADMIN' && submission.universityId.toString() !== userUni) {
      return res.status(403).json({ success: false, message: 'Unauthorized submission access' });
    }

    // Teacher authorization check
    if (req.user.role === 'TEACHER') {
      const course = await Course.findById(submission.courseId);
      const isInstructor = course?.instructors.some(
        (id) => id.toString() === (req.user._id || req.user.id).toString()
      );
      if (!isInstructor) {
        return res.status(403).json({ success: false, message: 'You are not assigned to grade this course' });
      }
    }

    const maxScore = submission.maxScore || submission.assignmentId?.totalMarks || 100;
    const numScore = Number(score);

    if (isNaN(numScore) || numScore < 0 || numScore > maxScore) {
      return res.status(400).json({
        success: false,
        message: `Score must be a number between 0 and ${maxScore}`,
      });
    }

    submission.score = numScore;
    submission.status = status || 'EVALUATED';
    submission.evaluatedBy = req.user._id || req.user.id;
    submission.evaluatedAt = new Date();

    if (feedback) {
      submission.feedback = {
        general: feedback.general || submission.feedback?.general || '',
        strengths: feedback.strengths || submission.feedback?.strengths || '',
        improvements: feedback.improvements || submission.feedback?.improvements || '',
      };
    }

    await submission.save();

    const populated = await Submission.findById(submission._id)
      .populate('studentId', 'name email studentId')
      .populate('evaluatedBy', 'name email');

    res.json({
      success: true,
      message: 'Submission evaluated successfully',
      submission: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const returnSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    const userUni = req.user.universityId?._id?.toString() || req.user.universityId?.toString();
    if (req.user.role !== 'SUPER_ADMIN' && submission.universityId.toString() !== userUni) {
      return res.status(403).json({ success: false, message: 'Unauthorized submission access' });
    }

    submission.status = 'RETURNED';
    if (req.body.feedback) {
      submission.feedback = {
        ...submission.feedback,
        general: req.body.feedback.general || submission.feedback?.general || '',
      };
    }
    await submission.save();

    res.json({
      success: true,
      message: 'Submission returned to student',
      submission,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
