// ⚠️ THIS FILE IS AUTO-GENERATED. DO NOT EDIT DIRECTLY. EDIT firebase-messaging-sw.template.js INSTEAD.
/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Auto-generated config from generate-sw.js
const firebaseConfig = {
    apiKey: "fake-api-key",
    authDomain: "decide-o-mat.firebaseapp.com",
    projectId: "decide-o-mat",
    storageBucket: "decide-o-mat.appspot.com",
    messagingSenderId: "fake-sender-id",
    appId: "fake-app-id",
    measurementId: "fake-measurement-id"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

const ICON_URL = '/vite.svg'; // Use generic app icon

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    // Customize notification here
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: ICON_URL,
        data: payload.data
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
