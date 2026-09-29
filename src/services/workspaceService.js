import { apiClient } from './api';

export const workspaceService = {
  getWorkspaces: async (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.courseId) searchParams.append('courseId', params.courseId);
    if (params.assignmentId) searchParams.append('assignmentId', params.assignmentId);
    const queryString = searchParams.toString();
    return apiClient.get(`/workspaces${queryString ? `?${queryString}` : ''}`);
  },

  getOrCreateAssignmentWorkspace: async (assignmentId) => {
    return apiClient.get(`/workspaces/assignment/${assignmentId}`);
  },

  getOrCreatePracticeWorkspace: async () => {
    return apiClient.get('/workspaces/practice/default');
  },

  getWorkspaceById: async (id) => {
    return apiClient.get(`/workspaces/${id}`);
  },

  getWorkspaceSyncState: async (id) => {
    return apiClient.get(`/workspaces/${id}/sync-state`);
  },

  pingReachability: async () => {
    try {
      const res = await apiClient.get('/health');
      return res && res.status === 'healthy';
    } catch {
      return false;
    }
  },

  saveWorkspace: async (id, payload) => {
    return apiClient.put(`/workspaces/${id}`, payload);
  },

  resetAssignmentWorkspace: async (id) => {
    return apiClient.post(`/workspaces/${id}/reset`);
  },

  deleteWorkspace: async (id) => {
    return apiClient.delete(`/workspaces/${id}`);
  },
};
