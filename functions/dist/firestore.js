"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Timestamp = exports.deleteMeeting = exports.addMeeting = exports.verifyMeetingCode = exports.getMeetingById = exports.getUpcomingMeetings = exports.deleteEvent = exports.updateEvent = exports.addEvent = exports.getEventById = exports.getEvents = exports.COLLECTIONS = void 0;
const firebase_1 = require("./firebase");
exports.COLLECTIONS = {
    EVENTS: 'events',
    MEETINGS: 'meetings',
    PROJECTS: 'projects',
    MEMBERS: 'members'
};
// Events
const getEvents = async () => {
    try {
        const snapshot = await firebase_1.db.collection(exports.COLLECTIONS.EVENTS).orderBy('date', 'desc').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    catch (error) {
        console.error('Error fetching events:', error);
        return [];
    }
};
exports.getEvents = getEvents;
const getEventById = async (id) => {
    try {
        const docSnap = await firebase_1.db.collection(exports.COLLECTIONS.EVENTS).doc(id).get();
        return docSnap.exists ? { id: docSnap.id, ...docSnap.data() } : null;
    }
    catch (error) {
        console.error('Error fetching event:', error);
        return null;
    }
};
exports.getEventById = getEventById;
const addEvent = async (event) => {
    try {
        const docRef = await firebase_1.db.collection(exports.COLLECTIONS.EVENTS).add({
            ...event,
            createdAt: firebase_1.admin.firestore.Timestamp.now()
        });
        return docRef.id;
    }
    catch (error) {
        console.error('Error adding event:', error);
        return null;
    }
};
exports.addEvent = addEvent;
const updateEvent = async (id, event) => {
    try {
        await firebase_1.db.collection(exports.COLLECTIONS.EVENTS).doc(id).update(event);
    }
    catch (error) {
        console.error('Error updating event:', error);
        throw error;
    }
};
exports.updateEvent = updateEvent;
const deleteEvent = async (id) => {
    try {
        await firebase_1.db.collection(exports.COLLECTIONS.EVENTS).doc(id).delete();
    }
    catch (error) {
        console.error('Error deleting event:', error);
        throw error;
    }
};
exports.deleteEvent = deleteEvent;
// Meetings
const getUpcomingMeetings = async () => {
    try {
        const snapshot = await firebase_1.db.collection(exports.COLLECTIONS.MEETINGS).orderBy('startTime', 'asc').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    catch (error) {
        console.error('Error fetching meetings:', error);
        return [];
    }
};
exports.getUpcomingMeetings = getUpcomingMeetings;
const getMeetingById = async (id) => {
    try {
        const docSnap = await firebase_1.db.collection(exports.COLLECTIONS.MEETINGS).doc(id).get();
        return docSnap.exists ? { id: docSnap.id, ...docSnap.data() } : null;
    }
    catch (error) {
        console.error('Error fetching meeting:', error);
        return null;
    }
};
exports.getMeetingById = getMeetingById;
const verifyMeetingCode = async (id, code) => {
    const m = await (0, exports.getMeetingById)(id);
    if (!m)
        return false;
    return m.meetingCode == code; // Loose equality matching backend behavior
};
exports.verifyMeetingCode = verifyMeetingCode;
const addMeeting = async (meeting) => {
    try {
        const docRef = await firebase_1.db.collection(exports.COLLECTIONS.MEETINGS).add({
            ...meeting,
            createdAt: firebase_1.admin.firestore.Timestamp.now()
        });
        return docRef.id;
    }
    catch (error) {
        console.error('Error adding meeting:', error);
        return null;
    }
};
exports.addMeeting = addMeeting;
const deleteMeeting = async (id) => {
    try {
        await firebase_1.db.collection(exports.COLLECTIONS.MEETINGS).doc(id).delete();
    }
    catch (error) {
        console.error('Error deleting meeting:', error);
        throw error;
    }
};
exports.deleteMeeting = deleteMeeting;
// Export Timestamp
exports.Timestamp = firebase_1.admin.firestore.Timestamp;
