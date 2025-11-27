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
          <div className="absolute inset-0 bg-black/40 z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_100%)] z-10" />
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover scale-105"
            style={{ filter: 'brightness(0.8) contrast(1.1)' }}
          >
            <source src="/background-video.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Cyber Grid Overlay */}
        <div className="absolute inset-0 z-10 pointer-events-none bg-[linear-gradient(to_right,#00f3ff15_1px,transparent_1px),linear-gradient(to_bottom,#00f3ff15_1px,transparent_1px)] bg-[size:40px_40px]" style={{ boxShadow: 'inset 0 0 100px rgba(0,243,255,0.1)' }} />

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
            className="mb-12 max-w-7xl"
          >
            {/* Terminal-style header */}
            <div className="flex items-center justify-center gap-3 mb-10">
              <motion.div
                className="flex items-center gap-2.5 px-5 py-2.5 bg-black/60 border border-cyan-400/40 backdrop-blur-sm rounded-lg"
                animate={{
                  boxShadow: [
                    '0 0 10px rgba(0,243,255,0.2)',
                    '0 0 20px rgba(0,243,255,0.4)',
                    '0 0 10px rgba(0,243,255,0.2)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></span>
                <span className="text-neon-green text-xs font-mono tracking-wider font-bold">SYSTEM_ONLINE</span>
              </motion.div>
            </div>

            {/* Title with word animation */}
            <div className="flex flex-col items-center justify-center mb-6">
              <h1 className="font-display font-black tracking-tight leading-[1.1] text-center">
                {/* Animated words */}
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mb-3">
                  <motion.span
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="text-white text-5xl sm:text-6xl md:text-7xl lg:text-8xl relative group cursor-pointer"
                    style={{
                      textShadow: '0 0 20px rgba(255,255,255,0.3)',
                      fontFamily: 'var(--font-orbitron)'
                    }}
                    whileHover={{
                      scale: 1.05,
                      textShadow: '0 0 30px rgba(255,255,255,0.6)'
                    }}
                  >
                    FUTURE
                    {/* Scribble underline */}
                    <motion.svg
                      className="absolute -bottom-2 left-0 w-full h-4 opacity-0 group-hover:opacity-100"
                      viewBox="0 0 200 10"
                    >
                      <motion.path
                        d="M 5 5 Q 50 2, 100 5 T 195 5"
                        stroke="#00f3ff"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        whileHover={{ pathLength: 1 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        style={{ filter: 'drop-shadow(0 0 4px rgba(0,243,255,0.8))' }}
                      />
                    </motion.svg>
                  </motion.span>

                  <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="text-neon-cyan text-5xl sm:text-6xl md:text-7xl lg:text-8xl"
                    style={{ fontFamily: 'var(--font-orbitron)' }}
                  >
                    IS
                  </motion.span>
                </div>

                <motion.span
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                  className="block text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan via-cyan-300 to-neon-cyan text-6xl sm:text-7xl md:text-8xl lg:text-9xl relative group cursor-pointer"
                  style={{
                    textShadow: '0 0 40px rgba(0,243,255,0.6)',
                    fontFamily: 'var(--font-orbitron)',
                    WebkitTextStroke: '1px rgba(0,243,255,0.3)'
                  }}
                  whileHover={{
                    scale: 1.05,
                    filter: 'brightness(1.2)'
                  }}
                >
                  ENGINEERED
                  {/* Scribble underline */}
                  <motion.svg
                    className="absolute -bottom-4 left-0 w-full h-6 opacity-0 group-hover:opacity-100"
                    viewBox="0 0 500 15"
                  >
                    <motion.path
                      d="M 5 8 Q 125 5, 250 8 T 495 8"
                      stroke="#00f3ff"
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      whileHover={{ pathLength: 1 }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                      style={{ filter: 'drop-shadow(0 0 6px rgba(0,243,255,0.9))' }}
                    />
                  </motion.svg>
                </motion.span>
              </h1>
            </div>
          </motion.div>

          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="mb-14 max-w-3xl mx-auto"
          >
            <p className="text-base md:text-lg text-cyan-100/80 font-mono leading-relaxed text-center">
              <span className="text-cyan-400 mr-2">//</span>
              Architecting the next generation of <span className="text-neon-cyan font-bold">Mechatronics</span>.
              <br />
              <span className="text-cyan-400 mr-2">//</span>
              Fusing mechanics, electronics, and AI into <span className="text-neon-green font-bold">Singularity</span>.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto px-4 justify-center"
          >
            <Link href="/register" className="w-full sm:w-auto">
              <motion.button
                className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold text-neon-cyan border-2 border-neon-cyan/70 bg-black/60 backdrop-blur-sm font-display tracking-wider relative overflow-hidden group rounded-lg"
                whileHover={{
                  scale: 1.03,
                  borderColor: 'rgba(0,243,255,0.9)',
                  backgroundColor: 'rgba(0,243,255,0.1)',
                  boxShadow: '0 0 30px rgba(0,243,255,0.4)'
                }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.2 }}
              >
                {/* Subtle gradient background on hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent opacity-0 group-hover:opacity-100"
                  transition={{ duration: 0.3 }}
                />

                <span className="flex items-center justify-center gap-2.5 relative z-10">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Rocket className="w-4 h-4" />
                  </motion.div>
                  INITIALIZE
                </span>
              </motion.button>
            </Link>

            <Link href="/projects" className="w-full sm:w-auto">
              <motion.button
                className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold text-orange-300 border-2 border-orange-600/70 bg-black/60 backdrop-blur-sm font-display tracking-wider relative overflow-hidden group rounded-lg"
                whileHover={{
                  scale: 1.03,
                  borderColor: 'rgba(234,88,12,0.9)',
                  backgroundColor: 'rgba(234,88,12,0.1)',
                  boxShadow: '0 0 30px rgba(234,88,12,0.4)'
                }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.2 }}
              >
                {/* Subtle gradient background on hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-400/20 to-transparent opacity-0 group-hover:opacity-100"
                  transition={{ duration: 0.3 }}
                />

                <span className="flex items-center justify-center gap-2.5 relative z-10">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Cpu className="w-4 h-4" />
                  </motion.div>
                  Explore Systems
                </span>
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 hidden md:flex flex-col items-center gap-2 cursor-pointer group"
          onClick={() => {
            const statsSection = document.getElementById('stats-section');
            if (statsSection) {
              statsSection.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        >
          <span className="text-[10px] uppercase tracking-[0.5em] text-neon-cyan font-display animate-pulse group-hover:text-white transition-colors">
            Initialize_Descent
          </span>
          <div className="relative w-6 h-10 border-2 border-neon-cyan/30 rounded-full flex justify-center p-1 group-hover:border-neon-cyan transition-colors shadow-[0_0_10px_rgba(0,243,255,0.2)]">
            <motion.div
              className="w-1 h-2 bg-neon-cyan rounded-full"
              animate={{
                y: [0, 15, 0],
                opacity: [1, 0, 1]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
          <div className="h-8 w-[1px] bg-gradient-to-b from-neon-cyan to-transparent opacity-50" />
        </motion.div>
      </section >

      {/* Stats Section - Holographic Cards */}
      < section id="stats-section" className="relative z-20 py-24 px-4" >
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
      </section >

      {/* What We Offer Section */}
      < WhatWeOffer />

      {/* Featured Projects Section */}
      < section className="py-32 px-4 relative" >
        {/* Background Elements */}
        < div className="absolute top-0 right-0 w-[500px] h-[500px] bg-neon-blue/10 rounded-full blur-[120px] pointer-events-none" />
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
      </section >

      {/* Final CTA Section */}
      < section className="py-32 px-4 relative overflow-hidden" >
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
      </section >
    </div >
  );
}
