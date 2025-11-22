'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useEffect, useState, useRef } from 'react';
import WhatWeOffer from '@/components/sections/WhatWeOffer';
import { ArrowRight, Zap, Target, Award, Users, Calendar, FolderGit2, Cpu, Globe, Rocket, Terminal } from 'lucide-react';
import { preloadMembers } from '@/lib/cache';
import { getProjects, getEvents } from '@/lib/firestore';

// Lazy load ParticleBackground
const ParticleBackground = dynamic(() => import('@/components/ui/ParticleBackground'), {
  ssr: false,
  loading: () => null,
});

export default function Home() {
  const [stats, setStats] = useState({
    members: 0,
    projects: 0,
    events: 0,
    awards: 0
  });
  const [featuredProjects, setFeaturedProjects] = useState<any[]>([]);

  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 0.9]);
  const y = useTransform(scrollYProgress, [0, 0.3], [0, 50]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [projects, events] = await Promise.all([
          getProjects(),
          getEvents()
        ]);

        setStats({
          members: 174,
          projects: projects.length || 12,
          events: events.length || 8,
          awards: 15
        });

        setFeaturedProjects(projects.slice(0, 3));
      } catch (error) {
        console.error('Error loading data:', error);
        setStats({ members: 174, projects: 50, events: 12, awards: 15 });
      }
    };

    loadData();

    const timer = setTimeout(() => {
      preloadMembers().catch(console.error);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const tryPlay = () => {
      const p = v.play();
      if (p && typeof (p as Promise<any>).catch === 'function') {
        (p as Promise<any>).catch(() => {
          // Autoplay blocked
        });
      }
    };

    tryPlay();
    v.addEventListener('canplay', tryPlay);

    return () => v.removeEventListener('canplay', tryPlay);
  }, []);

  return (
    <div className="min-h-screen text-white selection:bg-neon-cyan/30">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden pt-20 pb-10">
        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/70 z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_100%)] z-10" />
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover scale-105"
            style={{ filter: 'brightness(0.6) contrast(1.1)' }}
          >
            <source src="/background-video.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Cyber Grid Overlay */}
        <div className="absolute inset-0 z-10 pointer-events-none bg-[linear-gradient(to_right,#00f3ff05_1px,transparent_1px),linear-gradient(to_bottom,#00f3ff05_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* Particle Effect */}
        <div className="absolute inset-0 z-10 pointer-events-none opacity-40">
          <ParticleBackground />
        </div>

        {/* Hero Content */}
        <motion.div
          style={{ opacity, scale, y }}
          className="container mx-auto px-4 z-20 relative flex flex-col items-center text-center"
        >
          {/* Main Title */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mb-8 max-w-6xl"
          >
            <div className="flex items-center justify-center gap-2 mb-4 text-neon-cyan tracking-[0.5em] text-sm font-mono">
              <Terminal className="w-4 h-4" /> SYSTEM_ONLINE
            </div>
            <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.9] mb-6 animate-glitch">
              <span className="block text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                FUTURE
              </span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan via-white to-neon-cyan drop-shadow-[0_0_20px_rgba(0,243,255,0.5)]">
                ENGINEERED
              </span>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mb-12 max-w-3xl mx-auto"
          >
            <p className="text-lg md:text-2xl text-cyan-100/80 font-light leading-relaxed font-sans">
              Architecting the next generation of <span className="text-neon-cyan font-bold">Mechatronics</span>.
              Fusing mechanics, electronics, and AI into <span className="text-neon-green font-bold">Singularity</span>.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto px-4"
          >
            <Link href="/register" className="w-full sm:w-auto">
              <button className="cyber-button w-full sm:w-auto px-10 py-4 text-lg font-bold group">
                <span className="flex items-center justify-center gap-3">
                  <Rocket className="w-5 h-5" />
                  Initialize
                </span>
              </button>
            </Link>

            <Link href="/projects" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-10 py-4 text-lg font-bold text-white border border-white/20 hover:bg-white/10 transition-all clip-path-polygon relative overflow-hidden group font-display tracking-wider">
                <span className="flex items-center justify-center gap-3">
                  <Cpu className="w-5 h-5 text-neon-cyan" />
                  Explore Systems
                </span>
              </button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 hidden md:flex flex-col items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => {
            const statsSection = document.getElementById('stats-section');
            if (statsSection) {
              statsSection.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        >
          <span className="text-[10px] uppercase tracking-[0.3em] text-neon-cyan font-mono animate-pulse">Scroll_Down</span>
          <div className="w-[1px] h-16 bg-gradient-to-b from-neon-cyan to-transparent" />
        </motion.div>
      </section>

      {/* Stats Section - Holographic Cards */}
      <section id="stats-section" className="relative z-20 py-24 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { icon: Users, value: stats.members, label: 'Operatives', color: 'text-neon-cyan' },
              { icon: FolderGit2, value: `${stats.projects}+`, label: 'Prototypes', color: 'text-neon-blue' },
              { icon: Calendar, value: `${stats.events}+`, label: 'Missions', color: 'text-neon-green' },
              { icon: Award, value: `${stats.awards}+`, label: 'Achievements', color: 'text-white' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="holo-card rounded-none p-8 text-center group"
                style={{ clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)' }}
              >
                <stat.icon className={`w-10 h-10 mx-auto mb-4 ${stat.color} drop-shadow-[0_0_10px_rgba(0,243,255,0.5)]`} />
                <div className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tighter font-display">{stat.value}</div>
                <div className="text-xs text-cyan-400/60 font-mono uppercase tracking-widest">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Offer Section */}
      <WhatWeOffer />

      {/* Featured Projects Section */}
      <section className="py-32 px-4 relative">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-neon-blue/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-neon-cyan/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 border border-neon-cyan/30 mb-6 bg-neon-cyan/5">
                <Zap className="w-4 h-4 text-neon-cyan" />
                <span className="text-xs font-bold text-neon-cyan uppercase tracking-wider font-mono">R&D_Sector</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight font-display">
                Latest <span className="text-neon-cyan">Deployments</span>
              </h2>
              <p className="text-cyan-100/60 max-w-xl text-lg font-sans">
                Advanced engineering solutions developed by our operatives.
              </p>
            </div>

            <Link href="/projects">
              <button className="hidden md:flex items-center gap-2 px-6 py-3 border border-white/20 hover:border-neon-cyan text-white hover:text-neon-cyan transition-all font-mono text-sm uppercase tracking-wider">
                View_All_Projects
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {featuredProjects.length > 0 ? (
              featuredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  whileHover={{ y: -10 }}
                  className="group holo-card"
                >
                  <div className="h-56 bg-black/50 flex items-center justify-center relative overflow-hidden border-b border-white/10">
                    <div className="absolute inset-0 bg-neon-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <FolderGit2 className="w-16 h-16 text-slate-700 group-hover:text-neon-cyan transition-colors duration-500 transform group-hover:scale-110 drop-shadow-[0_0_15px_rgba(0,243,255,0.5)]" />
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-neon-cyan transition-colors font-display">
                      {project.title}
                    </h3>
                    <p className="text-cyan-100/60 text-sm line-clamp-2 mb-6 leading-relaxed font-sans">
                      {project.description}
                    </p>
                    <div className="flex items-center justify-between pt-6 border-t border-white/10">
                      <span className="text-xs font-bold text-neon-cyan bg-neon-cyan/10 px-3 py-1.5 border border-neon-cyan/30 uppercase tracking-wider font-mono">
                        {project.status || 'Active'}
                      </span>
                      <div className="flex items-center gap-2 text-sm text-slate-500 group-hover:text-white transition-colors font-mono">
                        ACCESS <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-3 text-center py-20 text-slate-600 font-mono">LOADING_DATA...</div>
            )}
          </div>

          <div className="md:hidden text-center mt-8">
            <Link href="/projects">
              <button className="cyber-button px-8 py-4">
                View All Projects
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 px-4 relative overflow-hidden">
        <div className="container mx-auto relative z-10">
          <div className="max-w-5xl mx-auto text-center relative">
            {/* Glow Effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-cyan/10 rounded-full blur-[120px] pointer-events-none" />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative holo-card p-12 md:p-20 overflow-hidden"
            >
              <Globe className="w-20 h-20 mx-auto mb-8 text-neon-cyan animate-pulse drop-shadow-[0_0_20px_rgba(0,243,255,0.8)]" />

              <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight font-display">
                Ready to <span className="text-neon-cyan">Upgrade</span> Your Future?
              </h2>
              <p className="text-xl text-cyan-100/70 mb-12 max-w-3xl mx-auto leading-relaxed font-sans">
                Join the elite unit of engineers and creators. Initialize your journey today.
              </p>

              <Link href="/register">
                <button className="cyber-button px-12 py-5 text-xl font-bold">
                  Start Sequence
                </button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
