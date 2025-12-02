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
  console.log("createDecision called with data:", request.data);
  const question = request.data.question;

  if (!question || typeof question !== "string" || question.trim().length === 0) {
    throw new HttpsError("invalid-argument", "The function must be called with a valid 'question' argument.");
  }

  if (question.length > 200) {
    throw new HttpsError("invalid-argument", "Question must be under 200 characters.");
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

  if (text.trim().length === 0 || text.length > 500) {
    throw new HttpsError("invalid-argument", "Text must be between 1 and 500 characters.");
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
  console.log("voteArgument called with data:", request.data);

  const {decisionId, argumentId, userId, displayName} = request.data;

  if (!decisionId || !argumentId || !userId) {
    throw new HttpsError("invalid-argument", "Missing required arguments: decisionId, argumentId, userId.");
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
        displayName: displayName || "Anonymous",
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
  const {decisionId, vote, userId, displayName} = request.data;

  if (!decisionId || !vote || !userId) {
    throw new HttpsError("invalid-argument", "Missing decisionId, vote, or userId");
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
        displayName: displayName || "Anonymous",
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
        displayName: displayName || "Anonymous",
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
