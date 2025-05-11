"use client"

import { Subject, Topic, Subtopic } from '@/types/store-types';
import { nanoid } from 'nanoid';

// Storage keys
const SUBJECTS_STORAGE_KEY = 'learnit-subjects';
const TOPICS_STORAGE_KEY = 'learnit-topics';
const SUBTOPICS_STORAGE_KEY = 'learnit-subtopics';

// Slugify a string (convert to lowercase, replace spaces with hyphens, remove special chars)
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Helper to safely parse JSON from localStorage
function getStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  
  const item = localStorage.getItem(key);
  if (!item) return defaultValue;
  
  try {
    return JSON.parse(item) as T;
  } catch (e) {
    console.error(`Failed to parse storage item: ${key}`, e);
    return defaultValue;
  }
}

// Helper to safely save JSON to localStorage
function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

// Save subject to browser storage
export function saveSubject(subject: Subject): void {
  const subjects = getStorageItem<Record<string, Subject>>(SUBJECTS_STORAGE_KEY, {});
  subjects[subject.id] = subject;
  setStorageItem(SUBJECTS_STORAGE_KEY, subjects);
}

// Save topic to browser storage
export function saveTopic(topic: Topic): void {
  const topics = getStorageItem<Record<string, Topic>>(TOPICS_STORAGE_KEY, {});
  topics[topic.id] = topic;
  setStorageItem(TOPICS_STORAGE_KEY, topics);
}

// Save subtopic to browser storage
export function saveSubtopic(subtopic: Subtopic): void {
  const subtopics = getStorageItem<Record<string, Subtopic>>(SUBTOPICS_STORAGE_KEY, {});
  subtopics[subtopic.id] = subtopic;
  setStorageItem(SUBTOPICS_STORAGE_KEY, subtopics);
}

// Delete subject from browser storage
export function deleteSubjectFiles(subjectId: string): void {
  // Delete subject
  const subjects = getStorageItem<Record<string, Subject>>(SUBJECTS_STORAGE_KEY, {});
  delete subjects[subjectId];
  setStorageItem(SUBJECTS_STORAGE_KEY, subjects);
  
  // Find and delete associated topics and subtopics
  const topics = getStorageItem<Record<string, Topic>>(TOPICS_STORAGE_KEY, {});
  const subtopics = getStorageItem<Record<string, Subtopic>>(SUBTOPICS_STORAGE_KEY, {});
  
  Object.values(topics).forEach(topic => {
    if (topic.subjectId === subjectId) {
      delete topics[topic.id];
      
      // Delete associated subtopics
      Object.values(subtopics).forEach(subtopic => {
        if (subtopic.topicId === topic.id) {
          delete subtopics[subtopic.id];
        }
      });
    }
  });
  
  setStorageItem(TOPICS_STORAGE_KEY, topics);
  setStorageItem(SUBTOPICS_STORAGE_KEY, subtopics);
}

// Delete topic from browser storage
export function deleteTopicFiles(topicId: string): void {
  // Delete topic
  const topics = getStorageItem<Record<string, Topic>>(TOPICS_STORAGE_KEY, {});
  delete topics[topicId];
  setStorageItem(TOPICS_STORAGE_KEY, topics);
  
  // Find and delete associated subtopics
  const subtopics = getStorageItem<Record<string, Subtopic>>(SUBTOPICS_STORAGE_KEY, {});
  
  Object.values(subtopics).forEach(subtopic => {
    if (subtopic.topicId === topicId) {
      delete subtopics[subtopic.id];
    }
  });
  
  setStorageItem(SUBTOPICS_STORAGE_KEY, subtopics);
}

// Delete subtopic from browser storage
export function deleteSubtopicFiles(subtopicId: string): void {
  const subtopics = getStorageItem<Record<string, Subtopic>>(SUBTOPICS_STORAGE_KEY, {});
  delete subtopics[subtopicId];
  setStorageItem(SUBTOPICS_STORAGE_KEY, subtopics);
}

// Load data from browser storage
export async function loadFileSystemData(): Promise<{
  subjects: Record<string, Subject>;
  topics: Record<string, Topic>;
  subtopics: Record<string, Subtopic>;
}> {
  const subjects = getStorageItem<Record<string, Subject>>(SUBJECTS_STORAGE_KEY, {});
  const topics = getStorageItem<Record<string, Topic>>(TOPICS_STORAGE_KEY, {});
  const subtopics = getStorageItem<Record<string, Subtopic>>(SUBTOPICS_STORAGE_KEY, {});
  
  return { subjects, topics, subtopics };
}
