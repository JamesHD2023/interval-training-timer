import { useState, useEffect, useRef, useCallback } from "react";

export function useTimer(initialTime: number, onComplete: () => void) {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);
  const startTimeRef = useRef<number | null>(null);
  const remainingTimeRef = useRef(initialTime);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    setTimeLeft(initialTime);
    remainingTimeRef.current = initialTime;
  }, [initialTime]);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now();
      remainingTimeRef.current = timeLeft;

      intervalRef.current = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - (startTimeRef.current || Date.now())) / 1000);
        const newTimeLeft = Math.max(0, remainingTimeRef.current - elapsed);
        
        setTimeLeft(newTimeLeft);
        
        if (newTimeLeft <= 0) {
          onCompleteRef.current();
        }
      }, 100);
    } else if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      startTimeRef.current = null;
    }

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, timeLeft]);

  const start = useCallback(() => setIsRunning(true), []);
  const pause = useCallback(() => setIsRunning(false), []);
  const reset = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(initialTime);
    remainingTimeRef.current = initialTime;
    startTimeRef.current = null;
  }, [initialTime]);

  return { timeLeft, isRunning, start, pause, reset };
}
