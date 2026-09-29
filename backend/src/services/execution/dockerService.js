import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import os from 'os';
import {
  EXECUTION_DEFAULTS,
  SAFE_ENV_VARS,
  sanitizeVirtualPath,
  truncateOutput,
} from './executionSecurity.js';
import { LANGUAGE_RUNTIMES, resolveEntryFile } from './languageRuntimes.js';

const execAsync = promisify(exec);

/**
 * On Windows, Docker Desktop may be installed in per-user AppData or Program Files.
 * If the current process environment lacks Docker in PATH, auto-resolve it.
 */
export function ensureDockerInPath() {
  if (process.platform !== 'win32') return;

  const currentPath = process.env.PATH || '';
  const candidateDirs = [
    path.join(process.env.LOCALAPPDATA || '', 'Programs', 'DockerDesktop', 'resources', 'bin'),
    path.join(process.env.ProgramFiles || 'C:\\Program Files', 'Docker', 'Docker', 'resources', 'bin'),
    path.join(process.env.ProgramData || 'C:\\ProgramData', 'DockerDesktop', 'version-bin'),
    'C:\\Program Files\\Docker\\Docker\\resources\\bin',
    'C:\\ProgramData\\DockerDesktop\\version-bin',
  ];

  for (const dir of candidateDirs) {
    try {
      if (fsSync.existsSync(path.join(dir, 'docker.exe'))) {
        if (!currentPath.includes(dir)) {
          process.env.PATH = `${dir};${currentPath}`;
        }
        break;
      }
    } catch (_) {}
  }
}

// Initial resolution on load
ensureDockerInPath();

let dockerHealthCache = {
  checkedAt: 0,
  isAvailable: false,
  version: null,
  error: null,
};

/**
 * Checks if Docker daemon is running and reachable
 * @param {boolean} force - Force re-evaluation without cache
 */
export async function checkDockerHealth(force = false) {
  ensureDockerInPath();
  const now = Date.now();
  if (!force && now - dockerHealthCache.checkedAt < 5000) {
    return dockerHealthCache;
  }

  try {
    const { stdout } = await execAsync('docker info --format "{{.ServerVersion}}"', {
      timeout: 3000,
    });
    dockerHealthCache = {
      checkedAt: now,
      isAvailable: true,
      version: stdout.trim(),
      error: null,
    };
  } catch (err) {
    dockerHealthCache = {
      checkedAt: now,
      isAvailable: false,
      version: null,
      error: err.message || 'Docker daemon not reachable or docker not installed',
    };
  }

  return dockerHealthCache;
}

/**
 * Stages workspace snapshot files into an isolated temporary directory
 */
export async function stageWorkspaceFiles(jobId, files = [], language = '') {
  const stageDir = path.join(os.tmpdir(), `unicodeide-sandbox-${jobId}`);
  await fs.mkdir(stageDir, { recursive: true });

  for (const file of files) {
    const safeRelPath = sanitizeVirtualPath(file.path);
    const destPath = path.join(stageDir, safeRelPath);

    // Ensure target folder exists
    await fs.mkdir(path.dirname(destPath), { recursive: true });
    await fs.writeFile(destPath, file.content || '', 'utf8');
  }

  const langUpper = (language || '').toUpperCase();

  // C# Auto-staging: Add minimal .csproj if none supplied by student
  if (langUpper === 'CSHARP') {
    const hasCsproj = files.some((f) => f.path?.endsWith('.csproj'));
    if (!hasCsproj) {
      const defaultCsproj = `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <EnableDefaultCompileItems>true</EnableDefaultCompileItems>
  </PropertyGroup>
</Project>\n`;
      await fs.writeFile(path.join(stageDir, 'unicodeide.csproj'), defaultCsproj, 'utf8');
    }
  }

  // SQL Auto-staging: Add secure, isolated in-memory SQLite runner script
  if (langUpper === 'SQL') {
    const sqlRunnerScript = `import sys
import sqlite3
import os

def run():
    if len(sys.argv) < 2:
        print("Usage: python3 _sql_runner.py <sql_file>", file=sys.stderr)
        sys.exit(1)
        
    sql_file = sys.argv[1]
    if not os.path.exists(sql_file):
        print(f"Error: SQL file '{sql_file}' not found.", file=sys.stderr)
        sys.exit(1)
        
    with open(sql_file, 'r', encoding='utf-8') as f:
        sql_content = f.read()

    # Ephemeral in-memory database - completely isolated from any host/app database
    conn = sqlite3.connect(':memory:')
    cursor = conn.cursor()

    # Pre-seed controlled sample tables for instant testing
    cursor.executescript("""
    CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        department TEXT NOT NULL,
        gpa REAL
    );
    INSERT INTO students (id, name, department, gpa) VALUES
        (1, 'Alex Mercer', 'Computer Science', 3.85),
        (2, 'Maya Lin', 'Data Science', 3.92),
        (3, 'Liam Chen', 'Software Engineering', 3.78),
        (4, 'Sofia Patel', 'Information Systems', 3.65);

    CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY,
        code TEXT NOT NULL,
        title TEXT NOT NULL,
        credits INTEGER NOT NULL
    );
    INSERT INTO courses (id, code, title, credits) VALUES
        (101, 'CS101', 'Data Structures & Algorithms', 4),
        (102, 'CS202', 'Database Management Systems', 3),
        (103, 'CS303', 'Distributed Systems', 4);

    CREATE TABLE IF NOT EXISTS enrollments (
        student_id INTEGER,
        course_id INTEGER,
        grade TEXT,
        FOREIGN KEY(student_id) REFERENCES students(id),
        FOREIGN KEY(course_id) REFERENCES courses(id)
    );
    INSERT INTO enrollments (student_id, course_id, grade) VALUES
        (1, 101, 'A'),
        (1, 102, 'A-'),
        (2, 102, 'A'),
        (3, 101, 'B+'),
        (4, 103, 'A');
    """)
    conn.commit()

    statements = [s.strip() for s in sql_content.split(';') if s.strip()]
    if not statements:
        print("[SQL] Query executed: (empty query)")
        return

    for idx, stmt in enumerate(statements):
        try:
            cursor.execute(stmt)
            if cursor.description:
                cols = [col[0] for col in cursor.description]
                rows = cursor.fetchall()
                col_widths = [len(c) for c in cols]
                for row in rows:
                    for i, val in enumerate(row):
                        col_widths[i] = max(col_widths[i], len(str(val)))
                
                header_line = " | ".join(c.ljust(col_widths[i]) for i, c in enumerate(cols))
                sep_line = "-+-".join("-" * col_widths[i] for i in range(len(cols)))
                
                print(header_line)
                print(sep_line)
                for row in rows:
                    row_line = " | ".join(str(val).ljust(col_widths[i]) for i, val in enumerate(row))
                    print(row_line)
                print(f"({len(rows)} row{'s' if len(rows) != 1 else ''})\\n")
            else:
                conn.commit()
                affected = cursor.rowcount
                if affected >= 0:
                    print(f"Query OK, {affected} row{'s' if affected != 1 else ''} affected\\n")
                else:
                    print("Query OK\\n")
        except sqlite3.OperationalError as e:
            print(f"SQL Syntax Error: {e}", file=sys.stderr)
            sys.exit(1)
        except Exception as e:
            print(f"SQL Execution Error: {e}", file=sys.stderr)
            sys.exit(1)
    
    conn.close()

if __name__ == '__main__':
    run()
`;
    await fs.writeFile(path.join(stageDir, '_sql_runner.py'), sqlRunnerScript, 'utf8');
  }

  return stageDir;
}

/**
 * Clean up temporary stage directory
 */
export async function cleanupStageDirectory(stageDir) {
  if (!stageDir) return;
  try {
    await fs.rm(stageDir, { recursive: true, force: true });
  } catch (err) {
    // Ignore cleanup error
  }
}

/**
 * Forcefully stops and removes a Docker container by name or ID
 */
export async function killAndRemoveContainer(containerName) {
  if (!containerName) return;
  try {
    await execAsync(`docker rm -f ${containerName}`, { timeout: 4000 });
  } catch (err) {
    // Ignore if already exited or removed
  }
}

/**
 * Executes code inside an ephemeral sandboxed Docker container
 *
 * @param {Object} options
 * @param {string} options.jobId
 * @param {string} options.language
 * @param {Array} options.files - Workspace files snapshot
 * @param {string} [options.stdinInput] - Standard input string for interactive/test execution
 * @param {number} [options.timeoutMs] - Timeout in milliseconds
 * @param {number} [options.memoryMb] - Memory limit in MB
 * @param {number} [options.cpuLimit] - CPU quota
 */
export async function runDockerSandbox({
  jobId,
  language,
  files = [],
  stdinInput = '',
  entryFile: customEntryFile = null,
  timeoutMs = EXECUTION_DEFAULTS.TIMEOUT_MS,
  memoryMb = EXECUTION_DEFAULTS.MEMORY_MB,
  cpuLimit = EXECUTION_DEFAULTS.CPU_LIMIT,
}) {
  const health = await checkDockerHealth();
  if (!health.isAvailable) {
    const error = new Error('Code execution temporarily unavailable. Your workspace is safe and saved.');
    error.code = 'EXECUTION_ENGINE_UNAVAILABLE';
    error.statusCode = 503;
    throw error;
  }

  const runtime = LANGUAGE_RUNTIMES[language?.toUpperCase()];
  if (!runtime) {
    throw new Error(`Unsupported programming language: ${language}`);
  }

  const effectiveTimeoutMs = Math.max(timeoutMs, runtime.timeoutMs || EXECUTION_DEFAULTS.TIMEOUT_MS);
  const effectiveMemoryMb = Math.max(memoryMb, runtime.memoryMb || EXECUTION_DEFAULTS.MEMORY_MB);
  const effectiveCpuLimit = Math.max(cpuLimit, runtime.cpuLimit || EXECUTION_DEFAULTS.CPU_LIMIT);
  const effectivePidsLimit = runtime.pidsLimit || EXECUTION_DEFAULTS.PIDS_LIMIT;

  const entryFile = customEntryFile || resolveEntryFile(files, language);
  const containerName = `unicodeide-exec-${jobId}-${Date.now().toString(36)}`;
  let stageDir = null;
  const startTime = Date.now();

  try {
    // 1. Stage files securely on host filesystem
    stageDir = await stageWorkspaceFiles(jobId, files, language);

    // 2. Compilation step (if compiled language)
    let compileOutput = '';
    if (runtime.isCompiled && runtime.compileCommand) {
      const compileCmd = runtime.compileCommand(entryFile);
      const compileResult = await spawnDockerProcess({
        containerName: `${containerName}-compile`,
        image: runtime.image,
        stageDir,
        command: compileCmd,
        timeoutMs: Math.min(effectiveTimeoutMs, EXECUTION_DEFAULTS.MAX_TIMEOUT_MS),
        memoryMb: Math.max(effectiveMemoryMb, 256),
        cpuLimit: effectiveCpuLimit,
        pidsLimit: effectivePidsLimit,
        readOnlyWorkspace: false, // Compiler needs to generate binary
        stdinInput: '',
        jobId,
      });

      compileOutput = (compileResult.stdout + '\n' + compileResult.stderr).trim();

      if (compileResult.exitCode !== 0) {
        return {
          status: 'COMPILE_ERROR',
          exitCode: compileResult.exitCode,
          signal: compileResult.signal,
          stdout: '',
          stderr: compileResult.stderr || compileResult.stdout || 'Compilation failed',
          compileOutput,
          durationMs: Date.now() - startTime,
          timedOut: compileResult.timedOut,
          outputLimitExceeded: compileResult.outputLimitExceeded,
        };
      }
    }

    // 3. Execution step
    const runCmd = runtime.runCommand(entryFile);
    const runResult = await spawnDockerProcess({
      containerName,
      image: runtime.image,
      stageDir,
      command: runCmd,
      timeoutMs: effectiveTimeoutMs,
      memoryMb: effectiveMemoryMb,
      cpuLimit: effectiveCpuLimit,
      pidsLimit: effectivePidsLimit,
      readOnlyWorkspace: false,
      stdinInput,
      jobId,
    });

    const durationMs = Date.now() - startTime;

    let finalStatus = 'PASSED';
    if (runResult.timedOut) {
      finalStatus = 'TIMEOUT';
    } else if (runResult.outputLimitExceeded) {
      finalStatus = 'OUTPUT_LIMIT';
    } else if (runResult.exitCode !== 0) {
      const errText = (runResult.stderr + '\n' + runResult.stdout).toLowerCase();
      const langUpper = language?.toUpperCase();
      if (
        (langUpper === 'SQL' && errText.includes('syntax error')) ||
        (langUpper === 'PHP' && (errText.includes('parse error') || errText.includes('syntax error'))) ||
        (langUpper === 'PERL' && errText.includes('syntax error')) ||
        (langUpper === 'BASH' && (errText.includes('syntax error') || errText.includes('unexpected end of file'))) ||
        (langUpper === 'SCALA' && (errText.includes('error:') || errText.includes('compilation failed')))
      ) {
        finalStatus = 'COMPILE_ERROR';
      } else {
        finalStatus = 'RUNTIME_ERROR';
      }
    }

    return {
      status: finalStatus,
      exitCode: runResult.exitCode,
      signal: runResult.signal,
      stdout: runResult.stdout,
      stderr: runResult.stderr,
      compileOutput,
      durationMs,
      timedOut: runResult.timedOut,
      outputLimitExceeded: runResult.outputLimitExceeded,
      containerId: containerName,
    };
  } finally {
    // Guaranteed cleanup: remove staging directory and container
    await cleanupStageDirectory(stageDir);
    await killAndRemoveContainer(containerName);
  }
}

/**
 * Spawns a docker process with strict security restrictions and collected I/O
 */
function spawnDockerProcess({
  containerName,
  image,
  stageDir,
  command,
  timeoutMs,
  memoryMb,
  cpuLimit,
  pidsLimit = EXECUTION_DEFAULTS.PIDS_LIMIT,
  readOnlyWorkspace,
  stdinInput = '',
  jobId,
}) {
  return new Promise((resolve) => {
    const mountMode = readOnlyWorkspace ? 'ro' : 'rw';
    // Normalize path for docker volume mount on Windows
    const dockerMountPath = stageDir.replace(/\\/g, '/');

    const dockerArgs = [
      'run',
      '--name', containerName,
      '--rm',
      '--label', 'unicodeide.execution=true',
      '--label', `unicodeide.job=${jobId}`,
      '--network', 'none', // Absolutely no network access
      '--cap-drop=ALL', // Drop all Linux capabilities
      '--security-opt', 'no-new-privileges',
      '--pids-limit', String(pidsLimit), // Fork bomb protection
      '-m', `${memoryMb}m`, // Memory limit
      '--cpus', String(cpuLimit), // CPU quota
      '-v', `${dockerMountPath}:/workspace:${mountMode}`,
      '-w', '/workspace',
      '-i', // Allow stdin feeding
    ];

    // Add safe environment variables
    for (const [key, val] of Object.entries(SAFE_ENV_VARS)) {
      dockerArgs.push('-e', `${key}=${val}`);
    }

    dockerArgs.push(image);
    dockerArgs.push(...command);

    let stdoutData = '';
    let stderrData = '';
    let timedOut = false;
    let outputLimitExceeded = false;
    let isTerminated = false;

    const child = spawn('docker', dockerArgs, {
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true,
    });

    let timeoutTimer = null;

    if (timeoutMs > 0) {
      timeoutTimer = setTimeout(async () => {
        timedOut = true;
        isTerminated = true;
        try {
          await killAndRemoveContainer(containerName);
          child.kill('SIGKILL');
        } catch (e) {
          // ignore
        }
      }, timeoutMs);
    }

    if (stdinInput && child.stdin) {
      try {
        child.stdin.write(stdinInput);
        child.stdin.end();
      } catch (err) {
        // ignore stdin write error
      }
    } else if (child.stdin) {
      child.stdin.end();
    }

    child.stdout.on('data', (chunk) => {
      if (isTerminated) return;
      stdoutData += chunk.toString('utf8');
      if (Buffer.byteLength(stdoutData, 'utf8') > EXECUTION_DEFAULTS.OUTPUT_LIMIT_BYTES) {
        outputLimitExceeded = true;
        isTerminated = true;
        killAndRemoveContainer(containerName);
        child.kill('SIGKILL');
      }
    });

    child.stderr.on('data', (chunk) => {
      if (isTerminated) return;
      stderrData += chunk.toString('utf8');
      if (Buffer.byteLength(stderrData, 'utf8') > EXECUTION_DEFAULTS.OUTPUT_LIMIT_BYTES) {
        outputLimitExceeded = true;
        isTerminated = true;
        killAndRemoveContainer(containerName);
        child.kill('SIGKILL');
      }
    });

    child.on('error', async (err) => {
      if (timeoutTimer) clearTimeout(timeoutTimer);
      await killAndRemoveContainer(containerName);
      resolve({
        exitCode: 1,
        signal: null,
        stdout: '',
        stderr: err.message,
        timedOut: false,
        outputLimitExceeded: false,
      });
    });

    child.on('close', (code, signal) => {
      if (timeoutTimer) clearTimeout(timeoutTimer);

      const truncatedStdout = truncateOutput(stdoutData);
      const truncatedStderr = truncateOutput(stderrData);

      resolve({
        exitCode: timedOut ? 124 : code,
        signal: signal || (timedOut ? 'SIGKILL' : null),
        stdout: truncatedStdout.text,
        stderr: truncatedStderr.text,
        timedOut,
        outputLimitExceeded: outputLimitExceeded || truncatedStdout.truncated || truncatedStderr.truncated,
      });
    });
  });
}

/**
 * Sweeps and cleans orphan UniCodeIDE containers
 */
export async function sweepOrphanContainers() {
  try {
    const { stdout } = await execAsync(
      'docker ps -a --filter "label=unicodeide.execution=true" --format "{{.ID}}"',
      { timeout: 5000 }
    );
    const containerIds = stdout.trim().split(/\s+/).filter(Boolean);
    for (const id of containerIds) {
      await killAndRemoveContainer(id);
    }
    return containerIds.length;
  } catch (err) {
    return 0;
  }
}
