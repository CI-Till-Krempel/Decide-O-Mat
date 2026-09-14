import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ParticipantService from './ParticipantService';
import EncryptionService from './EncryptionService';
import { db, registerParticipant as registerParticipantCloudFn } from './firebase';
import { collection, onSnapshot } from 'firebase/firestore';

vi.mock('./firebase', () => ({
    db: { type: 'mock-db' },
    registerParticipant: vi.fn(),
}));

vi.mock('./EncryptionService', () => ({
    default: {
        encrypt: vi.fn(),
        decrypt: vi.fn(),
    },
}));

vi.mock('firebase/firestore', () => ({
    collection: vi.fn(),
    onSnapshot: vi.fn(),
}));

describe('ParticipantService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('registerParticipant', () => {
        it('does nothing if displayName is empty/null/undefined', async () => {
            await ParticipantService.registerParticipant('decision-1', '', null);
            await ParticipantService.registerParticipant('decision-1', null, null);
            await ParticipantService.registerParticipant('decision-1', undefined, null);

            expect(registerParticipantCloudFn).not.toHaveBeenCalled();
        });

        it('registers unencrypted plain name when no key is provided', async () => {
            registerParticipantCloudFn.mockResolvedValueOnce({ data: { success: true } });

            await ParticipantService.registerParticipant('decision-1', 'Alice', null);

            expect(registerParticipantCloudFn).toHaveBeenCalledWith('decision-1', null, 'Alice');
            expect(EncryptionService.encrypt).not.toHaveBeenCalled();
        });

        it('registers encrypted name when key is provided', async () => {
            EncryptionService.encrypt.mockResolvedValueOnce('encrypted-alice');
            registerParticipantCloudFn.mockResolvedValueOnce({ data: { success: true } });
            const mockKey = { type: 'mock-key' };

            await ParticipantService.registerParticipant('decision-1', 'Alice', mockKey);

            expect(EncryptionService.encrypt).toHaveBeenCalledWith('Alice', mockKey);
            expect(registerParticipantCloudFn).toHaveBeenCalledWith('decision-1', 'encrypted-alice', null);
        });

        it('logs and rethrows error if registerParticipantCloudFn throws', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const mockError = new Error('Network error');
            registerParticipantCloudFn.mockRejectedValueOnce(mockError);

            await expect(
                ParticipantService.registerParticipant('decision-1', 'Alice', null)
            ).rejects.toThrow('Network error');

            expect(consoleSpy).toHaveBeenCalledWith('Failed to register participant:', mockError);
        });
    });

    describe('subscribeToParticipants', () => {
        it('subscribes with onSnapshot and maps decrypted participants correctly', async () => {
            const mockCollection = { type: 'mock-collection' };
            collection.mockReturnValueOnce(mockCollection);

            let snapshotCallback;
            onSnapshot.mockImplementationOnce((ref, onNext) => {
                snapshotCallback = onNext;
                return () => 'unsubscribed';
            });

            const onUpdate = vi.fn();
            const mockKey = { type: 'mock-key' };

            const unsubscribe = ParticipantService.subscribeToParticipants('decision-1', mockKey, onUpdate);

            expect(collection).toHaveBeenCalledWith(db, 'decisions', 'decision-1', 'participants');
            expect(onSnapshot).toHaveBeenCalledWith(mockCollection, expect.any(Function), expect.any(Function));
            expect(unsubscribe()).toBe('unsubscribed');

            // Simulate firestore snapshot trigger
            const mockDocs = [
                {
                    id: 'user-1',
                    data: () => ({
                        encryptedDisplayName: 'enc-alice',
                        isAnonymous: false,
                        photoURL: 'alice.png',
                    }),
                },
                {
                    id: 'user-2',
                    data: () => ({
                        plainDisplayName: 'Bob',
                        isAnonymous: true,
                        photoURL: null,
                    }),
                },
                {
                    id: 'user-3',
                    data: () => ({
                        displayName: 'Charlie',
                        isAnonymous: false,
                        photoURL: 'charlie.png',
                    }),
                },
            ];

            EncryptionService.decrypt.mockResolvedValueOnce('Alice');

            // Trigger snapshot callback
            await snapshotCallback({ docs: mockDocs });

            expect(EncryptionService.decrypt).toHaveBeenCalledWith('enc-alice', mockKey);
            expect(onUpdate).toHaveBeenCalledTimes(1);

            const resultUpdateMap = onUpdate.mock.calls[0][0];
            expect(resultUpdateMap.size).toBe(3);
            expect(resultUpdateMap.get('user-1')).toEqual({ name: 'Alice', isAnonymous: false, photoURL: 'alice.png' });
            expect(resultUpdateMap.get('user-2')).toEqual({ name: 'Bob', isAnonymous: true, photoURL: null });
            expect(resultUpdateMap.get('user-3')).toEqual({ name: 'Charlie', isAnonymous: false, photoURL: 'charlie.png' });
        });

        it('falls back gracefully when decryption fails', async () => {
            const mockCollection = { type: 'mock-collection' };
            collection.mockReturnValueOnce(mockCollection);

            let snapshotCallback;
            onSnapshot.mockImplementationOnce((ref, onNext) => {
                snapshotCallback = onNext;
                return () => 'unsubscribed';
            });

            const onUpdate = vi.fn();
            const mockKey = { type: 'mock-key' };

            ParticipantService.subscribeToParticipants('decision-1', mockKey, onUpdate);

            const mockDocs = [
                {
                    id: 'user-1',
                    data: () => ({
                        encryptedDisplayName: 'broken-enc',
                        isAnonymous: true,
                        photoURL: null,
                    }),
                },
            ];

            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            const mockError = new Error('Decryption Failed');
            EncryptionService.decrypt.mockRejectedValueOnce(mockError);

            await snapshotCallback({ docs: mockDocs });

            expect(consoleSpy).toHaveBeenCalledWith('Failed to decrypt name for user user-1', mockError);
            expect(onUpdate).toHaveBeenCalledTimes(1);

            const resultUpdateMap = onUpdate.mock.calls[0][0];
            expect(resultUpdateMap.size).toBe(1);
            expect(resultUpdateMap.get('user-1')).toEqual({ name: 'Unknown (Decryption Failed)', isAnonymous: true, photoURL: null });
        });

        it('logs error if subscribing fails', () => {
            const mockCollection = { type: 'mock-collection' };
            collection.mockReturnValueOnce(mockCollection);

            let onErrorCallback;
            onSnapshot.mockImplementationOnce((ref, onNext, onError) => {
                onErrorCallback = onError;
                return () => {};
            });

            const onUpdate = vi.fn();
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            ParticipantService.subscribeToParticipants('decision-1', null, onUpdate);

            const mockError = new Error('Permission Denied');
            onErrorCallback(mockError);

            expect(consoleSpy).toHaveBeenCalledWith('Error fetching participants:', mockError);
            expect(onUpdate).not.toHaveBeenCalled();
        });
    });
});
