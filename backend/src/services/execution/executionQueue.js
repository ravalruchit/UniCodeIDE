import { EventEmitter } from 'events';
import { EXECUTION_DEFAULTS } from './executionSecurity.js';
import { ExecutionJob } from '../../models/ExecutionJob.js';
import { ExecutionResult } from '../../models/ExecutionResult.js';
import { runDockerSandbox, killAndRemoveContainer } from './dockerService.js';
import { runAssignmentTests } from './testRunner.js';

class ExecutionQueueManager extends EventEmitter {
  constructor() {
    super();
    this.queue = []; // Array of job tasks waiting to run
    this.runningJobs = new Map(); // jobId -> { job, task, abortController }
    this.maxConcurrent = EXECUTION_DEFAULTS.MAX_CONCURRENT_EXECUTIONS;
    this.maxQueueSize = EXECUTION_DEFAULTS.MAX_QUEUE_SIZE;
  }

  /**
   * Enqueue an execution task
   * @param {Object} jobDoc - ExecutionJob mongoose document
   * @param {Object} taskData - { files, testCases, ... }
   */
  async enqueue(jobDoc, taskData) {
    if (this.queue.length >= this.maxQueueSize) {
      const err = new Error('Execution queue is full. Please try again in a few moments.');
      err.code = 'QUEUE_FULL';
      err.statusCode = 429;
      throw err;
    }

    const task = {
      jobId: jobDoc._id.toString(),
      jobDoc,
      taskData,
      cancelled: false,
    };

    this.queue.push(task);
    this.processNext();
    return task;
  }

  /**
   * Cancel a job in queue or currently running
   */
  async cancel(jobId) {
    const queueIdx = this.queue.findIndex((t) => t.jobId === jobId);
    if (queueIdx !== -1) {
      const [task] = this.queue.splice(queueIdx, 1);
      task.cancelled = true;

      await ExecutionJob.findByIdAndUpdate(jobId, {
        status: 'CANCELLED',
        completedAt: new Date(),
        errorMessage: 'Execution was cancelled by the user while queued.',
      });

      return { cancelled: true, state: 'QUEUED' };
    }

    const running = this.runningJobs.get(jobId);
    if (running) {
      running.cancelled = true;
      if (running.containerId) {
        await killAndRemoveContainer(running.containerId);
      }

      await ExecutionJob.findByIdAndUpdate(jobId, {
        status: 'CANCELLED',
        completedAt: new Date(),
        errorMessage: 'Execution was cancelled by the user during run.',
      });

      this.runningJobs.delete(jobId);
      this.processNext();
      return { cancelled: true, state: 'RUNNING' };
    }

    return { cancelled: false, state: 'UNKNOWN' };
  }

  /**
   * Checks if worker slots are available and triggers processing
   */
  async processNext() {
    if (this.runningJobs.size >= this.maxConcurrent) {
      return;
    }

    if (this.queue.length === 0) {
      return;
    }

    const task = this.queue.shift();
    if (task.cancelled) {
      return this.processNext();
    }

    const { jobId, jobDoc, taskData } = task;
    this.runningJobs.set(jobId, task);

    try {
      await ExecutionJob.findByIdAndUpdate(jobId, {
        status: 'RUNNING',
        startedAt: new Date(),
      });

      let execOutcome;

      if (jobDoc.mode === 'TEST' && taskData.testCases && taskData.testCases.length > 0) {
        // Run automated tests against assignment testCases
        const testRun = await runAssignmentTests({
          jobId,
          language: jobDoc.programmingLanguage,
          files: taskData.files,
          testCases: taskData.testCases,
          timeoutMs: jobDoc.timeoutMs,
          memoryMb: jobDoc.memoryLimitMb,
        });

        const overallStatus =
          testRun.summary.failed === 0 ? 'PASSED' : testRun.summary.passed > 0 ? 'FAILED' : 'FAILED';

        execOutcome = {
          status: overallStatus,
          exitCode: 0,
          stdout: `Executed ${testRun.summary.total} test cases (${testRun.summary.passed} passed, ${testRun.summary.failed} failed)`,
          stderr: '',
          compileOutput: '',
          durationMs: testRun.tests.reduce((acc, t) => acc + (t.executionTimeMs || 0), 0),
          tests: testRun.tests,
          summary: testRun.summary,
        };
      } else {
        // Run single workspace entry execution
        const runRes = await runDockerSandbox({
          jobId,
          language: jobDoc.programmingLanguage,
          files: taskData.files,
          stdinInput: taskData.stdinInput || '',
          entryFile: taskData.entryFile,
          timeoutMs: jobDoc.timeoutMs,
          memoryMb: jobDoc.memoryLimitMb,
          cpuLimit: jobDoc.cpuLimit,
        });

        execOutcome = {
          status: runRes.status,
          exitCode: runRes.exitCode,
          signal: runRes.signal,
          stdout: runRes.stdout,
          stderr: runRes.stderr,
          compileOutput: runRes.compileOutput || '',
          durationMs: runRes.durationMs,
          timedOut: runRes.timedOut,
          outputLimitExceeded: runRes.outputLimitExceeded,
          tests: [],
          summary: {
            total: 1,
            passed: runRes.status === 'PASSED' ? 1 : 0,
            failed: runRes.status !== 'PASSED' ? 1 : 0,
            score: runRes.status === 'PASSED' ? 100 : 0,
          },
        };
      }

      // If job was cancelled while executing, abort persistence
      if (task.cancelled) {
        return;
      }

      // Create persistent ExecutionResult
      const resultDoc = await ExecutionResult.create({
        executionJobId: jobDoc._id,
        universityId: jobDoc.universityId,
        userId: jobDoc.userId,
        workspaceId: jobDoc.workspaceId,
        assignmentId: jobDoc.assignmentId,
        submissionId: jobDoc.submissionId,
        status: execOutcome.status,
        exitCode: execOutcome.exitCode,
        signal: execOutcome.signal,
        stdout: execOutcome.stdout,
        stderr: execOutcome.stderr,
        compileOutput: execOutcome.compileOutput,
        durationMs: execOutcome.durationMs,
        timedOut: execOutcome.timedOut || false,
        outputLimitExceeded: execOutcome.outputLimitExceeded || false,
        tests: execOutcome.tests || [],
        summary: execOutcome.summary,
      });

      // Update ExecutionJob to COMPLETED / TIMEOUT / FAILED
      const jobStatus =
        execOutcome.status === 'TIMEOUT'
          ? 'TIMEOUT'
          : execOutcome.status === 'SYSTEM_ERROR'
          ? 'SYSTEM_ERROR'
          : execOutcome.status === 'PASSED' || execOutcome.status === 'FAILED' || execOutcome.status === 'RUNTIME_ERROR' || execOutcome.status === 'COMPILE_ERROR'
          ? 'COMPLETED'
          : 'FAILED';

      await ExecutionJob.findByIdAndUpdate(jobDoc._id, {
        status: jobStatus,
        completedAt: new Date(),
        resultId: resultDoc._id,
      });
    } catch (err) {
      if (!task.cancelled) {
        await ExecutionJob.findByIdAndUpdate(jobId, {
          status: 'SYSTEM_ERROR',
          completedAt: new Date(),
          errorMessage: err.message,
        });
      }
    } finally {
      this.runningJobs.delete(jobId);
      this.processNext();
    }
  }

  /**
   * Returns current queue and runner metrics
   */
  getMetrics() {
    return {
      queued: this.queue.length,
      running: this.runningJobs.size,
      maxConcurrent: this.maxConcurrent,
    };
  }
}

export const executionQueue = new ExecutionQueueManager();
