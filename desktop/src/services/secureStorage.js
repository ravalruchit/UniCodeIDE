import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';

class SecureStorage {
  constructor() {
    this.storageDir = path.join(os.homedir(), '.unicodeide-lab');
    this.credFile = path.join(this.storageDir, 'device-auth.dat');
    this.cacheDir = path.join(this.storageDir, 'session-cache');
    this._ensureDirectories();
  }

  _ensureDirectories() {
    try {
      if (!fs.existsSync(this.storageDir)) {
        fs.mkdirSync(this.storageDir, { recursive: true, mode: 0o700 });
      }
      if (!fs.existsSync(this.cacheDir)) {
        fs.mkdirSync(this.cacheDir, { recursive: true, mode: 0o700 });
      }
    } catch (err) {
      console.error('[SecureStorage] Directory creation failed:', err.message);
    }
  }

  // Derive machine-specific key for local obfuscation/encryption
  _getMachineKey() {
    const machineFingerprint = `${os.hostname()}_${os.platform()}_${os.arch()}_UniCodeIDE_Lab`;
    return crypto.createHash('sha256').update(machineFingerprint).digest();
  }

  /**
   * Save enrolled device credentials
   */
  saveDeviceCredentials(data) {
    this._ensureDirectories();
    const payload = JSON.stringify({
      deviceId: data.deviceId,
      deviceSecret: data.deviceSecret,
      deviceName: data.deviceName,
      universityId: data.universityId,
      labId: data.labId,
      enrolledAt: new Date().toISOString(),
    });

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', this._getMachineKey(), iv);
    let encrypted = cipher.update(payload, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const fileContent = JSON.stringify({
      iv: iv.toString('hex'),
      data: encrypted,
    });

    fs.writeFileSync(this.credFile, fileContent, { mode: 0o600 });
    return true;
  }

  /**
   * Read stored device credentials
   */
  getDeviceCredentials() {
    if (!fs.existsSync(this.credFile)) {
      return null;
    }

    try {
      const raw = fs.readFileSync(this.credFile, 'utf8');
      const { iv, data } = JSON.parse(raw);
      const decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        this._getMachineKey(),
        Buffer.from(iv, 'hex')
      );
      let decrypted = decipher.update(data, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return JSON.parse(decrypted);
    } catch (err) {
      console.error('[SecureStorage] Failed to decrypt device credentials:', err.message);
      return null;
    }
  }

  /**
   * Check if device is enrolled
   */
  isDeviceEnrolled() {
    return Boolean(this.getDeviceCredentials());
  }

  /**
   * Clear device credentials (unenroll workstation)
   */
  clearDeviceCredentials() {
    if (fs.existsSync(this.credFile)) {
      try {
        fs.unlinkSync(this.credFile);
      } catch (err) {
        console.error('[SecureStorage] Failed to remove cred file:', err.message);
      }
    }
  }

  /**
   * CRITICAL REQUIREMENT: Reset student-specific local state on logout.
   * Completely purges cached workspace files, tokens, and temporary session state
   * so Student B cannot see Student A's data!
   */
  clearStudentSessionCache() {
    try {
      if (fs.existsSync(this.cacheDir)) {
        const files = fs.readdirSync(this.cacheDir);
        for (const file of files) {
          fs.unlinkSync(path.join(this.cacheDir, file));
        }
      }
      return { success: true, message: 'Local student cache securely wiped' };
    } catch (err) {
      console.error('[SecureStorage] Error clearing student cache:', err.message);
      return { success: false, error: err.message };
    }
  }
}

export const secureStorage = new SecureStorage();
export default secureStorage;
