// Firebase database service
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Firestore
} from 'firebase/firestore';
import { db as firebaseDB, Timestamp } from './firebase';
import { Subject, Topic, Subtopic } from '@/types/store-types';

// Ensure Firestore db is available
if (!firebaseDB) {
  throw new Error('Firestore database is not initialized');
}

// Cast to Firestore with proper type checking
const db: Firestore = firebaseDB as Firestore;

// Subject operations
export async function fetchSubjects() {
  const q = query(collection(db, 'subjects'), orderBy('order', 'asc'));
  const snapshot = await getDocs(q);
  const subjects: Record<string, Subject> = {};
  
  snapshot.docs.forEach(doc => {
    subjects[doc.id] = {
      id: doc.id,
      title: doc.data().title,
      description: doc.data().description || '',
      order: doc.data().order || 0,
      topicOrder: doc.data().topicOrder || []
    };
  });
  
  return subjects;
}

export async function addSubject(title: string, description: string = '') {
  const subjectsRef = collection(db, 'subjects');
  const q = query(subjectsRef, orderBy('order', 'desc'));
  const snapshot = await getDocs(q);
  const highestOrder = snapshot.docs[0]?.data()?.order || 0;
  
  const timestamp = new Date().toISOString();
  
  const newSubject = await addDoc(subjectsRef, {
    title,
    description,
    order: highestOrder + 1,
    topicOrder: [],
    createdAt: timestamp,
    updatedAt: timestamp
  });
  
  return {
    id: newSubject.id,
    title,
    description,
    order: highestOrder + 1,
    topicOrder: [],
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

export async function updateSubject(id: string, title: string, description: string = '') {
  const subjectRef = doc(db, 'subjects', id);
  await updateDoc(subjectRef, {
    title,
    description,
    updatedAt: serverTimestamp()
  });
  
  return { id, title, description };
}

export async function deleteSubject(id: string) {
  await deleteDoc(doc(db, 'subjects', id));
  return id;
}

// Topic operations
export async function fetchTopics(subjectId: string) {
  const q = query(
    collection(db, 'subjects', subjectId, 'topics'),
    orderBy('order', 'asc')
  );
  const snapshot = await getDocs(q);
  const topics: Record<string, Topic> = {};
  
  snapshot.docs.forEach(doc => {
    topics[doc.id] = {
      id: doc.id,
      subjectId,
      title: doc.data().title,
      description: doc.data().description || '',
      content: doc.data().content || '',
      order: doc.data().order || 0
    };
  });
  
  return topics;
}

export async function addTopic(subjectId: string, title: string, description: string = '') {
  const topicsRef = collection(db, 'subjects', subjectId, 'topics');
  const q = query(topicsRef, orderBy('order', 'desc'));
  const snapshot = await getDocs(q);
  const highestOrder = snapshot.docs[0]?.data()?.order || 0;
  
  const timestamp = new Date().toISOString();
  
  const newTopic = await addDoc(topicsRef, {
    title,
    description,
    order: highestOrder + 1,
    content: '',
    subtopicOrder: [],
    createdAt: timestamp,
    updatedAt: timestamp
  });
  
  // Update the subject's topicOrder array
  const subjectRef = doc(db, 'subjects', subjectId);
  const subjectSnap = await getDoc(subjectRef);
  if (subjectSnap.exists()) {
    const topicOrder = subjectSnap.data().topicOrder || [];
    await updateDoc(subjectRef, {
      topicOrder: [...topicOrder, newTopic.id],
      updatedAt: serverTimestamp()
    });
  }
  
  return {
    id: newTopic.id,
    subjectId,
    title,
    description,
    content: '',
    subtopicOrder: [],
    order: highestOrder + 1,
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

export async function updateTopic(
  subjectId: string, 
  topicId: string, 
  title: string, 
  description: string = ''
) {
  const topicRef = doc(db, 'subjects', subjectId, 'topics', topicId);
  await updateDoc(topicRef, {
    title,
    description,
    updatedAt: serverTimestamp()
  });
  
  return { id: topicId, subjectId, title, description };
}

export async function updateTopicContent(subjectId: string, topicId: string, content: string) {
  const topicRef = doc(db, 'subjects', subjectId, 'topics', topicId);
  await updateDoc(topicRef, {
    content,
    updatedAt: serverTimestamp()
  });
  
  return { id: topicId, subjectId, content };
}

export async function deleteTopic(subjectId: string, topicId: string) {
  await deleteDoc(doc(db, 'subjects', subjectId, 'topics', topicId));
  
  // Update the subject's topicOrder array
  const subjectRef = doc(db, 'subjects', subjectId);
  const subjectSnap = await getDoc(subjectRef);
  if (subjectSnap.exists()) {
    const topicOrder = subjectSnap.data().topicOrder || [];
    await updateDoc(subjectRef, {
      topicOrder: topicOrder.filter((id: string) => id !== topicId),
      updatedAt: serverTimestamp()
    });
  }
  
  return topicId;
}

// Subtopic operations
export async function fetchSubtopics(subjectId: string, topicId: string) {
  const q = query(
    collection(db, 'subjects', subjectId, 'topics', topicId, 'subtopics'),
    orderBy('order', 'asc')
  );
  const snapshot = await getDocs(q);
  const subtopics: Record<string, Subtopic> = {};
  
  snapshot.docs.forEach(doc => {
    subtopics[doc.id] = {
      id: doc.id,
      topicId,
      title: doc.data().title,
      content: doc.data().content || '',
      status: doc.data().status || 'not-started',
      completionPercentage: doc.data().completionPercentage || 0,
      notes: doc.data().notes || '',
      order: doc.data().order || 0
    };
  });
  
  return subtopics;
}

export async function addSubtopic(subjectId: string, topicId: string, title: string) {
  const subtopicsRef = collection(db, 'subjects', subjectId, 'topics', topicId, 'subtopics');
  const q = query(subtopicsRef, orderBy('order', 'desc'));
  const snapshot = await getDocs(q);
  const highestOrder = snapshot.docs[0]?.data()?.order || 0;
  
  const timestamp = new Date().toISOString();
  
  const newSubtopic = await addDoc(subtopicsRef, {
    title,
    content: '',
    status: 'not-started',
    completionPercentage: 0,
    order: highestOrder + 1,
    createdAt: timestamp,
    updatedAt: timestamp,
    notes: ''
  });
  
  // Update the topic's subtopicOrder array to include the new subtopic
  const topicRef = doc(db, 'subjects', subjectId, 'topics', topicId);
  const topicSnapshot = await getDoc(topicRef);
  
  if (topicSnapshot.exists()) {
    const topicData = topicSnapshot.data();
    const currentSubtopicOrder = topicData.subtopicOrder || [];
    
    // Add the new subtopic ID to the subtopicOrder array
    await updateDoc(topicRef, {
      subtopicOrder: [...currentSubtopicOrder, newSubtopic.id],
      updatedAt: timestamp
    });
  }
  
  return {
    id: newSubtopic.id,
    topicId,
    title,
    content: '',
    status: 'not-started',
    completionPercentage: 0,
    notes: '',
    order: highestOrder + 1,
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

export async function updateSubtopic(
  subjectId: string, 
  topicId: string, 
  subtopicId: string, 
  title: string
) {
  const subtopicRef = doc(db, 'subjects', subjectId, 'topics', topicId, 'subtopics', subtopicId);
  await updateDoc(subtopicRef, {
    title,
    updatedAt: serverTimestamp(),
    lastAccessed: serverTimestamp()
  });
  
  return { id: subtopicId, topicId, title };
}

export async function updateSubtopicContent(
  subjectId: string,
  topicId: string,
  subtopicId: string,
  content: string
) {
  const subtopicRef = doc(db, 'subjects', subjectId, 'topics', topicId, 'subtopics', subtopicId);
  await updateDoc(subtopicRef, {
    content,
    updatedAt: serverTimestamp(),
    lastAccessed: serverTimestamp()
  });
  
  return { id: subtopicId, topicId, content };
}

export async function updateSubtopicStatus(
  subjectId: string,
  topicId: string,
  subtopicId: string,
  status: 'not-started' | 'in-progress' | 'completed',
  completionPercentage: number
) {
  const subtopicRef = doc(db, 'subjects', subjectId, 'topics', topicId, 'subtopics', subtopicId);
  await updateDoc(subtopicRef, {
    status,
    completionPercentage,
    updatedAt: serverTimestamp(),
    lastAccessed: serverTimestamp()
  });
  
  return { id: subtopicId, topicId, status, completionPercentage };
}

export async function updateSubtopicNotes(
  subjectId: string,
  topicId: string,
  subtopicId: string,
  notes: string
) {
  const subtopicRef = doc(db, 'subjects', subjectId, 'topics', topicId, 'subtopics', subtopicId);
  await updateDoc(subtopicRef, {
    notes,
    updatedAt: serverTimestamp()
  });
  
  return { id: subtopicId, topicId, notes };
}

export async function deleteSubtopic(subjectId: string, topicId: string, subtopicId: string) {
  await deleteDoc(doc(db, 'subjects', subjectId, 'topics', topicId, 'subtopics', subtopicId));
  return subtopicId;
}

// User preferences
export async function fetchUserPreferences(userId: string) {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists() && userSnap.data().preferences) {
    return userSnap.data().preferences;
  }
  
  return {
    theme: "light",
    fontFamily: "sans",
    fontSize: "medium"
  };
}

export async function updateUserPreferences(
  userId: string,
  preferences: {
    theme?: "light" | "dark" | "warm",
    fontFamily?: "sans" | "mono",
    fontSize?: "small" | "medium" | "large"
  }
) {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    const currentPreferences = userSnap.data().preferences || {};
    
    await updateDoc(userRef, {
      preferences: {
        ...currentPreferences,
        ...preferences
      },
      lastActive: serverTimestamp()
    });
    
    return {
      ...currentPreferences,
      ...preferences
    };
  }
  
  return null;
}

// Initialize admin account
export async function initializeAdmin(email: string, displayName: string) {
  // Check if admin exists
  const adminRef = doc(db, 'admin', email);
  const adminSnap = await getDoc(adminRef);
  
  if (!adminSnap.exists()) {
    // Create admin document
    await setDoc(adminRef, {
      displayName,
      email,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp()
    });
    
    console.log(`Admin account created for ${email}`);
  }
}

export async function reorderTopics(subjectId: string, topicOrder: string[]) {
  const subjectRef = doc(db, 'subjects', subjectId);
  await updateDoc(subjectRef, {
    topicOrder,
    updatedAt: serverTimestamp()
  });
  
  return { subjectId, topicOrder };
}

export async function reorderSubtopics(subjectId: string, topicId: string, subtopicOrder: string[]) {
  const topicRef = doc(db, 'subjects', subjectId, 'topics', topicId);
  await updateDoc(topicRef, {
    subtopicOrder,
    updatedAt: serverTimestamp()
  });
  
  return { topicId, subtopicOrder };
}
