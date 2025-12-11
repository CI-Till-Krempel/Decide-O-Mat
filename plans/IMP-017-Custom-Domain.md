# Implementation Plan - US-017: Custom Domain

## Goal
Configure custom domain for production.

## Proposed Changes

### Infrastructure
-   (Manual) Purchase domain (if not owned).
-   (Manual) Add domain to Firebase Hosting.
-   (Manual) Update DNS records (A/CNAME).

## Verification Plan

### Manual Verification
1.  Access `https://your-domain.com`.
2.  Verify SSL lock icon.
