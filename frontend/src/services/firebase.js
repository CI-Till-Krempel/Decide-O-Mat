import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator, collection, getDoc, getDocs, doc, query, orderBy, where, onSnapshot } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator, httpsCallable } from "firebase/functions";
import { getAuth, connectAuthEmulator, signInAnonymously } from "firebase/auth";
import { initializeAppCheck, ReCaptchaV3Provider, CustomProvider, getToken } from "firebase/app-check";

// ... (imports)
const firebaseConfig = {
    // ...
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize App Check BEFORE other services to ensure tokens are attached to earliest requests
let appCheck;
const reCaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
    // Use CustomProvider for localhost to avoid hitting real backend
    console.log("Using CustomProvider for App Check on localhost");
    appCheck = initializeAppCheck(app, {
        provider: new CustomProvider({
            getToken: async () => {
                return {
                    token: "fake-app-check-token",
                    expireTimeMillis: Date.now() + 60 * 60 * 1000,
                };
            }
        }),
        isTokenAutoRefreshEnabled: true
    });
} else {
    // Use ReCaptcha for other environments
    if (reCaptchaSiteKey) {
        console.log(`Initializing App Check with Site Key: ${reCaptchaSiteKey.substring(0, 5)}...`);
        appCheck = initializeAppCheck(app, {
            provider: new ReCaptchaV3Provider(reCaptchaSiteKey),
            isTokenAutoRefreshEnabled: true
        });

        // Debug: Attempt to fetch token immediately to check for errors
        getToken(appCheck)
            .then((tokenResult) => {
                console.log("App Check Token success:", tokenResult.token ? "Token received" : "No token");
            })
            .catch((err) => {
                console.error("App Check Token failed:", err);
            });
    } else {
        console.warn("VITE_RECAPTCHA_SITE_KEY is missing. App Check will not be initialized.");
    }
}

const db = getFirestore(app);
const functions = getFunctions(app);
const auth = getAuth(app);

// Connect to emulators if running locally
if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
    console.log("Connecting to Firebase Emulators...");
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectFunctionsEmulator(functions, 'localhost', 5001);
    connectAuthEmulator(auth, "http://localhost:9099");

    if (appCheck) {
        console.log("App Check initialized.");
    }

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

export const voteArgument = async (decisionId, argumentId, displayName) => {
    const voteArgumentFunction = httpsCallable(functions, 'voteArgument');
    console.log("Calling voteArgument with:", { decisionId, argumentId, displayName });
    return await voteArgumentFunction({ decisionId, argumentId, displayName });
};

export const toggleDecisionStatus = async (decisionId, status) => {
    const toggleFunction = httpsCallable(functions, 'toggleDecisionStatus');
    return await toggleFunction({ decisionId, status });
};

export const voteDecision = async (decisionId, vote, displayName) => {
    const voteDecisionFunction = httpsCallable(functions, 'voteDecision');
    return await voteDecisionFunction({ decisionId, vote, displayName });
};

export const updateUserDisplayName = async (decisionId, displayName) => {
    const updateUserDisplayNameFn = httpsCallable(functions, 'updateUserDisplayName');
    return await updateUserDisplayNameFn({ decisionId, displayName });
};

export const generateMagicLink = async () => {
    const generateFn = httpsCallable(functions, 'generateMagicLink');
    const result = await generateFn();
    return result.data.token;
};

export const registerParticipant = async (decisionId, encryptedDisplayName, plainDisplayName) => {
    const registerParticipantFn = httpsCallable(functions, 'registerParticipant');
    return await registerParticipantFn({ decisionId, encryptedDisplayName, plainDisplayName });
};

export const deleteUser = async () => {
    const deleteUserFn = httpsCallable(functions, 'deleteUser');
    return await deleteUserFn();
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

export const getUserDecisions = async (userId) => {
    // 1. Decisions created by user
    const qOwner = query(
        collection(db, "decisions"),
        orderBy("createdAt", "desc"),
        where("ownerId", "==", userId)
    );

    // 2. Decisions participated in by user
    const qParticipant = query(
        collection(db, "decisions"),
        orderBy("createdAt", "desc"),
        where("participantIds", "array-contains", userId)
    );

    const [ownerSnap, participantSnap] = await Promise.all([
        getDocs(qOwner),
        getDocs(qParticipant)
    ]);

    const decisionsMap = new Map();

    ownerSnap.forEach((doc) => {
        decisionsMap.set(doc.id, { id: doc.id, ...doc.data(), role: 'owner' });
    });

    participantSnap.forEach((doc) => {
        if (!decisionsMap.has(doc.id)) {
            decisionsMap.set(doc.id, { id: doc.id, ...doc.data(), role: 'participant' });
        } else {
            // Already there as owner, which takes precedence, but good to know
        }
    });

    // Convert to array and sort by createdAt desc
    const sortedDecisions = Array.from(decisionsMap.values()).sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return dateB - dateA;
    });

    return sortedDecisions;
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

export { db, functions, auth, signInAnonymously };
