import { ALLOWED_CHANNELS } from './ipcChannels.js';
import { IpcValidator } from '../security/ipcValidator.js';
import secureStorage from '../services/secureStorage.js';
import kioskManager from '../services/kioskManager.js';
import desktopConfig from '../services/desktopConfig.js';

export function registerIpcHandlers(ipcMain, browserWindow) {
  if (!ipcMain) return;

  // 1. Device Status
  ipcMain.handle(ALLOWED_CHANNELS.DEVICE_GET_STATUS, async () => {
    const creds = secureStorage.getDeviceCredentials();
    return {
      isEnrolled: Boolean(creds),
      deviceId: creds ? creds.deviceId : null,
      deviceName: creds ? creds.deviceName : null,
      universityId: creds ? creds.universityId : null,
      labId: creds ? creds.labId : null,
    };
  });

  // 2. Device Enrollment
  ipcMain.handle(ALLOWED_CHANNELS.DEVICE_ENROLL, async (event, payload) => {
    IpcValidator.validatePayload(payload);
    const { enrollmentToken, deviceName } = payload;

    const res = await fetch(`${desktopConfig.API_BASE_URL}/lab/devices/enroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        enrollmentToken,
        deviceName,
        clientVersion: desktopConfig.CLIENT_VERSION,
        operatingSystem: process.platform,
      }),
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || 'Enrollment failed');
    }

    // Securely persist device credentials locally
    secureStorage.saveDeviceCredentials(data.data);

    return {
      success: true,
      deviceId: data.data.deviceId,
      deviceName: data.data.deviceName,
      universityId: data.data.universityId,
    };
  });

  // 3. Student Session Login
  ipcMain.handle(ALLOWED_CHANNELS.SESSION_LOGIN, async (event, payload) => {
    IpcValidator.validatePayload(payload);
    const creds = secureStorage.getDeviceCredentials();
    if (!creds) {
      throw new Error('Device is not enrolled');
    }

    const { email, password } = payload;
    const res = await fetch(`${desktopConfig.API_BASE_URL}/lab/sessions/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId: creds.deviceId,
        deviceSecret: creds.deviceSecret,
        studentEmail: email,
        studentPassword: password,
        clientVersion: desktopConfig.CLIENT_VERSION,
      }),
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || 'Login failed');
    }

    return data.data;
  });

  // 4. Student Session Logout & Workstation Reset
  ipcMain.handle(ALLOWED_CHANNELS.SESSION_LOGOUT, async (event, payload) => {
    IpcValidator.validatePayload(payload);
    const { sessionId, token, reason = 'USER_LOGOUT' } = payload || {};

    try {
      if (sessionId && token) {
        await fetch(`${desktopConfig.API_BASE_URL}/lab/sessions/${sessionId}/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reason }),
        });
      }
    } catch (err) {
      console.warn('[IpcHandlers] Logout API error (proceeding with local wipe):', err.message);
    } finally {
      // Exit kiosk mode if active
      kioskManager.exitKiosk(browserWindow);

      // Crucial: Wipe student local cache completely
      secureStorage.clearStudentSessionCache();
    }

    return { success: true, message: 'Workstation reset completed' };
  });

  // 5. Session Heartbeat
  ipcMain.handle(ALLOWED_CHANNELS.SESSION_HEARTBEAT, async (event, payload) => {
    IpcValidator.validatePayload(payload);
    const { sessionId, token, activeWorkspaceId, activeExamSessionId, kioskActive } = payload;

    const res = await fetch(
      `${desktopConfig.API_BASE_URL}/lab/sessions/${sessionId}/heartbeat`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ activeWorkspaceId, activeExamSessionId, kioskActive }),
      }
    );

    return await res.json();
  });

  // 6. Kiosk Enter & Exit
  ipcMain.handle(ALLOWED_CHANNELS.KIOSK_ENTER, async (event, examPolicy) => {
    return kioskManager.enterKiosk(browserWindow, examPolicy);
  });

  ipcMain.handle(ALLOWED_CHANNELS.KIOSK_EXIT, async () => {
    return kioskManager.exitKiosk(browserWindow);
  });

  // 7. Cache Reset
  ipcMain.handle(ALLOWED_CHANNELS.CACHE_RESET, async () => {
    return secureStorage.clearStudentSessionCache();
  });

  // 8. Version Info
  ipcMain.handle(ALLOWED_CHANNELS.APP_GET_VERSION, async () => {
    return {
      version: desktopConfig.CLIENT_VERSION,
      environment: desktopConfig.ENVIRONMENT,
      apiBaseUrl: desktopConfig.API_BASE_URL,
    };
  });
}

export default registerIpcHandlers;
