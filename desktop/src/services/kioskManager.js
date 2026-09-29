class KioskManager {
  constructor() {
    this.kioskActive = false;
    this.currentPolicy = null;
  }

  /**
   * Enter exam lockdown / kiosk mode
   */
  enterKiosk(browserWindow, examPolicy = {}) {
    if (!browserWindow) return false;

    this.kioskActive = true;
    this.currentPolicy = examPolicy;

    try {
      browserWindow.setMenuBarVisibility(false);
      browserWindow.setAutoHideMenuBar(true);
      browserWindow.setFullScreen(true);

      if (examPolicy.strictKiosk) {
        browserWindow.setAlwaysOnTop(true, 'screen-saver');
      }

      console.log('[KioskManager] Entered restricted examination mode');
      return true;
    } catch (err) {
      console.error('[KioskManager] Failed to engage kiosk mode:', err.message);
      return false;
    }
  }

  /**
   * Exit kiosk mode and restore standard desktop behavior
   */
  exitKiosk(browserWindow) {
    if (!browserWindow) return false;

    this.kioskActive = false;
    this.currentPolicy = null;

    try {
      browserWindow.setAlwaysOnTop(false);
      browserWindow.setFullScreen(false);
      browserWindow.setMenuBarVisibility(true);
      browserWindow.setAutoHideMenuBar(false);

      console.log('[KioskManager] Exited examination kiosk mode');
      return true;
    } catch (err) {
      console.error('[KioskManager] Failed to exit kiosk mode:', err.message);
      return false;
    }
  }

  isKioskActive() {
    return this.kioskActive;
  }

  getCurrentPolicy() {
    return this.currentPolicy;
  }
}

export const kioskManager = new KioskManager();
export default kioskManager;
