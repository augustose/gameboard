# IMPL: Optional Cloud Sync & Authentication

This plan outlines the addition of optional Email/Password authentication and cloud synchronization using Firebase Firestore.

## User Requirements Analysis
- **Goal**: Allow users to save their last 200 games to the cloud.
- **Constraint**: Must be **optional**. "Offline-first" behavior remains default.
- **Tech**: Firebase Authentication (Email/Password) + Cloud Firestore.

## Critical Analysis (Pros & Cons)

| Feature | Pros | Cons |
| :--- | :--- | :--- |
| **Cloud Sync** | **Data Safety**: Games are backed up if device is lost.<br>**Multi-device**: Seamlessly switch between phone and tablet.<br>**Sharing**: Easier foundation for future features (e.g. sharing live games). | **Complexity**: Handling offline/online conflicts is difficult.<br>**Cost/Limits**: Firestore Storage/Bandwidth costs if user base grows significantly (though Free Tier is generous).<br>**Privacy**: User data leaves their device (requires Security Rules). |
| **Optional Auth**| **UX**: Low barrier to entry (no forced signup). | **Maintenance**: Code must handle two accumulation states (synced vs local-only). |

> [!IMPORTANT]
> **Decision**: We will implement a "Last Write Wins" sync strategy. This is simple and effective for single-user scenarios but may overwrite data if the user plays offline on two devices simultaneously and then syncs both. Given the use case (scorekeeping), this risk is acceptable.

## Proposed Architecture

### 1. Database Schema (Firestore)
- **Collection**: `users`
- **Document ID**: `{firebase_auth_uid}`
- **Fields**:
  - `history`: `Game[]` (Limit to last 200 items in code)
  - `preferences`: `{ theme: string, ... }`
  - `lastUpdated`: `Timestamp`

### 2. Authentication UI
- **SSO Only**: We will use `GoogleAuthProvider` for a one-click login experience.
- **Sidebar Update**:
  - Add "Account" section at the bottom.
  - If logged out: Show "Sign in with Google" button (with Google G logo).
  - If logged in: Show User Avatar/Name and "Logout" button.

### 3. Logic Updates

#### [MODIFY] [src/hooks/useLocalStorage.ts](file:///Users/augustose/DEV/gameboard/src/hooks/useLocalStorage.ts) -> `useDataStore.ts`
- Rename to `useDataStore`.
- **syncData(user)** function:
  - Called on login.
  - Merges local `Game[]` with Firestore `Game[]`.
- **saveGame(game)** function:
  - Updates local + Firestore (if logged in).

#### [MODIFY] [src/components/Sidebar.tsx](file:///Users/augustose/DEV/gameboard/src/components/Sidebar.tsx)
- Integrate `signInWithPopup(auth, googleProvider)` directly.
- Display user profile info from `currentUser`.

#### [MODIFY] [src/App.tsx](file:///Users/augustose/DEV/gameboard/src/App.tsx)
- No new routes needed! All auth happens via popup in the sidebar.

### 4. Security Rules (firestore.rules)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 5. Safety & Verification Strategy (The "Beta" Channel)

To avoid risking the production site (`el-turix-score-2025.web.app`), we will use **Firebase Hosting Preview Channels**.
This creates a temporary, hidden "Beta" URL (e.g., `...web.app`) where we can test the new Auth features fully.

**Workflow:**
1.  **Develop**: Implement changes locally.
2.  **Deploy Beta**: Run `firebase hosting:channel:deploy beta`.
    *   This generates a temporary URL.
    *   Production remains untouched.
3.  **Verify**: You open the Beta URL on your phone/desktop.
    *   Test Login with Google.
    *   Play a game.
    *   Verify data shows up in Firestore Console.
4.  **Go Live**: Only after you confirm it works, we run `firebase deploy`.

**Why this is better than Blue/Green:**
- built-in to Firebase (zero configuration).
- Instant rollback (just re-deploy previous version if needed).
- Zero cost/setup time compared to setting up separate "Staging" environments.

## Step-by-Step Plan

1.  **Firebase Setup**: User enables **Google Auth** and **Cloud Firestore** in Firebase Console.
2.  **Coding**: Implement `useDataStore`, Sidebar changes, and Auth logic.
3.  **Beta Release**: Deploy to a preview channel.
4.  **User Acceptance**: You test the beta link.
5.  **Production Release**: Merge and deploy to main site.
