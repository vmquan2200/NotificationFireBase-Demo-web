// Compat để có onBackgroundMessage
importScripts("https://www.gstatic.com/firebasejs/10.13.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyC_wYfigjo52Yi6K3oWk7_BmKz9JynTUR0",
  authDomain: "notification-537d7.firebaseapp.com",
  projectId: "notification-537d7",
  storageBucket: "notification-537d7.firebasestorage.app",
  messagingSenderId: "779369159825",
  appId: "1:779369159825:web:1f05b553ab071c20797330",
  measurementId: "G-PVM55NDDBX"
});

const messaging = firebase.messaging();

// BACKGROUND: chỉ chạy khi không ở foreground
messaging.onBackgroundMessage((payload) => {
  // Data-only: nội dung nằm ở payload.data
  const title = payload?.data?.title || "⏰ Ping ngầm";
  const body  = payload?.data?.body  || "Bạn vừa nhận ping từ cron";
  const url   = payload?.data?.url   || "/";

  self.registration.showNotification(title, {
    body,
    icon: "/favicon.ico",
    data: { url }
  });
});

// Click vào thông báo → mở/đưa focus tab
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && "focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
