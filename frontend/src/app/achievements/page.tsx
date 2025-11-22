'use client';

import { motion } from 'framer-motion';
import LazyImage from '@/components/ui/LazyImage';
import { Award, Trophy, Star, Medal, Terminal, Target, Zap, Crown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getAchievements, Achievement as FirestoreAchievement } from '@/lib/firestore';

interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  category?: string;
  image?: string;
  awardedBy?: string;
  teamMembers?: string[];
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const firestoreAchievements = await getAchievements();

        const formattedAchievements: Achievement[] = firestoreAchievements.map((achievement: FirestoreAchievement) => ({
          id: achievement.id || `achievement-${Date.now()}-${Math.random()}`,
          title: achievement.title,
          description: achievement.description,
          date: achievement.date.toDate().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          category: achievement.category,
          image: achievement.image,
          awardedBy: achievement.awardedBy,
          teamMembers: achievement.teamMembers
        }));

        setAchievements(formattedAchievements);
      } catch (error) {
        console.error('Error fetching achievements:', error);
        setAchievements([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  const getIcon = (category?: string) => {
    const cat = category?.toLowerCase() || 'default';
    switch (cat) {
      case 'competition':
        return <Trophy className="w-full h-full text-neon-cyan" />;
      case 'award':
        return <Award className="w-full h-full text-neon-green" />;
      case 'international':
        return <Star className="w-full h-full text-neon-blue" />;
      default:
        return <Medal className="w-full h-full text-white" />;
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-12 px-4 relative">
      {/* Background Grid */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#00f3ff05_1px,transparent_1px),linear-gradient(to_bottom,#00f3ff05_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <div className="flex items-center justify-center gap-2 mb-4 text-neon-cyan tracking-[0.5em] text-sm font-mono">
            <Terminal className="w-4 h-4" /> HALL_OF_FAME
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 font-display text-white tracking-tight">
            MISSION <span className="text-neon-cyan">SUCCESS</span>
          </h1>
          <p className="text-cyan-100/60 text-lg max-w-2xl mx-auto font-sans">
            Documenting our victories and technological breakthroughs.
          </p>
        </motion.div>

        {/* Timeline Tree Layout */}
        <div className="relative max-w-5xl mx-auto">
          {/* Central Neon Line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-neon-cyan/30 md:-translate-x-1/2 shadow-[0_0_15px_rgba(0,243,255,0.3)]" />

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(0,243,255,0.5)]" />
              <p className="mt-4 text-neon-cyan font-mono text-sm animate-pulse">LOADING_ARCHIVES...</p>
            </div>
          ) : achievements.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/60 text-lg font-mono">ARCHIVES_EMPTY.</p>
            </div>
          ) : (
            <div className="space-y-16">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative flex flex-col md:flex-row items-center ${index % 2 === 0 ? 'md:flex-row-reverse' : ''
                    }`}
                >
                  {/* Timeline Node (Center) */}
                  <div className="absolute left-4 md:left-1/2 w-4 h-4 bg-black border-2 border-neon-cyan rounded-full z-20 md:-translate-x-1/2 shadow-[0_0_10px_rgba(0,243,255,0.8)]">
                    <div className="absolute inset-0 bg-neon-cyan/50 rounded-full animate-ping opacity-75" />
                  </div>

                  {/* Connecting Line (Desktop) */}
                  <div className={`hidden md:block absolute top-1/2 w-1/2 h-0.5 bg-neon-cyan/20 ${index % 2 === 0 ? 'left-1/2' : 'right-1/2'
                    }`} />

                  {/* Content Card */}
                  <div className={`w-full md:w-1/2 pl-12 md:pl-0 ${index % 2 === 0 ? 'md:pl-12' : 'md:pr-12'
                    }`}>
                    <div className="holo-card p-6 group hover:border-neon-cyan transition-colors duration-300 relative overflow-hidden">
                      {/* Date Badge */}
                      <div className="absolute top-0 right-0 bg-neon-cyan/10 px-3 py-1 border-l border-b border-neon-cyan/30 text-neon-cyan text-xs font-mono">
                        {achievement.date}
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-16 h-16 bg-black/50 rounded-lg border border-white/10 flex items-center justify-center p-3 relative overflow-hidden group-hover:border-neon-cyan/50 transition-colors">
                          {achievement.image && achievement.image.startsWith('data:') ? (
                            <LazyImage
                              src={achievement.image}
                              alt={achievement.title}
                              className="w-full h-full object-cover rounded"
                              placeholder={<div className="w-full h-full bg-neon-cyan/10 animate-pulse" />}
                            />
                          ) : (
                            getIcon(achievement.category)
                          )}
                        </div>

                        <div className="flex-grow">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 bg-white/5 border border-white/10 text-[10px] font-mono uppercase text-cyan-100/70 tracking-wider">
                              {achievement.category || 'RECOGNITION'}
                            </span>
                          </div>

                          <h3 className="text-xl font-bold text-white mb-2 font-display group-hover:text-neon-cyan transition-colors">
                            {achievement.title}
                          </h3>

                          <p className="text-cyan-100/60 text-sm mb-4 font-sans leading-relaxed">
                            {achievement.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-white/5">
                            <div className="flex items-center gap-2 text-neon-green text-xs font-mono uppercase">
                              <Crown size={14} />
                              <span>{achievement.awardedBy || 'Authority'}</span>
                            </div>

                            {achievement.teamMembers && achievement.teamMembers.length > 0 && (
                              <div className="flex items-center gap-2 text-white/40 text-xs font-mono">
                                <Target size={14} />
                                <span>{achievement.teamMembers.length} Operatives</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-32 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            { icon: Trophy, number: '25+', label: 'Victories', color: 'text-neon-cyan' },
            { icon: Award, number: '40+', label: 'Honors', color: 'text-neon-green' },
            { icon: Star, number: '10+', label: 'Global Ops', color: 'text-neon-blue' },
            { icon: Medal, number: '50+', label: 'Certifications', color: 'text-white' }
          ].map((stat, index) => (
            <div key={index} className="holo-card p-6 text-center group hover:bg-neon-cyan/5 transition-colors">
              <stat.icon className={`w-10 h-10 mx-auto mb-4 ${stat.color} drop-shadow-[0_0_10px_rgba(0,243,255,0.5)]`} />
              <div className="text-4xl font-bold text-white mb-2 font-display tracking-tighter">
                {stat.number}
              </div>
              <div className="text-xs font-mono text-cyan-100/50 uppercase tracking-widest">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
