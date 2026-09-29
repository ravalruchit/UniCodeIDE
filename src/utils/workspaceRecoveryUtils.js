// Local Recovery Utility for Workspace Reliability
const RECOVERY_PREFIX = 'unicodeide_ws_recovery_';

export const workspaceRecoveryUtils = {
  getStorageKey: (workspaceId) => `${RECOVERY_PREFIX}${workspaceId}`,

  saveRecoverySnapshot: (workspaceId, data) => {
    if (!workspaceId) return false;
    try {
      const key = `${RECOVERY_PREFIX}${workspaceId}`;
      const payload = {
        workspaceId,
        baseRevision: data.baseRevision || 1,
        files: data.files || [],
        activeFilePath: data.activeFilePath || 'main.py',
        timestamp: Date.now(),
        syncState: data.syncState || 'PENDING',
      };
      localStorage.setItem(key, JSON.stringify(payload));
      return true;
    } catch (e) {
      console.warn('[WorkspaceRecovery] Failed to write recovery snapshot:', e);
      return false;
    }
  },

  getRecoverySnapshot: (workspaceId) => {
    if (!workspaceId) return null;
    try {
      const key = `${RECOVERY_PREFIX}${workspaceId}`;
      const item = localStorage.getItem(key);
      if (!item) return null;
      return JSON.parse(item);
    } catch (e) {
      console.warn('[WorkspaceRecovery] Failed to read recovery snapshot:', e);
      return null;
    }
  },

  clearRecoverySnapshot: (workspaceId) => {
    if (!workspaceId) return;
    try {
      const key = `${RECOVERY_PREFIX}${workspaceId}`;
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('[WorkspaceRecovery] Failed to clear recovery snapshot:', e);
    }
  },

  hasRecoverySnapshot: (workspaceId) => {
    if (!workspaceId) return false;
    try {
      const key = `${RECOVERY_PREFIX}${workspaceId}`;
      return !!localStorage.getItem(key);
    } catch {
      return false;
    }
  },
};
