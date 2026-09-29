import { examSessionService } from '../services/exams/examSessionService.js';
import { proctoringService } from '../services/exams/proctoringService.js';

export const startExamSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sessionData = await examSessionService.startExam(req.user, id);
    res.status(201).json({ success: true, ...sessionData });
  } catch (err) {
    next(err);
  }
};

export const getExamSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await examSessionService.getSession(req.user, id);
    res.json({ success: true, ...data });
  } catch (err) {
    next(err);
  }
};

export const recordHeartbeat = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await examSessionService.recordHeartbeat(req.user, id);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const submitExamSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await examSessionService.submitExam(req.user, id, req.body.submissionType || 'MANUAL');
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const executeQuestionCode = async (req, res, next) => {
  try {
    const { id, questionId } = req.params;
    const result = await examSessionService.executeQuestion(req.user, id, questionId, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const overrideSessionScore = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await examSessionService.overrideScore(req.user, id, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const recordProctoringEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await proctoringService.recordEvent(req.user, id, req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const getProctoringEvents = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await proctoringService.getEvents(req.user, id);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};
