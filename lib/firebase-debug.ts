// Firebase debug helper
import { getAuth, GoogleAuthProvider, signInWithPopup, AuthError } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { getApps } from 'firebase/app';

/**
 * Helper function to debug Firebase configuration and connection issues
 * Call this function from browser console when experiencing Firebase issues
 */
export async function debugFirebase() {
  // Display environment variables (public ones only)
  console.log('=== Firebase Configuration ===');
  console.log('API Key:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✓ Set' : '✗ Missing');
  console.log('Auth Domain:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);
  console.log('Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
  console.log('Storage Bucket:', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? '✓ Set' : '✗ Missing');
  console.log('Messaging Sender ID:', process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? '✓ Set' : '✗ Missing');
  console.log('App ID:', process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? '✓ Set' : '✗ Missing');
  console.log('App URL:', process.env.NEXT_PUBLIC_APP_URL || window.location.origin);
  
  // Check if Firebase is initialized
  const apps = getApps();
  console.log('\n=== Firebase Initialization ===');
  console.log('Firebase Apps Initialized:', apps.length);
  
  if (apps.length > 0) {
    try {
      // Test Firestore connection
      const db = getFirestore();
      console.log('\n=== Firestore Connection ===');
      try {
        const testCollection = collection(db, 'test_connection');
        const snapshot = await getDocs(testCollection);
        console.log('Firestore Read Test:', snapshot ? '✓ Success' : '✗ Failed');
      } catch (error) {
        console.error('Firestore Read Error:', error);
      }
      
      // Test authentication
      const auth = getAuth();
      console.log('\n=== Auth Configuration ===');
      console.log('Auth Instance:', auth ? '✓ Available' : '✗ Not available');
      console.log('Current User:', auth.currentUser ? auth.currentUser.email : 'Not signed in');
      
      // Domain verification
      console.log('\n=== Domain Verification ===');
      console.log('Current Origin:', window.location.origin);
      console.log('Make sure this origin is added to Firebase Console:');
      console.log('Firebase Console > Authentication > Sign-in method > Authorized domains');
    } catch (error) {
      console.error('Firebase Operation Error:', error);
    }
  }
  
  return 'Firebase debug complete. Check console output for details.';
}

/**
 * Helper function to perform a test sign-in with different parameters
 * Use this to troubleshoot specific authentication issues
 */
export async function testSignIn(useRedirectUri?: boolean) {
  try {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    
    // Add required scopes
    provider.addScope('https://www.googleapis.com/auth/userinfo.email');
    provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
    
    const customParams: {prompt: string; redirect_uri?: string} = {
      prompt: 'select_account'
    };
    
    // Only set redirect_uri if explicitly requested for testing
    if (useRedirectUri) {
      const redirectUri = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      customParams.redirect_uri = redirectUri;
      console.log('Testing with explicit redirect URI:', redirectUri);
      console.log('IMPORTANT: This should match what is configured in the Firebase console.');
    } else {
      console.log('Testing without explicit redirect URI (Firebase will use default)');
      console.log('Current origin:', window.location.origin);
    }
    
    // Configure the provider
    provider.setCustomParameters(customParams);
    
    console.log('Attempting test sign-in...');
    const result = await signInWithPopup(auth, provider);
    
    console.log('Sign-in successful:', result.user?.email);
    return `Sign-in successful: ${result.user?.email}`;
  } catch (error) {
    const authError = error as AuthError;
    console.error('Test Sign-In Error:', authError.code, authError.message);
    
    // Specific error handling
    if (authError.code === 'auth/unauthorized-domain') {
      console.error(`The domain '${window.location.origin}' is not authorized in Firebase.`);
      console.error('Add it to: Firebase Console > Authentication > Sign-in method > Authorized domains');
    } else if (authError.message?.includes('redirect_uri_mismatch')) {
      console.error(`redirect_uri_mismatch error detected.`);
      console.error(`Make sure ${window.location.origin} is registered as an authorized redirect URI in the Firebase console.`);
      console.error('Go to: Firebase Console > Authentication > Sign-in method > Google > Web SDK configuration');
    }
    
    return `Sign-in failed: ${authError.code} - ${authError.message}`;
  }
}

/**
 * Helper function to specifically diagnose redirect URI issues
 */
export function diagnoseRedirectUriIssue() {
  const currentOrigin = window.location.origin;
  const configuredAppUrl = process.env.NEXT_PUBLIC_APP_URL || '(not configured)';
  
  console.log('=== Redirect URI Diagnosis ===');
  console.log('Current browser origin:', currentOrigin);
  console.log('Configured NEXT_PUBLIC_APP_URL:', configuredAppUrl);
  
  if (currentOrigin !== configuredAppUrl && configuredAppUrl !== '(not configured)') {
    console.warn('WARNING: Current origin does not match NEXT_PUBLIC_APP_URL!');
    console.warn('This may cause redirect_uri_mismatch errors if Firebase is configured with NEXT_PUBLIC_APP_URL.');
  }
  
  console.log('\nTo fix redirect_uri_mismatch errors:');
  console.log('1. Go to Firebase Console > Authentication > Sign-in method > Google > Web SDK configuration');
  console.log(`2. Make sure "${currentOrigin}" is added as an Authorized domain.`);
  console.log('3. If using popup sign-in, no redirect URI configuration is needed.');
  console.log(`4. If using redirect sign-in, add "${currentOrigin}" as a redirect URI.`);
  console.log('\nTesting sign-in without explicitly setting redirect_uri is recommended.');
  
  return 'Redirect URI diagnosis complete. Check console for details.';
}

// Make the debug functions available in the global scope for browser console access
if (typeof window !== 'undefined') {
  (window as any).debugFirebase = debugFirebase;
  (window as any).testSignIn = testSignIn;
  (window as any).diagnoseRedirectUriIssue = diagnoseRedirectUriIssue;
}
