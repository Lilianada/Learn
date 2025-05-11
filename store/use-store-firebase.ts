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
  setSubjects: (subjects: Record<string, Subject>) => void
  setTopics: (topics: Record<string, Topic>) => void
  setSubtopics: (subtopics: Record<string, Subtopic>) => void
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
      useFirebase: false,
      
      // Initialize by loading from browser storage
      hydrate: async () => {
        try {
          if (get().useFirebase) {
            // Data will be loaded by the FirebaseInit component
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
      
      setUseFirebase: (value) => {
        set({ useFirebase: value });
      },
      
      setSubjects: (subjects) => {
        set({ subjects });
      },
      
      setTopics: (topics) => {
        set({ topics });
      },
      
      setSubtopics: (subtopics) => {
        set({ subtopics });
      },
      
      addSubject: async (title, description = '') => {
        try {
          if (get().useFirebase) {
            const newSubject = await fbAddSubject(title, description);
            
            set((state) => ({
              subjects: {
                ...state.subjects,
                [newSubject.id]: newSubject,
              },
              currentSubjectId: newSubject.id,
              currentTopicId: null,
              currentSubtopicId: null,
            }));
          } else {
            // Local storage implementation
            const id = crypto.randomUUID();
            const timestamp = new Date().toISOString();
            
            const newSubject = {
              id,
              title,
              description: description || '',
              order: Object.keys(get().subjects).length,
              topicOrder: [],
              createdAt: timestamp,
              updatedAt: timestamp,
            };
            
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
            // Local storage implementation
            const subject = get().subjects[id];
            if (!subject) return;
            
            const updatedSubject = {
              ...subject,
              title,
              description: description || '',
              updatedAt: new Date().toISOString(),
            };
            
            // Save to browser storage
            saveSubject(updatedSubject);
          }
          
          // Update the local state
          set((state) => ({
            subjects: {
              ...state.subjects,
              [id]: {
                ...state.subjects[id],
                title,
                description: description || '',
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
            // Local storage implementation
            await deleteSubjectFiles(id, get().subjects[id]);
          }
          
          // Update state
          set((state) => {
            const { [id]: _, ...remainingSubjects } = state.subjects;
            
            // Find topics associated with this subject and remove them
            const topicIdsToRemove = Object.values(state.topics)
              .filter(topic => topic.subjectId === id)
              .map(topic => topic.id);
            
            const remainingTopics = { ...state.topics };
            topicIdsToRemove.forEach(topicId => {
              delete remainingTopics[topicId];
            });
            
            // Find subtopics associated with these topics and remove them
            const subtopicIdsToRemove = Object.values(state.subtopics)
              .filter(subtopic => topicIdsToRemove.includes(subtopic.topicId))
              .map(subtopic => subtopic.id);
            
            const remainingSubtopics = { ...state.subtopics };
            subtopicIdsToRemove.forEach(subtopicId => {
              delete remainingSubtopics[subtopicId];
            });
            
            // Update current selections if needed
            const newCurrentSubjectId = state.currentSubjectId === id
              ? Object.keys(remainingSubjects)[0] || null
              : state.currentSubjectId;
            
            const newCurrentTopicId = topicIdsToRemove.includes(state.currentTopicId as string)
              ? null
              : state.currentTopicId;
            
            const newCurrentSubtopicId = subtopicIdsToRemove.includes(state.currentSubtopicId as string)
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
          if (get().useFirebase) {
            // Update in Firebase is not implemented yet
            console.log("Firebase reorderTopics not implemented yet");
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
          
          // Update in local storage if not using Firebase
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
      
      // Set current selections
      setCurrentSubject: (id) => set({ currentSubjectId: id }),
      setCurrentTopic: (id) => set({ currentTopicId: id }),
      setCurrentSubtopic: (id) => set({ currentSubtopicId: id }),

      // The rest of the implementation follows the same pattern:
      // 1. Check if using Firebase
      // 2. If yes, call Firebase service
      // 3. If no, use local storage implementation
      // 4. Update local state

      // Implementation for topic operations
      addTopic: async (subjectId, title, description = '') => {
        try {
          if (get().useFirebase) {
            const newTopic = await fbAddTopic(subjectId, title, description);
            
            set((state) => ({
              topics: {
                ...state.topics,
                [newTopic.id]: newTopic,
              },
              subjects: {
                ...state.subjects,
                [subjectId]: {
                  ...state.subjects[subjectId],
                  topicOrder: [...(state.subjects[subjectId].topicOrder || []), newTopic.id],
                },
              },
              currentTopicId: newTopic.id,
              currentSubtopicId: null,
            }));
          } else {
            // Local implementation
            const id = crypto.randomUUID();
            const timestamp = new Date().toISOString();
            
            const newTopic = {
              id,
              subjectId,
              title,
              description: description || '',
              content: '',
              order: Object.values(get().topics).filter(t => t.subjectId === subjectId).length,
              createdAt: timestamp,
              updatedAt: timestamp,
            };
            
            // Save to browser storage
            saveTopic(newTopic);
            
            // Update topicOrder in the subject
            const subject = get().subjects[subjectId];
            if (subject) {
              const updatedSubject = {
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
            // Local storage implementation
            const updatedTopic = {
              ...topic,
              title,
              description: description || '',
              updatedAt: new Date().toISOString(),
            };
            
            // Save to browser storage
            saveTopic(updatedTopic);
          }
          
          // Update local state
          set((state) => ({
            topics: {
              ...state.topics,
              [id]: {
                ...state.topics[id],
                title,
                description: description || '',
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
            // Local storage implementation
            const updatedTopic = {
              ...topic,
              content,
              updatedAt: new Date().toISOString(),
            };
            
            // Save to browser storage
            saveTopic(updatedTopic);
          }
          
          // Update local state
          set((state) => ({
            topics: {
              ...state.topics,
              [id]: {
                ...state.topics[id],
                content,
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
            // Local storage implementation
            await deleteTopicFiles(topic);
            
            // Update the subject's topicOrder
            const subject = get().subjects[topic.subjectId];
            if (subject) {
              const updatedSubject = {
                ...subject,
                topicOrder: (subject.topicOrder || []).filter(topicId => topicId !== id),
                updatedAt: new Date().toISOString(),
              };
              saveSubject(updatedSubject);
            }
          }
          
          // Update state
          set((state) => {
            const { [id]: _, ...remainingTopics } = state.topics;
            
            // Find subtopics associated with this topic and remove them
            const subtopicIdsToRemove = Object.values(state.subtopics)
              .filter(subtopic => subtopic.topicId === id)
              .map(subtopic => subtopic.id);
            
            const remainingSubtopics = { ...state.subtopics };
            subtopicIdsToRemove.forEach(subtopicId => {
              delete remainingSubtopics[subtopicId];
            });
            
            // Update current selections if needed
            const newCurrentTopicId = state.currentTopicId === id
              ? null
              : state.currentTopicId;
            
            const newCurrentSubtopicId = subtopicIdsToRemove.includes(state.currentSubtopicId as string)
              ? null
              : state.currentSubtopicId;
            
            // Update the subject's topicOrder
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
          // Firebase implementation would go here
          if (get().useFirebase) {
            // Update in Firebase is not implemented yet
            console.log("Firebase reorderSubtopics not implemented yet");
          }
          
          // Update local state - this function is not fully implemented in the original store
          console.log("Reordering subtopics", topicId, subtopicOrder);
        } catch (error) {
          console.error("Failed to reorder subtopics:", error);
        }
      },

      // Implementation for subtopic operations
      addSubtopic: async (topicId, title, description = '') => {
        try {
          const topic = get().topics[topicId];
          if (!topic) return;
          
          if (get().useFirebase) {
            const newSubtopic = await fbAddSubtopic(topic.subjectId, topicId, title);
            // Ensure we have all required properties for the Subtopic type
            const completeSubtopic: Subtopic = {
              ...newSubtopic,
            };
            
            set((state) => ({
              subtopics: {
                ...state.subtopics,
                [completeSubtopic.id]: completeSubtopic,
              },
              currentSubtopicId: completeSubtopic.id,
            }));
          } else {
            // Local implementation
            const id = crypto.randomUUID();
            const timestamp = new Date().toISOString();
            
            const newSubtopic = {
              id,
              topicId,
              title,
              content: '',
              status: 'not-started' as const,
              completionPercentage: 0,
              notes: '',
              order: Object.values(get().subtopics).filter(s => s.topicId === topicId).length,
              createdAt: timestamp,
              updatedAt: timestamp,
            };
            
            // Save to browser storage
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
            // Local storage implementation
            const updatedSubtopic = {
              ...subtopic,
              title,
              updatedAt: new Date().toISOString(),
            };
            
            // Save to browser storage
            saveSubtopic(updatedSubtopic);
          }
          
          // Update local state
          set((state) => ({
            subtopics: {
              ...state.subtopics,
              [id]: {
                ...state.subtopics[id],
                title,
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
            // Local storage implementation
            const updatedSubtopic = {
              ...subtopic,
              content,
              updatedAt: new Date().toISOString(),
            };
            
            // Save to browser storage
            saveSubtopic(updatedSubtopic);
          }
          
          // Update local state
          set((state) => ({
            subtopics: {
              ...state.subtopics,
              [id]: {
                ...state.subtopics[id],
                content,
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
            // Local storage implementation
            const updatedSubtopic = {
              ...subtopic,
              status,
              completionPercentage,
              updatedAt: new Date().toISOString(),
            };
            
            // Save to browser storage
            saveSubtopic(updatedSubtopic);
          }
          
          // Update local state
          set((state) => ({
            subtopics: {
              ...state.subtopics,
              [id]: {
                ...state.subtopics[id],
                status,
                completionPercentage,
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
            // Local storage implementation
            await deleteSubtopicFiles(subtopic);
          }
          
          // Update state
          set((state) => {
            const { [id]: _, ...remainingSubtopics } = state.subtopics;
            
            // Update current selection if needed
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
      name: "learnit-store",
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
);
