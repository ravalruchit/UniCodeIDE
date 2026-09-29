import { runDockerSandbox } from './dockerService.js';
import { normalizeTestOutput } from './executionSecurity.js';

/**
 * Runs test cases against a student's workspace code snapshot inside Docker sandboxes
 *
 * @param {Object} options
 * @param {string} options.jobId
 * @param {string} options.language
 * @param {Array} options.files - Workspace files snapshot
 * @param {Array} options.testCases - Assignment test cases
 * @param {number} [options.timeoutMs]
 * @param {number} [options.memoryMb]
 */
export async function runAssignmentTests({
  jobId,
  language,
  files = [],
  testCases = [],
  timeoutMs = 5000,
  memoryMb = 256,
}) {
  const testResults = [];
  let totalPoints = 0;
  let earnedPoints = 0;
  let passedCount = 0;
  let compileErrorEncountered = null;

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    const points = typeof tc.points === 'number' ? tc.points : 10;
    totalPoints += points;

    // If a previous test encountered a compilation error, skip execution for remaining tests
    if (compileErrorEncountered) {
      testResults.push({
        testCaseId: tc._id,
        name: tc.name || `Test Case #${i + 1}`,
        status: 'COMPILE_ERROR',
        input: tc.input || '',
        expectedOutput: tc.expectedOutput || '',
        actualOutput: '',
        executionTimeMs: 0,
        memoryUsedBytes: 0,
        error: compileErrorEncountered.stderr || 'Compilation failed',
        points,
        earnedPoints: 0,
        isHidden: Boolean(tc.isHidden),
      });
      continue;
    }

    try {
      const execResult = await runDockerSandbox({
        jobId: `${jobId}-tc${i + 1}`,
        language,
        files,
        stdinInput: tc.input || '',
        timeoutMs,
        memoryMb,
      });

      if (execResult.status === 'COMPILE_ERROR') {
        compileErrorEncountered = execResult;
        testResults.push({
          testCaseId: tc._id,
          name: tc.name || `Test Case #${i + 1}`,
          status: 'COMPILE_ERROR',
          input: tc.input || '',
          expectedOutput: tc.expectedOutput || '',
          actualOutput: '',
          executionTimeMs: execResult.durationMs,
          memoryUsedBytes: 0,
          error: execResult.stderr || execResult.compileOutput || 'Compilation failed',
          points,
          earnedPoints: 0,
          isHidden: Boolean(tc.isHidden),
        });
        continue;
      }

      const normalizedActual = normalizeTestOutput(execResult.stdout);
      const normalizedExpected = normalizeTestOutput(tc.expectedOutput);

      let status = 'FAILED';
      let earned = 0;

      if (execResult.status === 'TIMEOUT') {
        status = 'TIMEOUT';
      } else if (execResult.status === 'OUTPUT_LIMIT') {
        status = 'OUTPUT_LIMIT';
      } else if (execResult.status === 'RUNTIME_ERROR') {
        status = 'RUNTIME_ERROR';
      } else if (normalizedActual === normalizedExpected) {
        status = 'PASSED';
        earned = points;
        passedCount++;
      } else {
        status = 'FAILED';
      }

      earnedPoints += earned;

      testResults.push({
        testCaseId: tc._id,
        name: tc.name || `Test Case #${i + 1}`,
        status,
        input: tc.input || '',
        expectedOutput: tc.expectedOutput || '',
        actualOutput: execResult.stdout,
        executionTimeMs: execResult.durationMs,
        memoryUsedBytes: 0,
        error: execResult.stderr || null,
        points,
        earnedPoints: earned,
        isHidden: Boolean(tc.isHidden),
      });
    } catch (err) {
      testResults.push({
        testCaseId: tc._id,
        name: tc.name || `Test Case #${i + 1}`,
        status: 'SYSTEM_ERROR',
        input: tc.input || '',
        expectedOutput: tc.expectedOutput || '',
        actualOutput: '',
        executionTimeMs: 0,
        memoryUsedBytes: 0,
        error: err.message,
        points,
        earnedPoints: 0,
        isHidden: Boolean(tc.isHidden),
      });
    }
  }

  const total = testCases.length;
  const failedCount = total - passedCount;
  const scorePercent = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

  return {
    tests: testResults,
    summary: {
      total,
      passed: passedCount,
      failed: failedCount,
      score: scorePercent,
      totalPoints,
      earnedPoints,
    },
  };
}
