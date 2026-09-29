import { useState, useEffect, useRef, useCallback } from 'react';
import { workspaceService } from '../services/workspaceService';
import { workspaceRecoveryUtils } from '../utils/workspaceRecoveryUtils';
import { SYNC_STATES, getRetryDelay, isRetryableError } from '../utils/workspaceSyncUtils';

export function useWorkspaceSync({
  workspace,
  files,
  activeFilePath,
  setFiles,
  setWorkspace,
  isOnline,
  checkReachability,
}) {
  const [syncState, setSyncState] = useState(SYNC_STATES.SYNCED);
  const [lastSavedAt, setLastSavedAt] = useState(workspace?.lastSavedAt || null);
  const [conflictInfo, setConflictInfo] = useState(null);
  const [recoverySnapshot, setRecoverySnapshot] = useState(null);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [syncErrorMessage, setSyncErrorMessage] = useState(null);

  // References to preserve latest values inside timers & callbacks
  const workspaceRef = useRef(workspace);
  const filesRef = useRef(files);
  const activeFilePathRef = useRef(activeFilePath);
  const syncStateRef = useRef(syncState);
  const isOnlineRef = useRef(isOnline);
  const debounceTimerRef = useRef(null);
  const retryTimerRef = useRef(null);

  workspaceRef.current = workspace;
  filesRef.current = files;
  activeFilePathRef.current = activeFilePath;
  syncStateRef.current = syncState;
  isOnlineRef.current = isOnline;

  // 1. Check for un-persisted local recovery snapshot on workspace load
  useEffect(() => {
    if (!workspace?._id) return;

    const existingRecovery = workspaceRecoveryUtils.getRecoverySnapshot(workspace._id);
    if (existingRecovery && existingRecovery.files?.length > 0) {
      // Check if recovery has newer content or pending sync
      const isNewer =
        existingRecovery.timestamp > new Date(workspace.lastSavedAt || workspace.updatedAt).getTime();
      if (isNewer || existingRecovery.syncState === 'PENDING') {
        setRecoverySnapshot(existingRecovery);
      }
    }
  }, [workspace?._id]);

  // 2. Perform Save to Cloud API
  const performSave = useCallback(
    async (isManual = false, forceOverwrite = false) => {
      const currentWs = workspaceRef.current;
      if (!currentWs || !currentWs._id) return;

      // Clear any pending timers
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);

      // Check network status before attempting
      if (!isOnlineRef.current) {
        setSyncState(SYNC_STATES.OFFLINE);
        workspaceRecoveryUtils.saveRecoverySnapshot(currentWs._id, {
          baseRevision: currentWs.revision,
          files: filesRef.current,
          activeFilePath: activeFilePathRef.current,
          syncState: 'PENDING',
        });
        return;
      }

      setSyncState(SYNC_STATES.SAVING);
      setSyncErrorMessage(null);

      try {
        const payload = {
          files: filesRef.current,
          activeFilePath: activeFilePathRef.current,
          settings: currentWs.settings,
          expectedRevision: currentWs.revision,
          forceOverwrite: !!forceOverwrite,
        };

        const res = await workspaceService.saveWorkspace(currentWs._id, payload);

        if (res && res.success) {
          setWorkspace((prev) => ({
            ...prev,
            revision: res.revision,
            lastSavedAt: res.lastSavedAt,
          }));
          setLastSavedAt(res.lastSavedAt);
          setSyncState(SYNC_STATES.SYNCED);
          setConflictInfo(null);
          setRetryAttempt(0);

          // Clear local recovery snapshot as cloud is now authoritative
          workspaceRecoveryUtils.clearRecoverySnapshot(currentWs._id);
        }
      } catch (err) {
        console.warn('[WorkspaceSync] Save error:', err);

        // Always buffer unsaved state locally to prevent data loss
        workspaceRecoveryUtils.saveRecoverySnapshot(currentWs._id, {
          baseRevision: currentWs.revision,
          files: filesRef.current,
          activeFilePath: activeFilePathRef.current,
          syncState: 'PENDING',
        });

        // 409 Conflict: another device updated this workspace
        if (
          err.status === 409 ||
          err.code === 'WORKSPACE_REVISION_CONFLICT' ||
          err.message?.includes('conflict') ||
          err.message?.includes('revision')
        ) {
          setSyncState(SYNC_STATES.CONFLICT);
          setConflictInfo({
            serverRevision: err.serverRevision || err.data?.serverRevision || currentWs.revision + 1,
            localRevision: currentWs.revision,
            message:
              err.message ||
              'This workspace was modified on another device or session.',
            timestamp: new Date(),
          });
          return;
        }

        // 401 Unauthorized: session expired
        if (err.status === 401 || err.statusCode === 401) {
          setSyncState(SYNC_STATES.AUTH_EXPIRED);
          setSyncErrorMessage('Session expired. Please sign in again to sync changes.');
          return;
        }

        // Transient / Retryable errors (e.g. 503, network disconnect, timeout)
        if (isRetryableError(err)) {
          if (retryAttempt < 4) {
            const nextAttempt = retryAttempt + 1;
            setRetryAttempt(nextAttempt);
            setSyncState(SYNC_STATES.RETRYING);
            const delay = getRetryDelay(nextAttempt);
            retryTimerRef.current = setTimeout(() => {
              performSave(false, forceOverwrite);
            }, delay);
          } else {
            setSyncState(SYNC_STATES.ERROR);
            setSyncErrorMessage('Unable to reach cloud server after multiple attempts. Sync paused.');
          }
        } else {
          // Non-retryable error (e.g. 400 bad path, 413 quota)
          setSyncState(SYNC_STATES.ERROR);
          setSyncErrorMessage(err.message || 'Sync failed due to validation or quota limits.');
        }
      }
    },
    [retryAttempt, setWorkspace]
  );

  // 3. Trigger Change Handler (Invoked on code edit, file creation, rename, delete)
  const triggerChange = useCallback(
    (newFiles, newActivePath) => {
      const currentWs = workspaceRef.current;
      if (!currentWs) return;

      setSyncState(isOnlineRef.current ? SYNC_STATES.PENDING : SYNC_STATES.OFFLINE);

      // Save local recovery snapshot immediately
      workspaceRecoveryUtils.saveRecoverySnapshot(currentWs._id, {
        baseRevision: currentWs.revision,
        files: newFiles,
        activeFilePath: newActivePath || activeFilePathRef.current,
        syncState: 'PENDING',
      });

      // Clear existing debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // If online, debounce cloud save by 1500ms
      if (isOnlineRef.current) {
        debounceTimerRef.current = setTimeout(() => {
          performSave(false);
        }, 1500);
      }
    },
    [performSave]
  );

  // 4. Handle Network Online Transition (Auto-Resume Sync)
  useEffect(() => {
    if (isOnline) {
      if (
        syncStateRef.current === SYNC_STATES.OFFLINE ||
        syncStateRef.current === SYNC_STATES.PENDING ||
        syncStateRef.current === SYNC_STATES.ERROR
      ) {
        const currentWs = workspaceRef.current;
        if (currentWs && workspaceRecoveryUtils.hasRecoverySnapshot(currentWs._id)) {
          setSyncState(SYNC_STATES.RETRYING);
          // Ping reachability then flush save
          checkReachability?.().then((reachable) => {
            if (reachable) {
              performSave(false);
            }
          });
        }
      }
    } else {
      setSyncState(SYNC_STATES.OFFLINE);
    }
  }, [isOnline, checkReachability, performSave]);

  // 5. Restore Local Recovery Snapshot
  const restoreRecoverySnapshot = useCallback(() => {
    if (!recoverySnapshot || !recoverySnapshot.files) return;
    setFiles(recoverySnapshot.files);
    if (recoverySnapshot.activeFilePath) {
      // Caller should handle active file path state
    }
    setRecoverySnapshot(null);
    setSyncState(SYNC_STATES.PENDING);
    // Queue save to sync restored files to cloud
    setTimeout(() => performSave(true), 200);
  }, [recoverySnapshot, setFiles, performSave]);

  // 6. Discard Recovery Snapshot
  const discardRecoverySnapshot = useCallback(() => {
    const currentWs = workspaceRef.current;
    if (currentWs?._id) {
      workspaceRecoveryUtils.clearRecoverySnapshot(currentWs._id);
    }
    setRecoverySnapshot(null);
  }, []);

  // 7. Resolve Conflict
  const resolveConflictWithLocal = useCallback(() => {
    performSave(true, true); // Force overwrite with local copy
    setConflictInfo(null);
  }, [performSave]);

  const resolveConflictWithServer = useCallback(
    async (reloadCallback) => {
      setConflictInfo(null);
      if (reloadCallback) {
        await reloadCallback();
      }
    },
    []
  );

  return {
    syncState,
    lastSavedAt,
    conflictInfo,
    recoverySnapshot,
    syncErrorMessage,
    retryAttempt,
    triggerChange,
    performSave,
    restoreRecoverySnapshot,
    discardRecoverySnapshot,
    resolveConflictWithLocal,
    resolveConflictWithServer,
  };
}
