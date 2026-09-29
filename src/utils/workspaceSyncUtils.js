export const SYNC_STATES = {
  SYNCED: 'SYNCED',
  SAVING: 'SAVING',
  PENDING: 'PENDING',
  OFFLINE: 'OFFLINE',
  RETRYING: 'RETRYING',
  CONFLICT: 'CONFLICT',
  ERROR: 'ERROR',
  AUTH_EXPIRED: 'AUTH_EXPIRED',
  RECOVERING: 'RECOVERING',
};

// Calculate exponential backoff delay with jitter
export const getRetryDelay = (attempt, baseDelay = 1200, maxDelay = 15000) => {
  const exp = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  const jitter = Math.random() * 300;
  return Math.round(exp + jitter);
};

// Determine if an error is transient and retryable
export const isRetryableError = (error) => {
  if (!error) return false;

  // Network failures / fetch rejections
  if (error.name === 'TypeError' || error.message?.includes('fetch') || error.message?.includes('network')) {
    return true;
  }

  const status = error.status || error.statusCode;
  // Transient HTTP 5xx or rate limits / timeouts
  if ([408, 429, 500, 502, 503, 504].includes(status)) {
    return true;
  }

  // Non-retryable: 400 (bad request), 401 (auth), 403 (forbidden), 404 (not found), 409 (conflict), 413 (quota)
  return false;
};

// Check if two file lists have identical paths and contents
export const areFilesEqual = (filesA = [], filesB = []) => {
  if (filesA.length !== filesB.length) return false;
  const mapB = new Map(filesB.map((f) => [f.path, f.content]));
  for (const f of filesA) {
    if (!mapB.has(f.path) || mapB.get(f.path) !== f.content) {
      return false;
    }
  }
  return true;
};
