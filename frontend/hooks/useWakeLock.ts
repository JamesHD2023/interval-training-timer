import { useRef, useCallback } from "react";

export function useWakeLock() {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const requestWakeLock = useCallback(async () => {
    if ("wakeLock" in navigator) {
      try {
        wakeLockRef.current = await navigator.wakeLock.request("screen");
      } catch (err) {
        console.error("Failed to request wake lock:", err);
      }
    }
  }, []);

  const releaseWakeLock = useCallback(() => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release().catch((err) => {
        console.error("Failed to release wake lock:", err);
      });
      wakeLockRef.current = null;
    }
  }, []);

  return { requestWakeLock, releaseWakeLock };
}
