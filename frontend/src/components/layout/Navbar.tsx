"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home,
    Users,
    Calendar,
    FolderOpen,
    Trophy,
    Menu,
    X,
    Video
} from 'lucide-react';

const navItems = [
    { name: 'Home', path: '/', icon: Home, color: 'text-cyan-400' },
    { name: 'Members', path: '/members', icon: Users, color: 'text-blue-400' },
    { name: 'Events', path: '/events', icon: Calendar, color: 'text-green-500' },
    { name: 'Projects', path: '/projects', icon: FolderOpen, color: 'text-yellow-500' },
    { name: 'Achievements', path: '/achievements', icon: Trophy, color: 'text-purple-500' },
    { name: 'Meetings', path: '/meetings', icon: Video, color: 'text-red-400' },
];

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    return (
        <>
            <motion.nav
                initial={{ y: -100, x: "-50%" }}
                animate={{ y: 0, x: "-50%" }}
                className="fixed top-4 md:top-8 left-1/2 z-50 w-[95%] max-w-6xl transform-gpu will-change-transform [backface-visibility:hidden]"
            >
                <div className="relative bg-black/30 backdrop-blur-2xl border border-cyan-500/30 rounded-2xl px-8 py-4 flex items-center justify-between shadow-[0_0_25px_rgba(0,243,255,0.15)] overflow-hidden transform-gpu">

                    {/* Internal Grid Pattern for Tech Feel */}
                    <div className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(0,243,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.1)_1px,transparent_1px)] bg-[size:16px_16px] transform-gpu" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent z-0 pointer-events-none" />

                    {/* Logo Area */}
                    <Link href="/" className="flex items-center gap-4 group relative z-10">
                        <div className="relative w-10 h-10 flex items-center justify-center bg-cyan-950/30 rounded-lg border border-cyan-500/20 group-hover:border-cyan-400/50 transition-colors">
                            <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain opacity-80 group-hover:opacity-100 transition-opacity" onError={(e) => e.currentTarget.style.display = 'none'} />
                            <div className="absolute inset-0 bg-cyan-500/10 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-display font-bold text-2xl tracking-widest text-white leading-none">NSTU</span>
                            <span className="font-mono text-[10px] text-neon-cyan tracking-[0.3em] uppercase leading-none mt-1 group-hover:text-cyan-300 transition-colors">MECHATRONICS</span>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.path;
                            return (
                                <Link key={item.path} href={item.path}>
                                    <div className={`flex items-center gap-2.5 text-base font-mono font-medium tracking-wide transition-all duration-300 group
                                        ${isActive ? 'text-white' : 'text-gray-400 hover:text-white'}
                                    `}>
                                        <Icon className={`w-5 h-5 ${item.color} ${isActive ? 'brightness-125 drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]' : 'opacity-80 group-hover:opacity-100'}`} />
                                        <span>{item.name}</span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-white p-2 hover:text-neon-cyan transition-colors"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </motion.nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed top-24 left-1/2 -translate-x-1/2 z-40 w-[90%] md:hidden"
                    >
                        <div className="bg-[#050505]/95 backdrop-blur-xl border border-white/10 rounded-xl p-4 flex flex-col gap-2 shadow-2xl">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.path}
                                        href={item.path}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <div className={`p - 3 rounded - lg flex items - center gap - 3 transition - all
                                            ${pathname === item.path
                                                ? 'bg-cyan-500/10 text-neon-cyan border border-cyan-500/20'
                                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                            }
`}>
                                            <Icon className="w-5 h-5" />
                                            <span className="font-mono tracking-wider">{item.name}</span>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
