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
  isSigningIn: boolean; // Add this
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [firebaseEnabled, setFirebaseEnabled] = useState(Boolean(firebaseAuth));
  const [isSigningIn, setIsSigningIn] = useState(false);

 useEffect(() => {
  // Clean up any stale auth state when the component mounts
  sessionStorage.removeItem('auth_in_progress');
  
  // If Firebase auth is not initialized, skip auth state handling
  if (!firebaseAuth || !firestore) {
    console.warn("Firebase auth/db is not initialized - authentication features will be disabled");
    setLoading(false);
    return () => {};
  }

  // Listen for auth state changes
  const unsubscribe = firebaseAuth.onAuthStateChanged(async (authUser) => {
    if (authUser) {
      try {
        // Use a single "learn" document to store all user data and settings
        const learnDocRef = doc(firestore, 'learn', 'config');
        const learnSnap = await getDoc(learnDocRef);
        
        if (learnSnap.exists()) {
          const learnData = learnSnap.data();
          
          // Check if current user is in the admins list
          const admins = learnData.admins || {};
          const isCurrentUserAdmin = admins[authUser.email || ''] === true;
          
          if (isCurrentUserAdmin) {
            setIsAdmin(true);
            
            // Update the user's last activity within the learn document
            const users = learnData.users || {};
            const userData = users[authUser.uid] || {
              displayName: authUser.displayName,
              email: authUser.email,
              createdAt: serverTimestamp()
            };
            
            // Update user data
            users[authUser.uid] = {
              ...userData,
              lastActive: serverTimestamp()
            };
            
            // Update the learn document with the latest user data
            await updateDoc(learnDocRef, {
              [`users.${authUser.uid}`]: {
                displayName: authUser.displayName,
                email: authUser.email,
                isAdmin: true,
                lastActive: serverTimestamp(),
                // Keep track of the latest session
                currentSession: {
                  startedAt: serverTimestamp(),
                  userAgent: navigator.userAgent
                }
              }
            });
          } else {
            // Not an admin, sign them out
            if (firebaseAuth) {
              await firebaseSignOut(firebaseAuth);
            }
            setUser(null);
            setIsAdmin(false);
          }
        } else {
          // The learn document doesn't exist yet - create it with this user as admin
          // This is useful for first-time setup
          await setDoc(learnDocRef, {
            admins: {
              [authUser.email || '']: true
            },
            users: {
              [authUser.uid]: {
                displayName: authUser.displayName,
                email: authUser.email,
                isAdmin: true,
                createdAt: serverTimestamp(),
                lastActive: serverTimestamp(),
                currentSession: {
                  startedAt: serverTimestamp(),
                  userAgent: navigator.userAgent
                }
              }
            },
            settings: {
              appTitle: 'LearnIt',
              created: serverTimestamp()
            }
          });
          
          setIsAdmin(true);
        }
        
        // Set the user in state and finish loading regardless of admin status
        setUser(authUser);
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      }
    } else {
      // No user is signed in
      setUser(null);
      setIsAdmin(false);
    }
    
    // Always finish loading to prevent infinite spinner
    setLoading(false);
  });
  
  return () => unsubscribe();
}, []);

  const signIn = async (): Promise<void> => {
  // Prevent multiple sign-in attempts
  if (isSigningIn) return;
  
  // Check if auth is already in progress via session storage
  if (sessionStorage.getItem('auth_in_progress') === 'true') {
    console.log('Auth already in progress, preventing duplicate popup');
    return;
  }
  
  if (!firebaseAuth || !firebaseGoogleProvider) {
    console.error("Firebase auth is not initialized - cannot sign in");
    return;
  }
  
  try {
    setIsSigningIn(true);
    sessionStorage.setItem('auth_in_progress', 'true');
    
    // Provider configuration
    firebaseGoogleProvider.setCustomParameters({
      prompt: 'select_account'
    });
    
    const result = await signInWithPopup(firebaseAuth, firebaseGoogleProvider);
    
    // Save the email for future logins
    if (result.user?.email) {
      localStorage.setItem('lastLoginEmail', result.user.email);
    }
  } catch (error: any) {
    // Only log non-user-cancelled errors
    if (error.code !== 'auth/popup-closed-by-user' && 
        error.code !== 'auth/cancelled-popup-request') {
      console.error("Error signing in with Google:", error);
      
      if (error.code === 'auth/unauthorized-domain') {
        const currentDomain = window.location.origin;
        console.error(`The domain '${currentDomain}' isn't authorized in Firebase.`);
        alert(`Authentication Error: This domain (${currentDomain}) is not authorized.`);
      }
    }
  } finally {
    setIsSigningIn(false);
    sessionStorage.removeItem('auth_in_progress');
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
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isAdmin, 
      signIn, 
      signOut, 
      firebaseEnabled,
      isSigningIn 
    }}>
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