// Firebase configuration file
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, Timestamp } from 'firebase/firestore';

// Check if required environment variables are available
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
if (!apiKey) {
  console.error("Firebase API key is missing. Make sure your .env.local file contains NEXT_PUBLIC_FIREBASE_API_KEY");
}

const firebaseConfig = {
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId,
};

// Initialize Firebase only if we have required configuration
// Explicitly typing the Firebase instances
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let googleProvider: GoogleAuthProvider | undefined;

// Validate that we have all required configs to initialize Firebase
const requiredConfigs = [
  { name: 'API Key', value: apiKey },
  { name: 'Project ID', value: projectId },
  { name: 'Auth Domain', value: authDomain },
  { name: 'Storage Bucket', value: storageBucket }
];

const missingConfigs = requiredConfigs
  .filter(config => !config.value)
  .map(config => config.name);

const hasRequiredConfig = missingConfigs.length === 0;

if (hasRequiredConfig) {
  try {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    
    // Configure Google provider with proper scopes
    googleProvider = new GoogleAuthProvider();
    googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
    googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');
    
    // Adding custom parameters to handle redirect URI issues
    googleProvider.setCustomParameters({
      // Force account selection even if one account is available
      prompt: 'select_account'
      // Note: We don't set redirect_uri here anymore as it should be registered
      // in Firebase console and automatically used. Setting it manually can cause
      // redirect_uri_mismatch errors.
    });
    
    console.log("Firebase initialized successfully with project:", projectId);
  } catch (error) {
    console.error("Error initializing Firebase:", error);
    // Set these to undefined in case initialization partially succeeded
    app = undefined;
    auth = undefined;
    db = undefined;
    googleProvider = undefined;
  }
} else {
  console.warn(`Firebase initialization skipped due to missing configuration: ${missingConfigs.join(', ')}`);
}

export { app, auth, db, googleProvider, Timestamp };
