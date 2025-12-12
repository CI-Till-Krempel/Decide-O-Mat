import React, { createContext, useContext, useState, useEffect } from 'react';
// import { generateUUID } from '../utils/uuid'; // Removed
import NameGenerator from '../utils/NameGenerator';
import { auth } from '../services/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, signInAnonymously, updateProfile, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, linkWithPopup, linkWithCredential, EmailAuthProvider } from 'firebase/auth';

const UserContext = createContext();

export function UserProvider({ children }) {
    // Persistent display name AND associated User ID
    const [localDisplayName, setLocalDisplayName] = useState(() => {
        return localStorage.getItem('dom_display_name') || null;
    });

    const [firebaseUser, setFirebaseUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initialize/Sync Name on User Change
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // User detected

                // 1. Prefer Cloud Profile Name
                if (user.displayName) {
                    setLocalDisplayName(user.displayName);
                    localStorage.setItem('dom_display_name', user.displayName);
                    localStorage.setItem('dom_display_name_uid', user.uid);
                } else {
                    // 2. Fallback: No profile name.
                    const storedName = localStorage.getItem('dom_display_name');
                    const storedUid = localStorage.getItem('dom_display_name_uid');

                    if (user.uid !== storedUid) {
                        // Authenticated as a NEW user (mismatch)
                        if (storedUid) {
                            // Reset name for fresh anonymous account
                            const newName = NameGenerator.generate();
                            setLocalDisplayName(newName);
                            localStorage.setItem('dom_display_name', newName);
                            localStorage.setItem('dom_initial_name', newName);
                            localStorage.setItem('dom_display_name_uid', user.uid);
                            // Persist new name to profile immediately
                            try { await updateProfile(user, { displayName: newName }) } catch { /* ignore */ }
                        } else {
                            // First run / Legacy adoption
                            if (storedName) {
                                // Claim legacy name for this user
                                localStorage.setItem('dom_display_name_uid', user.uid);
                                setLocalDisplayName(storedName);
                                // "Heal": Sync legacy name to profile for transferability
                                try { await updateProfile(user, { displayName: storedName }) } catch { /* ignore */ }
                            } else {
                                // Fresh start
                                const newName = NameGenerator.generate();
                                setLocalDisplayName(newName);
                                localStorage.setItem('dom_display_name', newName);
                                localStorage.setItem('dom_initial_name', newName);
                                localStorage.setItem('dom_display_name_uid', user.uid);
                                // Persist new name to profile immediately
                                try { await updateProfile(user, { displayName: newName }) } catch { /* ignore */ }
                            }
                        }
                    } else {
                        // UID Matches. 
                        // If we have a local name but NO profile name, "Heal" it now.
                        if (storedName) {
                            if (storedName !== localDisplayName) setLocalDisplayName(storedName);
                            // Auto-heal profile
                            try { await updateProfile(user, { displayName: storedName }) } catch { /* ignore */ }
                        }
                    }
                }

                setFirebaseUser(user);
                setLoading(false);
            } else {
                signInAnonymously(auth).catch((error) => {
                    console.error("Anonymous auth failed", error);
                    setLoading(false);
                });
            }
        });
        return () => unsubscribe();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Persist display name updates
    useEffect(() => {
        if (localDisplayName) {
            localStorage.setItem('dom_display_name', localDisplayName);
        } else {
            localStorage.removeItem('dom_display_name');
        }
    }, [localDisplayName]);

    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            if (auth.currentUser && auth.currentUser.isAnonymous) {
                // Try to upgrade the anonymous account
                try {
                    await linkWithPopup(auth.currentUser, provider);
                    return; // Success
                    // eslint-disable-next-line no-unused-vars
                } catch (linkError) {
                    // console.log("Link failed, falling back to sign in", linkError);
                    // If link fails (e.g. email already in use), fall back to normal sign in
                    // This will switch the user, effectively "logging out" the anonymous session
                }
            }
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Google Login failed:", error);
            throw error;
        }
    };

    const registerEmail = async (email, password) => {
        try {
            if (auth.currentUser && auth.currentUser.isAnonymous) {
                // Try to link first -> "Upgrade"
                const credential = EmailAuthProvider.credential(email, password);
                /* 
                   Note: linkWithCredential works for ID/Pass. 
                   But if we want to create a NEW account with this email/pass and link it, 
                   it's effectively linkWithCredential.
                   However, createUserWithEmailAndPassword creates a user and signs in. 
                   To upgrade, we use linkWithCredential.
                */
                // Actually, linking requires the user to NOT exist yet with that credential.
                // If we want to "Register" a new email on this anonymous user:
                await linkWithCredential(auth.currentUser, credential);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
        } catch (error) {
            console.error("Registration failed:", error);
            throw error;
        }
    };

    const loginEmail = async (email, password) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error("Email Login failed:", error);
            throw error;
        }
    };

    const resetPassword = async (email) => {
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (error) {
            console.error("Reset Password failed:", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout failed:", error);
            throw error;
        }
    };

    // Determine the effective user
    const user = firebaseUser ? {
        userId: firebaseUser.uid,
        displayName: localDisplayName || firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        // Treat as anonymous if explicit flag OR if no providers
        isAnonymous: firebaseUser.isAnonymous || firebaseUser.providerData.length === 0
    } : null;

    const setDisplayName = async (name) => {
        setLocalDisplayName(name); // Updates local state -> persists via effect

        // Persist to Firebase Profile so it transfers with Magic Link
        if (firebaseUser) {
            try {
                await updateProfile(firebaseUser, { displayName: name });
            } catch {
                // console.warn("Failed to update profile name remotely", e);
            }
        }
    };

    const resetToInitialName = () => {
        const initial = localStorage.getItem('dom_initial_name');
        let nameToReturn;
        if (initial) {
            setDisplayName(initial); // Use wrapper to sync
            nameToReturn = initial;
        } else {
            const newName = NameGenerator.generate();
            localStorage.setItem('dom_initial_name', newName); // Keep "Original" distinct
            setDisplayName(newName); // Use wrapper
            nameToReturn = newName;
        }
        return nameToReturn;
    };

    const getInitialName = () => {
        return localStorage.getItem('dom_initial_name');
    };

    return (
        <UserContext.Provider value={{ user, loginWithGoogle, loginEmail, registerEmail, resetPassword, logout, setDisplayName, resetToInitialName, getInitialName, loading }}>
            {!loading && children}
        </UserContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUser() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}
