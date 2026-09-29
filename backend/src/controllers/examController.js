import { examService } from '../services/exams/examService.js';
import { proctoringService } from '../services/exams/proctoringService.js';

export const createExam = async (req, res, next) => {
  try {
    const exam = await examService.createExam(req.user, req.body);
    res.status(201).json({ success: true, exam });
  } catch (err) {
    next(err);
  }
};

export const getExams = async (req, res, next) => {
  try {
    const exams = await examService.getExams(req.user, req.query);
    res.json({ success: true, exams });
  } catch (err) {
    next(err);
  }
};

export const getExamById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const exam = await examService.getExamById(req.user, id);
    res.json({ success: true, exam });
  } catch (err) {
    next(err);
  }
};

export const updateExam = async (req, res, next) => {
  try {
    const { id } = req.params;
    const exam = await examService.updateExam(req.user, id, req.body);
    res.json({ success: true, exam });
  } catch (err) {
    next(err);
  }
};

export const publishExam = async (req, res, next) => {
  try {
    const { id } = req.params;
    const exam = await examService.publishExam(req.user, id);
    res.json({ success: true, exam });
  } catch (err) {
    next(err);
  }
};

export const closeExam = async (req, res, next) => {
  try {
    const { id } = req.params;
    const exam = await examService.closeExam(req.user, id);
    res.json({ success: true, exam });
  } catch (err) {
    next(err);
  }
};

export const getLiveExamSessions = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sessions = await proctoringService.getLiveExamSessions(req.user, id);
    res.json({ success: true, sessions });
  } catch (err) {
    next(err);
  }
};

// ================= QUESTION BANK =================

export const createQuestion = async (req, res, next) => {
  try {
    const question = await examService.createQuestion(req.user, req.body);
    res.status(201).json({ success: true, question });
  } catch (err) {
    next(err);
  }
};

export const getQuestions = async (req, res, next) => {
  try {
    const questions = await examService.getQuestions(req.user, req.query);
    res.json({ success: true, questions });
  } catch (err) {
    next(err);
  }
};

export const getQuestionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const question = await examService.getQuestionById(req.user, id);
    res.json({ success: true, question });
  } catch (err) {
    next(err);
  }
};

export const updateQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const question = await examService.updateQuestion(req.user, id, req.body);
    res.json({ success: true, question });
  } catch (err) {
    next(err);
  }
};
