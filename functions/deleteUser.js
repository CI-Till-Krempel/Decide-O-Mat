const {onCall, HttpsError} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const {getApps} = require("firebase-admin/app");
const {FieldValue, getFirestore} = require("firebase-admin/firestore");
const {getAuth} = require("firebase-admin/auth");

if (getApps().length === 0) {
  admin.initializeApp();
}

const animals = [
  "Alpaca", "Ant", "Anteater", "Antelope", "Armadillo", "Badger", "Bat", "Bear", "Beaver", "Bee",
  "Beetle", "Bird", "Bison", "Butterfly", "Camel", "Capybara", "Cat", "Chameleon", "Cheetah",
  "Chicken", "Chimpanzee", "Chinchilla", "Cobra", "Cow", "Crab", "Crocodile", "Crow", "Deer",
  "Dog", "Dolphin", "Donkey", "Duck", "Eagle", "Elephant", "Elk", "Emu", "Falcon", "Ferret",
  "Fish", "Flamingo", "Fox", "Frog", "Gazelle", "Gecko", "Giraffe", "Goat", "Goose", "Gorilla",
  "Grasshopper", "Guinea Pig", "Hamster", "Hawk", "Hedgehog", "Hippo", "Horse", "Hyena", "Iguana",
  "Impala", "Jaguar", "Jellyfish", "Kangaroo", "Koala", "Komodo Dragon", "Lemur", "Leopard",
  "Lion", "Lizard", "Llama", "Lobster", "Lynx", "Manatee", "Mantis", "Meerkat", "Mole", "Monkey",
  "Moose", "Mouse", "Narwhal", "Newt", "Octopus", "Ostrich", "Otter", "Owl", "Oyster", "Panther",
  "Parrot", "Peacock", "Pelican", "Penguin", "Pig", "Pigeon", "Platypus", "Polar Bear", "Porcupine",
  "Possum", "Pug", "Puffin", "Puma", "Quail", "Rabbit", "Raccoon", "Ram", "Rat", "Raven", "Reindeer",
  "Rhino", "Salamander", "Salmon", "Scorpion", "Seahorse", "Seal", "Shark", "Sheep", "Shrimp",
  "Skunk", "Sloth", "Snail", "Snake", "Spider", "Squid", "Squirrel", "Starfish", "Stork", "Swan",
  "Tapir", "Tiger", "Toad", "Tortoise", "Toucan", "Turkey", "Turtle", "Viper", "Vulture", "Walrus",
  "Wasp", "Weasel", "Whale", "Wolf", "Wombat", "Woodpecker", "Worm", "Yak", "Zebra",
];

// Staging/Prod differentiation: Enforce App Check ONLY in Prod ('decide-o-mat')
const {enforceAppCheck} = require("./config");

exports.deleteUser = onCall({cors: true, enforceAppCheck: enforceAppCheck}, async (request) => {
  // 1. Authentication Check
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
  }

  const uid = request.auth.uid;
  const db = getFirestore();
  const BATCH_LIMIT = 490;

  // Helper: commit the current batch and return a fresh one.
  const flushBatch = async (b) => {
    await b.commit();
    return db.batch();
  };

  try {
    // 2. Determine "Deleted Name"
    const userRecord = await getAuth().getUser(uid);
    let deletedName = "Deleted Bear"; // Default fallback

    if (userRecord.displayName && userRecord.displayName.startsWith("Anonymous ")) {
      const animal = userRecord.displayName.replace("Anonymous ", "");
      if (animals.includes(animal)) {
        deletedName = `Deleted ${animal}`;
      }
    } else {
      // Deterministic selection based on UID
      let hash = 0;
      for (let i = 0; i < uid.length; i++) {
        hash = (hash << 5) - hash + uid.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
      }
      const index = Math.abs(hash) % animals.length;
      deletedName = `Deleted ${animals[index]}`;
    }

    // 3. Find and Anonymize Data (Collection Group Queries)
    let batch = db.batch();
    let operationCount = 0;

    // A. Final Votes
    const finalVotesQuery = db.collectionGroup("finalVotes").where("userId", "==", uid);
    const finalVotesSnapshot = await finalVotesQuery.get();

    for (const docSnap of finalVotesSnapshot.docs) {
      batch.update(docSnap.ref, {displayName: deletedName, userId: "deleted"});
      operationCount++;
      if (operationCount >= BATCH_LIMIT) {
        batch = await flushBatch(batch);
        operationCount = 0;
      }
    }

    // B. Argument Votes
    const votesQuery = db.collectionGroup("votes").where("userId", "==", uid);
    const votesSnapshot = await votesQuery.get();

    for (const docSnap of votesSnapshot.docs) {
      batch.update(docSnap.ref, {displayName: deletedName, userId: "deleted"});
      operationCount++;
      if (operationCount >= BATCH_LIMIT) {
        batch = await flushBatch(batch);
        operationCount = 0;
      }
    }

    // C. Arguments authored by this user
    const argumentsQuery = db.collectionGroup("arguments").where("authorId", "==", uid);
    const argumentsSnapshot = await argumentsQuery.get();

    for (const docSnap of argumentsSnapshot.docs) {
      batch.update(docSnap.ref, {authorName: deletedName, authorId: "deleted"});
      operationCount++;
      if (operationCount >= BATCH_LIMIT) {
        batch = await flushBatch(batch);
        operationCount = 0;
      }
    }

    // D. Participant Records
    // Anonymize the display name and remove device-linked PII (FCM token, photo).
    // Participant docs are keyed by userId, so we query via decisions where the user
    // participated (participantIds already has a collection-scoped index).
    // batch.set with merge avoids a per-document read before updating.
    const decisionsQuery = db.collection("decisions")
        .where("participantIds", "array-contains", uid);
    const decisionsSnapshot = await decisionsQuery.get();

    for (const decisionDoc of decisionsSnapshot.docs) {
      const participantRef = decisionDoc.ref.collection("participants").doc(uid);
      batch.set(participantRef, {
        plainDisplayName: deletedName,
        encryptedDisplayName: FieldValue.delete(),
        fcmToken: FieldValue.delete(),
        photoURL: FieldValue.delete(),
      }, {merge: true});
      operationCount++;
      if (operationCount >= BATCH_LIMIT) {
        batch = await flushBatch(batch);
        operationCount = 0;
      }
    }

    // E. Decisions Owned by this user (#402)
    const ownedDecisionsQuery = db.collection("decisions").where("ownerId", "==", uid);
    const ownedDecisionsSnapshot = await ownedDecisionsQuery.get();

    for (const decisionDoc of ownedDecisionsSnapshot.docs) {
      const decisionData = decisionDoc.data();
      const otherParticipants = (decisionData.participantIds || []).filter((id) => id !== uid);

      if (otherParticipants.length === 0) {
        // Solo decision: cascade delete all subcollections and document
        const argsSnapshot = await decisionDoc.ref.collection("arguments").get();
        for (const argDoc of argsSnapshot.docs) {
          const votesSnapshot = await argDoc.ref.collection("votes").get();
          for (const voteDoc of votesSnapshot.docs) {
            batch.delete(voteDoc.ref);
            operationCount++;
            if (operationCount >= BATCH_LIMIT) {
              batch = await flushBatch(batch);
              operationCount = 0;
            }
          }
          batch.delete(argDoc.ref);
          operationCount++;
          if (operationCount >= BATCH_LIMIT) {
            batch = await flushBatch(batch);
            operationCount = 0;
          }
        }

        const finalVotesSnapshot = await decisionDoc.ref.collection("finalVotes").get();
        for (const voteDoc of finalVotesSnapshot.docs) {
          batch.delete(voteDoc.ref);
          operationCount++;
          if (operationCount >= BATCH_LIMIT) {
            batch = await flushBatch(batch);
            operationCount = 0;
          }
        }

        const participantsSnapshot = await decisionDoc.ref.collection("participants").get();
        for (const participantDoc of participantsSnapshot.docs) {
          batch.delete(participantDoc.ref);
          operationCount++;
          if (operationCount >= BATCH_LIMIT) {
            batch = await flushBatch(batch);
            operationCount = 0;
          }
        }

        batch.delete(decisionDoc.ref);
        operationCount++;
        if (operationCount >= BATCH_LIMIT) {
          batch = await flushBatch(batch);
          operationCount = 0;
        }
      } else {
        // Shared decision: freeze/close decision and anonymize ownerId
        batch.update(decisionDoc.ref, {
          ownerId: "deleted",
          isClosed: true,
          closedAt: FieldValue.serverTimestamp(),
          ownerDisplayName: deletedName,
        });
        operationCount++;
        if (operationCount >= BATCH_LIMIT) {
          batch = await flushBatch(batch);
          operationCount = 0;
        }
      }
    }

    // Commit any remaining operations
    if (operationCount > 0) {
      await batch.commit();
    }

    // 4. Delete Auth User — done last so anonymization always completes first
    await getAuth().deleteUser(uid);

    return {success: true, anonymizedName: deletedName};
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new HttpsError("internal", "Failed to delete user account.", error);
  }
});
