import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator, collection, getDoc, doc, query, orderBy, onSnapshot } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator, httpsCallable } from "firebase/functions";
import { getAuth, connectAuthEmulator } from "firebase/auth";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const functions = getFunctions(app);
const auth = getAuth(app);

// Connect to emulators if running locally
if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
    console.log("Connecting to Firebase Emulators...");
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectFunctionsEmulator(functions, 'localhost', 5001);
    connectAuthEmulator(auth, "http://localhost:9099");
    console.log("Functions region:", functions.region);
}

export const createDecision = async (question) => {
    const createDecisionFn = httpsCallable(functions, 'createDecision');
    const result = await createDecisionFn({ question });
    return result.data.id;
};

export const addArgument = async (decisionId, type, text, authorName, authorId) => {
    const addArgumentFn = httpsCallable(functions, 'addArgument');
    const payload = { decisionId, type, text };

    // Add optional author information if provided
    if (authorName) {
        payload.authorName = authorName;
    }
    if (authorId) {
        payload.authorId = authorId;
    }

    const result = await addArgumentFn(payload);
    return result.data.id;
};

export const voteArgument = async (decisionId, argumentId, userId, displayName) => {
    const voteArgumentFunction = httpsCallable(functions, 'voteArgument');
    console.log("Calling voteArgument with:", { decisionId, argumentId, userId, displayName });
    return await voteArgumentFunction({ decisionId, argumentId, userId, displayName });
};

export const toggleDecisionStatus = async (decisionId, status) => {
    const toggleFunction = httpsCallable(functions, 'toggleDecisionStatus');
    return await toggleFunction({ decisionId, status });
};

export const voteDecision = async (decisionId, vote, userId, displayName) => {
    const voteDecisionFunction = httpsCallable(functions, 'voteDecision');
    return await voteDecisionFunction({ decisionId, vote, userId, displayName });
};

export const updateUserDisplayName = async (decisionId, userId, displayName) => {
    const updateUserDisplayNameFn = httpsCallable(functions, 'updateUserDisplayName');
    return await updateUserDisplayNameFn({ decisionId, userId, displayName });
};

export const subscribeToDecision = (decisionId, callback) => {
    const docRef = doc(db, "decisions", decisionId);
    return onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
            callback({ id: doc.id, ...doc.data() });
        } else {
            callback(null);
        }
    });
};

export const getDecision = async (id) => {
    const docRef = doc(db, "decisions", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
    } else {
        return null;
    }
};

export const subscribeToArgumentVotes = (decisionId, argumentId, callback) => {
    const votesRef = collection(db, "decisions", decisionId, "arguments", argumentId, "votes");
    return onSnapshot(votesRef, (snapshot) => {
        const votes = [];
        snapshot.forEach((doc) => {
            votes.push({ id: doc.id, ...doc.data() });
        });
        callback(votes);
    });
};

export const subscribeToFinalVotes = (decisionId, callback) => {
    const votesRef = collection(db, "decisions", decisionId, "finalVotes");
    return onSnapshot(votesRef, (snapshot) => {
        const votes = [];
        snapshot.forEach((doc) => {
            votes.push({ id: doc.id, ...doc.data() });
        });
        callback(votes);
    });
};

export const subscribeToArguments = (decisionId, callback) => {
    const q = query(
        collection(db, "decisions", decisionId, "arguments"),
        orderBy("createdAt", "asc")
    );
    return onSnapshot(q, (snapshot) => {
        const args = [];
        snapshot.forEach((doc) => {
            args.push({ id: doc.id, ...doc.data() });
        });
        callback(args);
    }, (error) => {
        console.error("Error subscribing to arguments:", error);
    });
};

export { db, functions, auth };
