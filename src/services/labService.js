import { apiClient } from './api';

export const labService = {
  getLabs: async (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.status) searchParams.append('status', params.status);
    const qs = searchParams.toString();
    return apiClient.get(`/lab/labs${qs ? `?${qs}` : ''}`);
  },

  getLabById: async (id) => {
    return apiClient.get(`/lab/labs/${id}`);
  },

  createLab: async (data) => {
    return apiClient.post('/lab/labs', data);
  },

  updateLab: async (id, data) => {
    return apiClient.patch(`/lab/labs/${id}`, data);
  },

  deleteLab: async (id) => {
    return apiClient.delete(`/lab/labs/${id}`);
  },

  // Devices
  getDevices: async (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.labId) searchParams.append('labId', params.labId);
    if (params.status) searchParams.append('status', params.status);
    const qs = searchParams.toString();
    return apiClient.get(`/lab/devices${qs ? `?${qs}` : ''}`);
  },

  getDeviceById: async (id) => {
    return apiClient.get(`/lab/devices/${id}`);
  },

  createEnrollmentToken: async (data) => {
    return apiClient.post('/lab/devices/enrollment-tokens', data);
  },

  enableDevice: async (id) => {
    return apiClient.post(`/lab/devices/${id}/enable`);
  },

  disableDevice: async (id) => {
    return apiClient.post(`/lab/devices/${id}/disable`);
  },

  revokeDevice: async (id) => {
    return apiClient.post(`/lab/devices/${id}/revoke`);
  },

  rotateDeviceCredential: async (id) => {
    return apiClient.post(`/lab/devices/${id}/rotate-credential`);
  },

  forceLogoutDevice: async (id) => {
    return apiClient.post(`/lab/devices/${id}/force-logout`);
  },

  // Audit Events
  getAuditEvents: async (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.deviceId) searchParams.append('deviceId', params.deviceId);
    if (params.labId) searchParams.append('labId', params.labId);
    if (params.eventType) searchParams.append('eventType', params.eventType);
    if (params.limit) searchParams.append('limit', params.limit);
    if (params.skip) searchParams.append('skip', params.skip);
    const qs = searchParams.toString();
    return apiClient.get(`/lab/audit-events${qs ? `?${qs}` : ''}`);
  },

  getClientVersionInfo: async () => {
    return apiClient.get('/lab/client/version');
  },
};

export default labService;
