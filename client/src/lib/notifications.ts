// Browser Notification API helper for Sanchez Tournament

/** Returns current permission state, or 'unsupported' if not available */
export function getNotificationPermission(): "granted" | "denied" | "default" | "unsupported" {
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission;
}

/** Explicitly request permission — returns the result */
export async function requestNotificationPermission(): Promise<"granted" | "denied" | "default"> {
  if (!("Notification" in window)) return "default";
  if (Notification.permission !== "default") return Notification.permission;
  return await Notification.requestPermission();
}

export function showNotification(title: string, body: string, onClick?: () => void) {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const n = new Notification(title, {
    body,
    icon: "/icon-512.png",
    badge: "/favicon-32.png",
    tag: "sos-alert", // replaces previous SOS notification instead of stacking
  });

  if (onClick) {
    n.onclick = () => {
      window.focus();
      onClick();
      n.close();
    };
  }
}
