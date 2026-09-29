import React, { useState, useRef } from 'react';
import {
  Terminal,
  Info,
  AlertTriangle,
  Cpu,
  Layers,
  FlaskConical,
  CheckCircle2,
  XCircle,
  Clock,
  Lock,
  History,
  RotateCcw,
  Play,
  Square,
  AlertOctagon,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Trash2,
} from 'lucide-react';
import { EXECUTION_UI_STATES } from '../../hooks/useCodeExecution';

export function WorkspaceOutputPanel({
  workspace,
  files = [],
  executionState = 'IDLE',
  isRunning = false,
  executionResult = null,
  errorMessage = null,
  recentRuns = [],
  onRunCode,
  onRunTests,
  onClearOutput,
}) {
  const [activeTab, setActiveTab] = useState('output');
  const [panelHeight, setPanelHeight] = useState(240);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [copied, setCopied] = useState(false);

  const panelHeightRef = useRef(panelHeight);
  panelHeightRef.current = panelHeight;

  const totalBytes = files.reduce((acc, f) => acc + (f.size || 0), 0);
  const sizeKb = (totalBytes / 1024).toFixed(1);

  // Switch to tests tab automatically if tests result arrives
  React.useEffect(() => {
    if (executionResult?.tests?.length > 0) {
      setActiveTab('tests');
      setIsMinimized(false);
    } else if (executionResult?.stdout || executionResult?.stderr || executionResult?.compileOutput) {
      setActiveTab('output');
      setIsMinimized(false);
    }
  }, [executionResult]);

  // Draggable vertical resizing like VS Code (up/down)
  const handleMouseDown = (e) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = panelHeightRef.current;

    const handleMouseMove = (moveEvent) => {
      // Dragging mouse UP increases panel height; dragging DOWN decreases panel height
      const deltaY = startY - moveEvent.clientY;
      const newHeight = Math.max(90, Math.min(window.innerHeight - 120, startHeight + deltaY));
      setPanelHeight(newHeight);
      setIsMinimized(false);
      setIsMaximized(false);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleCopy = () => {
    let textToCopy = '';
    if (activeTab === 'output') {
      if (executionResult) {
        const parts = [];
        if (executionResult.compileOutput) parts.push(`--- COMPILER OUTPUT ---\n${executionResult.compileOutput}`);
        if (executionResult.stdout) parts.push(`--- STANDARD OUTPUT ---\n${executionResult.stdout}`);
        if (executionResult.stderr) parts.push(`--- STANDARD ERROR ---\n${executionResult.stderr}`);
        parts.push(`Status: ${executionResult.status} | Exit Code: ${executionResult.exitCode ?? 0} | Runtime: ${executionResult.durationMs || 0}ms`);
        textToCopy = parts.join('\n\n');
      } else if (errorMessage) {
        textToCopy = errorMessage;
      } else {
        textToCopy = `[Workspace Ready] ${workspace?.name || 'UniCodeIDE'}\nLanguage: ${workspace?.language || 'PYTHON'}`;
      }
    } else if (activeTab === 'terminal') {
      textToCopy = executionResult?.stdout || 'UniCodeIDE Sandbox Terminal [Interactive PTY]\nEnvironment: Alpine Linux • Network: None • User: sandbox';
    } else if (activeTab === 'problems') {
      textToCopy = executionResult?.compileOutput || executionResult?.stderr || errorMessage || 'No problems reported.';
    } else if (activeTab === 'tests') {
      if (executionResult?.tests?.length) {
        textToCopy = executionResult.tests.map(t => `${t.name}: ${t.status} (${t.earnedPoints}/${t.points} pts)`).join('\n');
      } else {
        textToCopy = 'No automated tests run yet.';
      }
    } else if (activeTab === 'history') {
      textToCopy = recentRuns?.map(r => `Run #${r.id?.slice(-4)}: ${r.status} (${r.programmingLanguage})`).join('\n') || 'No run history.';
    }

    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(err => {
        console.error('Failed to copy: ', err);
      });
    }
  };

  const hasProblems = Boolean(
    executionResult?.compileOutput ||
      (executionResult?.stderr && executionResult?.exitCode !== 0) ||
      errorMessage
  );

  return (
    <div
      style={{ height: isMinimized ? '37px' : isMaximized ? '75vh' : `${panelHeight}px` }}
      className="border-t border-border bg-card/80 flex flex-col shrink-0 text-left transition-[height] duration-75 relative z-10"
    >
      {/* Draggable Top Border Handle (VS Code style up/down resize) */}
      <div
        onMouseDown={handleMouseDown}
        className="h-1.5 w-full -mt-1 cursor-row-resize hover:bg-primary/60 active:bg-primary transition-colors flex items-center justify-center group z-30 select-none"
        title="Drag up or down to resize panel"
      >
        <div className="h-0.5 w-10 rounded-full bg-border group-hover:bg-primary transition-colors" />
      </div>

      {/* Panel Tab Bar */}
      <div className="h-9 border-b border-border flex items-center justify-between px-3 text-xs bg-muted/20 select-none">
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setActiveTab('output');
              setIsMinimized(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'output'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Info className="h-3.5 w-3.5" />
            <span>Output</span>
            {isRunning && <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />}
          </button>

          {workspace?.assignmentId && (
            <button
              onClick={() => {
                setActiveTab('tests');
                setIsMinimized(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'tests'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <FlaskConical className="h-3.5 w-3.5" />
              <span>Tests</span>
              {executionResult?.summary?.total > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    executionResult.summary.failed === 0
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : 'bg-rose-500/10 text-rose-500'
                  }`}
                >
                  {executionResult.summary.passed}/{executionResult.summary.total}
                </span>
              )}
            </button>
          )}

          <button
            onClick={() => {
              setActiveTab('terminal');
              setIsMinimized(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'terminal'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            <span>Terminal</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('problems');
              setIsMinimized(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'problems'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <AlertTriangle className={`h-3.5 w-3.5 ${hasProblems ? 'text-rose-500' : ''}`} />
            <span>Problems {hasProblems ? '(1)' : '(0)'}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('history');
              setIsMinimized(false);
            }}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>History</span>
          </button>
        </div>

        {/* Panel Actions & Workspace Telemetry */}
        <div className="flex items-center gap-2">
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer border border-border/40"
            title="Copy current output / terminal text to clipboard"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>Copy</span>
              </>
            )}
          </button>

          {/* Clear Output Button */}
          {onClearOutput && (
            <button
              onClick={onClearOutput}
              className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium text-muted-foreground hover:text-rose-400 hover:bg-muted/60 transition-colors cursor-pointer border border-border/40"
              title="Clear output and terminal display"
            >
              <Trash2 className="h-3 w-3" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}

          <div className="h-3 w-px bg-border/60 mx-0.5 hidden sm:block" />

          {/* Workspace Telemetry */}
          <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
            <span>{files.length} files</span>
            <span>•</span>
            <span>{sizeKb} KB</span>
            <span>•</span>
            <span className="uppercase text-primary font-medium">{workspace?.language || 'PYTHON'}</span>
          </div>

          <div className="h-3 w-px bg-border/60 mx-0.5" />

          {/* Minimize / Expand Toggle */}
          <button
            onClick={() => {
              setIsMinimized(!isMinimized);
              if (isMaximized) setIsMaximized(false);
            }}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
            title={isMinimized ? 'Restore Panel' : 'Minimize Panel'}
          >
            {isMinimized ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>

          {/* Maximize / Normal Toggle */}
          <button
            onClick={() => {
              setIsMaximized(!isMaximized);
              if (isMinimized) setIsMinimized(false);
            }}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
            title={isMaximized ? 'Restore Default Height' : 'Maximize Panel'}
          >
            {isMaximized ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Panel Content Body */}
      {!isMinimized && (
        <div className="flex-1 p-3 overflow-y-auto font-mono text-xs text-foreground/90 leading-relaxed bg-background/50 select-text">
          {/* 1. OUTPUT TAB */}
          {activeTab === 'output' && (
            <div className="space-y-2 select-text">
              {isRunning && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500">
                <Clock className="h-4 w-4 animate-spin" />
                <span className="font-semibold text-xs">
                  {executionState === 'QUEUED'
                    ? 'Execution queued... Waiting for worker slot.'
                    : 'Running in ephemeral Docker sandbox...'}
                </span>
              </div>
            )}

            {executionState === EXECUTION_UI_STATES.UNAVAILABLE && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 space-y-1">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertOctagon className="h-4 w-4" />
                  <span>Execution Engine Notice</span>
                </div>
                <p className="text-xs text-amber-500/90">
                  {errorMessage ||
                    'Code execution temporarily unavailable. Your workspace is safe and saved.'}
                </p>
              </div>
            )}

            {errorMessage && executionState !== EXECUTION_UI_STATES.UNAVAILABLE && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500">
                <p className="font-semibold">{errorMessage}</p>
              </div>
            )}

            {executionResult ? (
              <div className="space-y-2">
                {/* Status Bar */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40 border border-border text-[11px]">
                  <div className="flex items-center gap-2">
                    {executionResult.status === 'PASSED' ? (
                      <span className="flex items-center gap-1 text-emerald-500 font-semibold">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Execution Completed</span>
                      </span>
                    ) : executionResult.status === 'TIMEOUT' ? (
                      <span className="flex items-center gap-1 text-amber-500 font-semibold">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>Execution Timed Out</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-rose-500 font-semibold">
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Execution {executionResult.status}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span>Exit Code: {executionResult.exitCode ?? 'N/A'}</span>
                    <span>•</span>
                    <span>Runtime: {executionResult.durationMs || 0} ms</span>
                  </div>
                </div>

                {/* Compile Output */}
                {executionResult.compileOutput && (
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">
                      Compiler Output:
                    </span>
                    <pre className="p-2.5 rounded bg-muted/30 border border-border text-xs text-amber-400 whitespace-pre-wrap select-text font-mono">
                      {executionResult.compileOutput}
                    </pre>
                  </div>
                )}

                {/* Standard Output */}
                {executionResult.stdout && (
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Standard Output:</span>
                    <pre className="p-2.5 rounded bg-muted/30 border border-border text-xs whitespace-pre-wrap select-text font-mono">
                      {executionResult.stdout}
                    </pre>
                  </div>
                )}

                {/* Standard Error */}
                {executionResult.stderr && (
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-rose-400">Standard Error:</span>
                    <pre className="p-2.5 rounded bg-rose-950/20 border border-rose-900/30 text-xs text-rose-300 whitespace-pre-wrap select-text font-mono">
                      {executionResult.stderr}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              !isRunning &&
              executionState !== EXECUTION_UI_STATES.UNAVAILABLE && (
                <div className="space-y-1 text-muted-foreground">
                  <p className="text-foreground/90 font-semibold">
                    <span className="text-emerald-500">[Workspace Ready]</span> {workspace?.name}
                  </p>
                  <p>
                    Click <strong className="text-foreground">Run ▶</strong> in the top header to execute your code inside an isolated Docker sandbox.
                  </p>
                  <p className="text-muted-foreground/80">
                    Execution runs with strict memory limits, CPU quotas, and zero outbound network access.
                  </p>
                </div>
              )
            )}
          </div>
        )}

        {/* 2. TESTS TAB */}
        {activeTab === 'tests' && (
          <div className="space-y-3">
            {executionResult?.tests?.length > 0 ? (
              <>
                {/* Summary Banner */}
                <div className="p-2.5 rounded-lg bg-muted/40 border border-border flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">Test Suite Outcome:</span>
                    <span
                      className={`font-bold ${
                        executionResult.summary.failed === 0 ? 'text-emerald-500' : 'text-rose-500'
                      }`}
                    >
                      {executionResult.summary.passed} / {executionResult.summary.total} Passed (
                      {executionResult.summary.score}%)
                    </span>
                  </div>
                  {executionResult.summary.totalPoints > 0 && (
                    <span className="text-muted-foreground">
                      Points: {executionResult.summary.earnedPoints} / {executionResult.summary.totalPoints}
                    </span>
                  )}
                </div>

                {/* Test Cards List */}
                <div className="space-y-2">
                  {executionResult.tests.map((t, idx) => (
                    <div
                      key={t.testCaseId || idx}
                      className="p-3 rounded-lg border border-border bg-card/40 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {t.status === 'PASSED' ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          ) : (
                            <XCircle className="h-4 w-4 text-rose-500 shrink-0" />
                          )}
                          <span className="font-semibold text-foreground">{t.name}</span>
                          {t.isHidden && (
                            <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                              <Lock className="h-3 w-3" />
                              <span>Hidden Test</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          <span>{t.executionTimeMs} ms</span>
                          <span>•</span>
                          <span>
                            {t.earnedPoints}/{t.points} pts
                          </span>
                        </div>
                      </div>

                      {/* Input / Expected / Actual details */}
                      {!t.isHidden ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                          <div className="space-y-0.5">
                            <span className="text-muted-foreground">Expected Output:</span>
                            <pre className="p-1.5 rounded bg-muted/40 border border-border overflow-x-auto">
                              {t.expectedOutput || '(empty)'}
                            </pre>
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-muted-foreground">Actual Output:</span>
                            <pre
                              className={`p-1.5 rounded border overflow-x-auto ${
                                t.status === 'PASSED'
                                  ? 'bg-muted/40 border-border text-emerald-400'
                                  : 'bg-rose-950/20 border-rose-900/40 text-rose-400'
                              }`}
                            >
                              {t.actualOutput || '(empty)'}
                            </pre>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] text-muted-foreground italic">
                          Test case input and expected outputs are confidential to prevent hardcoded solutions.
                        </p>
                      )}

                      {t.error && (
                        <p className="text-[11px] text-rose-400">Error: {t.error}</p>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-4 space-y-2 text-muted-foreground">
                <FlaskConical className="h-8 w-8 mx-auto text-primary/60" />
                <p className="text-sm font-semibold text-foreground">No Automated Tests Run Yet</p>
                <p className="text-xs max-w-md mx-auto">
                  Click the <strong>Test Cases</strong> button in the header or run test evaluation against this assignment.
                </p>
                {onRunTests && (
                  <button
                    onClick={onRunTests}
                    disabled={isRunning}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Run Assignment Test Cases
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* 3. TERMINAL TAB */}
        {activeTab === 'terminal' && (
          <div className="space-y-3">
            <div className="p-2.5 rounded-lg bg-muted/30 border border-border space-y-1">
              <div className="flex items-center gap-2 text-primary font-semibold text-xs">
                <Cpu className="h-4 w-4" />
                <span>Sandbox Terminal Environment</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Commands execute inside an isolated temporary container. They cannot access the UniCodeIDE host system or student database.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-black text-emerald-400 font-mono text-xs space-y-2 border border-border min-h-[100px] select-text">
              <p className="text-muted-foreground">UniCodeIDE Sandbox Terminal [Interactive PTY]</p>
              <p className="text-muted-foreground">Environment: Alpine Linux • Network: None • User: sandbox</p>
              <div className="flex items-center gap-2 text-foreground">
                <span className="text-emerald-500 font-bold">$</span>
                <span className="text-muted-foreground italic">
                  Run commands using the Run button in the header or start an interactive session.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 4. PROBLEMS TAB */}
        {activeTab === 'problems' && (
          <div className="space-y-2 select-text">
            {hasProblems ? (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 space-y-1 select-text">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Execution Diagnostics</span>
                </div>
                <pre className="text-xs whitespace-pre-wrap font-mono mt-1 text-rose-400 select-text">
                  {executionResult?.compileOutput || executionResult?.stderr || errorMessage}
                </pre>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground py-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>No compilation or runtime errors reported.</span>
              </div>
            )}
          </div>
        )}

        {/* 5. HISTORY TAB */}
        {activeTab === 'history' && (
          <div className="space-y-2">
            {recentRuns?.length > 0 ? (
              <div className="space-y-1">
                {recentRuns.map((run, idx) => (
                  <div
                    key={run.id || idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground font-mono">
                        Run #{run.id?.slice(-4)}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                          run.status === 'COMPLETED'
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : run.status === 'TIMEOUT'
                            ? 'bg-amber-500/10 text-amber-500'
                            : 'bg-rose-500/10 text-rose-500'
                        }`}
                      >
                        {run.status}
                      </span>
                      <span className="text-muted-foreground font-mono">r{run.sourceRevision}</span>
                    </div>

                    <div className="flex items-center gap-3 text-muted-foreground text-[11px]">
                      <span>{run.programmingLanguage}</span>
                      <span>•</span>
                      <span>{new Date(run.requestedAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground py-2">No previous executions recorded for this workspace.</p>
            )}
          </div>
        )}
      </div>
    )}
  </div>
);
}
