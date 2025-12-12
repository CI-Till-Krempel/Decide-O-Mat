const {onCall, HttpsError} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const {FieldValue} = require("firebase-admin/firestore");

// setGlobalOptions({region: "europe-west1"});

admin.initializeApp();
const db = admin.firestore();

/**
 * Creates a new decision.
 * @param {Object} request - The request object.
 * @param {string} request.data.question - The question to decide on.
 * @return {Promise<Object>} The created decision ID.
 */
exports.createDecision = onCall({cors: true}, async (request) => {
  const question = request.data.question;

  if (!question || typeof question !== "string" || question.trim().length === 0) {
    throw new HttpsError("invalid-argument", "The function must be called with a valid 'question' argument.");
  }

  if (question.length > 1000) {
    throw new HttpsError("invalid-argument", "Question must be under 1000 characters.");
  }

  const decisionRef = db.collection("decisions").doc();

  await decisionRef.set({
    question: question.trim(),
    createdAt: FieldValue.serverTimestamp(),
  });

  return {id: decisionRef.id};
});

/**
 * Adds an argument (pro or con) to a decision.
 * @param {Object} request - The request object.
 * @param {string} request.data.decisionId - The ID of the decision.
 * @param {string} request.data.type - 'pro' or 'con'.
 * @param {string} request.data.text - The argument text.
 * @param {string} [request.data.authorName] - Optional display name of the author.
 * @param {string} [request.data.authorId] - Optional unique ID of the author.
 * @return {Promise<Object>} The created argument ID.
 */
exports.addArgument = onCall({cors: true}, async (request) => {
  const {decisionId, type, text, authorName, authorId} = request.data;

  if (!decisionId || !type || !text) {
    throw new HttpsError("invalid-argument", "Missing required arguments: decisionId, type, text.");
  }

  if (type !== "pro" && type !== "con") {
    throw new HttpsError("invalid-argument", "Type must be 'pro' or 'con'.");
  }

  if (text.trim().length === 0 || text.length > 2000) {
    throw new HttpsError("invalid-argument", "Text must be between 1 and 2000 characters.");
  }

  const decisionRef = db.collection("decisions").doc(decisionId);
  const doc = await decisionRef.get();

  if (!doc.exists) {
    throw new HttpsError("not-found", "Decision not found.");
  }

  const argumentRef = decisionRef.collection("arguments").doc();

  const argumentData = {
    type,
    text: text.trim(),
    votes: 0,
    createdAt: FieldValue.serverTimestamp(),
  };

  // Add optional author information if provided
  if (authorName) {
    argumentData.authorName = authorName;
  }
  if (authorId) {
    argumentData.authorId = authorId;
  }

  await argumentRef.set(argumentData);

  return {id: argumentRef.id};
});

/**
 * Votes on an argument.
 * @param {Object} request - The request object.
 * @param {string} request.data.decisionId - The ID of the decision.
 * @param {string} request.data.argumentId - The ID of the argument.
 * @param {number} request.data.change - Vote change (1 to vote, -1 to unvote).
 * @return {Promise<Object>} Success status.
 */
exports.voteArgument = onCall({cors: true}, async (request) => {
  // Authentication required
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
  }

  const {decisionId, argumentId} = request.data;
  const userId = request.auth.uid;

  if (!decisionId || !argumentId) {
    throw new HttpsError("invalid-argument", "Missing required arguments: decisionId, argumentId.");
  }

  const decisionRef = db.collection("decisions").doc(decisionId);
  const decisionDoc = await decisionRef.get();

  if (!decisionDoc.exists) {
    throw new HttpsError("not-found", "Decision not found.");
  }

  if (decisionDoc.data().status === "closed") {
    throw new HttpsError("failed-precondition", "Decision is closed.");
  }

  const argumentRef = decisionRef.collection("arguments").doc(argumentId);
  const argumentDoc = await argumentRef.get();

  if (!argumentDoc.exists) {
    throw new HttpsError("not-found", "Argument not found.");
  }

  // Check if user has already voted for this argument
  const voteRef = argumentRef.collection("votes").doc(userId);

  // Use a transaction to ensure atomic updates
  await db.runTransaction(async (transaction) => {
    const existingVote = await transaction.get(voteRef);

    if (existingVote.exists) {
      // User is trying to vote again - remove their vote (unvote)
      transaction.delete(voteRef);
      transaction.update(argumentRef, {
        votes: FieldValue.increment(-1),
      });
    } else {
      // New vote
      transaction.set(voteRef, {
        userId: userId,
        displayName: request.data.displayName || null, // Restore for unencrypted
        createdAt: FieldValue.serverTimestamp(),
      });
      transaction.update(argumentRef, {
        votes: FieldValue.increment(1),
      });
    }
  });

  return {success: true};
});

exports.toggleDecisionStatus = onCall({cors: true}, async (request) => {
  const {decisionId, status} = request.data;

  if (!decisionId || !status) {
    throw new HttpsError("invalid-argument", "Missing decisionId or status");
  }

  if (status !== "open" && status !== "closed") {
    throw new HttpsError("invalid-argument", "Status must be 'open' or 'closed'");
  }

  const decisionRef = admin.firestore().collection("decisions").doc(decisionId);
  const decisionDoc = await decisionRef.get();

  if (!decisionDoc.exists) {
    throw new HttpsError("not-found", "Decision not found");
  }

  await decisionRef.update({status: status});

  return {success: true, status: status};
});

exports.voteDecision = onCall({cors: true}, async (request) => {
  // Authentication required
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
  }

  const {decisionId, vote} = request.data;
  const userId = request.auth.uid;

  if (!decisionId || !vote) {
    throw new HttpsError("invalid-argument", "Missing decisionId or vote");
  }

  if (vote !== "yes" && vote !== "no") {
    throw new HttpsError("invalid-argument", "Vote must be 'yes' or 'no'");
  }

  const decisionRef = admin.firestore().collection("decisions").doc(decisionId);
  const decisionDoc = await decisionRef.get();

  if (!decisionDoc.exists) {
    throw new HttpsError("not-found", "Decision not found");
  }

  if (decisionDoc.data().status === "closed") {
    throw new HttpsError("failed-precondition", "Decision is closed");
  }

  // Check if user has already voted
  const voteRef = decisionRef.collection("finalVotes").doc(userId);

  // Use a transaction to ensure atomic updates
  await admin.firestore().runTransaction(async (transaction) => {
    const existingVote = await transaction.get(voteRef);
    let yesChange = 0;
    let noChange = 0;

    if (existingVote.exists) {
      const previousVote = existingVote.data().vote;

      if (previousVote === vote) {
        // User is trying to vote the same way again - no change needed
        return;
      }

      // User is changing their vote
      if (previousVote === "yes") {
        yesChange = -1;
        noChange = 1;
      } else {
        yesChange = 1;
        noChange = -1;
      }

      // Update the vote
      transaction.update(voteRef, {
        vote: vote,
        displayName: request.data.displayName || null, // Restore for unencrypted
        updatedAt: FieldValue.serverTimestamp(),
      });
    } else {
      // New vote
      if (vote === "yes") {
        yesChange = 1;
      } else {
        noChange = 1;
      }

      // Create the vote record
      transaction.set(voteRef, {
        vote: vote,
        userId: userId,
        displayName: request.data.displayName || null, // Restore displayName for unencrypted support
        createdAt: FieldValue.serverTimestamp(),
      });
    }

    // Update the aggregate counts
    transaction.update(decisionRef, {
      yesVotes: FieldValue.increment(yesChange),
      noVotes: FieldValue.increment(noChange),
    });
  });

  return {success: true};
});

/**
 * Updates a user's display name across their votes in a specific decision.
 * @param {Object} request - The request object.
 * @param {string} request.data.decisionId - The decision ID.
 * @param {string} request.data.userId - The user ID.
 * @param {string} request.data.displayName - The new display name.
 * @return {Promise<Object>} Success status.
 */
exports.updateUserDisplayName = onCall({cors: true}, async (request) => {
  // Authentication required
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
  }

  const {decisionId, displayName} = request.data;
  const userId = request.auth.uid;

  if (!decisionId || !displayName) {
    throw new HttpsError("invalid-argument", "Missing valid arguments.");
  }

  const db = admin.firestore();
  const decisionRef = db.collection("decisions").doc(decisionId);
  const decisionDoc = await decisionRef.get();

  if (!decisionDoc.exists) {
    throw new HttpsError("not-found", "Decision not found.");
  }

  const batch = db.batch();
  let operationCount = 0;

  // 1. Update Final Vote
  const finalVoteRef = decisionRef.collection("finalVotes").doc(userId);
  const finalVoteDoc = await finalVoteRef.get();
  if (finalVoteDoc.exists) {
    batch.update(finalVoteRef, {displayName: displayName});
    operationCount++;
  }

  // 2. Update Argument Votes (Iterative approach)
  const argumentsSnapshot = await decisionRef.collection("arguments").get();

  // Create an array of promises to fetch user votes for each argument
  const voteReadPromises = argumentsSnapshot.docs.map(async (argDoc) => {
    const voteRef = argDoc.ref.collection("votes").doc(userId);
    const voteDoc = await voteRef.get();
    return {ref: voteRef, exists: voteDoc.exists};
  });

  const voteResults = await Promise.all(voteReadPromises);

  voteResults.forEach((result) => {
    if (result.exists) {
      batch.update(result.ref, {displayName: displayName});
      operationCount++;
    }
  });

  if (operationCount > 0) {
    await batch.commit();
  }

  return {success: true, updated: operationCount};
});

/**
 * Registers or updates a participant in a decision.
 * Stores the encrypted display name.
 * @param {Object} request - The request object.
 * @param {string} request.data.decisionId - The decision ID.
 * @param {string} request.data.encryptedDisplayName - The encrypted display name.
 * @return {Promise<Object>} Success status.
 */
exports.registerParticipant = onCall({cors: true}, async (request) => {
  // Authentication required
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
  }

  const {decisionId, encryptedDisplayName, plainDisplayName} = request.data;
  const userId = request.auth.uid;

  if (!decisionId || (!encryptedDisplayName && !plainDisplayName)) {
    throw new HttpsError("invalid-argument", "Missing decisionId or display name.");
  }

  const db = admin.firestore();
  const decisionRef = db.collection("decisions").doc(decisionId);
  const decisionDoc = await decisionRef.get();

  if (!decisionDoc.exists) {
    throw new HttpsError("not-found", "Decision not found.");
  }

  const participantRef = decisionRef.collection("participants").doc(userId);

  const data = {
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (encryptedDisplayName) {
    data.encryptedDisplayName = encryptedDisplayName;
  }
  if (plainDisplayName) {
    data.plainDisplayName = plainDisplayName;
  }

  await participantRef.set(data, {merge: true});

  return {success: true};
});

/**
 * Generates a magic link for identity transfer.
 * @param {Object} request - The request object.
 * @return {Promise<Object>} The magic link token.
 */
exports.generateMagicLink = onCall({cors: true}, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
  }

  const userId = request.auth.uid;

  try {
    const customToken = await admin.auth().createCustomToken(userId);
    return {token: customToken};
  } catch (error) {
    console.error("Error creating custom token:", error);
    throw new HttpsError("internal", "Unable to create magic link token.");
  }
});

const {deleteUser} = require("./deleteUser");
exports.deleteUser = deleteUser;
