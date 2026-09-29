import { app, BrowserWindow, ipcMain } from 'electron';
import { createMainWindow } from '../windows/mainWindow.js';
import { registerIpcHandlers } from '../ipc/ipcHandlers.js';
import secureStorage from '../services/secureStorage.js';

let mainWindow = null;

async function initApp() {
  mainWindow = createMainWindow();
  registerIpcHandlers(ipcMain, mainWindow);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createMainWindow();
      registerIpcHandlers(ipcMain, mainWindow);
    }
  });
}

app.whenReady().then(initApp);

app.on('window-all-closed', () => {
  // Always clean local session cache on app exit to ensure Student B cannot access Student A data
  secureStorage.clearStudentSessionCache();

  if (process.platform !== 'darwin') {
    app.quit();
  }
});
