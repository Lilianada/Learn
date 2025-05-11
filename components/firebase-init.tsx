"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { 
  fetchSubjects, 
  fetchTopics, 
  fetchSubtopics,
  fetchUserPreferences
} from '@/lib/firebase-service';
import { useFirebaseStore } from '@/store/use-firebase-store';
import { useSettings } from '@/store/use-settings';

export function FirebaseInit() {
  const { user, isAdmin } = useAuth();
  const [initialized, setInitialized] = useState(false);
  const store = useStore();
  const { setTheme, setFontFamily, setFontSize } = useSettings();

  useEffect(() => {
    // Only run once after authentication is determined
    if (!initialized && isAdmin && user) {
      const loadData = async () => {
        try {
          // Load subjects
          const subjects = await fetchSubjects();
          
          // Load topics for each subject
          const allTopics = {};
          const allSubtopics = {};
          
          for (const subjectId of Object.keys(subjects)) {
            const topics = await fetchTopics(subjectId);
            Object.assign(allTopics, topics);
            
            // Load subtopics for each topic
            for (const topicId of Object.keys(topics)) {
              const subtopics = await fetchSubtopics(subjectId, topicId);
              Object.assign(allSubtopics, subtopics);
            }
          }
          
          // Update the store directly
          if (Object.keys(subjects).length > 0) {
            useStore.setState({ 
              subjects,
              topics: allTopics,
              subtopics: allSubtopics
            });
          }
          
          // Fetch user preferences
          try {
            const preferences = await fetchUserPreferences(user.uid);
            if (preferences) {
              if (preferences.theme) setTheme(preferences.theme);
              if (preferences.fontFamily) setFontFamily(preferences.fontFamily);
              if (preferences.fontSize) setFontSize(preferences.fontSize);
            }
          } catch (prefError) {
            console.error("Error loading user preferences:", prefError);
          }
          
          setInitialized(true);
          console.log("Firebase data loaded successfully");
        } catch (error) {
          console.error("Error loading Firebase data:", error);
        }
      };
      
      loadData();
    }
  }, [user, isAdmin, store, setTheme, setFontFamily, setFontSize, initialized]);

  // Nothing to render - this is just for initialization
  return null;
}
