import { useEffect, useCallback } from "react";

export function useNotifications() {
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const sendNotification = useCallback((title: string, body: string, vibrate = true) => {
    try {
      if (vibrate && "vibrate" in navigator) {
        navigator.vibrate([200, 100, 200]);
      }

      if ("Notification" in window && Notification.permission === "granted") {
        const notification = new Notification(`Pacee.Pro - ${title}`, {
          body,
          icon: "/icon-192.png",
          badge: "/icon-192.png",
          tag: "pacee-pro-timer",
          requireInteraction: false,
          silent: false,
        });

        setTimeout(() => {
          notification.close();
        }, 3000);

        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      }
    } catch (err) {
      console.error("Notification error:", err);
    }
  }, []);

  return { sendNotification };
}
