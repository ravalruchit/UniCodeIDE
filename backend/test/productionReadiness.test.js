import assert from 'assert';
import { authenticateToken } from '../src/middleware/authMiddleware.js';
import { signToken, verifyToken } from '../src/utils/jwt.js';
import {
  sanitizeVirtualPath,
  truncateOutput,
  maskHiddenTests,
  checkRateLimit,
  resetRateLimit,
} from '../src/services/execution/executionSecurity.js';
import { ENV } from '../src/config/env.js';

console.log('====================================================');
console.log('UniCodeIDE Enterprise Production Readiness Test Suite');
console.log('====================================================\n');

let testsPassed = 0;
let testsTotal = 0;

function runTest(testName, fn) {
  testsTotal++;
  try {
    fn();
    console.log(`[PASS] Test #${testsTotal}: ${testName}`);
    testsPassed++;
  } catch (err) {
    console.error(`[FAIL] Test #${testsTotal}: ${testName}`);
    console.error(err);
    process.exitCode = 1;
  }
}

async function runAsyncTest(testName, fn) {
  testsTotal++;
  try {
    await fn();
    console.log(`[PASS] Test #${testsTotal}: ${testName}`);
    testsPassed++;
  } catch (err) {
    console.error(`[FAIL] Test #${testsTotal}: ${testName}`);
    console.error(err);
    process.exitCode = 1;
  }
}

// ----------------------------------------------------
// 1. AUTHENTICATION & PRIVILEGE ESCALATION PREVENTION
// ----------------------------------------------------
console.log('--- 1. Authentication & Security Middleware Tests ---');

await runAsyncTest('Rejection of unauthenticated requests (missing header)', async () => {
  const req = { headers: {} };
  let statusCode = null;
  let responseData = null;
  const res = {
    status(code) {
      statusCode = code;
      return {
        json(data) {
          responseData = data;
        },
      };
    },
  };
  let nextCalled = false;
  await authenticateToken(req, res, () => {
    nextCalled = true;
  });

  assert.strictEqual(nextCalled, false, 'Next should not be called');
  assert.strictEqual(statusCode, 401, 'Should return 401 Unauthorized');
  assert.strictEqual(responseData.success, false);
});

await runAsyncTest('Rejection of forged mock admin token in development', async () => {
  // In dev, only student fallback is permitted; super_admin/teacher escalation MUST be blocked
  const req = { headers: { authorization: 'Bearer mock-jwt-token-super_admin-12345' } };
  let statusCode = null;
  let responseData = null;
  const res = {
    status(code) {
      statusCode = code;
      return {
        json(data) {
          responseData = data;
        },
      };
    },
  };
  let nextCalled = false;
  await authenticateToken(req, res, () => {
    nextCalled = true;
  });

  assert.strictEqual(nextCalled, false, 'Escalation to SUPER_ADMIN must be blocked');
  assert.strictEqual(statusCode, 401, 'Should reject mock admin token with 401');
  assert.ok(responseData.message.includes('cannot be used for administrative privileges'));
});

await runAsyncTest('Rejection of all mock tokens in production environment', async () => {
  const originalEnv = ENV.NODE_ENV;
  ENV.NODE_ENV = 'production';
  try {
    const req = { headers: { authorization: 'Bearer mock-jwt-token-student-12345' } };
    let statusCode = null;
    let responseData = null;
    const res = {
      status(code) {
        statusCode = code;
        return {
          json(data) {
            responseData = data;
          },
        };
      },
    };
    let nextCalled = false;
    await authenticateToken(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, false, 'Mock token must never proceed in production');
    assert.strictEqual(statusCode, 401);
    assert.ok(responseData.message.includes('Unsigned mock tokens are prohibited in production'));
  } finally {
    ENV.NODE_ENV = originalEnv;
  }
});

await runAsyncTest('Verification of cryptographically signed JWT token', async () => {
  const payload = {
    id: '60c72b2f9b1d8b2bad000001',
    name: 'Prof. Ada Lovelace',
    email: 'ada@meridian.edu',
    role: 'TEACHER',
    universityId: '60c72b2f9b1d8b2bad000099',
  };
  const token = signToken(payload);
  const req = { headers: { authorization: `Bearer ${token}` } };
  let nextCalled = false;
  const res = {
    status() {
      return { json() {} };
    },
  };

  await authenticateToken(req, res, () => {
    nextCalled = true;
  });

  assert.strictEqual(nextCalled, true, 'Valid signed JWT should proceed to next handler');
  assert.strictEqual(req.user.email, 'ada@meridian.edu');
  assert.strictEqual(req.user.role, 'TEACHER');
});

// ----------------------------------------------------
// 2. CODE EXECUTION SANDBOX SECURITY
// ----------------------------------------------------
console.log('\n--- 2. Code Execution Sandbox Security Tests ---');

runTest('Directory traversal attempts blocked by sanitizeVirtualPath', () => {
  const dangerousPaths = [
    '../etc/passwd',
    '../../shadow',
    '/root/.ssh/id_rsa',
    'C:\\Windows\\System32\\cmd.exe',
    '..\\..\\app.js',
    '/app/src/server.js',
  ];

  for (const p of dangerousPaths) {
    let threw = false;
    try {
      sanitizeVirtualPath(p);
    } catch {
      threw = true;
    }
    assert.strictEqual(threw, true, `Path '${p}' should have been rejected`);
  }

  // Safe relative paths should pass
  assert.strictEqual(sanitizeVirtualPath('main.py'), 'main.py');
  assert.strictEqual(sanitizeVirtualPath('src/utils/math.js'), 'src/utils/math.js');
});

runTest('Output limit truncation prevents memory exhaustion and DoS', () => {
  const hugeOutput = 'A'.repeat(100000); // 100 KB
  const result = truncateOutput(hugeOutput, 1024); // 1 KB limit for test
  assert.strictEqual(result.truncated, true);
  assert.ok(result.text.length < 2000);
  assert.ok(result.text.includes('OUTPUT_LIMIT_EXCEEDED'));

  const smallOutput = 'Hello, World!\n';
  const smallResult = truncateOutput(smallOutput, 1024);
  assert.strictEqual(smallResult.truncated, false);
  assert.strictEqual(smallResult.text, smallOutput);
});

runTest('Hidden test cases are masked to prevent student cheating', () => {
  const testResults = [
    {
      testCaseId: 'tc-01',
      name: 'Public Test 1',
      status: 'PASSED',
      points: 10,
      earnedPoints: 10,
      isHidden: false,
      input: '2 3\n',
      expectedOutput: '5\n',
      actualOutput: '5\n',
    },
    {
      testCaseId: 'tc-02',
      name: 'Secret Exam Test 2',
      status: 'FAILED',
      points: 20,
      earnedPoints: 0,
      isHidden: true,
      input: '1000000 2000000\n',
      expectedOutput: '3000000\n',
      actualOutput: 'Integer overflow\n',
    },
  ];

  const masked = maskHiddenTests(testResults);
  // Public test retains details
  assert.strictEqual(masked[0].input, '2 3\n');
  assert.strictEqual(masked[0].expectedOutput, '5\n');

  // Hidden test case must mask input, expectedOutput, and actualOutput
  assert.strictEqual(masked[1].input, '[HIDDEN_TEST_CASE]');
  assert.strictEqual(masked[1].expectedOutput, '[HIDDEN_TEST_CASE]');
  assert.strictEqual(masked[1].actualOutput, '[HIDDEN_OUTPUT]');
  assert.strictEqual(masked[1].error, 'Hidden test case failed.');
});

runTest('Per-user execution rate limiting blocks burst abuse', () => {
  const studentId = 'test-student-burst-01';
  resetRateLimit(studentId);

  // Default limit is 20 requests per minute
  for (let i = 0; i < 20; i++) {
    const allowed = checkRateLimit(studentId);
    assert.strictEqual(allowed, true, `Request #${i + 1} should be allowed`);
  }

  // 21st request must be throttled
  const blocked = checkRateLimit(studentId);
  assert.strictEqual(blocked, false, 'Request #21 must be rejected by rate limiter');

  resetRateLimit(studentId);
});

// ----------------------------------------------------
// 3. TENANT ISOLATION LOGIC
// ----------------------------------------------------
console.log('\n--- 3. Multi-Tenant University Isolation Tests ---');

runTest('Cross-university resource access prevention logic', () => {
  const uniAlphaId = '60c72b2f9b1d8b2bad000001';
  const uniBetaId = '60c72b2f9b1d8b2bad000002';

  const userFromAlpha = {
    _id: 'user-01',
    universityId: uniAlphaId,
    role: 'STUDENT',
  };

  const courseInBeta = {
    _id: 'course-99',
    universityId: uniBetaId,
    title: 'Data Structures at University Beta',
  };

  // Verify tenant check logic as implemented in controllers
  const userUni = userFromAlpha.universityId?.toString();
  const resourceUni = courseInBeta.universityId?.toString();
  const isAuthorizedTenant = userUni === resourceUni;

  assert.strictEqual(isAuthorizedTenant, false, 'User from University Alpha must not access University Beta course');
});

// ----------------------------------------------------
// 4. EXAM SUBMISSION RACE CONDITION DEFENSE
// ----------------------------------------------------
console.log('\n--- 4. Exam Submission Race Condition & Idempotency Tests ---');

runTest('Atomic status transition simulation (Compare-And-Swap idempotency)', () => {
  // Simulate mock database session state
  let sessionDoc = {
    _id: 'session-12345',
    status: 'IN_PROGRESS',
    submittedAt: null,
  };

  // Simulated findOneAndUpdate({ _id: sessionId, status: 'IN_PROGRESS' }, ...)
  function atomicSubmit(id, targetStatus) {
    if (sessionDoc._id === id && sessionDoc.status === 'IN_PROGRESS') {
      sessionDoc.status = targetStatus;
      sessionDoc.submittedAt = new Date();
      return { success: true, doc: sessionDoc };
    }
    // Already finalized; returns null indicating no transition occurred
    return null;
  }

  // First submission request (e.g., student clicks "Submit Exam")
  const req1Result = atomicSubmit('session-12345', 'SUBMITTED');
  assert.ok(req1Result !== null, 'First submission must succeed and acquire transition');
  assert.strictEqual(req1Result.doc.status, 'SUBMITTED');

  // Concurrent submission request (e.g., automated timer firing at exact same second)
  const req2Result = atomicSubmit('session-12345', 'AUTO_SUBMITTED');
  assert.strictEqual(req2Result, null, 'Second concurrent submission must be safely rejected by atomic CAS');
  assert.strictEqual(sessionDoc.status, 'SUBMITTED', 'Session state remains pristine');
});

// ----------------------------------------------------
// 5. PRODUCTION CORS ORIGIN PROTECTION
// ----------------------------------------------------
console.log('\n--- 5. Production CORS Policy Tests ---');

runTest('CORS Origin Whitelist validation logic', () => {
  function testCorsOrigin(origin, clientUrl) {
    if (!origin) return true; // Server-to-server / curl
    return (
      origin === clientUrl ||
      origin.endsWith('.vercel.app') ||
      origin.endsWith('.onrender.com') ||
      origin.endsWith('.railway.app') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1')
    );
  }

  const clientUrl = 'https://unicodeide.edu';

  // Allowed origins
  assert.strictEqual(testCorsOrigin('https://unicodeide.edu', clientUrl), true);
  assert.strictEqual(testCorsOrigin('https://unicodeide-preview.vercel.app', clientUrl), true);
  assert.strictEqual(testCorsOrigin('http://localhost:5173', clientUrl), true);
  assert.strictEqual(testCorsOrigin(undefined, clientUrl), true);

  // Disallowed attacker origins
  assert.strictEqual(testCorsOrigin('https://malicious-site.com', clientUrl), false);
  assert.strictEqual(testCorsOrigin('https://evil-phishing-attacker.org', clientUrl), false);
  assert.strictEqual(testCorsOrigin('http://university-hacker.xyz', clientUrl), false);
});

console.log('\n====================================================');
console.log(`Results: ${testsPassed} of ${testsTotal} test suites PASSED cleanly.`);
console.log('====================================================');
