import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { UserProvider, useUser } from './UserContext';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock firebase/auth
const mockOnAuthStateChanged = vi.fn();
const mockSignInWithPopup = vi.fn();
const mockSignOut = vi.fn();
const mockSignInAnonymously = vi.fn(() => Promise.resolve({ user: { uid: 'anon-uid', isAnonymous: true, providerData: [] } }));
const mockLinkWithPopup = vi.fn(() => Promise.resolve({ user: { uid: 'linked-user', displayName: 'Linked User', isAnonymous: false, providerData: [{ providerId: 'google.com' }] } }));
const mockLinkWithCredential = vi.fn(() => Promise.resolve({ user: { uid: 'linked-user', email: 'test@example.com', isAnonymous: false, providerData: [{ providerId: 'password' }] } }));
const mockCreateUser = vi.fn(() => Promise.resolve({ user: { uid: 'new-user', isAnonymous: false, providerData: [{ providerId: 'password' }] } }));

vi.mock('firebase/auth', () => ({
    getAuth: vi.fn(),
    connectAuthEmulator: vi.fn(),
    GoogleAuthProvider: class { },
    EmailAuthProvider: { credential: vi.fn() },
    signInWithPopup: (...args) => mockSignInWithPopup(...args),
    signInAnonymously: (...args) => mockSignInAnonymously(...args),
    signOut: (...args) => mockSignOut(...args),
    onAuthStateChanged: (...args) => mockOnAuthStateChanged(...args),
    createUserWithEmailAndPassword: (...args) => mockCreateUser(...args),
    signInWithEmailAndPassword: vi.fn(),
    sendPasswordResetEmail: vi.fn(),
    linkWithPopup: (...args) => mockLinkWithPopup(...args),
    linkWithCredential: (...args) => mockLinkWithCredential(...args),
    updateProfile: vi.fn(),
}));

// Mock services/firebase
vi.mock('../services/firebase', () => ({
    auth: { currentUser: { isAnonymous: true } }, // Default to anonymous for these tests
}));

// Test component to consume context
const TestComponent = () => {
    const { user, loginWithGoogle, registerEmail, logout } = useUser();
    return (
        <div>
            <div data-testid="user-id">{user ? user.userId : 'null'}</div>
            <div data-testid="user-name">{user ? user.displayName : 'null'}</div>
            <div data-testid="is-anonymous">{user && user.isAnonymous ? 'true' : 'false'}</div>
            <button onClick={() => loginWithGoogle(false)}>Login No Link</button>
            <button onClick={() => loginWithGoogle(true)}>Login With Link</button>
            <button onClick={() => registerEmail('t@t.com', 'p', false)}>Register No Link</button>
            <button onClick={() => registerEmail('t@t.com', 'p', true)}>Register With Link</button>
            <button onClick={logout}>Logout</button>
        </div>
    );
};

describe('UserContext', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        // Setup initial auth state as anonymous
        mockOnAuthStateChanged.mockImplementation((auth, callback) => {
            callback({ uid: 'anon-uid', isAnonymous: true, providerData: [] });
            return () => { };
        });
    });

    it('loginWithGoogle(false) calls signInWithPopup (new account)', async () => {
        await act(async () => { render(<UserProvider><TestComponent /></UserProvider>); });

        await act(async () => {
            screen.getByText('Login No Link').click();
        });

        expect(mockSignInWithPopup).toHaveBeenCalled();
        expect(mockLinkWithPopup).not.toHaveBeenCalled();
    });

    it('loginWithGoogle(true) calls linkWithPopup (link account)', async () => {
        // Ensure service mock reflects anonymous user
        const { auth } = await import('../services/firebase');
        auth.currentUser = { isAnonymous: true };

        await act(async () => { render(<UserProvider><TestComponent /></UserProvider>); });

        await act(async () => {
            screen.getByText('Login With Link').click();
        });

        expect(mockLinkWithPopup).toHaveBeenCalled();
        expect(mockSignInWithPopup).not.toHaveBeenCalled();
    });

    it('registerEmail(false) calls createUserWithEmailAndPassword (new account)', async () => {
        await act(async () => { render(<UserProvider><TestComponent /></UserProvider>); });

        await act(async () => {
            screen.getByText('Register No Link').click();
        });

        expect(mockCreateUser).toHaveBeenCalled();
        expect(mockLinkWithCredential).not.toHaveBeenCalled();
    });

    it('registerEmail(true) calls linkWithCredential (link account)', async () => {
        const { auth } = await import('../services/firebase');
        auth.currentUser = { isAnonymous: true };

        await act(async () => { render(<UserProvider><TestComponent /></UserProvider>); });

        await act(async () => {
            screen.getByText('Register With Link').click();
        });

        expect(mockLinkWithCredential).toHaveBeenCalled();
        expect(mockCreateUser).not.toHaveBeenCalled();
    });
});
