import assert from 'assert';
import { IpcValidator } from '../src/security/ipcValidator.js';
import { ALLOWED_CHANNELS } from '../src/ipc/ipcChannels.js';
import { CSP_HEADER } from '../src/security/securityPolicy.js';

console.log('--- Running Desktop Security Validation Tests ---');

// 1. Channel Allowlist Validation
console.log('1. Testing IPC Channel Whitelist...');
assert.strictEqual(IpcValidator.isChannelAllowed(ALLOWED_CHANNELS.DEVICE_GET_STATUS), true, 'Valid channel should be allowed');
assert.strictEqual(IpcValidator.isChannelAllowed(ALLOWED_CHANNELS.KIOSK_ENTER), true, 'Kiosk enter should be allowed');
assert.strictEqual(IpcValidator.isChannelAllowed('unregistered:channel:hack'), false, 'Unregistered channel must be blocked');
assert.strictEqual(IpcValidator.isChannelAllowed('electron:remote:exec'), false, 'Malicious remote channel must be blocked');
console.log('   PASSED: Channel whitelist correctly accepts registered channels and blocks unauthorized ones.');

// 2. Prototype Pollution Defense
console.log('2. Testing Prototype Pollution Defense...');
let pollutionBlocked = false;
try {
  IpcValidator.validatePayload(JSON.parse('{"__proto__": {"admin": true}}'));
} catch (e) {
  pollutionBlocked = true;
}
assert.strictEqual(pollutionBlocked, true, 'Prototype pollution payload should throw error');

let constructorBlocked = false;
try {
  IpcValidator.validatePayload(JSON.parse('{"constructor": {"prototype": {"admin": true}}}'));
} catch (e) {
  constructorBlocked = true;
}
assert.strictEqual(constructorBlocked, true, 'Constructor prototype payload should throw error');
console.log('   PASSED: Prototype pollution attempts successfully blocked.');

// 3. Shell Injection Defense
console.log('3. Testing Shell Injection Payload Defense...');
let shellBlocked = false;
try {
  IpcValidator.validatePayload({ command: 'test; rm -rf /' });
} catch (e) {
  shellBlocked = true;
}
assert.strictEqual(shellBlocked, true, 'Shell injection pattern should throw error');
console.log('   PASSED: Dangerous shell patterns rejected.');

// 4. Safe Payload Validation
console.log('4. Testing Valid Payloads...');
const validPayload = {
  examId: '60c72b2f9b1d8b2bad000001',
  studentId: '60c72b2f9b1d8b2bad000002',
  status: 'IN_PROGRESS',
};
assert.strictEqual(IpcValidator.validatePayload(validPayload), true, 'Valid structured payload must pass');
console.log('   PASSED: Legitimate payloads allowed.');

// 5. CSP Header Verification
console.log('5. Testing Content Security Policy Header...');
assert.ok(CSP_HEADER.includes("default-src 'self'"), 'CSP must specify default-src');
assert.ok(CSP_HEADER.includes("frame-src 'none'"), 'CSP must block iframe nesting');
assert.ok(CSP_HEADER.includes("object-src 'none'"), 'CSP must block plugin objects');
console.log('   PASSED: Hardened CSP configuration verified.');

console.log('--- All Desktop Security Tests Passed Successfully ---');
