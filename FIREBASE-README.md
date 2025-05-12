# Firebase Integration Guide for LearnDev

This guide will help you integrate Firebase authentication and database functionality into your LearnDev application.

## Setup Steps

1. **Environment Variables**:
   - Copy `.env.local.example` to `.env.local`
   - Fill in your Firebase project details from the Firebase Console

2. **Firebase Service**:
   - All Firebase service functions are properly implemented in `lib/firebase-service.ts`
   - Functions include CRUD operations for subjects, topics, subtopics, and user preferences

3. **Authentication**:
   - Authentication is managed through `lib/auth-context.tsx`
   - Only users with an entry in the `admin` collection can access the application
   - Create an admin document in Firestore:
     ```
     Collection: admin
     Document ID: your-email@example.com
     Fields: 
       - createdAt: timestamp
       - role: "admin"
     ```

## Usage

The application now supports two storage modes:

1. **Local Storage Mode**:
   - Default mode when not authenticated
   - Data is stored in browser storage
   - Uses the original `use-store.ts`

2. **Firebase Mode**:
   - Activated when an admin user is authenticated
   - Data is stored/retrieved from Firebase Firestore
   - Uses `use-firebase-store.ts`

The application automatically switches between these modes based on authentication state.

## Firebase Structure

The Firestore database is structured as follows:

```
/subjects/{subjectId}
  - title
  - description
  - order
  - topicOrder
  - createdAt
  - updatedAt

/subjects/{subjectId}/topics/{topicId}
  - title
  - description
  - content
  - order
  - subtopicOrder
  - createdAt
  - updatedAt

/subjects/{subjectId}/topics/{topicId}/subtopics/{subtopicId}
  - title
  - description
  - content
  - order
  - status
  - completionPercentage
  - notes
  - createdAt
  - updatedAt
  - lastAccessed

/users/{userId}
  - displayName
  - email
  - photoURL
  - isAdmin
  - preferences
    - theme
    - fontFamily
    - fontSize
  - createdAt
  - lastActive

/admin/{email}
  - role
  - createdAt
  - lastLogin
```

## Troubleshooting

If you encounter issues with Firebase integration:

1. Check browser console for errors
2. Verify that the Firebase configuration in `.env.local` is correct
3. Make sure the admin document exists in Firestore
4. Check that the Firebase service functions return properly typed objects
5. Ensure that the store initialization in `components/firebase-init.tsx` is working correctly

For a complete list of available Firebase functions, refer to `lib/firebase-service.ts`.
