// Enforce App Check in production ('decide-o-mat') only.
// Staging and local dev use false to avoid requiring real tokens during testing.
exports.enforceAppCheck = process.env.GCLOUD_PROJECT === "decide-o-mat";
