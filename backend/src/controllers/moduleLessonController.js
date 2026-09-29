import { Module } from '../models/Module.js';
import { Lesson } from '../models/Lesson.js';
import { Course } from '../models/Course.js';
import { LessonProgress } from '../models/LessonProgress.js';

export const getCourseCurriculum = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const userUni = req.user.universityId?._id?.toString() || req.user.universityId?.toString();
    if (req.user.role !== 'SUPER_ADMIN' && course.universityId.toString() !== userUni) {
      return res.status(403).json({ success: false, message: 'Unauthorized course access' });
    }

    const modules = await Module.find({ courseId }).sort({ order: 1 });
    const lessons = await Lesson.find({ courseId }).sort({ order: 1 });

    let progressMap = {};
    if (req.user.role === 'STUDENT') {
      const studentId = req.user._id || req.user.id;
      const progressDocs = await LessonProgress.find({ studentId, courseId });
      progressDocs.forEach((p) => {
        progressMap[p.lessonId.toString()] = {
          completed: p.completed,
          completedAt: p.completedAt,
          lastOpenedAt: p.lastOpenedAt,
        };
      });
    }

    const curriculum = modules.map((mod) => {
      const moduleLessons = lessons
        .filter((l) => l.moduleId.toString() === mod._id.toString())
        .map((l) => {
          const lObj = l.toObject();
          const prog = progressMap[l._id.toString()];
          return {
            ...lObj,
            isCompleted: prog ? prog.completed : false,
            lastOpenedAt: prog ? prog.lastOpenedAt : null,
          };
        });

      return {
        ...mod.toObject(),
        lessons: moduleLessons,
        lessonsCount: moduleLessons.length,
        durationMinutes: moduleLessons.reduce((acc, curr) => acc + (curr.duration || 0), 0),
      };
    });

    const totalLessons = lessons.length;
    const completedLessons = Object.values(progressMap).filter((p) => p.completed).length;
    const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    res.json({
      success: true,
      courseId,
      totalModules: modules.length,
      totalLessons,
      completedLessons,
      progressPercentage,
      curriculum,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createModule = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const userUni = req.user.universityId?._id?.toString() || req.user.universityId?.toString();
    if (req.user.role !== 'SUPER_ADMIN' && course.universityId.toString() !== userUni) {
      return res.status(403).json({ success: false, message: 'Unauthorized course access' });
    }

    const { title, description, order } = req.body;

    const moduleCount = await Module.countDocuments({ courseId });
    const moduleOrder = order !== undefined ? order : moduleCount;

    const newModule = await Module.create({
      courseId,
      universityId: course.universityId,
      title: title.trim(),
      description: description || '',
      order: moduleOrder,
      status: 'ACTIVE',
    });

    res.status(201).json({
      success: true,
      message: 'Module created successfully',
      module: {
        ...newModule.toObject(),
        lessons: [],
        lessonsCount: 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateModule = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    if (!module) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    const userUni = req.user.universityId?._id?.toString() || req.user.universityId?.toString();
    if (req.user.role !== 'SUPER_ADMIN' && module.universityId.toString() !== userUni) {
      return res.status(403).json({ success: false, message: 'Unauthorized module access' });
    }

    const { title, description, order, status } = req.body;
    if (title) module.title = title.trim();
    if (description !== undefined) module.description = description;
    if (order !== undefined) module.order = order;
    if (status) module.status = status;

    await module.save();

    res.json({
      success: true,
      message: 'Module updated successfully',
      module,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteModule = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    if (!module) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    const userUni = req.user.universityId?._id?.toString() || req.user.universityId?.toString();
    if (req.user.role !== 'SUPER_ADMIN' && module.universityId.toString() !== userUni) {
      return res.status(403).json({ success: false, message: 'Unauthorized module access' });
    }

    // Cascade delete lessons and progress
    await Promise.all([
      Lesson.deleteMany({ moduleId: module._id }),
      LessonProgress.deleteMany({ moduleId: module._id }),
      module.deleteOne(),
    ]);

    res.json({
      success: true,
      message: 'Module and related lessons deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createLesson = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const module = await Module.findById(moduleId);

    if (!module) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    const userUni = req.user.universityId?._id?.toString() || req.user.universityId?.toString();
    if (req.user.role !== 'SUPER_ADMIN' && module.universityId.toString() !== userUni) {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    const {
      title,
      description,
      content,
      type,
      resources,
      duration,
      order,
      status,
    } = req.body;

    const lessonCount = await Lesson.countDocuments({ moduleId });
    const lessonOrder = order !== undefined ? order : lessonCount;

    const lesson = await Lesson.create({
      courseId: module.courseId,
      moduleId,
      universityId: module.universityId,
      title: title.trim(),
      description: description || '',
      content: content || '',
      type: type || 'ARTICLE',
      resources: resources || [],
      duration: duration || 15,
      order: lessonOrder,
      status: status || 'PUBLISHED',
      createdBy: req.user._id || req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Lesson created successfully',
      lesson,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id)
      .populate('courseId', 'title code status')
      .populate('moduleId', 'title order');

    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    const userUni = req.user.universityId?._id?.toString() || req.user.universityId?.toString();
    if (req.user.role !== 'SUPER_ADMIN' && lesson.universityId.toString() !== userUni) {
      return res.status(403).json({ success: false, message: 'Unauthorized lesson access' });
    }

    let progress = null;
    if (req.user.role === 'STUDENT') {
      const studentId = req.user._id || req.user.id;
      // Upsert progress document to track lastOpenedAt
      progress = await LessonProgress.findOneAndUpdate(
        { studentId, lessonId: lesson._id },
        {
          $setOnInsert: {
            universityId: lesson.universityId,
            courseId: lesson.courseId._id || lesson.courseId,
            moduleId: lesson.moduleId._id || lesson.moduleId,
            completed: false,
          },
          $set: { lastOpenedAt: new Date() },
        },
        { upsert: true, new: true }
      );
    }

    res.json({
      success: true,
      lesson,
      progress,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    const userUni = req.user.universityId?._id?.toString() || req.user.universityId?.toString();
    if (req.user.role !== 'SUPER_ADMIN' && lesson.universityId.toString() !== userUni) {
      return res.status(403).json({ success: false, message: 'Unauthorized lesson access' });
    }

    const fields = ['title', 'description', 'content', 'type', 'resources', 'duration', 'order', 'status', 'moduleId'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        lesson[field] = req.body[field];
      }
    });

    await lesson.save();

    res.json({
      success: true,
      message: 'Lesson updated successfully',
      lesson,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    const userUni = req.user.universityId?._id?.toString() || req.user.universityId?.toString();
    if (req.user.role !== 'SUPER_ADMIN' && lesson.universityId.toString() !== userUni) {
      return res.status(403).json({ success: false, message: 'Unauthorized lesson access' });
    }

    await Promise.all([
      LessonProgress.deleteMany({ lessonId: lesson._id }),
      lesson.deleteOne(),
    ]);

    res.json({
      success: true,
      message: 'Lesson deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
