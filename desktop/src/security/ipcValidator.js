import { ALLOWED_CHANNELS } from '../ipc/ipcChannels.js';

export class IpcValidator {
  /**
   * Validate that an incoming IPC channel is strictly permitted
   */
  static isChannelAllowed(channel) {
    return Object.values(ALLOWED_CHANNELS).includes(channel);
  }

  /**
   * Validate that arguments do not contain prototype pollution or shell injection attempts
   */
  static validatePayload(payload) {
    if (!payload || typeof payload !== 'object') {
      return true;
    }

    const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
    const propNames = Object.getOwnPropertyNames(payload);
    for (const key of propNames) {
      if (dangerousKeys.includes(key)) {
        throw new Error(`Forbidden property detected: ${key}`);
      }
      if (typeof payload[key] === 'string') {
        // Reject shell injection meta-characters if ever targeted at process execution
        if (payload[key].includes('; rm ') || payload[key].includes('&& del ')) {
          throw new Error('Malicious shell pattern detected in IPC payload');
        }
      }
    }
    // Also check JSON serialized keys if provided
    try {
      const jsonStr = JSON.stringify(payload);
      if (jsonStr.includes('"__proto__":') || jsonStr.includes('"constructor":')) {
        throw new Error('Forbidden property detected: prototype pollution');
      }
    } catch (e) {
      if (e.message.includes('Forbidden property')) throw e;
    }
    return true;
  }
}

export default IpcValidator;
