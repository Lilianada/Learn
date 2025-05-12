"use client";

import { useEffect } from "react";
import { useStore } from "@/store/use-store";
import { useFirebaseStore } from "@/store/use-firebase-store";
import { useAuth } from "@/lib/auth-context";

export function StoreInitializer() {
  // Get hydrate functions from both stores
  const localHydrate = useStore((state: any) => state.hydrate);
  const firebaseHydrate = useFirebaseStore((state: any) => state.hydrate);
  const useFirebase = useFirebaseStore((state: any) => state.useFirebase);
  const { user, isAdmin, firebaseEnabled } = useAuth();
  
  useEffect(() => {
    // Determine which store to use
    if (useFirebase && isAdmin && user && firebaseEnabled) {
      console.log("Using Firebase store");
      // Firebase initialization is handled by FirebaseInit component
    } else {
      console.log("Using local store");
      // Load data from file system when the app starts
      localHydrate?.();
    }
  }, [localHydrate, firebaseHydrate, useFirebase, user, isAdmin, firebaseEnabled]);
  
  return null;
}
