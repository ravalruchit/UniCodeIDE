import { apiClient } from './api';

export const submissionService = {
  async saveDraft(assignmentId, data) {
    return apiClient(`/assignments/${assignmentId}/draft`, {
      method: 'PUT',
      body: data,
    });
  },

  async submitSolution(assignmentId, data) {
    return apiClient(`/assignments/${assignmentId}/submissions`, {
      method: 'POST',
      body: data,
    });
  },

  async getSubmissions(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = `/submissions${query ? `?${query}` : ''}`;
    return apiClient(endpoint);
  },

  async getSubmission(id) {
    return apiClient(`/submissions/${id}`);
  },

  async evaluateSubmission(id, data) {
    return apiClient(`/submissions/${id}/evaluate`, {
      method: 'PATCH',
      body: data,
    });
  },

  async returnSubmission(id, data) {
    return apiClient(`/submissions/${id}/return`, {
      method: 'PATCH',
      body: data,
    });
  },
};
