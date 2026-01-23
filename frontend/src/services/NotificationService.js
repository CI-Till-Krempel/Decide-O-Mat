import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { doc, updateDoc, getFirestore } from "firebase/firestore";
import { app } from "./firebase"; // We need to export app from firebase.js

let messaging = null;
try {
    messaging = getMessaging(app);
} catch (error) {
    console.warn("Firebase Messaging failed to initialize (this is expected in tests):", error);
}

const db = getFirestore(app);

const NotificationService = {
    requestPermission: async (decisionId, userId) => {
        if (!messaging) return false;
        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                const token = await getToken(messaging, {
                    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
                });

                if (token) {
                    await NotificationService.saveToken(decisionId, userId, token);
                    return true;
                }
            }
        } catch (error) {
            console.error('Unable to get permission or token.', error);
        }
        return false;
    },

    saveToken: async (decisionId, userId, token) => {
        if (!decisionId || !userId || !token) return;

        // Save token to the participant document
        const participantRef = doc(db, 'decisions', decisionId, 'participants', userId);
        try {
            await updateDoc(participantRef, {
                fcmToken: token
            });
        } catch (error) {
            console.error("Error saving FCM token:", error);
        }
    },

    onMessageListener: () =>
        new Promise((resolve) => {
            if (!messaging) {
                resolve(null);
                return;
            }
            onMessage(messaging, (payload) => {
                resolve(payload);
            });
        }),
};

export default NotificationService;
