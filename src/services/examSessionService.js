import { apiClient } from './api';

export const examSessionService = {
  getSession: async (sessionId) => {
    return apiClient.get(`/exam-sessions/${sessionId}`);
  },

  sendHeartbeat: async (sessionId) => {
    return apiClient.post(`/exam-sessions/${sessionId}/heartbeat`);
  },

  submitExam: async (sessionId, submissionType = 'MANUAL') => {
    return apiClient.post(`/exam-sessions/${sessionId}/submit`, { submissionType });
  },

  executeQuestion: async (sessionId, questionId, payload = {}) => {
    return apiClient.post(`/exam-sessions/${sessionId}/questions/${questionId}/execute`, payload);
  },

  recordProctoringEvent: async (sessionId, eventData) => {
    return apiClient.post(`/exam-sessions/${sessionId}/events`, eventData);
  },

  getProctoringEvents: async (sessionId) => {
    return apiClient.get(`/exam-sessions/${sessionId}/events`);
  },

  overrideScore: async (sessionId, payload) => {
    return apiClient.post(`/exam-sessions/${sessionId}/override-score`, payload);
  },
};
