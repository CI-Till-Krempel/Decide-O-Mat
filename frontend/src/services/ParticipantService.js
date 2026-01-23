import { db, registerParticipant as registerParticipantCloudFn } from './firebase';
import EncryptionService from './EncryptionService';
import { collection, onSnapshot } from 'firebase/firestore';

const ParticipantService = {
    /**
     * Registers or updates the current user as a participant with an encrypted display name.
     * @param {string} decisionId 
     * @param {string} displayName 
     * @param {CryptoKey} key 
     */
    registerParticipant: async (decisionId, displayName, key) => {
        if (!displayName) return;

        try {
            if (key) {
                const encryptedName = await EncryptionService.encrypt(displayName, key);
                await registerParticipantCloudFn(decisionId, encryptedName, null);
            } else {
                // Unencrypted mode: Register plaintext name
                await registerParticipantCloudFn(decisionId, null, displayName);
            }
        } catch (error) {
            console.error("Failed to register participant:", error);
            throw error;
        }
    },

    /**
     * Subscribes to the participants collection of a decision.
     * Decrypts names on the fly.
     * @param {string} decisionId 
     * @param {CryptoKey} key 
     * @param {Function} onUpdate - callback(Map<userId, displayName>)
     * @returns {Function} unsubscribe
     */
    subscribeToParticipants: (decisionId, key, onUpdate) => {
        const participantsRef = collection(db, 'decisions', decisionId, 'participants');

        return onSnapshot(participantsRef, async (snapshot) => {
            const participantMap = new Map();

            const promises = snapshot.docs.map(async (doc) => {
                const data = doc.data();
                if (data.encryptedDisplayName && key) {
                    try {
                        const name = await EncryptionService.decrypt(data.encryptedDisplayName, key);
                        participantMap.set(doc.id, { name, isAnonymous: data.isAnonymous, photoURL: data.photoURL });
                    } catch (e) {
                        console.warn(`Failed to decrypt name for user ${doc.id}`, e);
                        participantMap.set(doc.id, { name: "Unknown (Decryption Failed)", isAnonymous: data.isAnonymous, photoURL: data.photoURL });
                    }
                } else if (data.plainDisplayName) {
                    // Support unencrypted names
                    participantMap.set(doc.id, { name: data.plainDisplayName, isAnonymous: data.isAnonymous, photoURL: data.photoURL });
                } else if (data.displayName) {
                    // Fallback for logic that might write 'displayName'
                    participantMap.set(doc.id, { name: data.displayName, isAnonymous: data.isAnonymous, photoURL: data.photoURL });
                }
            });

            await Promise.all(promises);
            onUpdate(participantMap);
        }, (error) => {
            console.error("Error fetching participants:", error);
        });
    }
};

export default ParticipantService;
