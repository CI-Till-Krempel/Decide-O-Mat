import React, { createContext, useContext, useState, useEffect } from 'react';
import { generateUUID } from '../utils/uuid';

const UserContext = createContext();

export function UserProvider({ children }) {
    const [user, setUser] = useState(() => {
        // Load user from localStorage on initialization
        const stored = localStorage.getItem('decide-o-mat-user');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('Failed to parse stored user data:', e);
            }
        }
        // Generate new user with UUID
        return {
            userId: generateUUID(),
            displayName: null
        };
    });

    // Persist user to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('decide-o-mat-user', JSON.stringify(user));
    }, [user]);

    const setDisplayName = (name) => {
        setUser(prev => ({
            ...prev,
            displayName: name
        }));
    };

    return (
        <UserContext.Provider value={{ user, setDisplayName }}>
            {children}
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
