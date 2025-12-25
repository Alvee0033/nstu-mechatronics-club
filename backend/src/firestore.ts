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
import * as fs from 'fs';
import * as path from 'path';

// Local storage fallback for Meetings (to bypass auth/rule issues)
const DATA_DIR = path.join(__dirname, '..', 'data');
const MEETINGS_FILE = path.join(DATA_DIR, 'meetings.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Export Timestamp for use in routes
export { Timestamp };

// Collection names
export const COLLECTIONS = {
  EVENTS: 'events',
  PROJECTS: 'projects',
  MEMBERS: 'members',
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

export interface Project {
  id?: string;
  title: string;
  description: string;
  image?: string;
  technologies?: string[];
  teamMembers?: string[];
  status?: 'completed' | 'ongoing' | 'planned';
  githubUrl?: string;
  demoUrl?: string;
  createdAt?: Timestamp;
}

export interface Member {
  id?: string;
  name: string;
  email?: string;
  role?: string;
  department?: string;
  image?: string;
  social?: {
    linkedin?: string;
    github?: string;
  };
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

// Projects
export const getProjects = async (): Promise<Project[]> => {
  try {
    const projectsCol = collection(db, COLLECTIONS.PROJECTS);
    const q = query(projectsCol, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Project));
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
};

export const getProjectById = async (id: string): Promise<Project | null> => {
  try {
    const docRef = doc(db, COLLECTIONS.PROJECTS, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Project : null;
  } catch (error) {
    console.error('Error fetching project:', error);
    return null;
  }
};

export const addProject = async (project: Omit<Project, 'id'>): Promise<string | null> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.PROJECTS), {
      ...project,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding project:', error);
    return null;
  }
};

export const updateProject = async (id: string, project: Partial<Project>): Promise<void> => {
  try {
    const projectRef = doc(db, COLLECTIONS.PROJECTS, id);
    await updateDoc(projectRef, project);
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
};

export const deleteProject = async (id: string): Promise<void> => {
  try {
    const projectRef = doc(db, COLLECTIONS.PROJECTS, id);
    await deleteDoc(projectRef);
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
};

// Members
export const getMembers = async (): Promise<Member[]> => {
  try {
    const membersCol = collection(db, COLLECTIONS.MEMBERS);
    const q = query(membersCol, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Member));
  } catch (error) {
    console.error('Error fetching members:', error);
    // Fallback to hardcoded data if Firebase fails
    return [
      {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@nstu.edu.bd',
        role: 'President',
        department: 'Mechatronics Engineering',
        image: '/images/member1.jpg',
        social: {
          linkedin: 'https://linkedin.com',
          github: 'https://github.com'
        }
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane.smith@nstu.edu.bd',
        role: 'Vice President',
        department: 'Mechatronics Engineering',
        image: '/images/member2.jpg',
        social: {
          linkedin: 'https://linkedin.com',
          github: 'https://github.com'
        }
      }
    ];
  }
};

// Meetings
export interface Meeting {
  id?: string;
  title: string;
  description?: string;
  startTime: Timestamp;
  endTime: Timestamp;
  meetingLink: string;
  meetingCode: string;
  createdAt?: Timestamp;
}

// Validation to prevent potential "Date" vs "Timestamp" issues
const toTimestamp = (date: any): Timestamp => {
  if (date instanceof Timestamp) return date;
  if (typeof date === 'string') return Timestamp.fromDate(new Date(date));
  if (date && typeof date === 'object' && 'seconds' in date && 'nanoseconds' in date) return new Timestamp(date.seconds, date.nanoseconds);
  return Timestamp.fromDate(new Date(date));
};

const readMeetings = (): Meeting[] => {
  if (!fs.existsSync(MEETINGS_FILE)) return [];
  try {
    const data = fs.readFileSync(MEETINGS_FILE, 'utf-8');
    const raw = JSON.parse(data);
    return raw.map((m: any) => ({
      ...m,
      startTime: toTimestamp(m.startTime),
      endTime: toTimestamp(m.endTime),
      createdAt: m.createdAt ? toTimestamp(m.createdAt) : Timestamp.now()
    }));
  } catch (err) {
    console.error("Error reading meetings.json", err);
    return [];
  }
};

const readMeetingsRaw = (): any[] => {
  if (!fs.existsSync(MEETINGS_FILE)) return [];
  try {
    const data = fs.readFileSync(MEETINGS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading meetings.json (raw)", err);
    return [];
  }
};

const saveMeetings = (meetings: Meeting[]) => {
  // Convert Timestamps to ISO strings or serializable objects for JSON
  const serializable = meetings.map(m => ({
    ...m,
    startTime: m.startTime.toDate().toISOString(),
    endTime: m.endTime.toDate().toISOString(),
    createdAt: m.createdAt ? m.createdAt.toDate().toISOString() : undefined
  }));
  fs.writeFileSync(MEETINGS_FILE, JSON.stringify(serializable, null, 2));
};

export const addMeeting = async (meeting: Omit<Meeting, 'id'>): Promise<string | null> => {
  try {
    const meetings = readMeetings();
    const newMeeting: Meeting = {
      id: Date.now().toString(),
      ...meeting,
      createdAt: Timestamp.now()
    };
    meetings.push(newMeeting);
    saveMeetings(meetings);
    console.log(`Meeting added to ${MEETINGS_FILE}: ${newMeeting.id}`);
    return newMeeting.id || null;
  } catch (error) {
    console.error('Error adding meeting:', error);
    return null;
  }
};

export const getUpcomingMeetings = async (): Promise<Meeting[]> => {
  try {
    const meetings = readMeetings();
    // Sort by startTime
    meetings.sort((a, b) => a.startTime.toMillis() - b.startTime.toMillis());
    // Filter debug: return all for now to verify visibility
    return meetings;
  } catch (error) {
    console.error('Error fetching meetings:', error);
    return [];
  }
};

export const getMeetingById = async (id: string): Promise<Meeting | null> => {
  try {
    const meetings = readMeetingsRaw();
    const meeting = meetings.find((m: any) => m.id === id);
    if (!meeting) return null;
    // Construct minimum viable meeting object safely
    return {
      ...meeting,
      // Fallback for timestamps to avoid crashes if raw read
      startTime: meeting.startTime,
      endTime: meeting.endTime,
      createdAt: meeting.createdAt
    } as Meeting;
  } catch (error) {
    console.error('Error fetching meeting by ID:', error);
    return null;
  }
};

export const deleteMeeting = async (id: string): Promise<void> => {
  try {
    let meetings = readMeetings();
    meetings = meetings.filter(m => m.id !== id);
    saveMeetings(meetings);
  } catch (error) {
    console.error('Error deleting meeting:', error);
    throw error;
  }
};

export const verifyMeetingCode = async (id: string, code: string): Promise<boolean> => {
  try {
    // Use raw read to avoid strict type/timestamp issues during verification
    const meetings = readMeetingsRaw();
    const meeting = meetings.find((m: any) => m.id === id);

    if (!meeting) {
      console.log(`Meeting not found for verification: ${id}`);
      return false;
    }

    // Loose equality for code just in case, but trim string
    const match = meeting.meetingCode === code || meeting.meetingCode == code;
    if (!match) {
      console.log(`Code mismatch for ${id}. Expected: ${meeting.meetingCode}, Got: ${code}`);
    }
    return match;
  } catch (error) {
    console.error('Error verifying meeting code:', error);
    return false;
  }
};