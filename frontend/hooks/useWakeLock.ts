import { useRef, useCallback } from "react";

export function useWakeLock() {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const requestWakeLock = useCallback(async () => {
    if (!("wakeLock" in navigator)) {
      return;
    }

    try {
      if (wakeLockRef.current !== null && !wakeLockRef.current.released) {
        return;
      }

      wakeLockRef.current = await navigator.wakeLock.request("screen");
    } catch (err) {
      console.error("Wake lock error:", err);
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current && !wakeLockRef.current.released) {
      try {
        await wakeLockRef.current.release();
      } catch (err) {
        console.error("Wake lock release error:", err);
      }
      wakeLockRef.current = null;
    }
  }, []);

  return { requestWakeLock, releaseWakeLock };
}
