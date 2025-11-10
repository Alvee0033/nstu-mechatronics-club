import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Export Timestamp for use in routes
export { Timestamp };

// Collection names
export const COLLECTIONS = {
  EVENTS: 'events',
};

// Types
export interface Event {
  id?: string;
  title: string;
  description: string;
  date: Timestamp;
  location?: string;
  image?: string;
  category?: string;
  organizer?: string;
  createdAt?: Timestamp;
}

// Events
export const getEvents = async (): Promise<Event[]> => {
  try {
    const eventsCol = collection(db, COLLECTIONS.EVENTS);
    const q = query(eventsCol, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Event));
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
};

export const getEventById = async (id: string): Promise<Event | null> => {
  try {
    const docRef = doc(db, COLLECTIONS.EVENTS, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Event : null;
  } catch (error) {
    console.error('Error fetching event:', error);
    return null;
  }
};

export const addEvent = async (event: Omit<Event, 'id'>): Promise<string | null> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.EVENTS), {
      ...event,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding event:', error);
    return null;
  }
};

export const updateEvent = async (id: string, event: Partial<Event>): Promise<void> => {
  try {
    const eventRef = doc(db, COLLECTIONS.EVENTS, id);
    await updateDoc(eventRef, event);
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

export const deleteEvent = async (id: string): Promise<void> => {
  try {
    const eventRef = doc(db, COLLECTIONS.EVENTS, id);
    await deleteDoc(eventRef);
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};