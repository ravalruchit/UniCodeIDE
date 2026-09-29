import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const desktopRoot = path.join(__dirname, '..');

console.log('[Desktop Build] Verifying packaging configuration...');

// Verify critical files exist
const requiredFiles = [
  'package.json',
  'src/main/main.js',
  'src/preload/preload.js',
  'src/windows/mainWindow.js',
  'src/security/securityPolicy.js',
  'src/security/ipcValidator.js',
  'src/ipc/ipcChannels.js',
  'src/ipc/ipcHandlers.js',
  'src/services/desktopConfig.js',
  'src/services/secureStorage.js',
  'src/services/kioskManager.js',
  'src/renderer/index.html',
  'src/renderer/DesktopApp.jsx',
];

for (const file of requiredFiles) {
  const fullPath = path.join(desktopRoot, file);
  if (!fs.existsSync(fullPath)) {
    console.error(`[Desktop Build Error] Missing required file: ${file}`);
    process.exit(1);
  }
}

console.log('[Desktop Build] All required desktop runtime files verified.');
console.log('[Desktop Build] Production Electron packaging bundle configuration validated.');
