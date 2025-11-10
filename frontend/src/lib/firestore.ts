import { 
  collection, 
  getDocs, 
  getDoc,
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  setDoc,
  query,
  orderBy,
  where,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Collection names
export const COLLECTIONS = {
  MEMBERS: 'members',
  EVENTS: 'events',
  PROJECTS: 'projects',
  ACHIEVEMENTS: 'achievements',
  REGISTRATIONS: 'registrations',
  MEMBER_APPLICATIONS: 'memberApplications',
  INVOICES: 'invoices',
  TRANSACTIONS: 'transactions',
  SETTINGS: 'settings'
};

// Types
export interface Member {
  id?: string;
  name: string;
  role: string;
  department?: string;
  year?: string;
  email?: string;
  phone?: string;
  image?: string; // Can be Firebase Storage URL or base64 string
  photo?: string; // Alternative field name
  photoUrl?: string; // Alternative field name
  profilePhotoDataUrl?: string; // Full resolution profile photo (base64)
  profilePhotoThumbDataUrl?: string; // Thumbnail profile photo (base64)
  bio?: string;
  joinedAt?: Timestamp;
  createdAt?: Timestamp;
}

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

export interface Achievement {
  id?: string;
  title: string;
  description: string;
  date: Timestamp;
  image?: string;
  category?: string;
  awardedBy?: string;
  teamMembers?: string[];
  createdAt?: Timestamp;
}

export interface Registration {
  id?: string;
  fullName: string; // Changed from 'name' to 'fullName' to match database field
  name?: string; // Keep for backward compatibility
  studentId: string;
  email: string;
  phone: string;
  department: string;
  year: string;
  interests?: string;
  experience?: string;
  motivation?: string;
  photoUrl?: string;
  profilePhotoDataUrl?: string; // Full resolution profile photo (base64)
  profilePhotoThumbDataUrl?: string; // Thumbnail profile photo (base64)
  status?: 'pending' | 'approved' | 'rejected';
  createdAt?: Timestamp;
}

export interface Transaction {
  id?: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: Timestamp;
  invoiceUrl?: string; // URL to uploaded invoice/receipt
  invoiceFileName?: string;
  createdBy?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface FinancialStats {
  totalRevenue: number;
  totalExpenses: number;
  netBalance: number;
  transactionCount: number;
  categoryBreakdown: { [key: string]: number };
}

export interface Settings {
  id?: string;
  applicationsEnabled: boolean;
  disabledMessage?: string;
  updatedAt?: Timestamp;
  updatedBy?: string;
}

// Members
export const getMembers = async (): Promise<Member[]> => {
  try {
    const membersCol = collection(db, COLLECTIONS.MEMBERS);
    const q = query(membersCol, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    // Get all members and deduplicate by name and email combination
    const membersMap = new Map<string, Member>();
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      // Normalize image field - prioritize profilePhotoDataUrl fields, then check other possible field names
      const image = data.profilePhotoDataUrl || data.image || data.photo || data.photoUrl || '';
      
      // Clean up bio field by removing department information
      let bio = data.bio || '';
      if (bio) {
        // Remove common department patterns
        bio = bio.replace(/Department of [^\n]*/gi, '').trim();
        bio = bio.replace(/Computer/gi, '').trim();
        bio = bio.replace(/Mechanical/gi, '').trim();
        bio = bio.replace(/Software Engineering/gi, '').trim();
        bio = bio.replace(/Information and Communication Engineering/gi, '').trim();
        bio = bio.replace(/Electrical and Electronic Engineering/gi, '').trim();
        bio = bio.replace(/Civil Engineering/gi, '').trim();
        bio = bio.replace(/Chemical Engineering/gi, '').trim();
        bio = bio.replace(/Biomedical Engineering/gi, '').trim();
        bio = bio.replace(/ICE/gi, '').trim();
        bio = bio.replace(/CSE/gi, '').trim();
        bio = bio.replace(/EEE/gi, '').trim();
        bio = bio.replace(/ME/gi, '').trim();
        bio = bio.replace(/CE/gi, '').trim();
        bio = bio.replace(/ChE/gi, '').trim();
        bio = bio.replace(/BME/gi, '').trim();
        // Remove extra whitespace and clean up
        bio = bio.replace(/\s+/g, ' ').trim();
        // Remove leading/trailing punctuation
        bio = bio.replace(/^[,.\s]+|[,.\s]+$/g, '');
      }
      
      const member = { 
        id: doc.id, 
        ...data,
        image,
        bio: bio || undefined // Set to undefined if empty after cleaning
      } as Member;
      
      // Create a unique key based on name and email to deduplicate
      const uniqueKey = `${member.name?.toLowerCase()?.trim()}_${member.email?.toLowerCase()?.trim()}`;
      
      // Keep the most recently created member if duplicates exist
      if (!membersMap.has(uniqueKey) || 
          (member.createdAt && (!membersMap.get(uniqueKey)?.createdAt || 
           member.createdAt.toMillis() > membersMap.get(uniqueKey)!.createdAt!.toMillis()))) {
        membersMap.set(uniqueKey, member);
      }
    });
    
    return Array.from(membersMap.values());
  } catch (error) {
    console.error('Error fetching members:', error);
    return [];
  }
};

export const addMember = async (member: Omit<Member, 'id'>): Promise<string> => {
  try {
    const membersCol = collection(db, COLLECTIONS.MEMBERS);
    const docRef = await addDoc(membersCol, {
      ...member,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding member:', error);
    throw error;
  }
};

export const updateMember = async (id: string, member: Partial<Member>): Promise<void> => {
  try {
    const memberRef = doc(db, COLLECTIONS.MEMBERS, id);
    await updateDoc(memberRef, {
      ...member,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating member:', error);
    throw error;
  }
};

export const deleteMember = async (id: string): Promise<void> => {
  try {
    const memberRef = doc(db, COLLECTIONS.MEMBERS, id);
    await deleteDoc(memberRef);
  } catch (error) {
    console.error('Error deleting member:', error);
    throw error;
  }
};

export const getMemberById = async (id: string): Promise<Member | null> => {
  try {
    const docRef = doc(db, COLLECTIONS.MEMBERS, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Member : null;
  } catch (error) {
    console.error('Error fetching member:', error);
    return null;
  }
};

// Events
export const getEvents = async (): Promise<Event[]> => {
  try {
    const eventsCol = collection(db, COLLECTIONS.EVENTS);
    const q = query(eventsCol, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
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
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
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

// Achievements
export const getAchievements = async (): Promise<Achievement[]> => {
  try {
    const achievementsCol = collection(db, COLLECTIONS.ACHIEVEMENTS);
    const q = query(achievementsCol, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Achievement));
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return [];
  }
};

export const getAchievementById = async (id: string): Promise<Achievement | null> => {
  try {
    const docRef = doc(db, COLLECTIONS.ACHIEVEMENTS, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Achievement : null;
  } catch (error) {
    console.error('Error fetching achievement:', error);
    return null;
  }
};

export const addAchievement = async (achievement: Omit<Achievement, 'id'>): Promise<string | null> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.ACHIEVEMENTS), {
      ...achievement,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding achievement:', error);
    return null;
  }
};

export const updateAchievement = async (id: string, achievement: Partial<Achievement>): Promise<void> => {
  try {
    const achievementRef = doc(db, COLLECTIONS.ACHIEVEMENTS, id);
    await updateDoc(achievementRef, achievement);
  } catch (error) {
    console.error('Error updating achievement:', error);
    throw error;
  }
};

export const deleteAchievement = async (id: string): Promise<void> => {
  try {
    const achievementRef = doc(db, COLLECTIONS.ACHIEVEMENTS, id);
    await deleteDoc(achievementRef);
  } catch (error) {
    console.error('Error deleting achievement:', error);
    throw error;
  }
};

// Registrations
export const getRegistrations = async (): Promise<Registration[]> => {
  try {
    const registrationsCol = collection(db, COLLECTIONS.MEMBER_APPLICATIONS);
    const q = query(registrationsCol, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Registration));
  } catch (error) {
    console.error('Error fetching registrations:', error);
    return [];
  }
};

export const addRegistration = async (registration: Omit<Registration, 'id'>): Promise<string | null> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.MEMBER_APPLICATIONS), {
      ...registration,
      status: 'pending',
      createdAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding registration:', error);
    return null;
  }
};

export const updateRegistrationStatus = async (
  id: string, 
  status: 'pending' | 'approved' | 'rejected'
): Promise<boolean> => {
  try {
    const docRef = doc(db, COLLECTIONS.MEMBER_APPLICATIONS, id);
    await updateDoc(docRef, { status });
    return true;
  } catch (error) {
    console.error('Error updating registration status:', error);
    return false;
  }
};

// Approve application and convert to member
export const approveApplicationAndAddMember = async (
  applicationId: string,
  application: Registration
): Promise<boolean> => {
  try {
    // First, update the application status to approved
    const appDocRef = doc(db, COLLECTIONS.MEMBER_APPLICATIONS, applicationId);
    await updateDoc(appDocRef, { status: 'approved' });

    // Then, create a new member from the application
    const memberData: Omit<Member, 'id'> = {
      name: application.fullName || application.name || '', // Use fullName field
      role: 'Member', // Default role
      department: application.department,
      year: application.year,
      email: application.email,
      phone: application.phone,
      profilePhotoDataUrl: application.profilePhotoDataUrl || application.photoUrl,
      profilePhotoThumbDataUrl: application.profilePhotoThumbDataUrl,
      image: application.profilePhotoDataUrl || application.photoUrl,
      bio: application.motivation || '',
      joinedAt: Timestamp.now(),
      createdAt: Timestamp.now(),
    };

    await addMember(memberData);
    return true;
  } catch (error) {
    console.error('Error approving application and adding member:', error);
    return false;
  }
};

// Transactions & Invoices
export const getTransactions = async (filter?: {
  type?: 'income' | 'expense';
  startDate?: Date;
  endDate?: Date;
  category?: string;
}): Promise<Transaction[]> => {
  try {
    const transactionsCol = collection(db, COLLECTIONS.TRANSACTIONS);
    let q = query(transactionsCol, orderBy('date', 'desc'));

    if (filter?.type) {
      q = query(transactionsCol, where('type', '==', filter.type), orderBy('date', 'desc'));
    }

    const snapshot = await getDocs(q);
    let transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));

    // Apply additional filters client-side
    if (filter?.startDate) {
      transactions = transactions.filter(t => t.date.toDate() >= filter.startDate!);
    }
    if (filter?.endDate) {
      transactions = transactions.filter(t => t.date.toDate() <= filter.endDate!);
    }
    if (filter?.category) {
      transactions = transactions.filter(t => t.category === filter.category);
    }

    return transactions;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
};

export const getTransactionById = async (id: string): Promise<Transaction | null> => {
  try {
    const docRef = doc(db, COLLECTIONS.TRANSACTIONS, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Transaction : null;
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return null;
  }
};

export const addTransaction = async (transaction: Omit<Transaction, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.TRANSACTIONS), {
      ...transaction,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding transaction:', error);
    throw error;
  }
};

export const updateTransaction = async (id: string, transaction: Partial<Transaction>): Promise<void> => {
  try {
    const transactionRef = doc(db, COLLECTIONS.TRANSACTIONS, id);
    await updateDoc(transactionRef, {
      ...transaction,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
};

export const deleteTransaction = async (id: string): Promise<void> => {
  try {
    const transactionRef = doc(db, COLLECTIONS.TRANSACTIONS, id);
    await deleteDoc(transactionRef);
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
};

export const getFinancialStats = async (
  startDate?: Date,
  endDate?: Date
): Promise<FinancialStats> => {
  try {
    const transactions = await getTransactions();
    
    // Filter by date range if provided
    let filteredTransactions = transactions;
    if (startDate || endDate) {
      filteredTransactions = transactions.filter(t => {
        const tDate = t.date.toDate();
        if (startDate && tDate < startDate) return false;
        if (endDate && tDate > endDate) return false;
        return true;
      });
    }

    const stats: FinancialStats = {
      totalRevenue: 0,
      totalExpenses: 0,
      netBalance: 0,
      transactionCount: filteredTransactions.length,
      categoryBreakdown: {},
    };

    filteredTransactions.forEach(t => {
      if (t.type === 'income') {
        stats.totalRevenue += t.amount;
      } else {
        stats.totalExpenses += t.amount;
        stats.categoryBreakdown[t.category] = (stats.categoryBreakdown[t.category] || 0) + t.amount;
      }
    });

    stats.netBalance = stats.totalRevenue - stats.totalExpenses;

    return stats;
  } catch (error) {
    console.error('Error calculating financial stats:', error);
    return {
      totalRevenue: 0,
      totalExpenses: 0,
      netBalance: 0,
      transactionCount: 0,
      categoryBreakdown: {},
    };
  }
};

// Settings
export const getSettings = async (): Promise<Settings> => {
  try {
    const settingsDoc = await getDoc(doc(db, COLLECTIONS.SETTINGS, 'general'));
    if (settingsDoc.exists()) {
      return { id: settingsDoc.id, ...settingsDoc.data() } as Settings;
    } else {
      // Return default settings if none exist
      return {
        id: 'general',
        applicationsEnabled: true,
        updatedAt: Timestamp.now(),
      };
    }
  } catch (error) {
    console.error('Error fetching settings:', error);
    return {
      id: 'general',
      applicationsEnabled: true,
      updatedAt: Timestamp.now(),
    };
  }
};

export const updateSettings = async (settings: Partial<Settings>): Promise<void> => {
  try {
    const settingsRef = doc(db, COLLECTIONS.SETTINGS, 'general');
    await setDoc(settingsRef, {
      ...settings,
      updatedAt: Timestamp.now(),
    }, { merge: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
};

export const createDefaultSettings = async (): Promise<void> => {
  try {
    const settingsRef = doc(db, COLLECTIONS.SETTINGS, 'general');
    await setDoc(settingsRef, {
      applicationsEnabled: true,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error creating default settings:', error);
    throw error;
  }
};
