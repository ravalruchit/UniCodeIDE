import { useState, useEffect, useCallback } from 'react';
import { workspaceService } from '../services/workspaceService';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isApiReachable, setIsApiReachable] = useState(true);

  const checkReachability = useCallback(async () => {
    if (!navigator.onLine) {
      setIsApiReachable(false);
      return false;
    }
    const reachable = await workspaceService.pingReachability();
    setIsApiReachable(reachable);
    return reachable;
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      checkReachability();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsApiReachable(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    checkReachability();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkReachability]);

  return {
    isOnline: isOnline && isApiReachable,
    isBrowserOnline: isOnline,
    isApiReachable,
    checkReachability,
  };
}
