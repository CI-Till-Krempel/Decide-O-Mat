import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { UserProvider, useUser } from './UserContext';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock firebase/auth
const mockOnAuthStateChanged = vi.fn();
const mockSignInWithPopup = vi.fn();
const mockSignOut = vi.fn();
const mockSignInAnonymously = vi.fn(() => Promise.resolve({ user: { uid: 'anon-uid', isAnonymous: true } }));

vi.mock('firebase/auth', () => ({
    getAuth: vi.fn(),
    connectAuthEmulator: vi.fn(),
    GoogleAuthProvider: vi.fn(() => ({})),
    signInWithPopup: (...args) => mockSignInWithPopup(...args),
    signInAnonymously: (...args) => mockSignInAnonymously(...args),
    signOut: (...args) => mockSignOut(...args),
    onAuthStateChanged: (...args) => mockOnAuthStateChanged(...args),
}));

// Mock services/firebase
vi.mock('../services/firebase', () => ({
    auth: {},
}));

// Test component to consume context
const TestComponent = () => {
    const { user, login, logout } = useUser();
    return (
        <div>
            <div data-testid="user-id">{user.userId}</div>
            <div data-testid="user-name">{user.displayName || 'null'}</div>
            <div data-testid="is-anonymous">{user.isAnonymous ? 'true' : 'false'}</div>
            <button onClick={login}>Login</button>
            <button onClick={logout}>Logout</button>
        </div>
    );
};

describe('UserContext', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        // Default onAuthStateChanged to return unsubscribe immediately
        mockOnAuthStateChanged.mockImplementation((auth, callback) => {
            // Simulate initial loading finished with no user
            callback(null);
            return () => { };
        });
    });

    it('triggers anonymous sign-in if no user', async () => {
        await act(async () => {
            render(
                <UserProvider>
                    <TestComponent />
                </UserProvider>
            );
        });

        expect(mockSignInAnonymously).toHaveBeenCalled();
        // Note: Since we mocked onAuthStateChanged to return null and stop, 
        // the state update from signInAnonymously won't happen unless we wire it up manually in the mock 
        // or verify the call effect.
    });

    it('updates user when auth state changes', async () => {
        let authCallback;
        mockOnAuthStateChanged.mockImplementation((auth, callback) => {
            authCallback = callback;
            return () => { };
        });

        await act(async () => {
            render(
                <UserProvider>
                    <TestComponent />
                </UserProvider>
            );
        });

        // Initially loading
        // Trigger auth update
        await act(async () => {
            authCallback({ uid: 'firebase-uid', displayName: 'Firebase User', photoURL: 'url' });
        });

        expect(screen.getByTestId('is-anonymous')).toHaveTextContent('false');
        expect(screen.getByTestId('user-id')).toHaveTextContent('firebase-uid');
        expect(screen.getByTestId('user-name')).toHaveTextContent('Firebase User');
    });
});
