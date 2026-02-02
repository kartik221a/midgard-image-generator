# Troubleshooting Guide

## 1. Login Issues: `net::ERR_BLOCKED_BY_CLIENT`

**Symptoms:**
- You try to login, the popup appears and closes.
- You see `net::ERR_BLOCKED_BY_CLIENT` in your browser console.
- You remain logged out, or data doesn't load.

**Cause:**
This error is almost always caused by a **Browser Extension** (Ad Blocker, Privacy Guard, etc.) erroneously blocking the connection to the Firebase Database.

**Solution:**
1.  **Disable Ad Blockers for Localhost**:
    - Click your Ad Blocker icon (uBlock Origin, AdBlock Plus, Privacy Badger, etc.) in the browser toolbar.
    - Select "Disable for this site" or toggle the power button to **OFF** for `localhost:3000`.
    - Refresh the page.

2.  **Check Other Extensions**:
    - If you don't have an ad blocker, check for other extensions like "Privacy Badger", "Ghostery", or "DuckDuckGo Privacy Essentials".
    - Temporarily disable them effectively for this tab.

3.  **Try Incognito Mode**:
    - Open the site in an Incognito/Private window (where extensions are usually disabled by default).
    - If it works there, it is definitely an extension issue.

## 2. Popup Warnings: `Cross-Origin-Opener-Policy`

**Symptoms:**
- Warning in console: `Cross-Origin-Opener-Policy policy would block the window.closed call`.

**Solution:**
- We have updated the server configuration to allow these popups.
- **Restart your development server**:
  ```bash
  npm run dev
  ```
- Clear your browser cache or hard reload (Ctrl+Shift+R).

## 3. "Missing Permissions" Error

**Symptoms:**
- Error: `FirebaseError: Missing or insufficient permissions.`

**Solution:**
- This means your Firestore (Database) rules are too strict.
- Go to [Firebase Console](https://console.firebase.google.com/) > Firestore Database > Rules.
- Paste the rules provided in `firestore.rules` in your project folder.
