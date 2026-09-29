import { useEffect } from 'react';

export function useBeforeUnloadRecovery(hasPendingSync) {
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasPendingSync) {
        e.preventDefault();
        e.returnValue = 'You have unsynchronized changes in your cloud workspace.';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasPendingSync]);
}
