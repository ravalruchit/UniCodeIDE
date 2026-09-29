export const ALLOWED_CHANNELS = {
  DEVICE_GET_STATUS: 'desktop:device:status',
  DEVICE_ENROLL: 'desktop:device:enroll',
  SESSION_GET_STATE: 'desktop:session:state',
  SESSION_LOGIN: 'desktop:session:login',
  SESSION_LOGOUT: 'desktop:session:logout',
  SESSION_HEARTBEAT: 'desktop:session:heartbeat',
  KIOSK_ENTER: 'desktop:kiosk:enter',
  KIOSK_EXIT: 'desktop:kiosk:exit',
  CACHE_RESET: 'desktop:cache:reset',
  APP_GET_VERSION: 'desktop:app:version',
};

export default ALLOWED_CHANNELS;
