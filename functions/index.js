const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { FieldValue } = require("firebase-admin/firestore");

admin.initializeApp();
const db = admin.firestore();

/**
 * Creates a new decision.
 * @param {Object} request - The request object.
 * @param {string} request.data.question - The question to decide on.
 * @return {Promise<Object>} The created decision ID.
 */
exports.createDecision = onCall(async (request) => {
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

    return { id: decisionRef.id };
});

/**
 * Adds an argument (pro or con) to a decision.
 * @param {Object} request - The request object.
 * @param {string} request.data.decisionId - The ID of the decision.
 * @param {string} request.data.type - 'pro' or 'con'.
 * @param {string} request.data.text - The argument text.
 * @return {Promise<Object>} The created argument ID.
 */
exports.addArgument = onCall(async (request) => {
    const { decisionId, type, text } = request.data;

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

    await argumentRef.set({
        type,
        text: text.trim(),
        votes: 0,
        createdAt: FieldValue.serverTimestamp(),
    });

    return { id: argumentRef.id };
});

/**
 * Votes on an argument.
 * @param {Object} request - The request object.
 * @param {string} request.data.decisionId - The ID of the decision.
 * @param {string} request.data.argumentId - The ID of the argument.
 * @return {Promise<Object>} Success status.
 */
exports.voteArgument = onCall(async (request) => {
    const { decisionId, argumentId } = request.data;

    if (!decisionId || !argumentId) {
        throw new HttpsError("invalid-argument", "Missing required arguments: decisionId, argumentId.");
    }

    const argumentRef = db.collection("decisions").doc(decisionId).collection("arguments").doc(argumentId);

    // Using FieldValue.increment for atomic updates
    await argumentRef.update({
        votes: FieldValue.increment(1)
    });

    return { success: true };
});
