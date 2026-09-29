import { apiClient } from './api';

export const labSessionService = {
  startSession: async (data) => {
    return apiClient.post('/lab/sessions/start', data);
  },

  sessionHeartbeat: async (sessionId, data = {}) => {
    return apiClient.post(`/lab/sessions/${sessionId}/heartbeat`, data);
  },

  studentLogout: async (sessionId, reason = 'USER_LOGOUT') => {
    return apiClient.post(`/lab/sessions/${sessionId}/logout`, { reason });
  },

  forceLogoutSession: async (sessionId, reason = 'FORCED_BY_ADMIN') => {
    return apiClient.post(`/lab/sessions/${sessionId}/force-logout`, { reason });
  },

  getSessionById: async (sessionId) => {
    return apiClient.get(`/lab/sessions/${sessionId}`);
  },
};

export default labSessionService;
