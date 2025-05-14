"use client";

import { useEffect } from "react";
import { useStore } from "../store/use-store";
import { useFirebaseStore } from "../store/use-firebase-store";
import { useAuth } from "../lib/auth-context";
import { isFirstVisit, saveDefaultContent } from "../lib/browser-storage";
import { defaultContent } from "./default-content";

export function StoreInitializer() {
  // Get hydrate and other functions from both stores
  const localHydrate = useStore((state: any) => state.hydrate);
  const firebaseHydrate = useFirebaseStore((state: any) => state.hydrate);
  const setUseFirebase = useFirebaseStore((state: any) => state.setUseFirebase);
  const setCurrentSubject = useStore((state: any) => state.setCurrentSubject);
  const setCurrentTopic = useStore((state: any) => state.setCurrentTopic);
  const setCurrentSubtopic = useStore((state: any) => state.setCurrentSubtopic);
  const { user, firebaseEnabled } = useAuth();
  
  useEffect(() => {
    // Check if this is the user's first visit
    const firstVisit = isFirstVisit();
    
    if (firstVisit) {
      console.log("First visit detected! Loading welcome content...");
      // Save default content to localStorage
      saveDefaultContent(defaultContent);
    }
    
    // Always start with local data
    localHydrate?.();
    
    // If it was the first visit, navigate to welcome content
    if (firstVisit) {
      // Navigate to the welcome content after the store is hydrated
      setTimeout(() => {
        setCurrentSubject(defaultContent.subjects.welcome.id);
        setCurrentTopic(defaultContent.topics.getting_started.id);
        setCurrentSubtopic(defaultContent.subtopics.welcome_guide.id);
      }, 100);
    }
    
    // Update the store's Firebase usage flag based on authentication
    setUseFirebase?.(Boolean(user && firebaseEnabled));
    
    // If user is signed in and Firebase is enabled, also load from Firebase
    if (user && firebaseEnabled) {
      console.log("Using Firebase store");
      firebaseHydrate?.();
    } else {
      console.log("Using local store only");
    }
  }, [localHydrate, firebaseHydrate, setUseFirebase, user, firebaseEnabled, 
      setCurrentSubject, setCurrentTopic, setCurrentSubtopic]);
  
  return null;
}
