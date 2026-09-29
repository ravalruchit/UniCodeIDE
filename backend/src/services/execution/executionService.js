import { Workspace } from '../../models/Workspace.js';
import { Assignment } from '../../models/Assignment.js';
import { ExecutionJob } from '../../models/ExecutionJob.js';
import { ExecutionResult } from '../../models/ExecutionResult.js';
import { checkDockerHealth } from './dockerService.js';
import { executionQueue } from './executionQueue.js';
import {
  checkRateLimit,
  EXECUTION_DEFAULTS,
  maskHiddenTests,
} from './executionSecurity.js';
import { isLanguageSupported, detectLanguageFromPath } from './languageRuntimes.js';

function getUniversityId(user) {
  return (user?.universityId?._id || user?.universityId)?.toString();
}

function getUserId(user) {
  return (user?._id || user?.id)?.toString();
}

export class ExecutionService {
  /**
   * Request execution of workspace code snapshot
   */
  async requestExecution(user, { workspaceId, revision, mode = 'RUN', stdinInput = '', activeFilePath = '', language: targetLanguage = '' }) {
    const userId = getUserId(user);
    const userUnivId = getUniversityId(user);

    // 1. Rate limiting
    if (!checkRateLimit(userId)) {
      const err = new Error('Execution rate limit exceeded. Please wait a moment before running again.');
      err.code = 'RATE_LIMIT_EXCEEDED';
      err.statusCode = 429;
      throw err;
    }

    // 2. Validate workspace existence & ownership
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      const err = new Error('Workspace not found');
      err.statusCode = 404;
      throw err;
    }

    // Tenant isolation
    if (workspace.universityId.toString() !== userUnivId) {
      const err = new Error('Unauthorized workspace access across institutions');
      err.statusCode = 403;
      throw err;
    }

    // Ownership check (Students can only run their own; Teachers can inspect enrolled course workspaces)
    if (user.role === 'STUDENT' && workspace.ownerId.toString() !== userId) {
      const err = new Error('You can only execute your own workspace');
      err.statusCode = 403;
      throw err;
    }

    // Language support check: targetLanguage > activeFilePath extension > workspace.language > 'PYTHON'
    let language = (targetLanguage || '').toUpperCase();
    if (!language && activeFilePath) {
      const detected = detectLanguageFromPath(activeFilePath);
      if (detected) language = detected;
    }
    if (!language) {
      language = (workspace.language || 'PYTHON').toUpperCase();
    }

    if (!isLanguageSupported(language)) {
      const err = new Error(`Unsupported programming language for execution: ${language}`);
      err.statusCode = 400;
      throw err;
    }

    // Determine target entryFile
    let entryFile = null;
    if (activeFilePath && (workspace.files || []).some((f) => f.path === activeFilePath)) {
      const detected = detectLanguageFromPath(activeFilePath);
      if (detected === language) {
        entryFile = activeFilePath;
      }
    }

    // 3. Docker health check
    const health = await checkDockerHealth();
    if (!health.isAvailable) {
      const err = new Error('Code execution temporarily unavailable. Your workspace is safe and saved.');
      err.code = 'EXECUTION_ENGINE_UNAVAILABLE';
      err.statusCode = 503;
      throw err;
    }

    // 4. Freeze workspace files snapshot
    const sourceRevision = revision || workspace.revision;
    const snapshotFiles = (workspace.files || []).map((f) => ({
      path: f.path,
      name: f.name,
      content: f.content,
      isEntry: Boolean(f.isEntry),
      language: f.language,
      size: f.size,
    }));

    // 5. Test mode validation and test case retrieval
    let testCases = [];
    if (mode === 'TEST') {
      if (!workspace.assignmentId) {
        const err = new Error('Cannot run automated tests on a practice workspace without an assignment');
        err.statusCode = 400;
        throw err;
      }

      const assignment = await Assignment.findById(workspace.assignmentId);
      if (!assignment) {
        const err = new Error('Referenced assignment not found');
        err.statusCode = 404;
        throw err;
      }

      testCases = assignment.testCases || [];
      if (testCases.length === 0) {
        const err = new Error('This assignment has no configured test cases');
        err.statusCode = 400;
        throw err;
      }
    }

    // 6. Create ExecutionJob document
    const job = await ExecutionJob.create({
      universityId: workspace.universityId,
      userId: user._id,
      workspaceId: workspace._id,
      assignmentId: workspace.assignmentId || null,
      sourceRevision,
      programmingLanguage: language,
      mode,
      status: 'QUEUED',
      timeoutMs: EXECUTION_DEFAULTS.TIMEOUT_MS,
      memoryLimitMb: EXECUTION_DEFAULTS.MEMORY_MB,
      cpuLimit: EXECUTION_DEFAULTS.CPU_LIMIT,
    });

    // 7. Enqueue task for background worker
    await executionQueue.enqueue(job, {
      files: snapshotFiles,
      testCases,
      stdinInput,
      entryFile,
    });

    return {
      success: true,
      execution: {
        id: job._id,
        status: job.status,
        mode: job.mode,
        sourceRevision: job.sourceRevision,
        programmingLanguage: job.programmingLanguage,
        requestedAt: job.requestedAt,
      },
    };
  }

  /**
   * Get status & results of an execution
   */
  async getExecutionStatus(user, executionId) {
    const userId = getUserId(user);
    const userUnivId = getUniversityId(user);

    const job = await ExecutionJob.findById(executionId);
    if (!job) {
      const err = new Error('Execution job not found');
      err.statusCode = 404;
      throw err;
    }

    // Tenant check
    if (job.universityId.toString() !== userUnivId) {
      const err = new Error('Cross-tenant execution access denied');
      err.statusCode = 403;
      throw err;
    }

    // Authorization check
    if (user.role === 'STUDENT' && job.userId.toString() !== userId) {
      const err = new Error('Unauthorized access to another student execution');
      err.statusCode = 403;
      throw err;
    }

    let result = null;
    if (job.resultId) {
      const rawResult = await ExecutionResult.findById(job.resultId).lean();
      if (rawResult) {
        // If student, mask hidden test cases
        if (user.role === 'STUDENT' && rawResult.tests?.length > 0) {
          rawResult.tests = maskHiddenTests(rawResult.tests);
        }
        result = rawResult;
      }
    }

    return {
      execution: {
        id: job._id,
        workspaceId: job.workspaceId,
        assignmentId: job.assignmentId,
        status: job.status,
        mode: job.mode,
        sourceRevision: job.sourceRevision,
        programmingLanguage: job.programmingLanguage,
        requestedAt: job.requestedAt,
        startedAt: job.startedAt,
        completedAt: job.completedAt,
        errorMessage: job.errorMessage,
      },
      result,
    };
  }

  /**
   * Cancel an ongoing or queued execution
   */
  async cancelExecution(user, executionId) {
    const userId = getUserId(user);
    const userUnivId = getUniversityId(user);

    const job = await ExecutionJob.findById(executionId);
    if (!job) {
      const err = new Error('Execution job not found');
      err.statusCode = 404;
      throw err;
    }

    if (job.universityId.toString() !== userUnivId) {
      const err = new Error('Cross-tenant execution access denied');
      err.statusCode = 403;
      throw err;
    }

    if (user.role === 'STUDENT' && job.userId.toString() !== userId) {
      const err = new Error('Unauthorized execution cancellation');
      err.statusCode = 403;
      throw err;
    }

    const cancelOutcome = await executionQueue.cancel(executionId);
    return {
      success: true,
      message: 'Execution cancellation processed',
      outcome: cancelOutcome,
    };
  }

  /**
   * Retrieve bounded recent executions for a workspace
   */
  async getWorkspaceExecutions(user, workspaceId, limit = 10) {
    const userId = getUserId(user);
    const userUnivId = getUniversityId(user);

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      const err = new Error('Workspace not found');
      err.statusCode = 404;
      throw err;
    }

    if (workspace.universityId.toString() !== userUnivId) {
      const err = new Error('Cross-tenant execution history access denied');
      err.statusCode = 403;
      throw err;
    }

    if (user.role === 'STUDENT' && workspace.ownerId.toString() !== userId) {
      const err = new Error('Unauthorized execution history access');
      err.statusCode = 403;
      throw err;
    }

    const executions = await ExecutionJob.find({ workspaceId })
      .sort({ createdAt: -1 })
      .limit(Math.min(limit, 25))
      .populate('resultId', 'status durationMs exitCode summary')
      .lean();

    return {
      workspaceId,
      executions: executions.map((e) => ({
        id: e._id,
        status: e.status,
        mode: e.mode,
        sourceRevision: e.sourceRevision,
        programmingLanguage: e.programmingLanguage,
        requestedAt: e.requestedAt,
        completedAt: e.completedAt,
        result: e.resultId,
      })),
    };
  }
}

export const executionService = new ExecutionService();
