"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { 
  fetchSubjects,
  fetchTopics,
  fetchSubtopics,
  addSubject as fbAddSubject,
  updateSubject as fbUpdateSubject,
  deleteSubject as fbDeleteSubject,
  addTopic as fbAddTopic,
  updateTopic as fbUpdateTopic,
  deleteTopic as fbDeleteTopic,
  updateTopicContent as fbUpdateTopicContent,
  addSubtopic as fbAddSubtopic,
  updateSubtopic as fbUpdateSubtopic,
  deleteSubtopic as fbDeleteSubtopic,
  updateSubtopicContent as fbUpdateSubtopicContent,
  updateSubtopicStatus
} from '@/lib/firebase-service'
import { Subject, Topic, Subtopic } from '@/types/store-types'
import { 
  saveSubject, 
  saveTopic, 
  saveSubtopic, 
  deleteSubjectFiles, 
  deleteTopicFiles, 
  deleteSubtopicFiles,
  loadFileSystemData
} from '@/lib/browser-storage'

// Re-export types for backward compatibility
export type { Subject, Topic, Subtopic }

type State = {
  subjects: Record<string, Subject>
  topics: Record<string, Topic>
  subtopics: Record<string, Subtopic>
  currentSubjectId: string | null
  currentTopicId: string | null
  currentSubtopicId: string | null
  useFirebase: boolean
}

type Actions = {
  hydrate: () => Promise<void>
  setCurrentSubject: (id: string | null) => void
  setCurrentTopic: (id: string | null) => void
  setCurrentSubtopic: (id: string | null) => void
  addSubject: (title: string, description?: string) => Promise<void>
  updateSubject: (id: string, title: string, description?: string) => Promise<void>
  deleteSubject: (id: string) => Promise<void>
  reorderTopics: (subjectId: string, topicOrder: string[]) => Promise<void>
  addTopic: (subjectId: string, title: string, description?: string) => Promise<void>
  updateTopic: (id: string, title: string, description?: string) => Promise<void>
  deleteTopic: (id: string) => Promise<void>
  updateTopicContent: (id: string, content: string) => Promise<void>
  reorderSubtopics: (topicId: string, subtopicOrder: string[]) => Promise<void>
  addSubtopic: (topicId: string, title: string, description?: string) => Promise<void>
  updateSubtopic: (id: string, title: string, description?: string) => Promise<void>
  deleteSubtopic: (id: string) => Promise<void>
  updateSubtopicContent: (id: string, content: string) => Promise<void>
  updateSubtopicProgress: (id: string, status: 'not-started' | 'in-progress' | 'completed', completionPercentage: number) => Promise<void>
  setUseFirebase: (value: boolean) => void
}

type Store = State & Actions

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      subjects: {},
      topics: {},
      subtopics: {},
      currentSubjectId: null,
      currentTopicId: null,
      currentSubtopicId: null,
      
      // Initialize by loading from browser storage
      hydrate: async () => {
        try {
          const data = await loadFileSystemData();
          set({
            subjects: data.subjects,
            topics: data.topics,
            subtopics: data.subtopics,
          });
        } catch (error) {
          console.error("Failed to load data from browser storage:", error);
        }
      },
      
      addSubject: (title, description) => {
        const id = nanoid()
        const timestamp = new Date().toISOString()
        
        const newSubject = {
          id,
          title,
          description,
          createdAt: timestamp,
          updatedAt: timestamp,
          topicOrder: [],
        }
        
        // Save to browser storage
        saveSubject(newSubject);
        
        set((state) => ({
          subjects: {
            ...state.subjects,
            [id]: newSubject,
          },
          currentSubjectId: id,
          currentTopicId: null,
          currentSubtopicId: null,
        }))
      },
      
      updateSubject: (id, title, description) => {
        set((state) => {
          if (!state.subjects[id]) return state;
          
          const updatedSubject = {
            ...state.subjects[id],
            title,
            description,
            updatedAt: new Date().toISOString(),
          }
          
          // Save to browser storage
          saveSubject(updatedSubject);
          
          return {
            subjects: {
              ...state.subjects,
              [id]: updatedSubject,
            },
          }
        })
      },
      
      deleteSubject: (id) => {
        set((state) => {
          if (!state.subjects[id]) return state;
          
          // Create new state objects without the deleted subject
          const newSubjects = { ...state.subjects }
          delete newSubjects[id];
          
          // Delete subject from browser storage
          deleteSubjectFiles(id);
          
          return {
            subjects: newSubjects,
            currentSubjectId: null,
            currentTopicId: null,
            currentSubtopicId: null,
          }
        })
      },
      
      reorderTopics: (subjectId, topicOrder) => {
        set((state) => {
          const subject = state.subjects[subjectId];
          if (!subject) return state;
          
          const updatedSubject = {
            ...subject,
            topicOrder,
            updatedAt: new Date().toISOString(),
          }
          
          // Save to browser storage
          saveSubject(updatedSubject);
          
          return {
            subjects: {
              ...state.subjects,
              [subjectId]: updatedSubject,
            },
          }
        })
      },
      
      addTopic: (subjectId, title, description) => {
        set((state) => {
          const subject = state.subjects[subjectId];
          if (!subject) return state;
          
          const id = nanoid()
          const timestamp = new Date().toISOString()
          
          const updatedSubject = {
            ...subject,
            topicOrder: [...subject.topicOrder, id],
            updatedAt: timestamp,
          }
          
          const newTopic = {
            id,
            title,
            description,
            createdAt: timestamp,
            updatedAt: timestamp,
            subtopicOrder: [],
            subjectId,
          };
          
          // Save to browser storage
          saveSubject(updatedSubject);
          saveTopic(newTopic);
          
          return {
            topics: {
              ...state.topics,
              [id]: newTopic,
            },
            subjects: {
              ...state.subjects,
              [subjectId]: updatedSubject,
            },
            currentTopicId: id,
            currentSubtopicId: null,
          }
        })
      },
      
      updateTopic: (id, title, description) => {
        set((state) => {
          const topic = state.topics[id];
          if (!topic) return state;
          
          const updatedTopic = {
            ...topic,
            title,
            description,
            updatedAt: new Date().toISOString(),
          }
          
          // Save to browser storage
          saveTopic(updatedTopic);
          
          return {
            topics: {
              ...state.topics,
              [id]: updatedTopic,
            },
          }
        })
      },
      
      deleteTopic: (id) => {
        set((state) => {
          const topic = state.topics[id];
          if (!topic) return state;
          
          const subject = state.subjects[topic.subjectId];
          if (!subject) return state;
          
          // Create new state objects without the deleted topic
          const newTopics = { ...state.topics }
          delete newTopics[id];
          
          const updatedSubject = {
            ...subject,
            topicOrder: subject.topicOrder.filter(topicId => topicId !== id),
            updatedAt: new Date().toISOString(),
          }
          
          // Delete topic from browser storage
          deleteTopicFiles(id);
          saveSubject(updatedSubject);
          
          return {
            topics: newTopics,
            subjects: {
              ...state.subjects,
              [topic.subjectId]: updatedSubject,
            },
            currentTopicId: null,
            currentSubtopicId: null,
          }
        })
      },
      
      updateTopicContent: (id, content) => {
        set((state) => {
          const topic = state.topics[id];
          if (!topic) return state;
          
          const updatedTopic = {
            ...topic,
            content,
            updatedAt: new Date().toISOString(),
          }
          
          // Save to browser storage
          saveTopic(updatedTopic);
          
          return {
            topics: {
              ...state.topics,
              [id]: updatedTopic,
            },
          }
        })
      },
      
      reorderSubtopics: (topicId, subtopicOrder) => {
        set((state) => {
          const topic = state.topics[topicId];
          if (!topic) return state;
          
          const updatedTopic = {
            ...topic,
            subtopicOrder,
            updatedAt: new Date().toISOString(),
          }
          
          // Save to browser storage
          saveTopic(updatedTopic);
          
          return {
            topics: {
              ...state.topics,
              [topicId]: updatedTopic,
            },
          }
        })
      },
      
      addSubtopic: (topicId, title, description) => {
        set((state) => {
          const topic = state.topics[topicId];
          if (!topic) return state;
          
          const id = nanoid()
          const timestamp = new Date().toISOString()
          
          const updatedTopic = {
            ...topic,
            subtopicOrder: [...topic.subtopicOrder, id],
            updatedAt: timestamp,
          }
          
          const newSubtopic = {
            id,
            title,
            description,
            createdAt: timestamp,
            updatedAt: timestamp,
            topicId,
            content: '',
          };
          
          // Save to browser storage
          saveTopic(updatedTopic);
          saveSubtopic(newSubtopic);
          
          return {
            topics: {
              ...state.topics,
              [topicId]: updatedTopic,
            },
            subtopics: {
              ...state.subtopics,
              [id]: newSubtopic,
            },
            currentSubtopicId: id,
          }
        })
      },
      
      updateSubtopic: (id, title, description) => {
        set((state) => {
          const subtopic = state.subtopics[id];
          if (!subtopic) return state;
          
          const updatedSubtopic = {
            ...subtopic,
            title,
            description,
            updatedAt: new Date().toISOString(),
          }
          
          // Save to browser storage
          saveSubtopic(updatedSubtopic);
          
          return {
            subtopics: {
              ...state.subtopics,
              [id]: updatedSubtopic,
            },
          }
        })
      },
      
      deleteSubtopic: (id) => {
        set((state) => {
          const subtopic = state.subtopics[id];
          if (!subtopic) return state;
          
          const topic = state.topics[subtopic.topicId];
          if (!topic) return state;
          
          // Create new state objects without the deleted subtopic
          const newSubtopics = { ...state.subtopics }
          delete newSubtopics[id];
          
          const updatedTopic = {
            ...topic,
            subtopicOrder: topic.subtopicOrder.filter(subtopicId => subtopicId !== id),
            updatedAt: new Date().toISOString(),
          }
          
          // Delete subtopic from browser storage
          deleteSubtopicFiles(id);
          saveTopic(updatedTopic);
          
          return {
            subtopics: newSubtopics,
            topics: {
              ...state.topics,
              [subtopic.topicId]: updatedTopic,
            },
            currentSubtopicId: null,
          }
        })
      },
      
      updateSubtopicContent: (id, content) => {
        set((state) => {
          const subtopic = state.subtopics[id];
          if (!subtopic) return state;
          
          const updatedSubtopic = {
            ...subtopic,
            content,
            updatedAt: new Date().toISOString(),
          }
          
          // Save to browser storage
          saveSubtopic(updatedSubtopic);
          
          return {
            subtopics: {
              ...state.subtopics,
              [id]: updatedSubtopic,
            },
          }
        })
      },
      
      setCurrentSubject: (id) => {
        set({
          currentSubjectId: id,
          currentTopicId: null,
          currentSubtopicId: null,
        })
      },
      
      setCurrentTopic: (id) => {
        set({
          currentTopicId: id,
          currentSubtopicId: null,
        })
      },
      
      setCurrentSubtopic: (id) => {
        set({
          currentSubtopicId: id,
        })
      },
      
    }),
    {
      name: "learnit-storage",
    }
  )
)
