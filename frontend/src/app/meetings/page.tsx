"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Video, Loader2 } from 'lucide-react';

interface Meeting {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    meetingLink: string;
    meetingCode?: string;
    description?: string;
}

const MeetingCard = ({ meeting, index }: { meeting: Meeting; index: number }) => {
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        const calculateTime = () => {
            const now = new Date().getTime();
            const start = new Date(meeting.startTime).getTime();
            const distance = start - now;

            if (distance < 0) {
                setTimeLeft("LIVE");
            } else {
                const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const s = Math.floor((distance % (1000 * 60)) / 1000);
                setTimeLeft(`${h}h ${m}m ${s}s`);
            }
        };

        calculateTime();
        const interval = setInterval(calculateTime, 1000);
        return () => clearInterval(interval);
    }, [meeting.startTime]);

    // Get the join link for the meeting
    const getJoinLink = () => {
        // Use meetingCode if available, otherwise use meetingLink as the room code
        if (meeting.meetingCode) return `/meet/${meeting.meetingCode}`;

        // If link is already internal (/meet/...), use it
        if (meeting.meetingLink?.startsWith('/')) return meeting.meetingLink;

        // Otherwise, treat meetingLink as the Agora room code
        return `/meet/${meeting.meetingLink}`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="holo-card p-8 group border border-white/5 hover:border-cyan-500/30 transition-all"
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-xs font-bold font-mono rounded uppercase tracking-wider">
                            Active Protocol
                        </span>
                        <span className="flex items-center gap-1 text-gray-400 text-sm font-mono">
                            <Calendar className="w-3 h-3" />
                            {new Date(meeting.startTime).toLocaleDateString()}
                        </span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 font-display group-hover:text-neon-cyan transition-colors">
                        {meeting.title}
                    </h3>
                    <div className="flex items-center gap-4 text-gray-400 font-mono text-sm">
                        <span className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-cyan-500" />
                            {new Date(meeting.startTime).toLocaleTimeString()} - {new Date(meeting.endTime).toLocaleTimeString()}
                        </span>
                        <span className="flex items-center gap-2">
                            <Video className="w-4 h-4 text-purple-500" />
                            Video Uplink
                        </span>
                    </div>
                </div>

                <div className="w-full md:w-auto flex flex-col gap-3 min-w-[200px]">
                    <div className="px-6 py-4 bg-black/40 rounded-lg border border-white/5 text-center">
                        <p className="text-xs text-gray-500 font-mono uppercase mb-1">Status</p>
                        <p className={`font-bold tracking-widest font-mono ${timeLeft === 'LIVE' ? 'text-red-500 animate-pulse' : 'text-neon-green'}`}>
                            {timeLeft || "CALCULATING..."}
                        </p>
                    </div>
                    <a
                        href={getJoinLink()}
                        className="px-6 py-3 bg-neon-cyan/20 border border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan hover:text-black transition-all font-mono font-bold tracking-wider text-center uppercase text-sm rounded cursor-pointer group block decoration-0"
                    >
                        <span className="group-hover:animate-pulse">
                            {timeLeft === 'LIVE' ? "JOIN NOW" : "JOIN MISSION"}
                        </span>
                    </a>
                </div>
            </div>
        </motion.div>
    );
};

export default function MeetingsPage() {
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMeetings = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/meetings/active');
                if (res.ok) {
                    const data = await res.json();
                    setMeetings(data);
                }
            } catch (error) {
                console.error('Error fetching meetings:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMeetings();
    }, []);

    return (
        <div className="min-h-screen pt-32 px-4 pb-20">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]" />
            </div>

            <div className="container mx-auto relative z-10 max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-5xl md:text-7xl font-bold font-display mb-6">
                        Mission <span className="text-neon-cyan">Briefings</span>
                    </h1>
                    <p className="text-xl text-cyan-100/60 max-w-2xl mx-auto font-light">
                        Join our scheduled operations and technical workshops.
                        Secure lines establishment via Internal Uplink.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 gap-6 mt-12">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-10 h-10 text-neon-cyan animate-spin" />
                        </div>
                    ) : meetings.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-20 holo-card"
                        >
                            <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-gray-400 font-display">No Scheduled Missions</h3>
                            <p className="text-gray-500 mt-2">Stand by for future directives.</p>
                        </motion.div>
                    ) : (
                        meetings.map((meeting, index) => (
                            <MeetingCard key={meeting.id} meeting={meeting} index={index} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
