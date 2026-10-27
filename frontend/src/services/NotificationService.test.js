import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getToken, onMessage } from "firebase/messaging";
import { doc, updateDoc } from "firebase/firestore";

const { mockMessaging, mockDb } = vi.hoisted(() => ({
    mockMessaging: { isMockMessaging: true },
    mockDb: { type: "mock-db" }
}));

vi.mock("./firebase", () => ({
    app: { name: "mock-app" }
}));

vi.mock("firebase/messaging", () => ({
    getMessaging: vi.fn(() => mockMessaging),
    getToken: vi.fn(),
    onMessage: vi.fn()
}));

vi.mock("firebase/firestore", () => ({
    getFirestore: vi.fn(() => mockDb),
    doc: vi.fn(),
    updateDoc: vi.fn()
}));

import NotificationService from "./NotificationService";

describe("NotificationService", () => {
    const originalNotification = globalThis.Notification;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        globalThis.Notification = originalNotification;
    });

    describe("requestPermission", () => {
        it("returns false when Notification API is undefined", async () => {
            delete globalThis.Notification;
            const result = await NotificationService.requestPermission("dec-1", "user-1");
            expect(result).toBe(false);
        });

        it("returns false when permission is denied", async () => {
            globalThis.Notification = {
                requestPermission: vi.fn().mockResolvedValue("denied")
            };

            const result = await NotificationService.requestPermission("dec-1", "user-1");
            expect(result).toBe(false);
            expect(getToken).not.toHaveBeenCalled();
        });

        it("returns false when permission is default", async () => {
            globalThis.Notification = {
                requestPermission: vi.fn().mockResolvedValue("default")
            };

            const result = await NotificationService.requestPermission("dec-1", "user-1");
            expect(result).toBe(false);
            expect(getToken).not.toHaveBeenCalled();
        });

        it("returns true and saves token when permission is granted and token retrieved", async () => {
            globalThis.Notification = {
                requestPermission: vi.fn().mockResolvedValue("granted")
            };
            getToken.mockResolvedValue("fcm-token-123");
            const saveTokenSpy = vi.spyOn(NotificationService, "saveToken").mockResolvedValue();

            const result = await NotificationService.requestPermission("dec-1", "user-1");
            expect(result).toBe(true);
            expect(saveTokenSpy).toHaveBeenCalledWith("dec-1", "user-1", "fcm-token-123");
            saveTokenSpy.mockRestore();
        });

        it("returns false when permission is granted but getToken returns null", async () => {
            globalThis.Notification = {
                requestPermission: vi.fn().mockResolvedValue("granted")
            };
            getToken.mockResolvedValue(null);
            const saveTokenSpy = vi.spyOn(NotificationService, "saveToken");

            const result = await NotificationService.requestPermission("dec-1", "user-1");
            expect(result).toBe(false);
            expect(saveTokenSpy).not.toHaveBeenCalled();
        });

        it("catches and logs error when requestPermission throws", async () => {
            const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
            globalThis.Notification = {
                requestPermission: vi.fn().mockRejectedValue(new Error("Permission error"))
            };

            const result = await NotificationService.requestPermission("dec-1", "user-1");
            expect(result).toBe(false);
            expect(consoleSpy).toHaveBeenCalledWith("Unable to get permission or token.", expect.any(Error));
            consoleSpy.mockRestore();
        });
    });

    describe("saveToken", () => {
        it("does nothing if decisionId, userId, or token is missing", async () => {
            await NotificationService.saveToken("", "user-1", "token-1");
            await NotificationService.saveToken("dec-1", "", "token-1");
            await NotificationService.saveToken("dec-1", "user-1", "");
            await NotificationService.saveToken(null, null, null);

            expect(doc).not.toHaveBeenCalled();
            expect(updateDoc).not.toHaveBeenCalled();
        });

        it("saves token to the participant document in firestore", async () => {
            const mockRef = { path: "decisions/dec-1/participants/user-1" };
            doc.mockReturnValue(mockRef);
            updateDoc.mockResolvedValue();

            await NotificationService.saveToken("dec-1", "user-1", "token-123");

            expect(doc).toHaveBeenCalledWith(mockDb, "decisions", "dec-1", "participants", "user-1");
            expect(updateDoc).toHaveBeenCalledWith(mockRef, { fcmToken: "token-123" });
        });

        it("handles and logs firestore update errors gracefully", async () => {
            const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
            const mockRef = { path: "decisions/dec-1/participants/user-1" };
            doc.mockReturnValue(mockRef);
            updateDoc.mockRejectedValue(new Error("Firestore write failed"));

            await NotificationService.saveToken("dec-1", "user-1", "token-123");

            expect(consoleSpy).toHaveBeenCalledWith("Error saving FCM token:", expect.any(Error));
            consoleSpy.mockRestore();
        });
    });

    describe("onMessageListener", () => {
        it("resolves with the payload when a message is received", async () => {
            const mockPayload = { notification: { title: "New vote" } };
            onMessage.mockImplementation((messagingInstance, callback) => {
                callback(mockPayload);
                return vi.fn();
            });

            const result = await NotificationService.onMessageListener();
            expect(result).toEqual(mockPayload);
        });
    });
});
