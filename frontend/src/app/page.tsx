'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useEffect, useState, useRef } from 'react';
import Button from '@/components/ui/Button';
import GradientCard from '@/components/ui/GradientCard';
import GradientText from '@/components/ui/GradientText';
import WhatWeOffer from '@/components/sections/WhatWeOffer';
import { Cpu, Lightbulb, Users, Wrench } from 'lucide-react';
import { preloadMembers } from '@/lib/cache';

// Lazy load ParticleBackground for better initial load performance
const ParticleBackground = dynamic(() => import('@/components/ui/ParticleBackground'), {
  ssr: false,
  loading: () => null,
});

export default function Home() {
  const [stats, setStats] = useState({
    members: '174',
    projects: '50+',
    events: '1',
    awards: '12+'
  });

  // Preload members data in background for instant members page loading
  useEffect(() => {
    // Wait a bit for the landing page to render first
    const timer = setTimeout(() => {
      preloadMembers().catch(console.error);
    }, 1000); // Start preloading after 1 second

    return () => clearTimeout(timer);
  }, []);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Some mobile browsers (esp. iOS Safari) can be picky about autoplay.
  // Ensure the muted autoplay is attempted programmatically after mount.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const tryPlay = () => {
      const p = v.play();
      if (p && typeof (p as Promise<any>).catch === 'function') {
        (p as Promise<any>).catch(() => {
          // Autoplay blocked — leave the poster visible as a graceful fallback.
        });
      }
    };

    tryPlay();
    v.addEventListener('canplay', tryPlay);

    return () => v.removeEventListener('canplay', tryPlay);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section - Complete Redesign */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Video with Performance Optimization */}
        <div className="absolute inset-0 z-0">
          <video 
            ref={videoRef}
            autoPlay={true}
            loop={true}
            muted={true}
            playsInline={true}
            preload="metadata"
            poster="/images/video-poster.jpg"
            className="w-full h-full object-cover scale-105"
            style={{ willChange: 'auto', filter: 'brightness(0.7) saturate(1.1)' }}
            {...({ 'webkit-playsinline': 'true' } as any)}
          >
            <source src="/background-video.mp4" type="video/mp4" />
            {/* Fallback for browsers that don't support video */}
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Gradient Overlays for Depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-purple-500/10 z-10" />
        
        {/* Particle Effect */}
        <ParticleBackground />

        {/* Subtle Grid Pattern Overlay */}
        <div 
          className="absolute inset-0 z-10 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />

        {/* Hero Content Container */}
        <div className="container mx-auto px-4 z-20 relative">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="max-w-6xl mx-auto"
          >
            {/* Main Title - Redesigned */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.9, type: "spring", stiffness: 80 }}
              className="text-center mb-8"
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-cyan-400 to-cyan-500 drop-shadow-2xl">
                  NSTU Mechatronics Club
                </span>
              </h1>
              
              {/* Decorative Line */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.8, duration: 1 }}
                className="mt-8 h-1 w-32 mx-auto rounded-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
              />
            </motion.div>

            {/* Tagline - Modern Typography */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="text-center mb-6"
            >
              <p className="text-xl sm:text-2xl md:text-3xl text-white/90 font-light tracking-wide max-w-4xl mx-auto">
                Where <span className="font-semibold text-cyan-300">Innovation</span> Meets{' '}
                <span className="font-semibold text-purple-300">Engineering Excellence</span>
              </p>
            </motion.div>

            {/* Description - Enhanced */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="text-center mb-12"
            >
              <p className="text-base md:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
                Join us in exploring the fascinating world of robotics, automation, and mechatronics engineering. 
                <span className="block mt-2 text-cyan-300/80">Build the future, one innovation at a time.</span>
              </p>
            </motion.div>

            {/* CTA Buttons - Completely Redesigned */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-5 justify-center items-center mb-16"
            >
              {/* Primary CTA */}
              <Link href="/register">
                <motion.button
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative px-10 py-5 rounded-2xl font-bold text-lg text-white overflow-hidden shadow-2xl min-w-[240px] transition-all duration-300 backdrop-blur-xl border-2 border-cyan-400/30"
                >
                  {/* Glass Background */}
                  <div className="absolute inset-0 bg-cyan-500/20 group-hover:bg-cyan-500/30 transition-all duration-300" />
                  
                  {/* Shine Effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-300/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"
                    style={{ skewX: '-20deg' }}
                  />
                  
                  {/* Glow Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 blur-xl bg-cyan-400/40 transition-opacity duration-500" />
                  
                  {/* Content */}
                  <span className="relative z-10 flex items-center gap-3">
                    Join Our Community
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    >
                      →
                    </motion.span>
                  </span>
                </motion.button>
              </Link>

              {/* Secondary CTA */}
              <Link href="/projects">
                <motion.button
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative px-10 py-5 rounded-2xl font-bold text-lg text-white overflow-hidden shadow-2xl min-w-[240px] backdrop-blur-xl border-2 border-white/20 hover:border-white/40 transition-all duration-300"
                >
                  {/* Glass Background */}
                  <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition-all duration-300" />
                  
                  {/* Shine Effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"
                    style={{ skewX: '-20deg' }}
                  />
                  
                  {/* Content */}
                  <span className="relative z-10 flex items-center gap-3">
                    Explore Projects
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0.3 }}
                    >
                      →
                    </motion.span>
                  </span>
                </motion.button>
              </Link>
            </motion.div>

            {/* Scroll Indicator - Redesigned */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.8 }}
              className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-10 hidden md:block"
            >
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="flex flex-col items-center gap-3 cursor-pointer group"
              >
                <div className="w-6 h-10 rounded-full border-2 border-white/30 group-hover:border-cyan-400 flex justify-center pt-2 transition-colors">
                  <motion.div
                    animate={{ y: [0, 12, 0], opacity: [1, 0, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="w-1.5 h-3 rounded-full bg-gradient-to-b from-cyan-400 to-purple-400"
                  />
                </div>
                <span className="text-xs text-white/50 group-hover:text-white/80 transition-colors uppercase tracking-wider">
                  Scroll Down
                </span>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <WhatWeOffer />

      {/* Stats Section */}
      <section className="py-12 md:py-20 px-4 relative">
        {/* Radial gradient background */}
        <div className="absolute inset-0 bg-gradient-radial from-purple-900/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-12 px-4"
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-3">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Our Impact
              </span>
            </h2>
            <p className="text-gray-400 text-sm md:text-base">Numbers that speak for themselves</p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {[
              { number: stats.members, label: 'Members', color: 'from-cyan-400 to-blue-400' },
              { number: stats.projects, label: 'Projects', color: 'from-blue-400 to-purple-400' },
              { number: stats.events, label: 'Events', color: 'from-purple-400 to-pink-400' },
              { number: stats.awards, label: 'Awards', color: 'from-pink-400 to-cyan-400' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5, rotateY: -90 }}
                whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  delay: index * 0.15,
                  type: "spring",
                  stiffness: 200,
                  damping: 15
                }}
                whileHover={{ 
                  scale: 1.1,
                  transition: { type: "spring", stiffness: 400, damping: 10 }
                }}
                className="text-center group relative"
              >
                {/* Glow effect on hover */}
                <motion.div 
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"
                  style={{
                    background: `linear-gradient(135deg, ${stat.color.includes('cyan') ? 'rgba(34, 211, 238, 0.3)' : 'rgba(168, 85, 247, 0.3)'}, transparent)`
                  }}
                />
                
                <div className="relative">
                  {/* Counter number with gradient */}
                  <motion.div 
                    className={`text-3xl md:text-4xl lg:text-6xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-1 md:mb-2`}
                    whileHover={{ scale: 1.05 }}
                  >
                    {stat.number}
                  </motion.div>
                  
                  {/* Label */}
                  <div className="text-gray-400 text-sm md:text-base lg:text-lg group-hover:text-gray-300 transition-colors font-medium">
                    {stat.label}
                  </div>
                  
                  {/* Decorative line */}
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '60%' }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15 + 0.5, duration: 0.8 }}
                    className={`h-1 mx-auto mt-3 rounded-full bg-gradient-to-r ${stat.color} opacity-50 group-hover:opacity-100 transition-opacity`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
