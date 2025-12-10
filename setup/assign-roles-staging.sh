#!/bin/bash
set -e

PROJECT_ID="decide-o-mat-staging"
SERVICE_ACCOUNT_EMAIL="github-actions-deploy@${PROJECT_ID}.iam.gserviceaccount.com"

roles=(
  "roles/firebaseapphosting.admin"
  "roles/developerconnect.admin"
  "roles/cloudfunctions.admin"
  "roles/run.admin"
  "roles/artifactregistry.admin"
  "roles/firebasehosting.admin"
  "roles/firebaserules.admin"
  "roles/datastore.indexAdmin"
  "roles/firebaseextensions.viewer"
  "roles/iam.serviceAccountUser"
  "roles/serviceusage.apiKeysViewer"
)

echo "Assigning roles to $SERVICE_ACCOUNT_EMAIL in project $PROJECT_ID..."

for role in "${roles[@]}"; do
  echo "Adding role: $role"
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
    --role="$role" \
    --condition=None
done

echo "Done!"
