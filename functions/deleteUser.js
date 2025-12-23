const {onCall, HttpsError} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

if (admin.apps.length === 0) {
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
  const db = admin.firestore();
  const batch = db.batch();
  let operationCount = 0;

  try {
    // 2. Determine "Deleted Name"
    const userRecord = await admin.auth().getUser(uid);
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
      const randomAnimal = animals[index];
      deletedName = `Deleted ${randomAnimal}`;
    }

    // 3. Find and Anonymize Data (Collection Group Queries)

    // A. Final Votes
    const finalVotesQuery = db.collectionGroup("finalVotes").where("userId", "==", uid);
    const finalVotesSnapshot = await finalVotesQuery.get();

    finalVotesSnapshot.forEach((doc) => {
      batch.update(doc.ref, {
        displayName: deletedName,
        userId: "deleted",
      });
      operationCount++;
    });

    // B. Argument Votes
    const votesQuery = db.collectionGroup("votes").where("userId", "==", uid);
    const votesSnapshot = await votesQuery.get();

    votesSnapshot.forEach((doc) => {
      batch.update(doc.ref, {
        displayName: deletedName,
      });
      operationCount++;
    });

    // Commit Anonymization
    if (operationCount > 0) {
      if (operationCount > 490) {
        // Simple chunking strategy not implemented yet.
      }
      await batch.commit();
    }

    // 4. Delete Auth User
    await admin.auth().deleteUser(uid);

    return {success: true, count: operationCount, anonymizedName: deletedName};
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new HttpsError("internal", "Failed to delete user account.", error);
  }
});
