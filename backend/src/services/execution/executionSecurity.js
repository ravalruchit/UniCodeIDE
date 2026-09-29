import path from 'path';

export const EXECUTION_DEFAULTS = {
  TIMEOUT_MS: parseInt(process.env.EXECUTION_TIMEOUT_MS, 10) || 5000,
  MAX_TIMEOUT_MS: 45000,
  MEMORY_MB: parseInt(process.env.EXECUTION_MEMORY_MB, 10) || 256,
  MAX_MEMORY_MB: 512,
  CPU_LIMIT: parseFloat(process.env.EXECUTION_CPU_LIMIT) || 1.0,
  MAX_CPU_LIMIT: 2.0,
  PIDS_LIMIT: parseInt(process.env.EXECUTION_PIDS_LIMIT, 10) || 64,
  OUTPUT_LIMIT_BYTES: parseInt(process.env.EXECUTION_OUTPUT_LIMIT_BYTES, 10) || 65536, // 64 KB
  MAX_CONCURRENT_EXECUTIONS: parseInt(process.env.MAX_CONCURRENT_EXECUTIONS, 10) || 2,
  MAX_QUEUE_SIZE: 25,
  MAX_REQUESTS_PER_MINUTE: 20,
};

// Safe environment variables permitted inside execution containers
export const SAFE_ENV_VARS = {
  PATH: '/usr/lib/dart/bin:/usr/lib/kotlinc/bin:/usr/local/go/bin:/usr/local/cargo/bin:/usr/share/dotnet:/opt/java/openjdk/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
  LANG: 'C.UTF-8',
  LC_ALL: 'C.UTF-8',
  HOME: '/tmp',
  PYTHONUNBUFFERED: '1',
  NODE_ENV: 'production',
};

// In-memory rate limiting map: userId -> [timestamps]
const userExecutionRateMap = new Map();

/**
 * Checks per-student execution rate limit
 * @param {string} userId 
 * @returns {boolean} true if allowed, false if limit exceeded
 */
export function checkRateLimit(userId) {
  if (!userId) return false;
  const now = Date.now();
  const windowMs = 60 * 1000;
  const timestamps = userExecutionRateMap.get(userId) || [];

  // Filter out timestamps older than 1 minute
  const recent = timestamps.filter((t) => now - t < windowMs);

  if (recent.length >= EXECUTION_DEFAULTS.MAX_REQUESTS_PER_MINUTE) {
    userExecutionRateMap.set(userId, recent);
    return false;
  }

  recent.push(now);
  userExecutionRateMap.set(userId, recent);
  return true;
}

/**
 * Reset rate limit for user (useful for test suites)
 */
export function resetRateLimit(userId) {
  if (userId) {
    userExecutionRateMap.delete(userId);
  } else {
    userExecutionRateMap.clear();
  }
}

/**
 * Validates virtual relative path to prevent directory traversal
 */
export function sanitizeVirtualPath(inputPath) {
  if (!inputPath || typeof inputPath !== 'string') {
    throw new Error('Invalid path format');
  }

  // Reject traversal sequences and root paths
  if (
    inputPath.includes('..') ||
    inputPath.startsWith('/') ||
    inputPath.startsWith('\\') ||
    /^[a-zA-Z]:/.test(inputPath)
  ) {
    throw new Error('Path traversal or invalid path detected');
  }

  const normalized = path.posix.normalize(inputPath.replace(/\\/g, '/'));
  if (normalized.startsWith('../') || normalized === '..') {
    throw new Error('Directory traversal attempt blocked');
  }

  return normalized;
}

/**
 * Truncates stdout/stderr if exceeding output limit
 */
export function truncateOutput(output, limitBytes = EXECUTION_DEFAULTS.OUTPUT_LIMIT_BYTES) {
  if (!output) return { text: '', truncated: false };

  const buf = Buffer.from(output, 'utf8');
  if (buf.length <= limitBytes) {
    return { text: output, truncated: false };
  }

  const truncatedSlice = buf.subarray(0, limitBytes).toString('utf8');
  return {
    text: truncatedSlice + '\n\n[OUTPUT_LIMIT_EXCEEDED: Process output exceeded 64KB limit and was truncated]',
    truncated: true,
  };
}

/**
 * Normalizes test output for deterministic comparison
 */
export function normalizeTestOutput(rawOutput) {
  if (typeof rawOutput !== 'string') return '';
  return rawOutput
    .replace(/\r\n/g, '\n') // Normalize Windows CRLF to LF
    .replace(/\r/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd()) // Trim trailing spaces on each line
    .join('\n')
    .trim(); // Trim leading/trailing blank lines
}

/**
 * Masks test cases for student response (hides details if isHidden === true)
 */
export function maskHiddenTests(testResults = []) {
  return testResults.map((t) => {
    const isHidden = t.isHidden === true;
    return {
      testCaseId: t.testCaseId,
      name: t.name,
      status: t.status,
      points: t.points,
      earnedPoints: t.earnedPoints,
      isHidden,
      // Mask input and expected output for hidden test cases
      input: isHidden ? '[HIDDEN_TEST_CASE]' : t.input,
      expectedOutput: isHidden ? '[HIDDEN_TEST_CASE]' : t.expectedOutput,
      actualOutput: isHidden ? (t.status === 'PASSED' ? '[PASSED]' : '[HIDDEN_OUTPUT]') : t.actualOutput,
      executionTimeMs: t.executionTimeMs,
      error: isHidden && t.status !== 'PASSED' ? 'Hidden test case failed.' : t.error,
    };
  });
}
