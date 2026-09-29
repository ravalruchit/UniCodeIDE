import crypto from 'crypto';
import { TerminalSession } from '../../models/TerminalSession.js';
import { Workspace } from '../../models/Workspace.js';
import { Exam } from '../../models/Exam.js';
import { checkDockerHealth, killAndRemoveContainer } from '../execution/dockerService.js';

export const TERMINAL_DEFAULTS = {
  IDLE_TIMEOUT_MS: parseInt(process.env.TERMINAL_IDLE_TIMEOUT_MS, 10) || 5 * 60 * 1000, // 5 minutes
  MAX_LIFETIME_MS: parseInt(process.env.TERMINAL_MAX_LIFETIME_MS, 10) || 15 * 60 * 1000, // 15 minutes
};

function getUniversityId(user) {
  return (user?.universityId?._id || user?.universityId)?.toString();
}

function getUserId(user) {
  return (user?._id || user?.id)?.toString();
}

export class TerminalService {
  /**
   * Initializes a new containerized terminal session
   */
  async createSession(user, { workspaceId }) {
    const userId = getUserId(user);
    const userUnivId = getUniversityId(user);

    // 1. Validate workspace existence & permissions
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      const err = new Error('Workspace not found');
      err.statusCode = 404;
      throw err;
    }

    if (workspace.universityId.toString() !== userUnivId) {
      const err = new Error('Cross-tenant terminal access denied');
      err.statusCode = 403;
      throw err;
    }

    if (user.role === 'STUDENT' && workspace.ownerId.toString() !== userId) {
      const err = new Error('You cannot open a terminal in another student workspace');
      err.statusCode = 403;
      throw err;
    }

    // Check exam terminal policy if exam workspace
    if (workspace.type === 'EXAM' && workspace.examId) {
      const exam = await Exam.findById(workspace.examId);
      if (exam && !exam.allowTerminal) {
        const err = new Error('Terminal access is disabled for this examination');
        err.statusCode = 403;
        throw err;
      }
    }

    // 2. Docker availability check
    const health = await checkDockerHealth();
    if (!health.isAvailable) {
      const err = new Error('Terminal code execution temporarily unavailable. Docker engine is not accessible.');
      err.code = 'EXECUTION_ENGINE_UNAVAILABLE';
      err.statusCode = 503;
      throw err;
    }

    // 3. Clean up any existing active sessions for this user/workspace
    await this.cleanupUserSessions(userId, workspaceId);

    // 4. Generate session token and container identity
    const sessionId = `term_${crypto.randomBytes(16).toString('hex')}`;
    const containerId = `unicodeide-term-${sessionId}`;
    const expiresAt = new Date(Date.now() + TERMINAL_DEFAULTS.MAX_LIFETIME_MS);

    const session = await TerminalSession.create({
      sessionId,
      universityId: workspace.universityId,
      userId: user._id,
      workspaceId: workspace._id,
      containerId,
      status: 'ACTIVE',
      expiresAt,
    });

    return {
      success: true,
      sessionId: session.sessionId,
      containerId: session.containerId,
      expiresAt: session.expiresAt,
      message: 'Sandbox terminal initialized in ephemeral container.',
    };
  }

  /**
   * Closes and cleans up a terminal session
   */
  async closeSession(user, sessionId) {
    const userId = getUserId(user);
    const session = await TerminalSession.findOne({ sessionId });
    if (!session) {
      return { success: true, message: 'Session already closed or non-existent' };
    }

    if (user.role === 'STUDENT' && session.userId.toString() !== userId) {
      const err = new Error('Unauthorized session termination');
      err.statusCode = 403;
      throw err;
    }

    if (session.containerId) {
      await killAndRemoveContainer(session.containerId);
    }

    session.status = 'TERMINATED';
    await session.save();

    return { success: true, message: 'Terminal container terminated and cleaned up.' };
  }

  /**
   * Helper to clean up active sessions for a user
   */
  async cleanupUserSessions(userId, workspaceId) {
    const activeSessions = await TerminalSession.find({
      userId,
      workspaceId,
      status: 'ACTIVE',
    });

    for (const s of activeSessions) {
      if (s.containerId) {
        await killAndRemoveContainer(s.containerId);
      }
      s.status = 'TERMINATED';
      await s.save();
    }
  }
}

export const terminalService = new TerminalService();
