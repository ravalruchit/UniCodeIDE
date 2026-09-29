import { ProctoringEvent, PROCTORING_EVENT_TYPES } from '../../models/ProctoringEvent.js';
import { ExamSession } from '../../models/ExamSession.js';

function getUniversityId(user) {
  return (user?.universityId?._id || user?.universityId)?.toString();
}

function getUserId(user) {
  return (user?._id || user?.id)?.toString();
}

// In-memory throttling map to prevent event flooding: `${sessionId}:${type}` -> timestamp
const eventThrottleMap = new Map();

export class ProctoringService {
  /**
   * Records a factual observable proctoring signal
   */
  async recordEvent(user, sessionId, { type, durationMs = 0, metadata = {} }) {
    const universityId = getUniversityId(user);
    const userId = getUserId(user);

    // 1. Validate event type
    if (!PROCTORING_EVENT_TYPES.includes(type)) {
      const err = new Error(`Unsupported proctoring event type: ${type}`);
      err.statusCode = 400;
      throw err;
    }

    // 2. Validate session existence and ownership
    const session = await ExamSession.findById(sessionId);
    if (!session || session.universityId.toString() !== universityId) {
      const err = new Error('Exam session not found');
      err.statusCode = 404;
      throw err;
    }

    if (user.role === 'STUDENT' && session.studentId.toString() !== userId) {
      const err = new Error('Unauthorized event logging');
      err.statusCode = 403;
      throw err;
    }

    // 3. Debounce / Throttle rapid duplicate events (within 1000ms)
    const throttleKey = `${sessionId}:${type}`;
    const now = Date.now();
    const lastTimestamp = eventThrottleMap.get(throttleKey) || 0;

    if (now - lastTimestamp < 1000) {
      return { success: true, throttled: true };
    }
    eventThrottleMap.set(throttleKey, now);

    // Clean up old throttle keys periodically
    if (eventThrottleMap.size > 2000) {
      for (const [k, ts] of eventThrottleMap.entries()) {
        if (now - ts > 60000) eventThrottleMap.delete(k);
      }
    }

    // Determine neutral severity
    let severity = 'INFO';
    if (['TAB_HIDDEN', 'FULLSCREEN_EXIT', 'NETWORK_DISCONNECTED'].includes(type)) {
      severity = 'NOTICE';
    } else if (['TERMINATED_BY_TEACHER'].includes(type)) {
      severity = 'ATTENTION';
    }

    // 4. Increment session counters
    if (session.proctoringStats) {
      if (type === 'TAB_HIDDEN') session.proctoringStats.tabHiddenCount += 1;
      if (type === 'FULLSCREEN_EXIT') session.proctoringStats.fullscreenExitCount += 1;
      if (type === 'WINDOW_BLUR') session.proctoringStats.blurCount += 1;
      if (type === 'NETWORK_DISCONNECTED') session.proctoringStats.disconnectCount += 1;
      if (type === 'COPY_ATTEMPT' || type === 'PASTE_ATTEMPT') session.proctoringStats.copyPasteCount += 1;
      await session.save();
    }

    // 5. Create event record
    const event = await ProctoringEvent.create({
      universityId,
      examId: session.examId,
      sessionId: session._id,
      studentId: userId,
      type,
      severity,
      durationMs: typeof durationMs === 'number' ? durationMs : 0,
      metadata: metadata || {},
    });

    return {
      success: true,
      event: {
        id: event._id,
        type: event.type,
        severity: event.severity,
        timestamp: event.timestamp,
        durationMs: event.durationMs,
      },
    };
  }

  /**
   * Retrieves chronological proctoring timeline for an exam session
   */
  async getEvents(user, sessionId) {
    const universityId = getUniversityId(user);
    const userId = getUserId(user);

    const session = await ExamSession.findById(sessionId);
    if (!session || session.universityId.toString() !== universityId) {
      const err = new Error('Exam session not found');
      err.statusCode = 404;
      throw err;
    }

    // Students can only view their own proctoring events after review release
    if (user.role === 'STUDENT' && session.studentId.toString() !== userId) {
      const err = new Error('Unauthorized proctoring access');
      err.statusCode = 403;
      throw err;
    }

    const events = await ProctoringEvent.find({ sessionId })
      .sort({ timestamp: 1 })
      .lean();

    return {
      sessionId,
      stats: session.proctoringStats,
      events: events.map((e) => ({
        id: e._id,
        type: e.type,
        severity: e.severity,
        timestamp: e.timestamp,
        durationMs: e.durationMs,
        metadata: e.metadata,
      })),
    };
  }

  /**
   * Live exam monitoring telemetry for instructors
   */
  async getLiveExamSessions(user, examId) {
    const universityId = getUniversityId(user);

    const sessions = await ExamSession.find({ examId, universityId })
      .populate('studentId', 'name email avatar')
      .sort({ updatedAt: -1 })
      .lean();

    const now = Date.now();

    return sessions.map((s) => {
      const remainingSeconds = s.deadlineAt
        ? Math.max(0, Math.floor((new Date(s.deadlineAt).getTime() - now) / 1000))
        : 0;

      const answeredCount = (s.questions || []).filter((q) => q.status === 'ANSWERED').length;

      return {
        id: s._id,
        student: s.studentId,
        attemptNumber: s.attemptNumber,
        status: s.status,
        startedAt: s.startedAt,
        deadlineAt: s.deadlineAt,
        remainingSeconds,
        connectionStatus: s.connectionStatus,
        lastHeartbeatAt: s.lastHeartbeatAt,
        answeredCount,
        totalQuestions: s.questions?.length || 0,
        score: s.score,
        maxScore: s.maxScore,
        proctoringStats: s.proctoringStats,
      };
    });
  }
}

export const proctoringService = new ProctoringService();
