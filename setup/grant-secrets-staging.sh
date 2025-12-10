#!/bin/bash
set -e

PROJECT_ID="decide-o-mat-staging"
BACKEND_ID="decide-o-mat-staging"

secrets=(
  "VITE_FIREBASE_API_KEY"
  "VITE_FIREBASE_AUTH_DOMAIN"
  "VITE_FIREBASE_PROJECT_ID"
  "VITE_FIREBASE_STORAGE_BUCKET"
  "VITE_FIREBASE_MESSAGING_SENDER_ID"
  "VITE_FIREBASE_APP_ID"
  "VITE_FIREBASE_MEASUREMENT_ID"
)

echo "Granting secret access for project: $PROJECT_ID, backend: $BACKEND_ID"

for secret in "${secrets[@]}"; do
  echo "Granting access to $secret..."
  firebase apphosting:secrets:grantaccess "$secret" \
    --backend "$BACKEND_ID" \
    --project "$PROJECT_ID"
done

echo "Done!"
