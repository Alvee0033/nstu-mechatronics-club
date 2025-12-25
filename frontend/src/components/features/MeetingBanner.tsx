"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Video } from 'lucide-react';

interface Meeting {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    description?: string;
    // meetingLink and meetingCode are hidden until verify
}

export default function MeetingBanner() {
    const [meeting, setMeeting] = useState<Meeting | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [isLive, setIsLive] = useState(false);
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch active meeting
        const fetchMeeting = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/meetings/active');
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.length > 0) {
                        // Pick the soonest one
                        setMeeting(data[0]);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch meetings", err);
            }
        };
        fetchMeeting();
    }, []);

    useEffect(() => {
        if (!meeting) return;

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const start = new Date(meeting.startTime).getTime();
            const end = new Date(meeting.endTime).getTime();

            if (now > end) {
                setMeeting(null); // Meeting ended
                return;
            }

            if (now >= start) {
                setIsLive(true);
                setTimeLeft("LIVE NOW");
            } else {
                const distance = start - now;
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [meeting]);

    const handleJoin = async () => {
        if (!code) return;
        setLoading(true);
        setError('');

        try {
            const res = await fetch('http://localhost:5000/api/meetings/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: meeting?.id, code }),
            });

            const data = await res.json();
            if (data.success && data.meetingLink) {
                // Navigate to Agora meeting room using the room code
                const roomCode = data.meetingLink;
                window.location.assign(`/meet/${roomCode}`);
                setShowModal(false);
            } else {
                setError('Invalid Meeting Code');
            }
        } catch (err) {
            setError('Connection failed');
        } finally {
            setLoading(false);
        }
    };

    if (!meeting) return null;

    return (
        <>
            <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-cyan-500/30 text-white px-4 py-3 shadow-[0_0_20px_rgba(0,243,255,0.2)]"
            >
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <span className="relative flex h-3 w-3">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isLive ? 'bg-red-500' : 'bg-cyan-500'}`}></span>
                            <span className={`relative inline-flex rounded-full h-3 w-3 ${isLive ? 'bg-red-500' : 'bg-cyan-500'}`}></span>
                        </span>
                        <div>
                            <p className="text-sm text-cyan-400 font-orbitron tracking-wider">UPCOMING SESSION</p>
                            <h3 className="font-bold text-lg leading-tight">{meeting.title}</h3>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-xl font-mono text-cyan-100 bg-white/5 py-1 px-3 rounded border border-white/10">
                            <Clock className="w-4 h-4 text-cyan-500" />
                            {timeLeft}
                        </div>

                        <button
                            onClick={() => setShowModal(true)}
                            disabled={!isLive}
                            className={`cyber-button px-6 py-2 text-sm font-bold tracking-widest ${!isLive ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isLive ? 'JOIN NOW' : 'WAITING'}
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Auth Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass-card w-full max-w-md p-8 border border-cyan-500/30 relative"
                        >
                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-white"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500/10 mb-4 border border-cyan-500/50">
                                    <Video className="w-8 h-8 text-cyan-500" />
                                </div>
                                <h2 className="text-2xl font-bold font-orbitron mb-2">Join Meeting</h2>
                                <p className="text-gray-400">{meeting.title}</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">
                                        Enter Access Code
                                    </label>
                                    <input
                                        type="password"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        placeholder="••••••"
                                        className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-center text-xl tracking-widest"
                                    />
                                    {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
                                </div>

                                <button
                                    onClick={handleJoin}
                                    disabled={loading || !code}
                                    className="w-full cyber-button py-3 font-bold mt-4"
                                >
                                    {loading ? 'VERIFYING...' : 'ENTER ROOM'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
