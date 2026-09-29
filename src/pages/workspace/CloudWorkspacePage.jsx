import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { workspaceService } from '../../services/workspaceService';
import { submissionService } from '../../services/submissionService';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useBeforeUnloadRecovery } from '../../hooks/useBeforeUnloadRecovery';
import { useWorkspaceSync } from '../../hooks/useWorkspaceSync';
import { useCodeExecution } from '../../hooks/useCodeExecution';
import { SYNC_STATES } from '../../utils/workspaceSyncUtils';
import { WorkspaceHeader } from '../../components/workspace/WorkspaceHeader';
import { FileExplorer } from '../../components/workspace/FileExplorer';
import { EditorTabs } from '../../components/workspace/EditorTabs';
import { CodeEditor } from '../../components/workspace/CodeEditor';
import { WorkspaceOutputPanel } from '../../components/workspace/WorkspaceOutputPanel';
import { WorkspaceSettingsModal } from '../../components/workspace/WorkspaceSettingsModal';
import { OfflineBanner } from '../../components/workspace/OfflineBanner';
import { SyncConflictModal } from '../../components/workspace/SyncConflictModal';
import { SyncRecoveryModal } from '../../components/workspace/SyncRecoveryModal';
import { SaveRecoveryPanel } from '../../components/workspace/SaveRecoveryPanel';
import {
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  RefreshCw,
  Send,
  X,
  PanelLeft,
  FolderOpen,
  Play,
  Settings,
  ArrowLeft,
  Files,
  Terminal,
} from 'lucide-react';

export function CloudWorkspacePage() {
  const { workspaceId, assignmentId } = useParams();
  const navigate = useNavigate();
  const outletCtx = useOutletContext() || {};
  const { collapsed, setCollapsed } = outletCtx;

  // Network Awareness
  const { isOnline, isBrowserOnline, checkReachability } = useNetworkStatus();

  // Core Workspace & File State
  const [workspace, setWorkspace] = useState(null);
  const [files, setFiles] = useState([]);
  const [activeFilePath, setActiveFilePath] = useState('');
  const [openTabs, setOpenTabs] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [showExplorer, setShowExplorer] = useState(true);
  const [settings, setSettings] = useState({
    fontSize: 14,
    tabSize: 4,
    wordWrap: 'on',
    minimap: true,
    theme: 'vs-dark',
  });

  // UI Modals State
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTelemetryOpen, setIsTelemetryOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);

  // Synchronization Hook
  const {
    syncState,
    lastSavedAt,
    conflictInfo,
    recoverySnapshot,
    retryAttempt,
    triggerChange,
    performSave,
    restoreRecoverySnapshot,
    discardRecoverySnapshot,
    resolveConflictWithLocal,
    resolveConflictWithServer,
  } = useWorkspaceSync({
    workspace,
    files,
    activeFilePath,
    setFiles,
    setWorkspace,
    isOnline,
    checkReachability,
  });

  // Protect against accidental browser tab close if unsynced
  const hasPendingSync =
    syncState === SYNC_STATES.PENDING ||
    syncState === SYNC_STATES.SAVING ||
    syncState === SYNC_STATES.OFFLINE;
  useBeforeUnloadRecovery(hasPendingSync);

  // Execution Engine Hook
  const {
    executionState,
    isRunning: isExecuting,
    executionResult,
    errorMessage: execErrorMessage,
    recentRuns,
    runCode,
    runTests,
    cancelCode,
    clearOutput,
  } = useCodeExecution(workspace?._id);

  const detectLanguageFromFileName = (filePath) => {
    if (!filePath) return 'JAVASCRIPT';
    const ext = filePath.split('.').pop()?.toLowerCase();
    if (['js', 'mjs', 'cjs'].includes(ext)) return 'JAVASCRIPT';
    if (['py'].includes(ext)) return 'PYTHON';
    if (['java'].includes(ext)) return 'JAVA';
    if (['cpp', 'cc', 'cxx'].includes(ext)) return 'CPP';
    if (['c'].includes(ext)) return 'C';
    if (['ts'].includes(ext)) return 'TYPESCRIPT';
    if (['cs'].includes(ext)) return 'CSHARP';
    if (['go'].includes(ext)) return 'GO';
    if (['rs'].includes(ext)) return 'RUST';
    if (['sql'].includes(ext)) return 'SQL';
    if (['php'].includes(ext)) return 'PHP';
    if (['rb'].includes(ext)) return 'RUBY';
    if (['kt'].includes(ext)) return 'KOTLIN';
    if (['swift'].includes(ext)) return 'SWIFT';
    if (['dart'].includes(ext)) return 'DART';
    if (['r', 'R'].includes(ext)) return 'R';
    if (['sh', 'bash'].includes(ext)) return 'BASH';
    if (['scala'].includes(ext)) return 'SCALA';
    if (['lua'].includes(ext)) return 'LUA';
    if (['pl', 'pm'].includes(ext)) return 'PERL';
    return 'JAVASCRIPT';
  };

  const currentLanguage = selectedLanguage || detectLanguageFromFileName(activeFilePath);

  const handleRunCode = async () => {
    if (syncState === SYNC_STATES.PENDING || syncState === SYNC_STATES.OFFLINE) {
      await performSave(true);
    }
    runCode(workspace?._id, workspace?.revision, '', activeFilePath, currentLanguage);
  };

  const handleRunTests = async () => {
    if (syncState === SYNC_STATES.PENDING || syncState === SYNC_STATES.OFFLINE) {
      await performSave(true);
    }
    runTests(workspace?._id, workspace?.revision);
  };

  // 1. Initial Load of Workspace
  const loadWorkspace = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      let res;
      if (assignmentId) {
        res = await workspaceService.getOrCreateAssignmentWorkspace(assignmentId);
      } else if (workspaceId) {
        res = await workspaceService.getWorkspaceById(workspaceId);
      } else {
        // Direct navigation to /app/student/workspace -> Get or create dedicated personal IDE workspace
        res = await workspaceService.getOrCreatePracticeWorkspace();
      }

      if (res && res.workspace) {
        const ws = res.workspace;
        setWorkspace(ws);
        setFiles(ws.files || []);
        setSettings(
          ws.settings || {
            fontSize: 14,
            tabSize: 4,
            wordWrap: 'on',
            minimap: true,
            theme: 'vs-dark',
          }
        );

        const initialActive = ws.activeFilePath || ws.files?.[0]?.path || 'main.py';
        setActiveFilePath(initialActive);
        setOpenTabs(ws.files?.map((f) => f.path) || [initialActive]);
      } else {
        setErrorMessage('Unable to load workspace data.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to initialize cloud workspace.');
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, assignmentId]);

  useEffect(() => {
    loadWorkspace();
  }, [loadWorkspace]);

  // 2. Editor Content Change Handler
  const handleContentChange = (newContent) => {
    const nextFiles = files.map((f) =>
      f.path === activeFilePath ? { ...f, content: newContent, size: newContent.length } : f
    );
    setFiles(nextFiles);
    triggerChange(nextFiles, activeFilePath);
  };

  // 3. File Explorer Actions
  const handleSelectFile = (path) => {
    setActiveFilePath(path);
    if (!openTabs.includes(path)) {
      setOpenTabs((prev) => [...prev, path]);
    }
  };

  const handleCloseTab = (path) => {
    const newTabs = openTabs.filter((p) => p !== path);
    setOpenTabs(newTabs);
    if (activeFilePath === path && newTabs.length > 0) {
      setActiveFilePath(newTabs[newTabs.length - 1]);
    }
  };

  const handleCreateFile = (newPath) => {
    if (files.some((f) => f.path === newPath)) {
      alert(`File "${newPath}" already exists.`);
      return;
    }

    const newFile = {
      path: newPath,
      name: newPath.split('/').pop(),
      content: '',
      size: 0,
      isEntry: false,
      updatedAt: new Date(),
    };

    const nextFiles = [...files, newFile];
    setFiles(nextFiles);
    setActiveFilePath(newPath);
    setOpenTabs((prev) => [...prev, newPath]);
    triggerChange(nextFiles, newPath);
  };

  const handleRenameFile = (oldPath, newPath) => {
    if (files.some((f) => f.path === newPath)) {
      alert(`A file with path "${newPath}" already exists.`);
      return;
    }

    const nextFiles = files.map((f) =>
      f.path === oldPath ? { ...f, path: newPath, name: newPath.split('/').pop() } : f
    );
    setFiles(nextFiles);
    setOpenTabs((prev) => prev.map((p) => (p === oldPath ? newPath : p)));
    if (activeFilePath === oldPath) {
      setActiveFilePath(newPath);
    }
    triggerChange(nextFiles, newPath);
  };

  const handleDeleteFile = (path) => {
    if (files.length <= 1) {
      alert('Cannot delete the last remaining file in the workspace.');
      return;
    }

    const nextFiles = files.filter((f) => f.path !== path);
    setFiles(nextFiles);
    setOpenTabs((prev) => prev.filter((p) => p !== path));
    const nextActive = activeFilePath === path ? nextFiles[0]?.path || '' : activeFilePath;
    setActiveFilePath(nextActive);
    triggerChange(nextFiles, nextActive);
  };

  // 4. Reset to Starter Code
  const handleResetToStarter = async () => {
    if (!workspace?._id) return;
    setIsLoading(true);
    try {
      const res = await workspaceService.resetAssignmentWorkspace(workspace._id);
      if (res && res.workspace) {
        setWorkspace(res.workspace);
        setFiles(res.workspace.files || []);
        setActiveFilePath(res.workspace.activeFilePath || 'main.py');
        setOpenTabs(res.workspace.files?.map((f) => f.path) || ['main.py']);
      }
    } catch (err) {
      alert(err.message || 'Failed to reset workspace');
    } finally {
      setIsLoading(false);
      setIsResetModalOpen(false);
    }
  };

  // 5. Submit Solution with Workspace Snapshot
  const handleSubmitSolution = async () => {
    if (!workspace || !workspace.assignmentId) return;

    // Ensure latest changes are synced to cloud first
    await performSave(true);

    setIsSubmitting(true);
    try {
      const entryFile =
        files.find((f) => f.isEntry) ||
        files.find((f) => !f.path.endsWith('.md')) ||
        files[0];

      const snapshotFiles = files.map((f) => ({
        name: f.name,
        path: f.path,
        content: f.content,
        size: f.size,
      }));

      const res = await submissionService.submitSolution(
        workspace.assignmentId._id || workspace.assignmentId,
        {
          sourceCode: entryFile?.content || '',
          files: snapshotFiles,
          programmingLanguage: workspace.language,
        }
      );

      if (res && res.submission) {
        setSubmitSuccess({
          attemptNumber: res.submission.attemptNumber,
          isLate: res.submission.isLate,
        });
      }
    } catch (err) {
      alert(err.message || 'Submission failed. Please check attempt limit or deadline.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeFile = files.find((f) => f.path === activeFilePath) || files[0];
  const unsavedSet = new Set(
    syncState !== SYNC_STATES.SYNCED ? [activeFilePath] : []
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-muted-foreground gap-3">
        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
        <span className="text-sm font-medium">Opening Cloud Programming Workspace...</span>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-6 text-center">
        <div className="p-3 rounded-full bg-rose-500/10 text-rose-500 mb-3">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h2 className="text-base font-semibold text-foreground mb-1">Workspace Unavailable</h2>
        <p className="text-sm text-muted-foreground max-w-md mb-4">{errorMessage}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Return to Previous Page
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-[#1e1e1e] text-foreground select-none">
      {/* 1. Header Bar with Synchronizer Status & Sidebar Toggle */}
      <WorkspaceHeader
        workspace={workspace}
        syncState={syncState}
        isSaving={syncState === SYNC_STATES.SAVING}
        hasUnsavedChanges={syncState === SYNC_STATES.PENDING || syncState === SYNC_STATES.OFFLINE}
        lastSavedAt={lastSavedAt}
        retryAttempt={retryAttempt}
        executionState={executionState}
        isRunning={isExecuting}
        activeFilePath={activeFilePath}
        currentLanguage={currentLanguage}
        onSelectLanguage={setSelectedLanguage}
        sidebarCollapsed={collapsed}
        onToggleSidebar={() => setCollapsed && setCollapsed(!collapsed)}
        onSave={() => performSave(true)}
        onReset={() => setIsResetModalOpen(true)}
        onSubmit={() => setIsSubmitModalOpen(true)}
        onRun={handleRunCode}
        onRunTests={handleRunTests}
        onCancelExecution={cancelCode}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenSyncTelemetry={() => setIsTelemetryOpen(true)}
        onBack={() => navigate('/app/student/dashboard')}
      />

      {/* 2. Offline Awareness Banner */}
      <OfflineBanner isOffline={!isOnline || syncState === SYNC_STATES.OFFLINE} />

      {/* 3. Main VS Code Workspace (Activity Bar + File Explorer + Editor + Terminal) */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Leftmost VS Code Activity Bar */}
        <div className="w-12 h-full bg-[#18181b] border-r border-border/60 flex flex-col items-center py-2 justify-between select-none shrink-0 z-10">
          {/* Top Activity Icons */}
          <div className="flex flex-col items-center gap-2 w-full">
            <button
              onClick={() => setShowExplorer(!showExplorer)}
              className={`p-2.5 rounded-lg transition-colors cursor-pointer ${
                showExplorer
                  ? 'text-primary bg-primary/10 border-l-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
              title="Explorer (Toggle File Tree)"
            >
              <Files className="h-5 w-5" />
            </button>
            <button
              onClick={handleRunCode}
              disabled={isExecuting}
              className="p-2.5 rounded-lg text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
              title={`Run Code (${activeFilePath || 'Current File'})`}
            >
              <Play className="h-5 w-5 fill-current" />
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
              title="Editor Settings"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>

          {/* Bottom Activity Icons: Sidebar Expand/Collapse & Back */}
          <div className="flex flex-col items-center gap-2 w-full">
            {setCollapsed && (
              <button
                onClick={() => setCollapsed(!collapsed)}
                className={`p-2.5 rounded-lg transition-colors cursor-pointer ${
                  collapsed
                    ? 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    : 'text-primary bg-primary/10'
                }`}
                title={collapsed ? 'Show Dashboard Sidebar' : 'Hide Dashboard Sidebar (Zen Mode)'}
              >
                <PanelLeft className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={() => navigate('/app/student/dashboard')}
              className="p-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
              title="Return to Student Dashboard"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Left: Virtual File Tree (collapsible) */}
        {showExplorer && (
          <FileExplorer
            files={files}
            activeFilePath={activeFilePath}
            onSelectFile={handleSelectFile}
            onCreateFile={handleCreateFile}
            onCreateFolder={(folder) => handleCreateFile(`${folder}/index.js`)}
            onRenameFile={handleRenameFile}
            onDeleteFile={handleDeleteFile}
          />
        )}

        {/* Center: Tabs + Monaco Editor */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <EditorTabs
            openTabs={openTabs}
            activeFilePath={activeFilePath}
            unsavedPaths={unsavedSet}
            onSelectTab={handleSelectFile}
            onCloseTab={handleCloseTab}
          />

          <CodeEditor
            filePath={activeFilePath}
            content={activeFile?.content || ''}
            onChange={handleContentChange}
            settings={settings}
            onSave={() => performSave(true)}
          />

          {/* Bottom: Secure Execution Output Panel */}
          <WorkspaceOutputPanel
            workspace={workspace}
            files={files}
            executionState={executionState}
            isRunning={isExecuting}
            executionResult={executionResult}
            errorMessage={execErrorMessage}
            recentRuns={recentRuns}
            onRunCode={handleRunCode}
            onRunTests={handleRunTests}
            onClearOutput={clearOutput}
          />
        </div>
      </div>

      {/* VS Code Bottom Status Bar (Sleek Dark Theme) */}
      <div className="h-6 bg-[#18181b] border-t border-border/80 text-muted-foreground flex items-center justify-between px-3 text-[11px] font-mono select-none shrink-0 z-20">
        <div className="flex items-center gap-3">
          {setCollapsed && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hover:bg-accent/60 hover:text-foreground px-1.5 py-0.5 rounded flex items-center gap-1 cursor-pointer transition-colors"
              title="Toggle Dashboard Navigation Sidebar"
            >
              <PanelLeft className="h-3 w-3" />
              <span>{collapsed ? 'Sidebar: Hidden' : 'Sidebar: Visible'}</span>
            </button>
          )}
          <span>•</span>
          <span className="flex items-center gap-1">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                syncState === SYNC_STATES.SYNCED ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
              }`}
            />
            <span className="text-foreground/80">{syncState}</span>
          </span>
          <span>•</span>
          <span>{files.length} files</span>
          <span>•</span>
          <span>Revision {workspace?.revision || 1}</span>
        </div>

        <div className="flex items-center gap-3">
          <span>Spaces: {settings.tabSize || 4}</span>
          <span>UTF-8</span>
          <span>LF</span>
          <span className="font-semibold bg-secondary/80 px-1.5 py-0.5 rounded text-foreground border border-border/50">
            {currentLanguage}
          </span>
        </div>
      </div>

      {/* 4. Editor Preferences Modal */}
      <WorkspaceSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newSettings) => setSettings((prev) => ({ ...prev, ...newSettings }))}
      />

      {/* 5. Cloud Sync Telemetry Panel */}
      <SaveRecoveryPanel
        isOpen={isTelemetryOpen}
        onClose={() => setIsTelemetryOpen(false)}
        syncState={syncState}
        revision={workspace?.revision || 1}
        lastSavedAt={lastSavedAt}
        isOnline={isOnline}
        files={files}
        onManualSync={() => performSave(true)}
        isSaving={syncState === SYNC_STATES.SAVING}
      />

      {/* 6. Conflict Resolution Modal */}
      <SyncConflictModal
        conflictInfo={conflictInfo}
        localFiles={files}
        onReloadServer={() => resolveConflictWithServer(loadWorkspace)}
        onKeepLocal={resolveConflictWithLocal}
      />

      {/* 7. Startup Recovery Modal */}
      <SyncRecoveryModal
        recoverySnapshot={recoverySnapshot}
        onRestore={restoreRecoverySnapshot}
        onDiscard={discardRecoverySnapshot}
      />

      {/* 8. Reset to Starter Code Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-left">
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-xl p-5 space-y-4">
            <div className="flex items-center gap-2.5 text-amber-500">
              <RotateCcw className="h-5 w-5" />
              <h3 className="font-semibold text-sm text-foreground">Reset to Starter Code?</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to reset this workspace? All current code and added files will be replaced with the original assignment template. This cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResetToStarter}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-sm"
              >
                Reset Workspace
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. Submit Assignment Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-left">
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-xl p-5 space-y-4">
            {submitSuccess ? (
              <div className="text-center space-y-3 py-2">
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-base text-foreground">Solution Submitted!</h3>
                <p className="text-sm text-muted-foreground">
                  Attempt #{submitSuccess.attemptNumber} has been recorded. An immutable file snapshot of this workspace was saved for instructor evaluation.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setIsSubmitModalOpen(false);
                      setSubmitSuccess(null);
                      navigate(-1);
                    }}
                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    Return to Assignment
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <Send className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-sm text-foreground">Submit Assignment Solution</h3>
                  </div>
                  <button
                    onClick={() => setIsSubmitModalOpen(false)}
                    className="p-1 rounded text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="text-xs text-muted-foreground space-y-2">
                  <p>
                    You are about to snapshot and submit your current cloud workspace solution to:{' '}
                    <strong className="text-foreground">{workspace?.name}</strong>
                  </p>
                  <div className="p-3 rounded-lg bg-muted/40 border border-border space-y-1 font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span>Total Project Files:</span>
                      <span className="text-foreground font-semibold">{files.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Language:</span>
                      <span className="text-foreground font-semibold">{workspace?.language}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Workspace Revision:</span>
                      <span className="text-foreground font-semibold">r{workspace?.revision}</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground/80">
                    Your submission creates an immutable record that will be reviewed by your teacher. Subsequent edits in this workspace will not alter this submitted attempt.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <button
                    onClick={() => setIsSubmitModalOpen(false)}
                    disabled={isSubmitting}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-medium border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitSolution}
                    disabled={isSubmitting}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
                  >
                    {isSubmitting && <RefreshCw className="h-3 w-3 animate-spin" />}
                    <span>{isSubmitting ? 'Submitting...' : 'Confirm Submission'}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
