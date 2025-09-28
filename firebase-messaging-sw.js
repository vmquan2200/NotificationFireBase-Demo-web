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

messaging.onBackgroundMessage((payload) => {
  console.log("Background message:", payload);
  const { title, body } = payload.notification || {};
  self.registration.showNotification(title || "New Message", {
    body: body || JSON.stringify(payload.data || {}),
    icon: "/favicon.ico"
  });
});
