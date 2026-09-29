import { apiClient } from './api';

export const executionService = {
  /**
   * Check execution engine health and Docker availability
   */
  getHealth: async () => {
    return apiClient.get('/executions/health');
  },

  /**
   * Request execution (RUN or TEST)
   */
  requestExecution: async ({ workspaceId, revision, mode = 'RUN', stdinInput = '', activeFilePath = '', language = '' }) => {
    return apiClient.post('/executions', {
      workspaceId,
      revision,
      mode,
      stdinInput,
      activeFilePath,
      language,
    });
  },

  /**
   * Poll execution status and results
   */
  getExecutionStatus: async (executionId) => {
    return apiClient.get(`/executions/${executionId}`);
  },

  /**
   * Cancel an execution job
   */
  cancelExecution: async (executionId) => {
    return apiClient.post(`/executions/${executionId}/cancel`);
  },

  /**
   * Get recent executions for a workspace
   */
  getWorkspaceExecutions: async (workspaceId, limit = 10) => {
    return apiClient.get(`/executions/workspaces/${workspaceId}?limit=${limit}`);
  },

  /**
   * Start a sandbox terminal session
   */
  createTerminalSession: async (workspaceId) => {
    return apiClient.post('/terminal/sessions', { workspaceId });
  },

  /**
   * Close a sandbox terminal session
   */
  closeTerminalSession: async (sessionId) => {
    return apiClient.delete(`/terminal/sessions/${sessionId}`);
  },
};
