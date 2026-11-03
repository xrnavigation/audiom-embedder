# Typed helper for SDK sound activation

## Goal

Deliver the companion helper for Audiom-Front-End #2488 in an independent PR from origin/main. Q authorized full execution of the SDK campaign.

## State

Added the enableSounds command type, handler method, focused test and documentation. No tests run or publication claimed yet. Existing release workflow publishes GitHub Packages on v-prefixed tags. Main currently declares package version 1.0.0; versioning/publication follows verified frontend support.

## Decisions and why

Smallest change: use the existing postCommand owner, target iframe and exact origin. Approximately ten production lines; no duplicate frontend behavior or transport implementation. The browser's audio gesture requirement remains applicable. Source and test changes will be separate commits.

## Surprises

This repository's integrated default branch is main, unlike the frontend's master. Existing README imports use an older package name; this task's new example uses the existing handler variable and does not expand into a documentation migration.

## Next step

Install dependencies, run only the authored message test file, publish the scoped PR and read hosted CI. Do not release before frontend support merges; verify real registry publication separately.
