import { admin, db } from './firebase';

export const COLLECTIONS = {
  EVENTS: 'events',
  MEETINGS: 'meetings',
  PROJECTS: 'projects',
  MEMBERS: 'members'
};

// Types
export interface Event {
  id?: string;
  title: string;
  description: string;
  date: admin.firestore.Timestamp;
  location?: string;
  image?: string;
  category?: string;
  organizer?: string;
  createdAt?: admin.firestore.Timestamp;
}

export interface Meeting {
  id?: string;
  title: string;
  description?: string;
  startTime: admin.firestore.Timestamp;
  endTime: admin.firestore.Timestamp;
  meetingLink: string;
  meetingCode: string;
  createdAt?: admin.firestore.Timestamp;
}

// Events
export const getEvents = async (): Promise<Event[]> => {
  try {
    const snapshot = await db.collection(COLLECTIONS.EVENTS).orderBy('date', 'desc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
};

export const getEventById = async (id: string): Promise<Event | null> => {
  try {
    const docSnap = await db.collection(COLLECTIONS.EVENTS).doc(id).get();
    return docSnap.exists ? { id: docSnap.id, ...docSnap.data() } as Event : null;
  } catch (error) {
    console.error('Error fetching event:', error);
    return null;
  }
};

export const addEvent = async (event: Omit<Event, 'id'>): Promise<string | null> => {
  try {
    const docRef = await db.collection(COLLECTIONS.EVENTS).add({
      ...event,
      createdAt: admin.firestore.Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding event:', error);
    return null;
  }
};

export const updateEvent = async (id: string, event: Partial<Event>): Promise<void> => {
  try {
    await db.collection(COLLECTIONS.EVENTS).doc(id).update(event);
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

export const deleteEvent = async (id: string): Promise<void> => {
  try {
    await db.collection(COLLECTIONS.EVENTS).doc(id).delete();
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

// Meetings
export const getUpcomingMeetings = async (): Promise<Meeting[]> => {
  try {
    const snapshot = await db.collection(COLLECTIONS.MEETINGS).orderBy('startTime', 'asc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Meeting));
  } catch (error) {
    console.error('Error fetching meetings:', error);
    return [];
  }
};

export const getMeetingById = async (id: string): Promise<Meeting | null> => {
  try {
    const docSnap = await db.collection(COLLECTIONS.MEETINGS).doc(id).get();
    return docSnap.exists ? { id: docSnap.id, ...docSnap.data() } as Meeting : null;
  } catch (error) {
    console.error('Error fetching meeting:', error);
    return null;
  }
};

export const verifyMeetingCode = async (id: string, code: string): Promise<boolean> => {
  const m = await getMeetingById(id);
  if (!m) return false;
  return m.meetingCode == code; // Loose equality matching backend behavior
};

export const addMeeting = async (meeting: Omit<Meeting, 'id'>): Promise<string | null> => {
  try {
    const docRef = await db.collection(COLLECTIONS.MEETINGS).add({
      ...meeting,
      createdAt: admin.firestore.Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding meeting:', error);
    return null;
  }
};

export const deleteMeeting = async (id: string): Promise<void> => {
  try {
    await db.collection(COLLECTIONS.MEETINGS).doc(id).delete();
  } catch (error) {
    console.error('Error deleting meeting:', error);
    throw error;
  }
};

// Export Timestamp
export const Timestamp = admin.firestore.Timestamp;