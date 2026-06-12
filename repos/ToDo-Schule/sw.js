// ========================================================================
//  ToDo-Schule — Service Worker (Push-Notifications)
// ========================================================================

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

/* Web-Push (z. B. künftig via VAPID vom Backend). Payload-Format:
   { "title": "...", "body": "...", "taskId": 123 } */
self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (_) {
    data = { body: event.data ? event.data.text() : "" };
  }
  event.waitUntil(
    self.registration.showNotification(data.title || "ToDo-Schule", {
      body: data.body || "",
      icon: "assets/esg-mark.svg",
      badge: "assets/esg-mark.svg",
      tag: data.taskId ? `task-${data.taskId}` : undefined,
      data: { taskId: data.taskId || null },
    })
  );
});

/* Klick auf Notification: vorhandenes App-Fenster fokussieren, sonst öffnen. */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((wins) => {
      for (const win of wins) {
        if ("focus" in win) return win.focus();
      }
      return self.clients.openWindow("./ToDo-Schule.html");
    })
  );
});
