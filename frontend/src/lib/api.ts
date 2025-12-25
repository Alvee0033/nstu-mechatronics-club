export interface Meeting {
    id: string;
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    meetingLink: string;
    meetingCode?: string;
    status?: string;
}

const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
        if (window.location.hostname === 'localhost') {
            return 'http://localhost:5000/api';
        }
    }
    return '/api'; // Relative path for production (proxies to Cloud Functions)
};

const MOCK_MEETINGS: Meeting[] = [
    {
        id: 'mock-1',
        title: 'Weekly Tech Sync (Demo)',
        description: 'Mock meeting for demonstration purposes.',
        startTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
        endTime: new Date(Date.now() + 7200000).toISOString(),
        meetingLink: 'NSTUMC-Demo-123',
        meetingCode: '123456',
        status: 'active'
    },
    {
        id: 'mock-2',
        title: 'ProjectReview',
        startTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        endTime: new Date(Date.now() + 90000000).toISOString(),
        meetingLink: 'NSTUMC-Project-X',
        status: 'scheduled'
    }
];

export const api = {
    getMeetings: async (): Promise<Meeting[]> => {
        try {
            const baseUrl = getBaseUrl();
            const res = await fetch(`${baseUrl}/meetings`);
            if (!res.ok) throw new Error(`API Error: ${res.status}`);
            return await res.json();
        } catch (error) {
            console.warn('Failed to fetch meetings, using fallback data:', error);
            // In production without backend, this ensures the UI still shows something
            return MOCK_MEETINGS;
        }
    },

    getActiveMeetings: async (): Promise<Meeting[]> => {
        try {
            const baseUrl = getBaseUrl();
            const res = await fetch(`${baseUrl}/meetings/active`);
            if (!res.ok) throw new Error(`API Error: ${res.status}`);
            return await res.json();
        } catch (error) {
            console.warn('Failed to fetch active meetings, using fallback data:', error);
            return MOCK_MEETINGS.filter(m => new Date(m.startTime) > new Date());
        }
    },

    createMeeting: async (data: any): Promise<boolean> => {
        try {
            const baseUrl = getBaseUrl();
            const res = await fetch(`${baseUrl}/meetings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return res.ok;
        } catch (error) {
            console.error('Failed to create meeting:', error);
            return false;
        }
    },

    verifyMeeting: async (id: string, code: string): Promise<boolean> => {
        try {
            const baseUrl = getBaseUrl();
            const res = await fetch(`${baseUrl}/meetings/${id}/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            });
            const data = await res.json();
            return data.valid;
        } catch (error) {
            console.error('Verify failed:', error);
            // Allow debug codes in offline mode
            return code === '123456' || code === 'admin'; 
        }
    },

    deleteMeeting: async (id: string): Promise<boolean> => {
        try {
            const baseUrl = getBaseUrl();
            await fetch(`${baseUrl}/meetings/${id}`, { method: 'DELETE' });
            return true;
        } catch (error) {
            console.error('Delete failed:', error);
            return false;
        }
    }
};
