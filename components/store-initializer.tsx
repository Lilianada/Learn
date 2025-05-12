"use client";

import { useEffect } from "react";
import { useStore } from "../store/use-store";
import { useFirebaseStore } from "../store/use-firebase-store";
import { useAuth } from "../lib/auth-context";

export function StoreInitializer() {
  // Get hydrate functions from both stores
  const localHydrate = useStore((state: any) => state.hydrate);
  const firebaseHydrate = useFirebaseStore((state: any) => state.hydrate);
  const { user, firebaseEnabled } = useAuth();
  
  useEffect(() => {
    // Always start with local data
    localHydrate?.();
    
    // If user is signed in and Firebase is enabled, also load from Firebase
    if (user && firebaseEnabled) {
      console.log("Using Firebase store");
      firebaseHydrate?.();
    } else {
      console.log("Using local store only");
    }
  }, [localHydrate, firebaseHydrate, user, firebaseEnabled]);
  
  return null;
}
