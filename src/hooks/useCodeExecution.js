import { useState, useEffect, useRef, useCallback } from 'react';
import { executionService } from '../services/executionService';

export const EXECUTION_UI_STATES = {
  IDLE: 'IDLE',
  QUEUED: 'QUEUED',
  STARTING: 'STARTING',
  RUNNING: 'RUNNING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  TIMEOUT: 'TIMEOUT',
  CANCELLED: 'CANCELLED',
  UNAVAILABLE: 'UNAVAILABLE',
};

export function useCodeExecution(workspaceId) {
  const [executionState, setExecutionState] = useState(EXECUTION_UI_STATES.IDLE);
  const [activeJob, setActiveJob] = useState(null);
  const [executionResult, setExecutionResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [engineHealth, setEngineHealth] = useState(null);
  const [recentRuns, setRecentRuns] = useState([]);

  const pollIntervalRef = useRef(null);
  const activeJobIdRef = useRef(null);

  // Stop polling interval safely
  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  // Check Docker Engine health on load
  const checkHealth = useCallback(async () => {
    try {
      const res = await executionService.getHealth();
      setEngineHealth(res);
      return res;
    } catch {
      setEngineHealth({
        status: 'EXECUTION_ENGINE_UNAVAILABLE',
        docker: { available: false },
      });
      return null;
    }
  }, []);

  // Fetch recent executions history
  const fetchRecentRuns = useCallback(async () => {
    if (!workspaceId) return;
    try {
      const res = await executionService.getWorkspaceExecutions(workspaceId, 10);
      if (res?.executions) {
        setRecentRuns(res.executions);
      }
    } catch {
      // ignore history fetch error
    }
  }, [workspaceId]);

  useEffect(() => {
    checkHealth();
    fetchRecentRuns();
    return () => stopPolling();
  }, [checkHealth, fetchRecentRuns, stopPolling]);

  // Polling loop for active job
  const startPolling = useCallback(
    (jobId) => {
      stopPolling();
      activeJobIdRef.current = jobId;

      pollIntervalRef.current = setInterval(async () => {
        try {
          const res = await executionService.getExecutionStatus(jobId);
          if (!res?.execution) return;

          const job = res.execution;
          setActiveJob(job);

          if (job.status === 'QUEUED') {
            setExecutionState(EXECUTION_UI_STATES.QUEUED);
          } else if (job.status === 'STARTING') {
            setExecutionState(EXECUTION_UI_STATES.STARTING);
          } else if (job.status === 'RUNNING') {
            setExecutionState(EXECUTION_UI_STATES.RUNNING);
          } else if (job.status === 'COMPLETED') {
            setExecutionState(EXECUTION_UI_STATES.COMPLETED);
            setExecutionResult(res.result);
            stopPolling();
            fetchRecentRuns();
          } else if (job.status === 'TIMEOUT') {
            setExecutionState(EXECUTION_UI_STATES.TIMEOUT);
            setExecutionResult(res.result);
            stopPolling();
            fetchRecentRuns();
          } else if (job.status === 'FAILED') {
            setExecutionState(EXECUTION_UI_STATES.FAILED);
            setExecutionResult(res.result);
            stopPolling();
            fetchRecentRuns();
          } else if (job.status === 'CANCELLED') {
            setExecutionState(EXECUTION_UI_STATES.CANCELLED);
            stopPolling();
            fetchRecentRuns();
          } else if (job.status === 'SYSTEM_ERROR') {
            setExecutionState(EXECUTION_UI_STATES.FAILED);
            setErrorMessage(job.errorMessage || 'Execution engine system error');
            stopPolling();
            fetchRecentRuns();
          }
        } catch (err) {
          stopPolling();
          setExecutionState(EXECUTION_UI_STATES.FAILED);
          setErrorMessage(err.message || 'Failed to poll execution status');
        }
      }, 700);
    },
    [stopPolling, fetchRecentRuns]
  );

  // Run Code entry point
  const runCode = useCallback(
    async (wsId, revision, stdinInput = '', activeFilePath = '', language = '') => {
      const targetWorkspaceId = wsId || workspaceId;
      if (!targetWorkspaceId) return;

      setErrorMessage(null);
      setExecutionState(EXECUTION_UI_STATES.QUEUED);

      try {
        const res = await executionService.requestExecution({
          workspaceId: targetWorkspaceId,
          revision,
          mode: 'RUN',
          stdinInput,
          activeFilePath,
          language,
        });

        if (res?.execution?.id) {
          setActiveJob(res.execution);
          startPolling(res.execution.id);
        }
      } catch (err) {
        stopPolling();
        if (err.status === 503 || err.details?.code === 'EXECUTION_ENGINE_UNAVAILABLE') {
          setExecutionState(EXECUTION_UI_STATES.UNAVAILABLE);
          setErrorMessage(
            err.message || 'Code execution temporarily unavailable. Your workspace is safe and saved.'
          );
        } else {
          setExecutionState(EXECUTION_UI_STATES.FAILED);
          setErrorMessage(err.message || 'Failed to launch code execution');
        }
      }
    },
    [workspaceId, startPolling, stopPolling]
  );

  // Run Automated Tests entry point
  const runTests = useCallback(
    async (wsId, revision) => {
      const targetWorkspaceId = wsId || workspaceId;
      if (!targetWorkspaceId) return;

      setErrorMessage(null);
      setExecutionState(EXECUTION_UI_STATES.QUEUED);

      try {
        const res = await executionService.requestExecution({
          workspaceId: targetWorkspaceId,
          revision,
          mode: 'TEST',
        });

        if (res?.execution?.id) {
          setActiveJob(res.execution);
          startPolling(res.execution.id);
        }
      } catch (err) {
        stopPolling();
        if (err.status === 503 || err.details?.code === 'EXECUTION_ENGINE_UNAVAILABLE') {
          setExecutionState(EXECUTION_UI_STATES.UNAVAILABLE);
          setErrorMessage(
            err.message || 'Code execution temporarily unavailable. Your workspace is safe and saved.'
          );
        } else {
          setExecutionState(EXECUTION_UI_STATES.FAILED);
          setErrorMessage(err.message || 'Failed to launch test suite execution');
        }
      }
    },
    [workspaceId, startPolling, stopPolling]
  );

  // Cancel execution
  const cancelCode = useCallback(async () => {
    const currentId = activeJobIdRef.current || activeJob?.id;
    if (!currentId) return;

    try {
      await executionService.cancelExecution(currentId);
      stopPolling();
      setExecutionState(EXECUTION_UI_STATES.CANCELLED);
      fetchRecentRuns();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to cancel execution');
    }
  }, [activeJob, stopPolling, fetchRecentRuns]);

  const clearOutput = useCallback(() => {
    setExecutionResult(null);
    setErrorMessage(null);
    setExecutionState(EXECUTION_UI_STATES.IDLE);
  }, []);

  const isRunning =
    executionState === EXECUTION_UI_STATES.QUEUED ||
    executionState === EXECUTION_UI_STATES.STARTING ||
    executionState === EXECUTION_UI_STATES.RUNNING;

  return {
    executionState,
    isRunning,
    activeJob,
    executionResult,
    errorMessage,
    engineHealth,
    recentRuns,
    runCode,
    runTests,
    cancelCode,
    clearOutput,
    fetchRecentRuns,
    checkHealth,
  };
}
