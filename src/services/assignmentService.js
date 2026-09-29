import { apiClient } from './api';

export const assignmentService = {
  async getAssignments(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = `/assignments${query ? `?${query}` : ''}`;
    return apiClient(endpoint);
  },

  async getAssignment(id) {
    return apiClient(`/assignments/${id}`);
  },

  async createAssignment(data) {
    return apiClient('/assignments', {
      method: 'POST',
      body: data,
    });
  },

  async updateAssignment(id, data) {
    return apiClient(`/assignments/${id}`, {
      method: 'PUT',
      body: data,
    });
  },

  async updateAssignmentStatus(id, status) {
    return apiClient(`/assignments/${id}/status`, {
      method: 'PATCH',
      body: { status },
    });
  },

  async deleteAssignment(id) {
    return apiClient(`/assignments/${id}`, {
      method: 'DELETE',
    });
  },
};
