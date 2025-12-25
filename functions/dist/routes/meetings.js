"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const firestore_1 = require("../firestore");
const router = (0, express_1.Router)();
// GET /api/meetings/active - Public active meetings
router.get('/active', async (req, res) => {
    try {
        const meetings = await (0, firestore_1.getUpcomingMeetings)();
        const formatted = meetings.map(m => ({
            ...m,
            startTime: m.startTime.toDate().toISOString(),
            endTime: m.endTime.toDate().toISOString(),
            createdAt: m.createdAt ? m.createdAt.toDate().toISOString() : undefined,
            meetingCode: undefined, // Hide secret
            meetingLink: undefined // Hide link until verify
        }));
        res.json(formatted);
    }
    catch (error) {
        console.error('Error fetching meetings:', error);
        res.status(500).json({ message: 'Error fetching meetings' });
    }
});
// GET /api/meetings - Admin all meetings
router.get('/', async (req, res) => {
    try {
        const meetings = await (0, firestore_1.getUpcomingMeetings)();
        const formatted = meetings.map(m => ({
            ...m,
            startTime: m.startTime.toDate().toISOString(),
            endTime: m.endTime.toDate().toISOString(),
            createdAt: m.createdAt ? m.createdAt.toDate().toISOString() : undefined
        }));
        res.json(formatted);
    }
    catch (error) {
        console.error('Error fetching meetings:', error);
        res.status(500).json({ message: 'Error fetching meetings' });
    }
});
// POST /api/meetings/verify - Verify code
router.post('/verify', async (req, res) => {
    try {
        const { id, code } = req.body;
        if (!id || !code)
            return res.status(400).json({ message: 'Missing id or code' });
        const isValid = await (0, firestore_1.verifyMeetingCode)(id, code);
        if (isValid) {
            // We need to fetch the meeting again to get the link... 
            // Ideally verifyMeetingCode returns the object or null.
            // But existing verifyMeetingCode returns boolean.
            // Let's rely on getMeetingById exported? 
            // Wait, I exported verifyMeetingCode in firestore.ts which uses getMeetingById.
            // I should modify verify logic or just fetch it here.
            // To be efficient, let's just use getMeetingById here if valid.
            const { getMeetingById } = await Promise.resolve().then(() => __importStar(require('../firestore')));
            const m = await getMeetingById(id);
            if (m) {
                res.json({ success: true, meetingLink: m.meetingLink });
            }
            else {
                res.status(500).json({ message: 'Meeting found then lost?' });
            }
        }
        else {
            res.status(401).json({ success: false, message: 'Invalid code' });
        }
    }
    catch (error) {
        console.error('Error verifying:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
// POST /api/meetings - Create
router.post('/', async (req, res) => {
    try {
        const { title, description, startTime, endTime, meetingLink, meetingCode } = req.body;
        // Parse dates to Timestamp
        const startTs = firestore_1.Timestamp.fromDate(new Date(startTime));
        const endTs = firestore_1.Timestamp.fromDate(new Date(endTime));
        const id = await (0, firestore_1.addMeeting)({
            title,
            description: description || '',
            startTime: startTs,
            endTime: endTs,
            meetingLink,
            meetingCode
        });
        if (id) {
            res.status(201).json({ id, message: 'Meeting created' });
        }
        else {
            res.status(500).json({ message: 'Failed to create meeting' });
        }
    }
    catch (error) {
        console.error('Error creating meeting:', error);
        res.status(500).json({ message: 'Error creating meeting' });
    }
});
// DELETE /api/meetings/:id
router.delete('/:id', async (req, res) => {
    try {
        await (0, firestore_1.deleteMeeting)(req.params.id);
        res.json({ message: 'Meeting deleted' });
    }
    catch (error) {
        console.error('Error deleting:', error);
        res.status(500).json({ message: 'Error deleting meeting' });
    }
});
exports.default = router;
