import React from "react";
import { render, screen, act } from "@testing-library/react";
import { UserProvider, useUser } from "./UserContext";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock firebase/auth
const mockOnAuthStateChanged = vi.fn();
const mockSignInWithPopup = vi.fn();
const mockSignOut = vi.fn();
const mockSignInAnonymously = vi.fn(() => Promise.resolve({ user: { uid: "anon-uid", isAnonymous: true, providerData: [] } }));
const mockLinkWithPopup = vi.fn(() => Promise.resolve({ user: { uid: "linked-user", displayName: "Linked User", isAnonymous: false, providerData: [{ providerId: "google.com" }] } }));
const mockLinkWithCredential = vi.fn(() => Promise.resolve({ user: { uid: "linked-user", email: "test@example.com", isAnonymous: false, providerData: [{ providerId: "password" }] } }));
const mockCreateUser = vi.fn(() => Promise.resolve({ user: { uid: "new-user", isAnonymous: false, providerData: [{ providerId: "password" }] } }));
const mockSignInWithEmailAndPassword = vi.fn(() => Promise.resolve({ user: { uid: "email-uid" } }));
const mockSendPasswordResetEmail = vi.fn(() => Promise.resolve());
const mockUpdateProfile = vi.fn(() => Promise.resolve());
const mockReauthenticateWithPopup = vi.fn(() => Promise.resolve());
const mockReauthenticateWithCredential = vi.fn(() => Promise.resolve());

vi.mock("firebase/auth", () => ({
    getAuth: vi.fn(),
    connectAuthEmulator: vi.fn(),
    GoogleAuthProvider: class {
        setCustomParameters = vi.fn();
    },
    EmailAuthProvider: {
        credential: vi.fn((email, password) => ({ providerId: "password", email, password })),
    },
    signInWithPopup: (...args) => mockSignInWithPopup(...args),
    signInAnonymously: (...args) => mockSignInAnonymously(...args),
    signOut: (...args) => mockSignOut(...args),
    onAuthStateChanged: (...args) => mockOnAuthStateChanged(...args),
    createUserWithEmailAndPassword: (...args) => mockCreateUser(...args),
    signInWithEmailAndPassword: (...args) => mockSignInWithEmailAndPassword(...args),
    sendPasswordResetEmail: (...args) => mockSendPasswordResetEmail(...args),
    linkWithPopup: (...args) => mockLinkWithPopup(...args),
    linkWithCredential: (...args) => mockLinkWithCredential(...args),
    updateProfile: (...args) => mockUpdateProfile(...args),
    reauthenticateWithPopup: (...args) => mockReauthenticateWithPopup(...args),
    reauthenticateWithCredential: (...args) => mockReauthenticateWithCredential(...args),
}));

// Mock services/firebase
const mockDeleteUser = vi.fn(() => Promise.resolve());
vi.mock("../services/firebase", () => ({
    auth: { currentUser: { isAnonymous: true } },
    deleteUser: (...args) => mockDeleteUser(...args),
}));

// Test component to consume context
let latestContext;
const TestComponent = () => {
    const context = useUser();
    React.useEffect(() => {
        latestContext = context;
    }, [context]);
    const { user, loginWithGoogle, registerEmail, logout } = context;
    return (
        <div>
            <div data-testid="user-id">{user ? user.userId : "null"}</div>
            <div data-testid="user-name">{user ? user.displayName : "null"}</div>
            <div data-testid="is-anonymous">{user && user.isAnonymous ? "true" : "false"}</div>
            <button onClick={() => loginWithGoogle(false)}>Login No Link</button>
            <button onClick={() => loginWithGoogle(true)}>Login With Link</button>
            <button onClick={() => registerEmail("t@t.com", "p", false)}>Register No Link</button>
            <button onClick={() => registerEmail("t@t.com", "p", true)}>Register With Link</button>
            <button onClick={logout}>Logout</button>
        </div>
    );
};

describe("UserContext", () => {
    let mockUser;

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        mockUser = {
            uid: "anon-uid",
            isAnonymous: true,
            providerData: [],
            displayName: "Test User",
        };
        mockOnAuthStateChanged.mockImplementation((auth, callback) => {
            callback(mockUser);
            return () => {};
        });
    });

    it("throws error when useUser is rendered outside UserProvider", () => {
        const FailingComponent = () => {
            useUser();
            return null;
        };
        expect(() => render(<FailingComponent />)).toThrow("useUser must be used within a UserProvider");
    });

    it("loginWithGoogle(false) calls signInWithPopup (new account)", async () => {
        await act(async () => { render(<UserProvider><TestComponent /></UserProvider>); });

        await act(async () => {
            screen.getByText("Login No Link").click();
        });

        expect(mockSignInWithPopup).toHaveBeenCalled();
        expect(mockLinkWithPopup).not.toHaveBeenCalled();
    });

    it("loginWithGoogle(true) calls linkWithPopup (link account)", async () => {
        const { auth } = await import("../services/firebase");
        auth.currentUser = { isAnonymous: true };

        await act(async () => { render(<UserProvider><TestComponent /></UserProvider>); });

        await act(async () => {
            screen.getByText("Login With Link").click();
        });

        expect(mockLinkWithPopup).toHaveBeenCalled();
        expect(mockSignInWithPopup).not.toHaveBeenCalled();
    });

    it("loginWithGoogle(true) falls back to signInWithPopup if credential already in use", async () => {
        const { auth } = await import("../services/firebase");
        auth.currentUser = { isAnonymous: true };
        const credentialError = new Error("Credential in use");
        credentialError.code = "auth/credential-already-in-use";
        mockLinkWithPopup.mockRejectedValueOnce(credentialError);
        mockSignInWithPopup.mockResolvedValueOnce({ user: { uid: "existing-google-user" } });

        await act(async () => { render(<UserProvider><TestComponent /></UserProvider>); });

        await act(async () => {
            await latestContext.loginWithGoogle(true);
        });

        expect(mockLinkWithPopup).toHaveBeenCalled();
        expect(mockSignInWithPopup).toHaveBeenCalled();
    });

    it("registerEmail(false) calls createUserWithEmailAndPassword (new account)", async () => {
        await act(async () => { render(<UserProvider><TestComponent /></UserProvider>); });

        await act(async () => {
            screen.getByText("Register No Link").click();
        });

        expect(mockCreateUser).toHaveBeenCalled();
        expect(mockLinkWithCredential).not.toHaveBeenCalled();
    });

    it("registerEmail(true) calls linkWithCredential (link account)", async () => {
        const { auth } = await import("../services/firebase");
        auth.currentUser = { isAnonymous: true };

        await act(async () => { render(<UserProvider><TestComponent /></UserProvider>); });

        await act(async () => {
            screen.getByText("Register With Link").click();
        });

        expect(mockLinkWithCredential).toHaveBeenCalled();
        expect(mockCreateUser).not.toHaveBeenCalled();
    });

    it("loginEmail calls signInWithEmailAndPassword", async () => {
        await act(async () => { render(<UserProvider><TestComponent /></UserProvider>); });

        await act(async () => {
            await latestContext.loginEmail("user@example.com", "password123");
        });

        expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
            expect.anything(),
            "user@example.com",
            "password123"
        );
    });

    it("loginEmail rethrows on failure", async () => {
        mockSignInWithEmailAndPassword.mockRejectedValueOnce(new Error("Invalid credentials"));

        await act(async () => { render(<UserProvider><TestComponent /></UserProvider>); });

        await expect(
            latestContext.loginEmail("user@example.com", "wrongpass")
        ).rejects.toThrow("Invalid credentials");
    });

    it("resetPassword calls sendPasswordResetEmail", async () => {
        await act(async () => { render(<UserProvider><TestComponent /></UserProvider>); });

        await act(async () => {
            await latestContext.resetPassword("reset@example.com");
        });

        expect(mockSendPasswordResetEmail).toHaveBeenCalledWith(
            expect.anything(),
            "reset@example.com"
        );
    });

    it("resetPassword rethrows on failure", async () => {
        mockSendPasswordResetEmail.mockRejectedValueOnce(new Error("Email not found"));

        await act(async () => { render(<UserProvider><TestComponent /></UserProvider>); });

        await expect(
            latestContext.resetPassword("nonexistent@example.com")
        ).rejects.toThrow("Email not found");
    });

    it("logout calls signOut", async () => {
        await act(async () => { render(<UserProvider><TestComponent /></UserProvider>); });

        await act(async () => {
            await latestContext.logout();
        });

        expect(mockSignOut).toHaveBeenCalled();
    });

    it("setDisplayName updates state, localStorage, and updates Firebase user profile", async () => {
        await act(async () => { render(<UserProvider><TestComponent /></UserProvider>); });

        await act(async () => {
            await latestContext.setDisplayName("Updated Hero");
        });

        expect(latestContext.user.displayName).toBe("Updated Hero");
        expect(localStorage.getItem("dom_display_name")).toBe("Updated Hero");
        expect(mockUpdateProfile).toHaveBeenCalledWith(
            expect.anything(),
            { displayName: "Updated Hero" }
        );
    });

    it("getInitialName retrieves name from localStorage", async () => {
        localStorage.setItem("dom_initial_name", "Initial Explorer");

        await act(async () => { render(<UserProvider><TestComponent /></UserProvider>); });

        expect(latestContext.getInitialName()).toBe("Initial Explorer");
    });

    it("resetToInitialName restores existing initial name", async () => {
        localStorage.setItem("dom_initial_name", "Initial Explorer");

        await act(async () => { render(<UserProvider><TestComponent /></UserProvider>); });

        let restored;
        await act(async () => {
            restored = latestContext.resetToInitialName();
        });

        expect(restored).toBe("Initial Explorer");
        expect(latestContext.user.displayName).toBe("Initial Explorer");
    });

    it("resetToInitialName generates and saves new initial name if none exists", async () => {
        await act(async () => { render(<UserProvider><TestComponent /></UserProvider>); });

        let generated;
        await act(async () => {
            generated = latestContext.resetToInitialName();
        });

        expect(generated).toBeTruthy();
        expect(localStorage.getItem("dom_initial_name")).toBe(generated);
        expect(latestContext.user.displayName).toBe(generated);
    });

    it("deleteAccount deletes anonymous user without reauthentication and cleans localStorage", async () => {
        localStorage.setItem("dom_display_name_uid", "anon-uid");
        localStorage.setItem("dom_initial_name", "Anonymous Bear");

        await act(async () => { render(<UserProvider><TestComponent /></UserProvider>); });

        await act(async () => {
            await latestContext.deleteAccount();
        });

        expect(mockReauthenticateWithPopup).not.toHaveBeenCalled();
        expect(mockReauthenticateWithCredential).not.toHaveBeenCalled();
        expect(mockDeleteUser).toHaveBeenCalled();
        expect(mockSignOut).toHaveBeenCalled();
        expect(localStorage.getItem("dom_display_name_uid")).toBeNull();
        expect(localStorage.getItem("dom_initial_name")).toBeNull();
    });

    it("deleteAccount reauthenticates Google user with popup", async () => {
        mockUser.providerData = [{ providerId: "google.com" }];

        await act(async () => { render(<UserProvider><TestComponent /></UserProvider>); });

        await act(async () => {
            await latestContext.deleteAccount();
        });

        expect(mockReauthenticateWithPopup).toHaveBeenCalled();
        expect(mockDeleteUser).toHaveBeenCalled();
        expect(mockSignOut).toHaveBeenCalled();
    });

    it("deleteAccount reauthenticates password user with credential", async () => {
        mockUser.providerData = [{ providerId: "password" }];
        mockUser.email = "registered@example.com";

        await act(async () => { render(<UserProvider><TestComponent /></UserProvider>); });

        await act(async () => {
            await latestContext.deleteAccount("secret123");
        });

        expect(mockReauthenticateWithCredential).toHaveBeenCalled();
        expect(mockDeleteUser).toHaveBeenCalled();
        expect(mockSignOut).toHaveBeenCalled();
    });

    it("deleteAccount throws if password is missing for password user", async () => {
        mockUser.providerData = [{ providerId: "password" }];
        mockUser.email = "registered@example.com";

        await act(async () => { render(<UserProvider><TestComponent /></UserProvider>); });

        await expect(latestContext.deleteAccount()).rejects.toThrow("Password required for deletion");
    });
});
