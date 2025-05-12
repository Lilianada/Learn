# Firebase Integration Steps

Use this document as a guide to test the Firebase integration in the LearnDev application.

## Setup Checklist

1. Make sure Firebase config is set correctly in `/lib/firebase.ts`
2. Enable Google Authentication in the Firebase Console
3. Create an admin document in the Firestore database to define who can access the app:
   - Collection: `admin`
   - Document ID: Your email address used for Google sign in
   - Fields: `createdAt`, `role: "admin"`

## Testing Steps

1. Authentication
   - Sign in using the Settings menu
   - Confirm that your Google account is used
   - Check admin status is recognized
   - Test sign out functionality

2. Data Operations
   - Create a new subject
   - Add topics to the subject
   - Add subtopics to topics
   - Edit content in topics and subtopics
   - Test reordering functionality
   - Delete elements and confirm cascading deletes work properly

3. User Preferences
   - Change theme, font family, and font size settings
   - Sign out and sign back in to confirm preferences are saved

## Common Issues

1. Type errors in FirebaseInit component:
   - Make sure the store is using the correct interface (useFirebaseStore)
   - Confirm all async functions properly return Promises

2. Authentication issues:
   - Check if the admin document exists in Firestore
   - Make sure the email matches exactly (case sensitive)

3. Data persistence issues:
   - Verify useFirebase flag is properly set
   - Check that Firebase service functions are correctly returning data
