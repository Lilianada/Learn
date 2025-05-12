"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  Auth,
  GoogleAuthProvider
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  serverTimestamp,
  Firestore
} from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';

// Type assertions to handle the possibility of undefined Firebase instances
const firestore = db as Firestore | undefined;
const firebaseAuth = auth as Auth | undefined;
const firebaseGoogleProvider = googleProvider as GoogleAuthProvider | undefined;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  firebaseEnabled: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [firebaseEnabled, setFirebaseEnabled] = useState(Boolean(firebaseAuth));

  useEffect(() => {
    // If Firebase auth is not initialized, skip auth state handling
    if (!firebaseAuth || !firestore) {
      console.warn("Firebase auth/db is not initialized - authentication features will be disabled");
      setLoading(false);
      return () => {};
    }

    // Listen for auth state changes
    const unsubscribe = firebaseAuth.onAuthStateChanged(async (authUser) => {
      setUser(authUser);
      setLoading(false);
      
      if (authUser) {
        try {
          // Check if user is admin
          const adminRef = doc(firestore, 'admin', authUser.email || '');
          const adminSnap = await getDoc(adminRef);
          
          if (adminSnap.exists()) {
            setIsAdmin(true);
            
            // Update lastLogin timestamp
            await updateDoc(adminRef, {
              lastLogin: serverTimestamp()
            });
            
            // Update or create user document
            const userRef = doc(firestore, 'users', authUser.uid);
            const userSnap = await getDoc(userRef);
            
            if (userSnap.exists()) {
              await updateDoc(userRef, {
                lastActive: serverTimestamp()
              });
            } else {
              await setDoc(userRef, {
                displayName: authUser.displayName,
                email: authUser.email,
                photoURL: authUser.photoURL,
                isAdmin: true,
                preferences: {
                  theme: "light",
                  fontFamily: "sans",
                  fontSize: "medium"
                },
                createdAt: serverTimestamp(),
                lastActive: serverTimestamp()
              });
            }
            
            // Create a session document
            const sessionRef = doc(collection(firestore, 'sessions'));
            await setDoc(sessionRef, {
              email: authUser.email,
              validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
              createdAt: serverTimestamp(),
              userAgent: navigator.userAgent
            });
          } else {
            // Not an admin, sign them out
            if (firebaseAuth) {
              await firebaseSignOut(firebaseAuth);
            }
            setUser(null);
            setIsAdmin(false);
          }
        } catch (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    });
    
    return () => unsubscribe();
  }, []);

  const signIn = async (): Promise<void> => {
    if (!firebaseAuth || !firebaseGoogleProvider) {
      console.error("Firebase auth is not initialized - cannot sign in");
      return;
    }
    
    try {
      // Configure Google provider with the correct settings for this session
      const customParameters: { prompt: string; login_hint?: string; redirect_uri: string } = {
        prompt: 'select_account',
        redirect_uri: process.env.NEXT_PUBLIC_APP_URL || window.location.origin,
      };
      
      const lastLoginEmail = localStorage.getItem('lastLoginEmail');
      if (lastLoginEmail) {
        customParameters.login_hint = lastLoginEmail;
      }
      
      firebaseGoogleProvider.setCustomParameters(customParameters);
      
      console.log("Starting Google sign-in with redirect URI:", process.env.NEXT_PUBLIC_APP_URL || window.location.origin);
      
      const result = await signInWithPopup(firebaseAuth, firebaseGoogleProvider);
      
      // Save the email for future logins
      if (result.user?.email) {
        localStorage.setItem('lastLoginEmail', result.user.email);
      }
      console.log("Sign-in successful for:", result.user?.email);
    } catch (error: any) {
      console.error("Error signing in with Google:", error);
      
      // More detailed error logging for debugging
      if (error.code === 'auth/unauthorized-domain') {
        const currentDomain = window.location.origin;
        console.error(`The domain '${currentDomain}' isn't authorized in Firebase. Add this domain to the authorized domains list in the Firebase Console.`);
        alert(`Authentication Error: This domain (${currentDomain}) is not authorized. Please contact the administrator.`);
      } else if (error.code === 'auth/popup-closed-by-user') {
        console.log("Sign-in popup was closed by the user before finalizing the sign-in.");
      } else if (error.code === 'auth/redirect-cancelled-by-user') {
        console.log("Sign-in redirect was canceled by the user.");
      } else if (error.message?.includes('redirect_uri_mismatch')) {
        const currentUrl = window.location.origin;
        console.error(`redirect_uri_mismatch error detected. Make sure ${currentUrl} is registered in Firebase console.`);
        alert(`Authentication Error: redirect_uri_mismatch. Please ensure ${currentUrl} is registered in the Firebase console.`);
      }
    }
  };

  const signOut = async (): Promise<void> => {
    if (!firebaseAuth) {
      console.error("Firebase auth is not initialized - cannot sign out");
      return;
    }
    
    try {
      await firebaseSignOut(firebaseAuth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signIn, signOut, firebaseEnabled }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
