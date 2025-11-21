import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator, collection, getDoc, doc, query, orderBy, onSnapshot } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator, httpsCallable } from "firebase/functions";

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

// Connect to emulators if running locally
if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
    console.log("Connecting to Firebase Emulators...");
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectFunctionsEmulator(functions, 'localhost', 5001);
    console.log("Functions region:", functions.region);
}

export const createDecision = async (question) => {
    const createDecisionFn = httpsCallable(functions, 'createDecision');
    const result = await createDecisionFn({ question });
    return result.data.id;
};

export const addArgument = async (decisionId, type, text) => {
    const addArgumentFn = httpsCallable(functions, 'addArgument');
    const result = await addArgumentFn({ decisionId, type, text });
    return result.data.id;
};

export const voteArgument = async (decisionId, argumentId, voteChange) => {
    const voteArgumentFunction = httpsCallable(functions, 'voteArgument');
    console.log("Calling voteArgument with:", { decisionId, argumentId, change: voteChange });
    // Explicitly passing 'change' as the property name to match backend expectation
    return await voteArgumentFunction({ decisionId, argumentId, change: voteChange });
};

export const toggleDecisionStatus = async (decisionId, status) => {
    const toggleFunction = httpsCallable(functions, 'toggleDecisionStatus');
    return await toggleFunction({ decisionId, status });
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
    });
};

export { db, functions };
