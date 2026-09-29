const { contextBridge, ipcRenderer } = require('electron');

const ALLOWED_CHANNELS = {
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

// Expose safe, strictly typed API to renderer
contextBridge.exposeInMainWorld('desktopAPI', {
  device: {
    getStatus: () => ipcRenderer.invoke(ALLOWED_CHANNELS.DEVICE_GET_STATUS),
    enroll: (payload) => ipcRenderer.invoke(ALLOWED_CHANNELS.DEVICE_ENROLL, payload),
  },
  session: {
    login: (payload) => ipcRenderer.invoke(ALLOWED_CHANNELS.SESSION_LOGIN, payload),
    logout: (payload) => ipcRenderer.invoke(ALLOWED_CHANNELS.SESSION_LOGOUT, payload),
    heartbeat: (payload) => ipcRenderer.invoke(ALLOWED_CHANNELS.SESSION_HEARTBEAT, payload),
  },
  kiosk: {
    enter: (examPolicy) => ipcRenderer.invoke(ALLOWED_CHANNELS.KIOSK_ENTER, examPolicy),
    exit: () => ipcRenderer.invoke(ALLOWED_CHANNELS.KIOSK_EXIT),
  },
  cache: {
    reset: () => ipcRenderer.invoke(ALLOWED_CHANNELS.CACHE_RESET),
  },
  app: {
    getVersion: () => ipcRenderer.invoke(ALLOWED_CHANNELS.APP_GET_VERSION),
  },
});
