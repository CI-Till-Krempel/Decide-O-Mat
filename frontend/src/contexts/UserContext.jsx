import React, { createContext, useContext, useState, useEffect } from 'react';
import { generateUUID } from '../utils/uuid';
import { auth } from '../services/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

const UserContext = createContext();

export function UserProvider({ children }) {
    // Persistent anonymous identity
    const [anonymousUser, setAnonymousUser] = useState(() => {
        const stored = localStorage.getItem('decide-o-mat-user');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('Failed to parse stored user data:', e);
            }
        }
        return {
            userId: generateUUID(),
            displayName: null
        };
    });

    const [firebaseUser, setFirebaseUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Persist anonymous user to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('decide-o-mat-user', JSON.stringify(anonymousUser));
    }, [anonymousUser]);

    // Listen to Firebase Auth state
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setFirebaseUser(user);
            setLoading(false);
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
    const user = firebaseUser ? {
        userId: firebaseUser.uid,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        isAnonymous: false
    } : {
        ...anonymousUser,
        isAnonymous: true
    };

    const setDisplayName = (name) => {
        if (firebaseUser) {
            // For now, we don't update Firebase profile, or we could?
            // The story says "Users can update their profile".
            // For now, let's just update the local anonymous user if not logged in.
            // If logged in, we might want to allow updating the display name too, but that requires updateProfile.
            // Let's stick to updating anonymous user for now, or warn.
            console.warn("Updating display name for authenticated user not yet fully implemented");
        } else {
            setAnonymousUser(prev => ({
                ...prev,
                displayName: name
            }));
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
