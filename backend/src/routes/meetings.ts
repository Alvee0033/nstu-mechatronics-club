import { Router, Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

const router = Router();

// --- Local File Logic (Isolated) ---
const DATA_DIR = path.join(__dirname, '..', '..', 'data');
// Note: src is in backend/src/, so .. is backend/, .. is parent? 
// Wait. backend/src/index.ts. __dirname is src or dist.
// If run via ts-node, __dirname is src.
// meetings.json is in backend/data.
// So src/../data is correct.
// Let's use robust path finding.

const getMeetingsPath = () => {
    // Try standard locations
    const candidates = [
        path.join(process.cwd(), 'data', 'meetings.json'),
        path.join(__dirname, '..', 'data', 'meetings.json'),
        path.join(__dirname, '..', '..', 'data', 'meetings.json')
    ];
    for (const p of candidates) {
        if (fs.existsSync(p)) return p;
    }
    // Default to create in cwd/data
    const defaultPath = path.join(process.cwd(), 'data', 'meetings.json');
    const dir = path.dirname(defaultPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return defaultPath;
};

const MEETINGS_FILE = getMeetingsPath();
console.log('[Meetings] Using data file:', MEETINGS_FILE);

const readMeetingsSafe = (): any[] => {
    try {
        if (!fs.existsSync(MEETINGS_FILE)) return [];
        const data = fs.readFileSync(MEETINGS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (e) {
        console.error('[Meetings] Read Error:', e);
        return [];
    }
};

const saveMeetingsSafe = (meetings: any[]) => {
    try {
        fs.writeFileSync(MEETINGS_FILE, JSON.stringify(meetings, null, 2));
    } catch (e) {
        console.error('[Meetings] Save Error:', e);
    }
};

// --- Routes ---

// GET /api/meetings/active
router.get('/active', async (req: Request, res: Response) => {
    try {
        const meetings = readMeetingsSafe();
        // Sort by startTime if possible (iso strings compare lexically OK for standard format)
        // If not, just send.
        meetings.sort((a: any, b: any) => (a.startTime || '').localeCompare(b.startTime || ''));

        // Hide secret codes
        const publicData = meetings.map((m: any) => ({
            ...m,
            meetingCode: undefined, // Hide code
            meetingLink: undefined  // Hide link until verify
        }));

        res.json(publicData);
    } catch (error) {
        console.error('[Meetings] GET /active Error:', error);
        res.status(500).json({ message: 'Server error fetching active meetings' });
    }
});

// GET /api/meetings (Admin)
router.get('/', async (req: Request, res: Response) => {
    try {
        const meetings = readMeetingsSafe();
        res.json(meetings);
    } catch (error) {
        console.error('[Meetings] GET / Error:', error);
        res.status(500).json({ message: 'Server error fetching meetings' });
    }
});

// POST /api/meetings/verify
router.post('/verify', async (req: Request, res: Response) => {
    try {
        console.log('[Meetings] Verifying code. Body:', req.body);
        const { id, code } = req.body;

        if (!id || !code) {
            return res.status(400).json({ message: 'Missing ID or code' });
        }

        const meetings = readMeetingsSafe();
        const meeting = meetings.find((m: any) => m.id === String(id));

        if (!meeting) {
            console.log(`[Meetings] Meeting not found: ${id}`);
            return res.status(401).json({ success: false, message: 'Meeting not found' });
        }

        // Compare codes (handle potentially different types or whitespace)
        const storedCode = String(meeting.meetingCode || '').trim();
        const inputCode = String(code || '').trim();

        if (storedCode === inputCode) {
            console.log(`[Meetings] Verification success for ${id}`);
            res.json({ success: true, meetingLink: meeting.meetingLink });
        } else {
            console.log(`[Meetings] Code mismatch for ${id}. Expected '${storedCode}', got '${inputCode}'`);
            res.status(401).json({ success: false, message: 'Invalid code' });
        }
    } catch (error: any) {
        console.error('[Meetings] Verify Error:', error);
        // Return JSON even on crash, logging the error
        res.status(500).json({ message: 'Internal Server Verification Error', error: error.toString() });
    }
});

// POST /api/meetings (Create)
router.post('/', async (req: Request, res: Response) => {
    try {
        const { title, description, startTime, endTime, meetingLink, meetingCode } = req.body;

        const meetings = readMeetingsSafe();
        const newMeeting = {
            id: Date.now().toString(),
            title,
            description: description || '',
            startTime, // Assume ISO string from frontend
            endTime,
            meetingLink,
            meetingCode,
            createdAt: new Date().toISOString()
        };

        meetings.push(newMeeting);
        saveMeetingsSafe(meetings);

        res.status(201).json({ id: newMeeting.id, message: 'Meeting created' });
    } catch (error) {
        console.error('[Meetings] Create Error:', error);
        res.status(500).json({ message: 'Error creating meeting' });
    }
});

// DELETE /api/meetings/:id
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        let meetings = readMeetingsSafe();
        meetings = meetings.filter((m: any) => m.id !== id);
        saveMeetingsSafe(meetings);
        res.json({ message: 'Meeting deleted' });
    } catch (error) {
        console.error('[Meetings] Delete Error:', error);
        res.status(500).json({ message: 'Error deleting meeting' });
    }
});

export default router;
