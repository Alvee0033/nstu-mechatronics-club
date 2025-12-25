"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, ArrowLeft, Clock, Video, Lock } from "lucide-react";
import Link from 'next/link';
import { motion } from "framer-motion";
import dynamic from 'next/dynamic';

const AgoraMeeting = dynamic(() => import('@/components/features/AgoraMeeting'), { ssr: false });

interface Meeting {
    id: string;
    title: string;
    startTime: string; // ISO
    endTime: string;
    meetingLink: string;
}

export default function MeetingPage() {
    const params = useParams();
    const roomId = params?.id as string;

    const [meeting, setMeeting] = useState<Meeting | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState("");
    const [hasJoined, setHasJoined] = useState(false);

    useEffect(() => {
        const fetchMeeting = async () => {
            try {
                // Fetch all meetings to find the one matching this room ID
                const res = await fetch('http://localhost:5000/api/meetings');
                const data = await res.json();

                // Logic: The room ID in URL (e.g. "NSTUMC-Test-123") is part of the stored meetingLink
                const found = data.find((m: any) => m.meetingLink && m.meetingLink.includes(roomId));

                // Fallback for debug/direct rooms
                setMeeting(found || {
                    title: "SECURE CHANNEL",
                    startTime: new Date().toISOString(),
                    meetingLink: roomId
                });
            } catch (error) {
                console.error("Failed to fetch meeting", error);
            } finally {
                setLoading(false);
            }
        };
        if (roomId) fetchMeeting();
    }, [roomId]);

    // Timer logic
    useEffect(() => {
        if (!meeting) return;
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const start = new Date(meeting.startTime).getTime();
            const distance = start - now;

            if (distance < 0) {
                setTimeLeft("READY");
            } else {
                const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const s = Math.floor((distance % (1000 * 60)) / 1000);
                setTimeLeft(`${h}h ${m}m ${s}s`);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [meeting]);

    if (loading) return (
        <div className="bg-black h-screen flex items-center justify-center text-cyan-500 font-mono tracking-widest">
            <Loader2 className="animate-spin w-10 h-10 mb-4" />
            <span>ESTABLISHING UPLINK...</span>
        </div>
    );

    return (
        <div className="relative w-full h-screen bg-black overflow-hidden flex flex-col font-rajdhani">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-50 p-4 flex justify-between items-start pointer-events-none">
                <Link href="/">
                    <button className="pointer-events-auto flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-md border border-cyan-500/30 rounded-lg text-cyan-400 hover:text-white hover:bg-cyan-500/20 transition-all font-mono text-xs uppercase tracking-widest">
                        <ArrowLeft className="w-4 h-4" /> Return to Base
                    </button>
                </Link>
                <div className="pointer-events-auto px-4 py-2 bg-black/60 backdrop-blur-md border border-cyan-500/30 rounded-lg text-xs font-mono text-cyan-500/50 flex items-center gap-2">
                    <Lock className="w-3 h-3" /> SECURE_CONNECTION
                </div>
            </div>

            {!hasJoined ? (
                // LOBBY
                <div className="flex-1 flex flex-col items-center justify-center relative">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none" />
                    <div className="absolute inset-0 bg-radial-gradient(circle at center, rgba(0,243,255,0.1) 0%, transparent 70%) pointer-events-none" />

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card max-w-lg w-full p-10 text-center border border-cyan-500/30 flex flex-col items-center gap-6 relative z-10"
                    >
                        <div className="w-24 h-24 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/50 mb-2 shadow-[0_0_30px_rgba(0,243,255,0.2)] animate-pulse">
                            <Video className="w-10 h-10 text-cyan-400" />
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-white to-purple-500 font-orbitron">
                                {meeting?.title}
                            </h1>
                            <div className="inline-block px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded text-xs font-mono text-cyan-400 tracking-[0.2em] uppercase">
                                VERIFIED ACCESS
                            </div>
                        </div>

                        <div className="bg-black/50 border border-white/10 rounded-xl p-6 w-full flex flex-col items-center justify-center gap-2">
                            <div className="flex items-center gap-2 text-gray-400 text-xs font-mono uppercase tracking-widest">
                                <Clock className="w-3 h-3" /> Mission Timer
                            </div>
                            <span className="text-4xl font-mono text-cyan-200 tracking-wider font-bold drop-shadow-[0_0_10px_rgba(0,243,255,0.5)]">
                                {timeLeft || "--:--:--"}
                            </span>
                        </div>

                        <button
                            onClick={() => setHasJoined(true)}
                            className="cyber-button w-full py-4 text-xl font-bold tracking-widest group relative overflow-hidden"
                        >
                            <span className="relative z-10 group-hover:animate-pulse">
                                {timeLeft === "READY" ? "INITIATE UPLINK" : "ENTER WAITING ROOM"}
                            </span>
                        </button>

                        <div className="text-xs text-gray-500 font-mono mt-4">
                            STATUS: <span className={timeLeft === "READY" ? "text-green-500" : "text-yellow-500"}>{timeLeft === "READY" ? "LIVE" : "SCHEDULED"}</span>
                        </div>
                    </motion.div>
                </div>
            ) : (
                // AGORA MEETING CLIENT
                <div className="flex-1 w-full h-full relative">
                    <AgoraMeeting
                        channel={roomId}
                        onLeave={() => setHasJoined(false)}
                    />
                </div>
            )}
        </div>
    );
}
