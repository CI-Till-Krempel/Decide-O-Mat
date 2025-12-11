import React, { createContext, useContext, useState, useEffect } from 'react';
// import { generateUUID } from '../utils/uuid'; // Removed
import { auth } from '../services/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, signInAnonymously } from 'firebase/auth';

const UserContext = createContext();

export function UserProvider({ children }) {
    // Persistent anonymous identity
    // Persistent display name for anonymous users
    const [localDisplayName, setLocalDisplayName] = useState(() => {
        return localStorage.getItem('dom_display_name') || null;
    });

    const [firebaseUser, setFirebaseUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Persist display name
    useEffect(() => {
        if (localDisplayName) {
            localStorage.setItem('dom_display_name', localDisplayName);
        } else {
            localStorage.removeItem('dom_display_name');
        }
    }, [localDisplayName]);

    // Listen to Firebase Auth state
    // Listen to Firebase Auth state
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setFirebaseUser(user);
                setLoading(false);
            } else {
                // If no user, sign in anonymously
                signInAnonymously(auth).catch((error) => {
                    console.error("Anonymous auth failed", error);
                    setLoading(false);
                });
            }
        });
        return () => unsubscribe();
    }, []);

    const login = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Login failed:", error);
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
    // Determine the effective user
    // Now we rely on firebaseUser for everything (even anonymous)
    // We mix in localDisplayName if the firebase user doesn't have one (anonymous usually doesn't)
    const user = firebaseUser ? {
        userId: firebaseUser.uid,
        displayName: firebaseUser.displayName || localDisplayName,
        photoURL: firebaseUser.photoURL,
        isAnonymous: firebaseUser.isAnonymous
    } : null; // Should not happen after loading, but safe fallback

    const setDisplayName = (name) => {
        // Always update local display name for now, as it's used for anonymous contexts
        setLocalDisplayName(name);

        if (firebaseUser && !firebaseUser.isAnonymous) {
            // Future: Update profile for real users
            console.warn("Updating display name for authenticated user only updates local state for now");
        }
    };

    return (
        <UserContext.Provider value={{ user, login, logout, setDisplayName, loading }}>
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
