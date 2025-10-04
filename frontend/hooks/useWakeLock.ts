import { useRef, useCallback, useEffect } from "react";

export function useWakeLock() {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const isActiveRef = useRef(false);

  const requestWakeLock = useCallback(async () => {
    if (!("wakeLock" in navigator)) {
      console.warn("Wake Lock API not supported");
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
      console.log("Wake Lock acquired");

      wakeLockRef.current.addEventListener("release", () => {
        console.log("Wake Lock released");
        wakeLockRef.current = null;
        if (isActiveRef.current && document.visibilityState === "visible") {
          setTimeout(() => requestWakeLock(), 100);
        }
      });
    } catch (err) {
      console.error("Failed to request wake lock:", err);
    }
  }, []);

  const releaseWakeLock = useCallback(() => {
    isActiveRef.current = false;
    if (wakeLockRef.current) {
      wakeLockRef.current.release().catch((err) => {
        console.error("Failed to release wake lock:", err);
      });
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
