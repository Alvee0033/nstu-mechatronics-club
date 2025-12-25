'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useEffect, useState, useRef } from 'react';
import { ArrowRight, Zap, Target, Award, Users, Calendar, FolderGit2, Cpu, Globe, Rocket, Terminal } from 'lucide-react';
import { preloadMembers } from '@/lib/cache';
import { getProjects, getEvents } from '@/lib/firestore';


// Lazy load ParticleBackground
const ParticleBackground = dynamic(() => import('@/components/ui/ParticleBackground'), {
  ssr: false,
  loading: () => null,
});

const WhatWeOffer = dynamic(() => import('@/components/sections/WhatWeOffer'), {
  loading: () => <div className="h-96 flex items-center justify-center text-cyan-500/50">Loading Protocol...</div>
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
      {/* Hero Section - Terminal Style (Compacted & Enhanced) */}
      <section className="relative min-h-[95vh] flex flex-col justify-center items-center overflow-hidden pt-40 pb-20 transform-gpu">

        {/* Background Video */}
        <div className="absolute inset-0 z-0 transform-gpu will-change-transform">
          <div className="absolute inset-0 bg-black/50 z-10" /> {/* Slightly lighter overlay for glass effect */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_100%)] z-10" />
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            poster="/hero-poster.jpg"
            className="w-full h-full object-cover scale-105 transform-gpu will-change-transform"
            style={{ filter: 'brightness(0.9) contrast(1.1) saturate(1.1)' }}
          >
            <source src="/background-video.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Global Grid Overlay */}
        <div className="absolute inset-0 z-10 pointer-events-none bg-[linear-gradient(to_right,#00f3ff05_1px,transparent_1px),linear-gradient(to_bottom,#00f3ff05_1px,transparent_1px)] bg-[size:40px_40px] transform-gpu" />

        <div className="container mx-auto px-4 z-20 relative flex flex-col items-center text-center">

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-5xl relative z-20"
          >
            {/* Terminal Window Frame - Ultra Clear (Minimal Blur) */}
            <div className="relative bg-[#00000005] border border-cyan-500/30 rounded-xl overflow-hidden backdrop-blur-sm shadow-[0_0_60px_rgba(0,243,255,0.1)] group max-w-4xl mx-auto border-opacity-40 transform-gpu [backface-visibility:hidden]">

              {/* Top Right Code Snippet */}
              <div className="absolute top-14 right-8 text-[10px] font-mono text-cyan-500/60 text-right hidden md:block select-none leading-relaxed z-10">
                <span className="text-cyan-400">const</span> init = () =&gt; {'{'}<br />
                &nbsp;&nbsp;system.boot();<br />
                &nbsp;&nbsp;ai.connect();<br />
                &nbsp;&nbsp;<span className="text-purple-400">return</span> future;<br />
                {'}'}
                <div className="mt-2 opacity-50">
                  while(alive) {'{'}<br />
                  &nbsp;&nbsp;innovate();<br />
                  &nbsp;&nbsp;create();<br />
                  &nbsp;&nbsp;disrupt();<br />
                  {'}'}
                </div>
              </div>

              {/* Internal Grid - Barely Visible */}
              <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(0,243,255,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.3)_1px,transparent_1px)] bg-[size:30px_30px]" />

              {/* Terminal Header Bar */}
              <div className="bg-black/20 px-4 py-2 flex items-center gap-4 border-b border-cyan-500/10 relative z-20">
                <div className="flex gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] shadow-[0_0_5px_rgba(255,95,86,0.5)]"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] shadow-[0_0_5px_rgba(255,189,46,0.5)]"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f] shadow-[0_0_5px_rgba(39,201,63,0.5)]"></div>
                </div>
                <div className="flex-1 text-center font-mono text-[10px] md:text-xs text-cyan-500/80 tracking-[0.1em] drop-shadow-md">
                  user@nstu-mecha:~/protocol_init
                </div>
                <div className="w-14"></div>
              </div>

              {/* Terminal Content */}
              <div className="p-8 md:p-12 relative flex flex-col items-start text-left">

                {/* Boot Sequence - Enhanced Visibility */}
                <div className="w-full font-mono text-xs md:text-sm text-[#0f0] mb-6 space-y-1 opacity-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] relative z-20">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                    <span className="text-neon-cyan">➜</span> <span className="text-pink-500">~</span> initialize_sequence --force
                  </motion.div>
                  <div className="h-4"></div> {/* Spacer */}
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-yellow-400">
                    [LOADING] <span className="text-white">Neural Interface...</span> <span className="text-[#0f0]">OK</span>
                  </motion.div>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-yellow-400">
                    [LOADING] <span className="text-white">Mechatronic Systems...</span> <span className="text-[#0f0]">OK</span>
                  </motion.div>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-yellow-400">
                    [LOADING] <span className="text-white">Future Protocols...</span> <span className="text-[#0f0]">READY</span>
                  </motion.div>
                </div>

                {/* Main Glitch Text - Enhanced Visibility & Smaller */}
                <div className="mb-6 relative z-10 w-full drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                  <h1 className="font-black font-display tracking-tighter leading-[0.9] select-none">
                    <div className="text-3xl md:text-5xl text-white mb-1 shadow-black">{'<THE_/>'}</div>
                    <div className="text-3xl md:text-5xl text-white mb-2 shadow-black">{'FUTURE/>'}</div>
                    <div className="text-4xl md:text-6xl lg:text-[4.5rem] text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan via-[#bc13fe] to-neon-cyan animate-text-gradient filter drop-shadow-[0_0_15px_rgba(0,243,255,0.4)] transform-gpu will-change-[background-position]">
                      IS_ENGINEERED
                      <span className="animate-pulse text-neon-cyan inline-block translate-y-1 ml-1">|</span>
                    </div>
                  </h1>
                </div>

                {/* Subtitle - Enhanced Visibility */}
                <div className="font-mono text-xs md:text-sm text-gray-200 mb-8 space-y-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                  <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.0 }}>
                    // Architecting the next generation of Mechatronics.
                  </motion.p>
                  <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2 }}>
                    // Fusing mechanics, electronics, and AI into Singularity.
                  </motion.p>
                </div>

                {/* Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.4 }}
                  className="flex flex-wrap gap-4 w-full"
                >
                  <Link href="/register">
                    <button className="px-8 py-3 bg-neon-cyan text-black font-bold font-mono tracking-wider hover:bg-white transition-colors duration-300 clip-path-polygon flex items-center gap-2">
                      &gt; JOIN_NOW
                    </button>
                  </Link>
                  <Link href="/projects">
                    <button className="px-8 py-3 border border-neon-cyan/50 text-neon-cyan font-bold font-mono tracking-wider hover:bg-neon-cyan/10 transition-colors duration-300 flex items-center gap-2">
                      &gt; VIEW_PROJECTS
                    </button>
                  </Link>
                </motion.div>

              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] font-mono text-neon-cyan tracking-[0.3em]">SCROLL_DOWN</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-neon-cyan to-transparent"></div>
        </motion.div>

      </section>

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
