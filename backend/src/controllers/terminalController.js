import { terminalService } from '../services/terminal/terminalService.js';

export const createTerminalSession = async (req, res, next) => {
  try {
    const { workspaceId } = req.body;
    if (!workspaceId) {
      return res.status(400).json({
        success: false,
        message: 'workspaceId is required to start a sandbox terminal',
      });
    }

    const session = await terminalService.createSession(req.user, { workspaceId });
    res.status(201).json(session);
  } catch (err) {
    next(err);
  }
};

export const closeTerminalSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const result = await terminalService.closeSession(req.user, sessionId);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
