import { useState, useEffect, useRef, useCallback } from 'react';

export function useExamTimer(deadlineAt, onTimeExpired) {
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [hasExpired, setHasExpired] = useState(false);
  const expiredHandledRef = useRef(false);

  const calculateRemaining = useCallback(() => {
    if (!deadlineAt) return 0;
    const diffMs = new Date(deadlineAt).getTime() - Date.now();
    return Math.max(0, Math.floor(diffMs / 1000));
  }, [deadlineAt]);

  useEffect(() => {
    const initial = calculateRemaining();
    setRemainingSeconds(initial);

    if (initial <= 0 && !expiredHandledRef.current) {
      setHasExpired(true);
      expiredHandledRef.current = true;
      if (onTimeExpired) onTimeExpired();
      return;
    }

    const interval = setInterval(() => {
      const remaining = calculateRemaining();
      setRemainingSeconds(remaining);

      if (remaining <= 0 && !expiredHandledRef.current) {
        setHasExpired(true);
        expiredHandledRef.current = true;
        clearInterval(interval);
        if (onTimeExpired) onTimeExpired();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [calculateRemaining, onTimeExpired]);

  // Visual Urgency States
  let urgency = 'normal';
  if (remainingSeconds <= 60) {
    urgency = 'critical'; // < 1 minute
  } else if (remainingSeconds <= 600) {
    urgency = 'urgent'; // < 10 minutes
  } else if (remainingSeconds <= 1800) {
    urgency = 'warning'; // 10–30 minutes
  }

  // Format as HH:MM:SS or MM:SS
  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  const formattedTime =
    hours > 0
      ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return {
    remainingSeconds,
    formattedTime,
    urgency,
    hasExpired,
  };
}
