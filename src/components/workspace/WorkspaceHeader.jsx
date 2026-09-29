import React from 'react';
import {
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Settings,
  Send,
  ArrowLeft,
  RotateCcw,
  Play,
  Square,
  FlaskConical,
  Clock,
  AlertTriangle,
  PanelLeft,
  ChevronRight,
  Code2,
} from 'lucide-react';

import { SyncStatusIndicator } from './SyncStatusIndicator';

export function WorkspaceHeader({
  workspace,
  syncState,
  isSaving,
  hasUnsavedChanges,
  lastSavedAt,
  retryAttempt = 0,
  executionState = 'IDLE',
  isRunning = false,
  activeFilePath = '',
  currentLanguage = 'JAVASCRIPT',
  onSelectLanguage,
  sidebarCollapsed = false,
  onToggleSidebar,
  onSave,
  onReset,
  onSubmit,
  onRun,
  onRunTests,
  onCancelExecution,
  onOpenSettings,
  onOpenSyncTelemetry,
  onBack,
}) {
  const activeFileName = activeFilePath ? activeFilePath.split('/').pop() : '';

  return (
    <header className="h-12 border-b border-border bg-[#18181b]/90 backdrop-blur-md px-3 flex items-center justify-between gap-3 select-none shrink-0 z-20">
      {/* Left: Sidebar Toggle, Back & Workspace Breadcrumbs */}
      <div className="flex items-center gap-2 min-w-0">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className={`p-1.5 rounded-md border text-xs flex items-center gap-1 transition-all ${
              sidebarCollapsed
                ? 'bg-muted/60 border-border text-foreground hover:bg-muted'
                : 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/20'
            }`}
            title={sidebarCollapsed ? 'Expand Dashboard Sidebar' : 'Collapse Dashboard Sidebar (Zen Mode)'}
          >
            <PanelLeft className="h-3.5 w-3.5" />
            <span className="hidden xl:inline text-[11px] font-medium">
              {sidebarCollapsed ? 'Sidebar' : 'Sidebar'}
            </span>
          </button>
        )}

        <button
          onClick={onBack}
          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Exit to Dashboard"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-1.5 min-w-0 text-xs font-mono">
          <span className="font-semibold text-foreground truncate max-w-[140px] sm:max-w-[200px]">
            {workspace?.name || 'IDE Workspace'}
          </span>
          {activeFileName && (
            <>
              <ChevronRight className="h-3 w-3 text-muted-foreground/60 shrink-0" />
              <span className="text-primary font-medium truncate max-w-[150px]">
                {activeFileName}
              </span>
            </>
          )}
          {workspace?.assignmentId && (
            <span className="text-[10px] font-sans font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 shrink-0">
              Assignment
            </span>
          )}
          <span className="text-[10px] px-1 py-0.2 rounded bg-muted/60 text-muted-foreground shrink-0">
            r{workspace?.revision || 1}
          </span>
        </div>
      </div>

      {/* Middle: Save Status & Sync Indicator */}
      <div className="hidden md:flex items-center gap-2">
        <SyncStatusIndicator
          syncState={syncState}
          revision={workspace?.revision || 1}
          lastSavedAt={lastSavedAt}
          retryAttempt={retryAttempt}
          onClick={onOpenSyncTelemetry}
        />
      </div>

      {/* Right: Runtime Language Picker & Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Runtime Language Selector */}
        {onSelectLanguage && (
          <div className="flex items-center gap-1 bg-muted/40 border border-border/80 px-2 py-1 rounded text-xs">
            <Code2 className="h-3.5 w-3.5 text-primary shrink-0" />
            <select
              value={currentLanguage}
              onChange={(e) => onSelectLanguage(e.target.value)}
              className="bg-transparent text-foreground text-xs font-medium outline-none cursor-pointer"
              title="Execution Engine Language Runtime"
            >
              <option value="PYTHON" className="bg-[#18181b] text-foreground">Python (3.11)</option>
              <option value="JAVASCRIPT" className="bg-[#18181b] text-foreground">JavaScript (Node 20)</option>
              <option value="TYPESCRIPT" className="bg-[#18181b] text-foreground">TypeScript (5.x)</option>
              <option value="JAVA" className="bg-[#18181b] text-foreground">Java (Temurin 17)</option>
              <option value="C" className="bg-[#18181b] text-foreground">C (GCC 14)</option>
              <option value="CPP" className="bg-[#18181b] text-foreground">C++ (GCC 14)</option>
              <option value="CSHARP" className="bg-[#18181b] text-foreground">C# (.NET 8.0)</option>
              <option value="GO" className="bg-[#18181b] text-foreground">Go (1.22)</option>
              <option value="RUST" className="bg-[#18181b] text-foreground">Rust (1.77)</option>
              <option value="SQL" className="bg-[#18181b] text-foreground">SQL (SQLite 3 / ANSI)</option>
              <option value="PHP" className="bg-[#18181b] text-foreground">PHP (8.2)</option>
              <option value="RUBY" className="bg-[#18181b] text-foreground">Ruby (3.2)</option>
              <option value="KOTLIN" className="bg-[#18181b] text-foreground">Kotlin (JVM)</option>
              <option value="SWIFT" className="bg-[#18181b] text-foreground">Swift (5.9 Linux)</option>
              <option value="DART" className="bg-[#18181b] text-foreground">Dart (3.x SDK)</option>
              <option value="R" className="bg-[#18181b] text-foreground">R (GNU Rscript)</option>
              <option value="BASH" className="bg-[#18181b] text-foreground">Bash / Shell (5.2)</option>
              <option value="SCALA" className="bg-[#18181b] text-foreground">Scala (3.x CLI)</option>
              <option value="LUA" className="bg-[#18181b] text-foreground">Lua (5.4)</option>
              <option value="PERL" className="bg-[#18181b] text-foreground">Perl (5.38)</option>
            </select>
          </div>
        )}

        {/* Run Code / Stop Code Button */}
        {isRunning ? (
          <button
            onClick={onCancelExecution}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-sm animate-pulse cursor-pointer"
            title="Stop Execution"
          >
            <Square className="h-3.5 w-3.5 fill-current" />
            <span>
              {executionState === 'QUEUED'
                ? 'Queued...'
                : executionState === 'STARTING'
                ? 'Starting...'
                : 'Stop'}
            </span>
          </button>
        ) : (
          <button
            onClick={onRun}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer"
            title={`Execute ${activeFileName || 'code'} inside isolated Docker sandbox`}
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Run {activeFileName ? activeFileName : ''}</span>
          </button>
        )}

        {/* Run Automated Tests Button (Assignment Workspaces) */}
        {workspace?.assignmentId && onRunTests && (
          <button
            onClick={onRunTests}
            disabled={isRunning}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border bg-background hover:bg-muted disabled:opacity-50 transition-colors shadow-sm"
            title="Run Assignment Test Cases"
          >
            <FlaskConical className="h-3.5 w-3.5 text-primary" />
            <span>Test Cases</span>
          </button>
        )}

        {/* Manual Save Button */}
        <button
          onClick={onSave}
          disabled={isSaving || !hasUnsavedChanges}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border bg-background hover:bg-muted disabled:opacity-50 transition-colors shadow-sm"
          title="Save to Cloud (Ctrl + S)"
        >
          <Save className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Save</span>
          <kbd className="hidden lg:inline text-[10px] bg-muted/80 px-1 rounded text-muted-foreground">
            Ctrl+S
          </kbd>
        </button>

        {/* Reset to starter code (Assignment only) */}
        {workspace?.assignmentId && onReset && (
          <button
            onClick={onReset}
            className="p-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent transition-colors"
            title="Reset to Starter Code"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent transition-colors"
          title="Editor Settings"
        >
          <Settings className="h-3.5 w-3.5" />
        </button>

        {/* Submit Assignment Action */}
        {workspace?.assignmentId && onSubmit && (
          <button
            onClick={onSubmit}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Submit Solution</span>
          </button>
        )}
      </div>
    </header>
  );
}
