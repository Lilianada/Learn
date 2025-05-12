# Firebase Authentication Troubleshooting Guide

This document provides solutions for common Firebase authentication issues in the LearnDev application.

## Common Authentication Issues

### 1. `redirect_uri_mismatch` Error

**Symptom:** Authentication fails with a "redirect_uri_mismatch" error in the console.

**Cause:** This occurs when the URI where the authentication popup or redirect is initiated doesn't match any of the authorized redirect URIs in the Firebase console.

**Solution:**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Navigate to your project → Authentication → Sign-in method → Google → Web SDK configuration
3. Add your application's URL to the authorized domains list:
   - For local development: `http://localhost:3000`
   - For production: Your actual domain (e.g., `https://learndev.example.com`)
4. Make sure the `NEXT_PUBLIC_APP_URL` in your `.env.local` file matches your actual URL

**Using Debug Tools:**
```javascript
// Run this in the browser console
diagnoseRedirectUriIssue();
```

### 2. `auth/unauthorized-domain` Error

**Symptom:** Authentication fails with "auth/unauthorized-domain" error.

**Cause:** The domain you're trying to authenticate from isn't in the authorized domains list.

**Solution:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Navigate to your project → Authentication → Settings → Authorized domains
3. Add your domain to the list

**Using Debug Tools:**
```javascript
// Run this in the browser console
debugFirebase();
```

### 3. Authentication Popup Closes Immediately

**Symptom:** The sign-in popup appears briefly and then closes without completing authentication.

**Cause:** This can happen due to popup blockers, third-party cookies being disabled, or authentication configuration issues.

**Solutions:**
1. Make sure popup blocker is disabled for your site
2. Check that third-party cookies are enabled in the browser
3. Try the test sign-in function:

```javascript
// Run this in the browser console
testSignIn();
```

### 4. Firebase Not Initialized

**Symptom:** Authentication functions don't work, and you see "Firebase not initialized" errors.

**Cause:** Environment variables might be missing or Firebase initialization failed.

**Solution:**
1. Check your `.env.local` file for correct Firebase configuration
2. Required variables:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
3. Restart your development server after updating environment variables
4. Use the debug function:

```javascript
// Run this in the browser console
debugFirebase();
```

## Advanced Debugging

The LearnDev application includes several debugging utilities in `firebase-debug.ts`:

1. **General Firebase Debugging:**
   ```javascript
   debugFirebase();
   ```

2. **Test Sign-In:**
   ```javascript
   // Test without explicit redirect URI (recommended)
   testSignIn();
   
   // Test with explicit redirect URI (troubleshooting only)
   testSignIn(true);
   ```

3. **Redirect URI Diagnosis:**
   ```javascript
   diagnoseRedirectUriIssue();
   ```

These functions will output detailed information to the browser console that can help identify and fix authentication issues.

## Environment Configuration

For proper Firebase authentication, ensure your `.env.local` file has the correct configuration:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

In production, update `NEXT_PUBLIC_APP_URL` to your actual domain.
