import { Router, Request, Response } from 'express';
import { getUpcomingMeetings, verifyMeetingCode, addMeeting, deleteMeeting, Timestamp } from '../firestore';

const router = Router();

// GET /api/meetings/active - Public active meetings
router.get('/active', async (req: Request, res: Response) => {
    try {
        const meetings = await getUpcomingMeetings();
        const formatted = meetings.map(m => ({
            ...m,
            startTime: m.startTime.toDate().toISOString(),
            endTime: m.endTime.toDate().toISOString(),
            createdAt: m.createdAt ? m.createdAt.toDate().toISOString() : undefined,
            meetingCode: undefined, // Hide secret
            meetingLink: undefined  // Hide link until verify
        }));
        res.json(formatted);
    } catch (error) {
        console.error('Error fetching meetings:', error);
        res.status(500).json({ message: 'Error fetching meetings' });
    }
});

// GET /api/meetings - Admin all meetings
router.get('/', async (req: Request, res: Response) => {
    try {
        const meetings = await getUpcomingMeetings();
        const formatted = meetings.map(m => ({
            ...m,
            startTime: m.startTime.toDate().toISOString(),
            endTime: m.endTime.toDate().toISOString(),
            createdAt: m.createdAt ? m.createdAt.toDate().toISOString() : undefined
        }));
        res.json(formatted);
    } catch (error) {
        console.error('Error fetching meetings:', error);
        res.status(500).json({ message: 'Error fetching meetings' });
    }
});

// POST /api/meetings/verify - Verify code
router.post('/verify', async (req: Request, res: Response) => {
    try {
        const { id, code } = req.body;
        if (!id || !code) return res.status(400).json({ message: 'Missing id or code' });

        const isValid = await verifyMeetingCode(id, code);
        if (isValid) {
            // We need to fetch the meeting again to get the link... 
            // Ideally verifyMeetingCode returns the object or null.
            // But existing verifyMeetingCode returns boolean.
            // Let's rely on getMeetingById exported? 
            // Wait, I exported verifyMeetingCode in firestore.ts which uses getMeetingById.
            // I should modify verify logic or just fetch it here.

            // To be efficient, let's just use getMeetingById here if valid.
            const { getMeetingById } = await import('../firestore');
            const m = await getMeetingById(id);
            if (m) {
                res.json({ success: true, meetingLink: m.meetingLink });
            } else {
                res.status(500).json({ message: 'Meeting found then lost?' });
            }
        } else {
            res.status(401).json({ success: false, message: 'Invalid code' });
        }
    } catch (error) {
        console.error('Error verifying:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/meetings - Create
router.post('/', async (req: Request, res: Response) => {
    try {
        const { title, description, startTime, endTime, meetingLink, meetingCode } = req.body;

        // Parse dates to Timestamp
        const startTs = Timestamp.fromDate(new Date(startTime));
        const endTs = Timestamp.fromDate(new Date(endTime));

        const id = await addMeeting({
            title,
            description: description || '',
            startTime: startTs,
            endTime: endTs,
            meetingLink,
            meetingCode
        });

        if (id) {
            res.status(201).json({ id, message: 'Meeting created' });
        } else {
            res.status(500).json({ message: 'Failed to create meeting' });
        }
    } catch (error) {
        console.error('Error creating meeting:', error);
        res.status(500).json({ message: 'Error creating meeting' });
    }
});

// DELETE /api/meetings/:id
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        await deleteMeeting(req.params.id);
        res.json({ message: 'Meeting deleted' });
    } catch (error) {
        console.error('Error deleting:', error);
        res.status(500).json({ message: 'Error deleting meeting' });
    }
});

export default router;
