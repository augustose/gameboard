---
description: Professional Release Process (Dev -> Local Test -> Beta -> Prod)
---

Follow this strict protocol for all feature releases and significant changes.

## 1. Development (Dev)
-   **Context**: Building new features or fixing bugs.
-   **Command**: `npm run dev`
-   **Goal**: Feature complete & working in dev mode.

## 2. Local Verification (Local Test)
-   **Context**: Before committing code.
-   **Action**: Simulate a production build locally to catch AOT/Build issues.
-   **Command**: `npm run build && npm run preview`
-   **Requirement**: User must verify the app running on `localhost:4173` (or network IP).
-   **Gateway**: **STOP**. detailed user approval required.

## 3. Versioning (SemVer)
-   **Context**: Before committing.
-   **Rule**:
    -   **Bug Fix**: Increment **Patch** (e.g., 1.0.0 -> 1.0.1)
    -   **Feature**: Increment **Minor** (e.g., 1.0.0 -> 1.1.0)
    -   **Huge Change**: Increment **Major** (e.g., 1.0.0 -> 2.0.0)
-   **Action**: Update `version` in `package.json`.
-   **Command**: `npm version patch` (or `minor`/`major`)

## 4. Commit (Version Control)
-   **Context**: Code is verified locally and version updated.
-   **Action**: Commit changes to git.
-   **Command**: `git add . && git commit -m "feat/fix: ..."`

## 5. Beta Deployment (Staging)
-   **Context**: Verified locally, ready for device testing.
-   **Command**: `firebase hosting:channel:deploy beta`
-   **Requirement**: User must test the generated preview URL on their actual device (phone).
-   **Gateway**: **STOP**. Explicit user approval required.

## 5. Production Deployment (Prod)
-   **Context**: Beta passed.
-   **Command**: `firebase deploy --only hosting:main`
-   **Post-Action**: Verify `iturix.web.app` is live with changes.
