export const CSP_HEADER = [
  "default-src 'self' http://localhost:5000",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: https:",
  "connect-src 'self' http://localhost:5000 ws://localhost:5000",
  "frame-src 'none'",
  "object-src 'none'",
].join('; ');

export function applySecurityPolicies(browserWindow, session) {
  if (!browserWindow) return;

  // 1. Content Security Policy header
  if (session && session.webRequest) {
    session.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [CSP_HEADER],
          'X-Content-Type-Options': ['nosniff'],
          'X-Frame-Options': ['DENY'],
        },
      });
    });
  }

  // 2. Navigation restrictions: block external URLs
  browserWindow.webContents.on('will-navigate', (event, url) => {
    const parsed = new URL(url);
    const isAllowed =
      parsed.origin === 'http://localhost:5000' ||
      parsed.origin === 'http://localhost:5173' ||
      parsed.protocol === 'file:';

    if (!isAllowed) {
      console.warn(`[SecurityPolicy] Blocked external navigation to: ${url}`);
      event.preventDefault();
    }
  });

  // 3. Block window.open / popups
  browserWindow.webContents.setWindowOpenHandler(({ url }) => {
    console.warn(`[SecurityPolicy] Denied popup opening for: ${url}`);
    return { action: 'deny' };
  });

  // 4. Disable devtools in production or when restricted
  browserWindow.webContents.on('devtools-opened', () => {
    if (process.env.NODE_ENV === 'production') {
      browserWindow.webContents.closeDevTools();
    }
  });
}

export default { CSP_HEADER, applySecurityPolicies };
