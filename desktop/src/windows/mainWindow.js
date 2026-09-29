import { BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { applySecurityPolicies } from '../security/securityPolicy.js';
import desktopConfig from '../services/desktopConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createMainWindow() {
  const preloadPath = path.join(__dirname, '..', 'preload', 'preload.js');

  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 850,
    minWidth: 1024,
    minHeight: 700,
    title: desktopConfig.APP_NAME,
    backgroundColor: '#020617', // Slate 950
    show: false,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
  });

  applySecurityPolicies(mainWindow);

  // Load URL depending on environment
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173/desktop');
  } else {
    const indexPath = path.join(__dirname, '..', 'renderer', 'index.html');
    mainWindow.loadFile(indexPath);
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  return mainWindow;
}

export default createMainWindow;
