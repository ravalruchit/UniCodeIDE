import labService from '../services/lab/labService.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const createLab = async (req, res) => {
  try {
    const universityId = req.user.universityId?._id || req.user.universityId;
    const lab = await labService.createLab(universityId, req.body, req.user._id);
    return sendSuccess(res, lab, 'Lab created successfully', 201);
  } catch (err) {
    return sendError(res, err.message, 400);
  }
};

export const getLabs = async (req, res) => {
  try {
    const universityId = req.user.universityId?._id || req.user.universityId;
    const labs = await labService.getLabs(universityId, req.query);
    return sendSuccess(res, labs, 'Labs retrieved successfully');
  } catch (err) {
    return sendError(res, err.message, 400);
  }
};

export const getLabById = async (req, res) => {
  try {
    const universityId = req.user.universityId?._id || req.user.universityId;
    const lab = await labService.getLabById(universityId, req.params.id);
    return sendSuccess(res, lab, 'Lab details retrieved');
  } catch (err) {
    return sendError(res, err.message, 404);
  }
};

export const updateLab = async (req, res) => {
  try {
    const universityId = req.user.universityId?._id || req.user.universityId;
    const lab = await labService.updateLab(universityId, req.params.id, req.body);
    return sendSuccess(res, lab, 'Lab updated successfully');
  } catch (err) {
    return sendError(res, err.message, 400);
  }
};

export const deleteLab = async (req, res) => {
  try {
    const universityId = req.user.universityId?._id || req.user.universityId;
    const result = await labService.deleteLab(universityId, req.params.id);
    return sendSuccess(res, result, 'Lab deleted successfully');
  } catch (err) {
    return sendError(res, err.message, 400);
  }
};
