'use client';

import { motion } from 'framer-motion';
import GradientCard from '@/components/ui/GradientCard';
import LazyImage from '@/components/ui/LazyImage';
import { Award, Trophy, Star, Medal } from 'lucide-react';
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
        // Fallback to empty array if Firestore fails
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
        return <Trophy size={40} className="text-yellow-400" />;
      case 'award':
        return <Award size={40} className="text-purple-400" />;
      case 'international':
        return <Star size={40} className="text-blue-400" />;
      default:
        return <Medal size={40} className="text-pink-400" />;
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Achievements
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Celebrating our milestones and recognitions in robotics and technology
          </p>
        </motion.div>

        {/* Timeline Style Layout */}
        <div className="relative">
          {/* Center Line - Show on mobile too */}
          <div className="absolute left-6 md:left-1/2 top-0 w-1 h-full bg-gradient-to-b from-purple-500 via-pink-500 to-blue-500 opacity-30 transform md:-translate-x-1/2" />

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : achievements.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/60 text-lg">No achievements found. Add some from the admin dashboard!</p>
            </div>
          ) : (
            <div className="space-y-8 md:space-y-12">
              {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, x: 0 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative flex items-start gap-4 md:gap-8"
              >
                {/* Center Circle - Show on mobile */}
                <div className="relative z-10 flex-shrink-0 ml-0 md:ml-auto md:mr-auto">
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 180 }}
                    className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/50"
                  >
                    <div className="w-6 h-6 bg-white rounded-full" />
                  </motion.div>
                </div>

                {/* Content - Mobile: right side, Desktop: alternating */}
                <div className="flex-1 md:flex-1 md:max-w-md">
                  <GradientCard>
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {achievement.image && achievement.image.startsWith('data:') ? (
                          <LazyImage
                            src={achievement.image}
                            alt={achievement.title}
                            className="w-12 h-12 md:w-16 md:h-16 rounded-lg object-cover border border-purple-500/30"
                            placeholder={
                              <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                                <Award size={20} className="text-white/40" />
                              </div>
                            }
                          />
                        ) : (
                          <div className="scale-75 md:scale-100">
                            {getIcon(achievement.category)}
                          </div>
                        )}
                      </div>
                      <div className="flex-grow">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                          <span className="px-2 py-1 md:px-3 md:py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs md:text-sm font-semibold w-fit">
                            {achievement.category || 'Achievement'}
                          </span>
                          <span className="text-white/40 text-xs md:text-sm">{achievement.date}</span>
                        </div>
                        <h3 className="text-lg md:text-2xl font-bold text-white mb-2">{achievement.title}</h3>
                        <p className="text-white/60 text-sm md:text-base mb-3 md:mb-4">{achievement.description}</p>
                        <div className="flex items-center space-x-2">
                          <Award size={14} className="text-yellow-400" />
                          <span className="text-yellow-400 font-semibold text-sm md:text-base">{achievement.awardedBy || 'Achievement'}</span>
                        </div>
                        {achievement.teamMembers && achievement.teamMembers.length > 0 && (
                          <div className="mt-2 text-xs text-white/50">
                            Team: {achievement.teamMembers.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  </GradientCard>
                </div>
              </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            { icon: <Trophy />, number: '25+', label: 'Competitions Won' },
            { icon: <Award />, number: '40+', label: 'Awards Received' },
            { icon: <Star />, number: '10+', label: 'International Recognition' },
            { icon: <Medal />, number: '50+', label: 'Certificates' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + index * 0.1 }}
            >
              <GradientCard className="text-center">
                <div className="flex justify-center mb-3 text-purple-400">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-white/60">{stat.label}</div>
              </GradientCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
