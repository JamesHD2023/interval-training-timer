import { useRef, useCallback, useEffect } from "react";

export function useWakeLock() {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const isActiveRef = useRef(false);

  const requestWakeLock = useCallback(async () => {
    if (!("wakeLock" in navigator)) {
      return;
    }

    if (document.visibilityState !== "visible") {
      return;
    }

    try {
      if (wakeLockRef.current !== null) {
        return;
      }

      wakeLockRef.current = await navigator.wakeLock.request("screen");

      wakeLockRef.current.addEventListener("release", () => {
        wakeLockRef.current = null;
        if (isActiveRef.current && document.visibilityState === "visible") {
          setTimeout(() => requestWakeLock(), 100);
        }
      });
    } catch (err) {
      wakeLockRef.current = null;
    }
  }, []);

  const releaseWakeLock = useCallback(() => {
    isActiveRef.current = false;
    if (wakeLockRef.current) {
      wakeLockRef.current.release().catch(() => {});
      wakeLockRef.current = null;
    }
  }, []);

  const activateWakeLock = useCallback(async () => {
    isActiveRef.current = true;
    await requestWakeLock();
  }, [requestWakeLock]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isActiveRef.current) {
        requestWakeLock();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      releaseWakeLock();
    };
  }, [requestWakeLock, releaseWakeLock]);

  return { requestWakeLock: activateWakeLock, releaseWakeLock };
}
