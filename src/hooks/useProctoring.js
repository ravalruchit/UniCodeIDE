import { useState, useEffect, useRef, useCallback } from 'react';
import { examSessionService } from '../services/examSessionService';

export function useProctoring({
  sessionId,
  isActive = false,
  proctoringMode = 'BASIC',
  requireFullscreen = false,
  onEventLogged,
}) {
  const [eventCounts, setEventCounts] = useState({
    tabHidden: 0,
    fullscreenExit: 0,
    blur: 0,
    disconnect: 0,
  });

  const lastHiddenTimeRef = useRef(null);

  const logEvent = useCallback(
    async (type, durationMs = 0, metadata = {}) => {
      if (!sessionId || !isActive || proctoringMode === 'NONE') return;

      try {
        await examSessionService.recordProctoringEvent(sessionId, {
          type,
          durationMs,
          metadata,
        });

        if (type === 'TAB_HIDDEN') {
          setEventCounts((prev) => ({ ...prev, tabHidden: prev.tabHidden + 1 }));
        } else if (type === 'FULLSCREEN_EXIT') {
          setEventCounts((prev) => ({ ...prev, fullscreenExit: prev.fullscreenExit + 1 }));
        } else if (type === 'WINDOW_BLUR') {
          setEventCounts((prev) => ({ ...prev, blur: prev.blur + 1 }));
        } else if (type === 'NETWORK_DISCONNECTED') {
          setEventCounts((prev) => ({ ...prev, disconnect: prev.disconnect + 1 }));
        }

        if (onEventLogged) onEventLogged(type);
      } catch {
        // fail gracefully if logging fails (e.g. offline)
      }
    },
    [sessionId, isActive, proctoringMode, onEventLogged]
  );

  useEffect(() => {
    if (!sessionId || !isActive || proctoringMode === 'NONE') return;

    // 1. Visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        lastHiddenTimeRef.current = Date.now();
        logEvent('TAB_HIDDEN');
      } else if (document.visibilityState === 'visible') {
        const duration = lastHiddenTimeRef.current ? Date.now() - lastHiddenTimeRef.current : 0;
        lastHiddenTimeRef.current = null;
        logEvent('TAB_VISIBLE', duration);
      }
    };

    // 2. Window Blur / Focus
    const handleBlur = () => {
      logEvent('WINDOW_BLUR');
    };

    const handleFocus = () => {
      logEvent('WINDOW_FOCUS');
    };

    // 3. Fullscreen changes
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        logEvent('FULLSCREEN_EXIT');
      } else {
        logEvent('FULLSCREEN_ENTER');
      }
    };

    // 4. Online / Offline network events
    const handleOnline = () => {
      logEvent('NETWORK_RECONNECTED');
    };

    const handleOffline = () => {
      logEvent('NETWORK_DISCONNECTED');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [sessionId, isActive, proctoringMode, logEvent]);

  // Request fullscreen utility
  const enterFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      // ignore rejection if user cancels
    }
  }, []);

  return {
    eventCounts,
    logEvent,
    enterFullscreen,
  };
}
