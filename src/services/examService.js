import { apiClient } from './api';

export const examService = {
  getExams: async (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.courseId) searchParams.append('courseId', params.courseId);
    if (params.status) searchParams.append('status', params.status);
    const qs = searchParams.toString();
    return apiClient.get(`/exams${qs ? `?${qs}` : ''}`);
  },

  getExamById: async (id) => {
    return apiClient.get(`/exams/${id}`);
  },

  createExam: async (data) => {
    return apiClient.post('/exams', data);
  },

  updateExam: async (id, data) => {
    return apiClient.put(`/exams/${id}`, data);
  },

  publishExam: async (id) => {
    return apiClient.post(`/exams/${id}/publish`);
  },

  closeExam: async (id) => {
    return apiClient.post(`/exams/${id}/close`);
  },

  getLiveExamSessions: async (id) => {
    return apiClient.get(`/exams/${id}/live-sessions`);
  },

  startExam: async (id) => {
    return apiClient.post(`/exams/${id}/start`);
  },

  // Question Bank
  getQuestions: async (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.courseId) searchParams.append('courseId', params.courseId);
    if (params.difficulty) searchParams.append('difficulty', params.difficulty);
    const qs = searchParams.toString();
    return apiClient.get(`/exams/questions${qs ? `?${qs}` : ''}`);
  },

  createQuestion: async (data) => {
    return apiClient.post('/exams/questions', data);
  },

  getQuestionById: async (id) => {
    return apiClient.get(`/exams/questions/${id}`);
  },

  updateQuestion: async (id, data) => {
    return apiClient.put(`/exams/questions/${id}`, data);
  },
};
