// filepath: /Users/lilian/Desktop/Projects/LearnDev/lib/file-system.ts
"use client"

// This file is now just a wrapper around browser-storage.ts
// to maintain compatibility with any other imports
import { 
  saveSubject,
  saveTopic,
  saveSubtopic,
  deleteSubjectFiles,
  deleteTopicFiles,
  deleteSubtopicFiles,
  loadFileSystemData,
  slugify
} from './browser-storage';

// Re-export all functions from browser-storage.ts
export {
  saveSubject,
  saveTopic,
  saveSubtopic,
  deleteSubjectFiles,
  deleteTopicFiles,
  deleteSubtopicFiles,
  loadFileSystemData,
  slugify
};
