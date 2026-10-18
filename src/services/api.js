// API Client using native fetch() - No external HTTP library
const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
    ? 'https://unicodeide-backend.onrender.com/api'
    : 'http://localhost:5000/api');


class ApiError extends Error {
  constructor(message, status = 500, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

/**
 * Get current stored JWT token
 */
export const getStoredToken = () => {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem('unicodeide_token');
};

/**
 * Set stored JWT token
 */
export const setStoredToken = (token) => {
  if (typeof localStorage === 'undefined') return;
  if (token) {
    localStorage.setItem('unicodeide_token', token);
  } else {
    localStorage.removeItem('unicodeide_token');
  }
};

/**
 * Core fetch wrapper with timeout, bearer token injection, and unified error handling
 */
export const apiClient = async (endpoint, options = {}) => {
  const {
    method = 'GET',
    body = null,
    headers = {},
    requiresAuth = true,
    timeout = 10000,
    ...customConfig
  } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const requestHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (requiresAuth) {
    const token = getStoredToken();
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }
  }

  const config = {
    method,
    headers: requestHeaders,
    signal: controller.signal,
    ...customConfig,
  };

  if (body) {
    config.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  try {
    const response = await fetch(url, config);
    clearTimeout(timeoutId);

    let data = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMessage =
        (typeof data === 'object' && data?.message) ||
        (typeof data === 'string' && data) ||
        `Request failed with status ${response.status}`;

      throw new ApiError(errorMessage, response.status, data?.details || null);
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw new ApiError('Request timed out. Please check your internet connection.', 408);
    }

    if (error instanceof ApiError) {
      throw error;
    }

    // Network error (e.g. backend server offline)
    throw new ApiError(
      error.message === 'Failed to fetch'
        ? 'Unable to connect to the UniCodeIDE backend server. Please verify the service is running.'
        : error.message,
      0
    );
  }
};

// Convenience HTTP method shortcuts for services
apiClient.get = (endpoint, options = {}) =>
  apiClient(endpoint, { ...options, method: 'GET' });

apiClient.post = (endpoint, body = null, options = {}) =>
  apiClient(endpoint, { ...options, method: 'POST', body });

apiClient.put = (endpoint, body = null, options = {}) =>
  apiClient(endpoint, { ...options, method: 'PUT', body });

apiClient.patch = (endpoint, body = null, options = {}) =>
  apiClient(endpoint, { ...options, method: 'PATCH', body });

apiClient.delete = (endpoint, options = {}) =>
  apiClient(endpoint, { ...options, method: 'DELETE' });

export { ApiError };
