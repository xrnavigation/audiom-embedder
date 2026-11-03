# Typed helper for SDK sound activation

## Goal

Deliver the companion helper for Audiom-Front-End #2488 in an independent PR from origin/main. Q authorized full execution of the SDK campaign.

## State

Added the enableSounds command type, handler method, focused test and documentation. PR #10 has green build/test and changelog checks on the code; the authored message test passed locally. Frontend counterpart #2684 merged normally. Set the package and lockfile to 1.1.0 for this additive API so the existing v-prefixed tag release can publish a new installable version; the version update needs fresh CI before merge. No registry publication claimed yet.

## Decisions and why

Smallest change: use the existing postCommand owner, target iframe and exact origin. Approximately ten production lines; no duplicate frontend behavior or transport implementation. The browser's audio gesture requirement remains applicable. Source and test changes will be separate commits.

## Surprises

This repository's integrated default branch is main, unlike the frontend's master. Existing README imports use an older package name; this task's new example uses the existing handler variable and does not expand into a documentation migration.

## Next step

Commit and push the version increment, read current-head CI, then normally merge PR #10. Use the existing release workflow and verify the real registry version separately. Deployment of the frontend remains distinct from its source merge.
