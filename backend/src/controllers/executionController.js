import { executionService } from '../services/execution/executionService.js';
import { checkDockerHealth } from '../services/execution/dockerService.js';
import { executionQueue } from '../services/execution/executionQueue.js';
import { getLanguageCatalog } from '../services/execution/languageRuntimes.js';

export const createExecution = async (req, res, next) => {
  try {
    const { workspaceId, revision, mode, stdinInput, activeFilePath, language } = req.body;

    if (!workspaceId) {
      return res.status(400).json({
        success: false,
        message: 'workspaceId is required for code execution',
      });
    }

    const result = await executionService.requestExecution(req.user, {
      workspaceId,
      revision,
      mode: mode || 'RUN',
      stdinInput: stdinInput || '',
      activeFilePath: activeFilePath || '',
      language: language || '',
    });

    res.status(202).json(result);
  } catch (err) {
    next(err);
  }
};

export const getExecution = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await executionService.getExecutionStatus(req.user, id);
    res.json({
      success: true,
      ...data,
    });
  } catch (err) {
    next(err);
  }
};

export const cancelExecution = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await executionService.cancelExecution(req.user, id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getWorkspaceExecutions = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const limit = parseInt(req.query.limit, 10) || 10;
    const data = await executionService.getWorkspaceExecutions(req.user, workspaceId, limit);
    res.json({
      success: true,
      ...data,
    });
  } catch (err) {
    next(err);
  }
};

export const getExecutionEngineHealth = async (req, res, next) => {
  try {
    const health = await checkDockerHealth(true);
    const metrics = executionQueue.getMetrics();

    res.json({
      success: true,
      status: health.isAvailable ? 'EXECUTION_ENGINE_AVAILABLE' : 'EXECUTION_ENGINE_UNAVAILABLE',
      docker: {
        available: health.isAvailable,
        version: health.version,
        error: health.error,
      },
      queue: metrics,
    });
  } catch (err) {
    next(err);
  }
};

export const getLanguageCatalogController = async (req, res, next) => {
  try {
    const catalog = getLanguageCatalog();
    res.json({
      success: true,
      languages: catalog,
    });
  } catch (err) {
    next(err);
  }
};
