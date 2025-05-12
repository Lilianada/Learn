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
  updateSubtopicStatus,
  reorderTopics as fbReorderTopics,
  reorderSubtopics as fbReorderSubtopics
} from '../lib/firebase-service'
import { Subject, Topic, Subtopic } from '../types/store-types'
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

// Import the nanoid for unique ID generation
import { nanoid } from "nanoid"

export const useFirebaseStore = create<Store>()(
  persist(
    (set, get) => ({
      subjects: {},
      topics: {},
      subtopics: {},
      currentSubjectId: null,
      currentTopicId: null,
      currentSubtopicId: null,
      useFirebase: false,
      
      hydrate: async () => {
        try {
          if (get().useFirebase) {
            // We'll load firebase data elsewhere
            console.log("Firebase mode enabled, skipping local hydration");
            return;
          }
          
          const data = await loadFileSystemData();
          set({
            subjects: data.subjects,
            topics: data.topics,
            subtopics: data.subtopics,
          });
        } catch (error) {
          console.error("Failed to load data:", error);
        }
      },
      
      setUseFirebase: (value: boolean) => {
        set({ useFirebase: value });
      },
      
      setCurrentSubject: (id) => set({ currentSubjectId: id }),
      setCurrentTopic: (id) => set({ currentTopicId: id }),
      setCurrentSubtopic: (id) => set({ currentSubtopicId: id }),
      
      addSubject: async (title, description = '') => {
        try {
          if (get().useFirebase) {
            const newSubject = await fbAddSubject(title, description);
            set((state) => ({
              subjects: {
                ...state.subjects,
                [newSubject.id]: newSubject as Subject,
              },
              currentSubjectId: newSubject.id,
              currentTopicId: null,
              currentSubtopicId: null,
            }));
          } else {
            const id = nanoid();
            const timestamp = new Date().toISOString();
            
            const newSubject: Subject = {
              id,
              title,
              description,
              createdAt: timestamp,
              updatedAt: timestamp,
              topicOrder: [],
              order: Object.keys(get().subjects).length
            };
            
            saveSubject(newSubject);
            
            set((state) => ({
              subjects: {
                ...state.subjects,
                [id]: newSubject,
              },
              currentSubjectId: id,
              currentTopicId: null,
              currentSubtopicId: null,
            }));
          }
        } catch (error) {
          console.error("Failed to add subject:", error);
        }
      },
      
      updateSubject: async (id, title, description = '') => {
        try {
          if (get().useFirebase) {
            await fbUpdateSubject(id, title, description);
          } else {
            const subject = get().subjects[id];
            if (!subject) return;
            
            const updatedSubject: Subject = {
              ...subject,
              title,
              description,
              updatedAt: new Date().toISOString(),
            };
            
            saveSubject(updatedSubject);
          }
          
          set((state) => ({
            subjects: {
              ...state.subjects,
              [id]: {
                ...state.subjects[id],
                title,
                description,
                updatedAt: new Date().toISOString(),
              },
            },
          }));
        } catch (error) {
          console.error("Failed to update subject:", error);
        }
      },
      
      deleteSubject: async (id) => {
        try {
          if (get().useFirebase) {
            await fbDeleteSubject(id);
          } else {
            await deleteSubjectFiles(id);
          }
          
          set((state) => {
            const { [id]: _, ...remainingSubjects } = state.subjects;
            
            const topicIdsToRemove = Object.values(state.topics)
              .filter(topic => topic.subjectId === id)
              .map(topic => topic.id);
            
            const remainingTopics = { ...state.topics };
            topicIdsToRemove.forEach(topicId => {
              delete remainingTopics[topicId];
            });
            
            const subtopicIdsToRemove = Object.values(state.subtopics)
              .filter(subtopic => topicIdsToRemove.includes(subtopic.topicId))
              .map(subtopic => subtopic.id);
            
            const remainingSubtopics = { ...state.subtopics };
            subtopicIdsToRemove.forEach(subtopicId => {
              delete remainingSubtopics[subtopicId];
            });
            
            const newCurrentSubjectId = state.currentSubjectId === id
              ? Object.keys(remainingSubjects)[0] || null
              : state.currentSubjectId;
            
            const newCurrentTopicId = topicIdsToRemove.includes(state.currentTopicId || '')
              ? null
              : state.currentTopicId;
            
            const newCurrentSubtopicId = subtopicIdsToRemove.includes(state.currentSubtopicId || '')
              ? null
              : state.currentSubtopicId;
            
            return {
              subjects: remainingSubjects,
              topics: remainingTopics,
              subtopics: remainingSubtopics,
              currentSubjectId: newCurrentSubjectId,
              currentTopicId: newCurrentTopicId,
              currentSubtopicId: newCurrentSubtopicId,
            };
          });
        } catch (error) {
          console.error("Failed to delete subject:", error);
        }
      },
      
      reorderTopics: async (subjectId, topicOrder) => {
        try {
          // Update Firebase if enabled
          if (get().useFirebase) {
            await fbReorderTopics(subjectId, topicOrder);
          }
          
          // Update local state
          set((state) => ({
            subjects: {
              ...state.subjects,
              [subjectId]: {
                ...state.subjects[subjectId],
                topicOrder,
                updatedAt: new Date().toISOString(),
              },
            },
          }));
          
          // Save to local storage if not using Firebase
          if (!get().useFirebase) {
            const subject = get().subjects[subjectId];
            if (subject) {
              saveSubject({
                ...subject,
                topicOrder,
                updatedAt: new Date().toISOString(),
              });
            }
          }
        } catch (error) {
          console.error("Failed to reorder topics:", error);
        }
      },
      
      addTopic: async (subjectId, title, description = '') => {
        try {
          if (get().useFirebase) {
            const newTopic = await fbAddTopic(subjectId, title, description);
            
            set((state) => {
              // Get current topicOrder for subject
              const subject = state.subjects[subjectId];
              const topicOrder = subject?.topicOrder || [];
              
              return {
                topics: {
                  ...state.topics,
                  [newTopic.id]: newTopic as Topic,
                },
                subjects: {
                  ...state.subjects,
                  [subjectId]: {
                    ...state.subjects[subjectId],
                    topicOrder: [...topicOrder, newTopic.id],
                  },
                },
                currentTopicId: newTopic.id,
                currentSubtopicId: null,
              };
            });
          } else {
            const id = nanoid();
            const timestamp = new Date().toISOString();
            
            const newTopic: Topic = {
              id,
              subjectId,
              title,
              description,
              content: '',
              createdAt: timestamp,
              updatedAt: timestamp,
              subtopicOrder: [],
              order: Object.values(get().topics).filter(t => t.subjectId === subjectId).length,
            };
            
            saveTopic(newTopic);
            
            const subject = get().subjects[subjectId];
            if (subject) {
              const updatedSubject: Subject = {
                ...subject,
                topicOrder: [...(subject.topicOrder || []), id],
                updatedAt: timestamp,
              };
              saveSubject(updatedSubject);
              
              set((state) => ({
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
              }));
            }
          }
        } catch (error) {
          console.error("Failed to add topic:", error);
        }
      },
      
      updateTopic: async (id, title, description = '') => {
        try {
          const topic = get().topics[id];
          if (!topic) return;
          
          if (get().useFirebase) {
            await fbUpdateTopic(topic.subjectId, id, title, description);
          } else {
            const updatedTopic: Topic = {
              ...topic,
              title,
              description,
              updatedAt: new Date().toISOString(),
            };
            
            saveTopic(updatedTopic);
          }
          
          set((state) => ({
            topics: {
              ...state.topics,
              [id]: {
                ...state.topics[id],
                title,
                description,
                updatedAt: new Date().toISOString(),
              },
            },
          }));
        } catch (error) {
          console.error("Failed to update topic:", error);
        }
      },
      
      updateTopicContent: async (id, content) => {
        try {
          const topic = get().topics[id];
          if (!topic) return;
          
          if (get().useFirebase) {
            await fbUpdateTopicContent(topic.subjectId, id, content);
          } else {
            const updatedTopic: Topic = {
              ...topic,
              content,
              updatedAt: new Date().toISOString(),
            };
            
            saveTopic(updatedTopic);
          }
          
          set((state) => ({
            topics: {
              ...state.topics,
              [id]: {
                ...state.topics[id],
                content,
                updatedAt: new Date().toISOString(),
              },
            },
          }));
        } catch (error) {
          console.error("Failed to update topic content:", error);
        }
      },
      
      deleteTopic: async (id) => {
        try {
          const topic = get().topics[id];
          if (!topic) return;
          
          if (get().useFirebase) {
            await fbDeleteTopic(topic.subjectId, id);
          } else {
            await deleteTopicFiles(topic.id);
            
            const subject = get().subjects[topic.subjectId];
            if (subject) {
              const updatedSubject: Subject = {
                ...subject,
                topicOrder: (subject.topicOrder || []).filter(topicId => topicId !== id),
                updatedAt: new Date().toISOString(),
              };
              saveSubject(updatedSubject);
            }
          }
          
          set((state) => {
            const { [id]: _, ...remainingTopics } = state.topics;
            
            const subtopicIdsToRemove = Object.values(state.subtopics)
              .filter(subtopic => subtopic.topicId === id)
              .map(subtopic => subtopic.id);
            
            const remainingSubtopics = { ...state.subtopics };
            subtopicIdsToRemove.forEach(subtopicId => {
              delete remainingSubtopics[subtopicId];
            });
            
            const newCurrentTopicId = state.currentTopicId === id
              ? null
              : state.currentTopicId;
            
            const newCurrentSubtopicId = subtopicIdsToRemove.includes(state.currentSubtopicId || '')
              ? null
              : state.currentSubtopicId;
            
            const updatedSubjects = { ...state.subjects };
            if (topic && updatedSubjects[topic.subjectId]) {
              updatedSubjects[topic.subjectId] = {
                ...updatedSubjects[topic.subjectId],
                topicOrder: (updatedSubjects[topic.subjectId].topicOrder || [])
                  .filter(topicId => topicId !== id),
              };
            }
            
            return {
              topics: remainingTopics,
              subtopics: remainingSubtopics,
              subjects: updatedSubjects,
              currentTopicId: newCurrentTopicId,
              currentSubtopicId: newCurrentSubtopicId,
            };
          });
        } catch (error) {
          console.error("Failed to delete topic:", error);
        }
      },
      
      reorderSubtopics: async (topicId, subtopicOrder) => {
        try {
          const topic = get().topics[topicId];
          if (!topic) return;
          
          if (get().useFirebase) {
            // Call the Firebase service function
            await fbReorderSubtopics(topic.subjectId, topicId, subtopicOrder);
          }
          
          // Update local state
          set((state) => ({
            topics: {
              ...state.topics,
              [topicId]: {
                ...state.topics[topicId],
                subtopicOrder,
                updatedAt: new Date().toISOString(),
              },
            },
          }));
          
          // Save to local storage if not using Firebase
          if (!get().useFirebase) {
            const topic = get().topics[topicId];
            if (topic) {
              saveTopic({
                ...topic,
                subtopicOrder,
                updatedAt: new Date().toISOString(),
              });
            }
          }
        } catch (error) {
          console.error("Failed to reorder subtopics:", error);
        }
      },
      
      addSubtopic: async (topicId, title, description = '') => {
        try {
          const topic = get().topics[topicId];
          if (!topic) return;
          
          if (get().useFirebase) {
            const newSubtopic = await fbAddSubtopic(topic.subjectId, topicId, title);
            
            set((state) => ({
              subtopics: {
                ...state.subtopics,
                [newSubtopic.id]: newSubtopic as Subtopic,
              },
              currentSubtopicId: newSubtopic.id,
            }));
          } else {
            const id = nanoid();
            const timestamp = new Date().toISOString();
            
            const newSubtopic: Subtopic = {
              id,
              topicId,
              title,
              content: '',
              status: 'not-started',
              completionPercentage: 0,
              notes: '',
              order: Object.values(get().subtopics).filter(s => s.topicId === topicId).length,
              createdAt: timestamp,
              updatedAt: timestamp,
            };
            
            saveSubtopic(newSubtopic);
            
            set((state) => ({
              subtopics: {
                ...state.subtopics,
                [id]: newSubtopic,
              },
              currentSubtopicId: id,
            }));
          }
        } catch (error) {
          console.error("Failed to add subtopic:", error);
        }
      },
      
      updateSubtopic: async (id, title, description = '') => {
        try {
          const subtopic = get().subtopics[id];
          if (!subtopic) return;
          
          const topic = get().topics[subtopic.topicId];
          if (!topic) return;
          
          if (get().useFirebase) {
            await fbUpdateSubtopic(topic.subjectId, subtopic.topicId, id, title);
          } else {
            const updatedSubtopic: Subtopic = {
              ...subtopic,
              title,
              updatedAt: new Date().toISOString(),
            };
            
            saveSubtopic(updatedSubtopic);
          }
          
          set((state) => ({
            subtopics: {
              ...state.subtopics,
              [id]: {
                ...state.subtopics[id],
                title,
                updatedAt: new Date().toISOString(),
              },
            },
          }));
        } catch (error) {
          console.error("Failed to update subtopic:", error);
        }
      },
      
      updateSubtopicContent: async (id, content) => {
        try {
          const subtopic = get().subtopics[id];
          if (!subtopic) return;
          
          const topic = get().topics[subtopic.topicId];
          if (!topic) return;
          
          if (get().useFirebase) {
            await fbUpdateSubtopicContent(topic.subjectId, subtopic.topicId, id, content);
          } else {
            const updatedSubtopic: Subtopic = {
              ...subtopic,
              content,
              updatedAt: new Date().toISOString(),
            };
            
            saveSubtopic(updatedSubtopic);
          }
          
          set((state) => ({
            subtopics: {
              ...state.subtopics,
              [id]: {
                ...state.subtopics[id],
                content,
                updatedAt: new Date().toISOString(),
              },
            },
          }));
        } catch (error) {
          console.error("Failed to update subtopic content:", error);
        }
      },
      
      updateSubtopicProgress: async (id, status, completionPercentage) => {
        try {
          const subtopic = get().subtopics[id];
          if (!subtopic) return;
          
          const topic = get().topics[subtopic.topicId];
          if (!topic) return;
          
          if (get().useFirebase) {
            await updateSubtopicStatus(topic.subjectId, subtopic.topicId, id, status, completionPercentage);
          } else {
            const updatedSubtopic: Subtopic = {
              ...subtopic,
              status,
              completionPercentage,
              updatedAt: new Date().toISOString(),
            };
            
            saveSubtopic(updatedSubtopic);
          }
          
          set((state) => ({
            subtopics: {
              ...state.subtopics,
              [id]: {
                ...state.subtopics[id],
                status,
                completionPercentage,
                updatedAt: new Date().toISOString(),
              },
            },
          }));
        } catch (error) {
          console.error("Failed to update subtopic progress:", error);
        }
      },
      
      deleteSubtopic: async (id) => {
        try {
          const subtopic = get().subtopics[id];
          if (!subtopic) return;
          
          const topic = get().topics[subtopic.topicId];
          if (!topic) return;
          
          if (get().useFirebase) {
            await fbDeleteSubtopic(topic.subjectId, subtopic.topicId, id);
          } else {
            await deleteSubtopicFiles(subtopic.id);
          }
          
          set((state) => {
            const { [id]: _, ...remainingSubtopics } = state.subtopics;
            
            const newCurrentSubtopicId = state.currentSubtopicId === id
              ? null
              : state.currentSubtopicId;
            
            return {
              subtopics: remainingSubtopics,
              currentSubtopicId: newCurrentSubtopicId,
            };
          });
        } catch (error) {
          console.error("Failed to delete subtopic:", error);
        }
      },
    }),
    {
      name: "learnit-firebase-store",
      partialize: (state) => ({
        subjects: state.subjects,
        topics: state.topics,
        subtopics: state.subtopics,
        currentSubjectId: state.currentSubjectId,
        currentTopicId: state.currentTopicId,
        currentSubtopicId: state.currentSubtopicId,
        useFirebase: state.useFirebase,
      }),
    }
  )
)

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      subjects: {},
      topics: {},
      subtopics: {},
      currentSubjectId: null,
      currentTopicId: null,
      currentSubtopicId: null,
      useFirebase: false,
      
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
      
      addSubject: async (title, description) => {
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
      
      updateSubject: async (id, title, description) => {
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
      
      deleteSubject: async (id) => {
        set((state) => {
          if (!state.subjects[id]) return state;
          
          // Create new state objects without the deleted subject
          const newSubjects = { ...state.subjects }
          delete newSubjects[id];
          
          return {
            subjects: newSubjects,
            currentSubjectId: null,
            currentTopicId: null,
            currentSubtopicId: null,
          }
        });

        // Delete subject from browser storage
        await deleteSubjectFiles(id);
      },
      
      reorderTopics: async (subjectId, topicOrder) => {
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
        });
      },
      
      addTopic: async (subjectId, title, description) => {
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
      
      updateTopic: async (id, title, description) => {
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
      
      deleteTopic: async (id) => {
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
          
          return {
            topics: newTopics,
            subjects: {
              ...state.subjects,
              [topic.subjectId]: updatedSubject,
            },
            currentTopicId: null,
            currentSubtopicId: null,
          }
        });
        // Delete topic from browser storage
        await deleteTopicFiles(id);
        const topic = get().topics[id];
        if (topic) {
          const subject = get().subjects[topic.subjectId];
          if (subject) {
            const updatedSubject = {
              ...subject,
              topicOrder: subject.topicOrder.filter(topicId => topicId !== id),
              updatedAt: new Date().toISOString(),
            };
            saveSubject(updatedSubject);
          }
        }
      },
      
      updateTopicContent: async (id, content) => {
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
      
      reorderSubtopics: async (topicId, subtopicOrder) => {
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
        });
      },
      
      addSubtopic: async (topicId, title, description) => {
        set((state) => {
          const topic = state.topics[topicId];
          if (!topic) return state;
          
          const id = nanoid()
          const timestamp = new Date().toISOString()
          
          const updatedTopic = {
            ...topic,
            subtopicOrder: [...(topic.subtopicOrder || []), id],
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
        });
      },
      
      updateSubtopic: async (id, title, description) => {
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
      
      deleteSubtopic: async (id) => {
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
            subtopicOrder: (topic.subtopicOrder ?? []).filter(subtopicId => subtopicId !== id),
            updatedAt: new Date().toISOString(),
          }
          
          return {
            subtopics: newSubtopics,
            topics: {
              ...state.topics,
              [subtopic.topicId]: updatedTopic,
            },
            currentSubtopicId: null,
          }
        });
        // Delete subtopic from browser storage
        await deleteSubtopicFiles(id);
        const subtopic = get().subtopics[id];
        if (subtopic) {
          const topic = get().topics[subtopic.topicId];
          if (topic) {
            const updatedTopic = {
              ...topic,
              subtopicOrder: (topic.subtopicOrder ?? []).filter(subtopicId => subtopicId !== id),
              updatedAt: new Date().toISOString(),
            };
            saveTopic(updatedTopic);
          }
        }
      },
      
      updateSubtopicContent: async (id, content) => {
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
      
      setCurrentSubject: async (id) => {
        set({
          currentSubjectId: id,
          currentTopicId: null,
          currentSubtopicId: null,
        });
      },
      
      setCurrentTopic: async (id) => {
        set({
          currentTopicId: id,
          currentSubtopicId: null,
        });
      },
      setCurrentSubtopic: async (id) => {
        set({
          currentSubtopicId: id,
        });
      },
      
      updateSubtopicProgress: async (id, status, completionPercentage) => {
        set((state) => {
          const subtopic = state.subtopics[id];
          if (!subtopic) return state;
          
          const updatedSubtopic = {
            ...subtopic,
            status,
            completionPercentage,
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
        });
      },
      
      setUseFirebase: (value: boolean) => {
        set({ useFirebase: value });
      },
      
    }),
    {
      name: "learnit-storage",
    }
    
  )
)
