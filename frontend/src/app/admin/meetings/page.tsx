"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Plus, Calendar, Clock, Link as LinkIcon, Lock } from 'lucide-react';

interface Meeting {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    meetingLink: string;
    meetingCode: string;
    status: string;
}

export default function AdminMeetingsPage() {
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        meetingLink: '',
        meetingCode: ''
    });

    const fetchMeetings = async () => {
        try {
            // For now, using public active endpoint, but admin might need a different one? 
            // Or we just implement delete/view all here.
            // Let's assume we can fetch all or just active.
            const res = await fetch('http://localhost:5000/api/meetings');
            const data = await res.json();
            setMeetings(data);
        } catch (error) {
            console.error('Error fetching meetings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMeetings();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/meetings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                alert('Meeting scheduled successfully!');
                setFormData({
                    title: '',
                    description: '',
                    startTime: '',
                    endTime: '',
                    meetingLink: '',
                    meetingCode: ''
                });
                fetchMeetings();
            } else {
                alert('Failed to schedule meeting');
            }
        } catch (error) {
            console.error('Error scheduling meeting:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this meeting?')) return;
        try {
            await fetch(`http://localhost:5000/api/meetings/${id}`, {
                method: 'DELETE'
            });
            fetchMeetings();
        } catch (error) {
            console.error('Error deleting meeting:', error);
        }
    };

    return (
        <div className="min-h-screen pt-24 px-4 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-600">
                    Meeting Control
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Schedule Form */}
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="glass-card p-8"
                >
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <Plus className="text-cyan-400" /> Schedule New
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-gray-400 mb-2">Title</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-black/30 border border-gray-700 rounded p-3 text-white focus:border-cyan-500 outline-none"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-400 mb-2">Start Time</label>
                                <input
                                    type="datetime-local"
                                    required
                                    className="w-full bg-black/30 border border-gray-700 rounded p-3 text-white focus:border-cyan-500 outline-none"
                                    value={formData.startTime}
                                    onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 mb-2">End Time</label>
                                <input
                                    type="datetime-local"
                                    required
                                    className="w-full bg-black/30 border border-gray-700 rounded p-3 text-white focus:border-cyan-500 outline-none"
                                    value={formData.endTime}
                                    onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-400 mb-2">Room Code (Agora Channel)</label>
                            <div className="relative">
                                <LinkIcon className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    required
                                    placeholder="NSTUMC-Session-2024"
                                    className="w-full bg-black/30 border border-gray-700 rounded p-3 pl-10 text-white focus:border-cyan-500 outline-none font-mono"
                                    value={formData.meetingLink}
                                    onChange={e => setFormData({ ...formData, meetingLink: e.target.value })}
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const roomName = formData.title ? formData.title.replace(/\s+/g, '-') : 'New-Meeting';
                                        setFormData({ ...formData, meetingLink: `NSTUMC-${roomName}-${Date.now().toString().slice(-6)}` })
                                    }}
                                    className="absolute right-2 top-2 px-3 py-1.5 text-xs bg-cyan-500/20 text-cyan-400 rounded hover:bg-cyan-500/30 transition-colors"
                                >
                                    Generate Room Code
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-400 mb-2">Secret Code</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. 123456"
                                    className="w-full bg-black/30 border border-gray-700 rounded p-3 pl-10 text-white focus:border-cyan-500 outline-none font-mono tracking-widest"
                                    value={formData.meetingCode}
                                    onChange={e => setFormData({ ...formData, meetingCode: e.target.value })}
                                />
                            </div>
                        </div>

                        <button type="submit" className="cyber-button w-full py-3 font-bold">
                            Create Meeting
                        </button>
                    </form>
                </motion.div>

                {/* Meeting List */}
                <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="space-y-4"
                >
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <Calendar className="text-purple-400" /> Active Meetings
                    </h2>

                    {loading ? (
                        <div className="text-center text-gray-500 py-10">Loading...</div>
                    ) : meetings.length === 0 ? (
                        <div className="glass-card p-8 text-center text-gray-500">No active meetings</div>
                    ) : (
                        meetings.map(meeting => (
                            <div key={meeting.id} className="glass-card p-6 flex justify-between items-center group hover:border-cyan-500/50">
                                <div>
                                    <h3 className="font-bold text-xl text-white mb-2">{meeting.title}</h3>
                                    <div className="flex items-center gap-4 text-sm text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            {new Date(meeting.startTime).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <a
                                        href={`/meet?id=${meeting.meetingLink}`}
                                        className="p-2 rounded-full hover:bg-cyan-500/20 text-gray-500 hover:text-cyan-500 transition-colors"
                                        title="Launch Meeting"
                                    >
                                        <LinkIcon className="w-5 h-5" />
                                    </a>
                                    <button
                                        onClick={() => handleDelete(meeting.id)}
                                        className="p-2 rounded-full hover:bg-red-500/20 text-gray-500 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </motion.div>
            </div>
        </div>
    );
}
