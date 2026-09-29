/**
 * UniCodeIDE Desktop Lab Client Configuration
 */
export const desktopConfig = {
  API_BASE_URL: process.env.UNICODEIDE_API_URL || 'http://localhost:5000/api',
  WS_BASE_URL: process.env.UNICODEIDE_WS_URL || 'ws://localhost:5000',
  ENVIRONMENT: process.env.NODE_ENV || 'production',
  CLIENT_VERSION: '1.0.0',
  MIN_SUPPORTED_VERSION: '1.0.0',
  APP_NAME: 'UniCodeIDE Lab Client',
  DEFAULT_HEARTBEAT_INTERVAL_MS: 30000,
  CACHE_STORAGE_KEY: 'unicodeide_lab_cache',
  DEVICE_STORAGE_KEY: 'unicodeide_device_credential',
};

export default desktopConfig;
