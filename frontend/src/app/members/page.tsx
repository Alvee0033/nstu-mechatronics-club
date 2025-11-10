'use client';

import { motion } from 'framer-motion';
import GradientCard from '@/components/ui/GradientCard';
import { Github, Linkedin, Mail } from 'lucide-react';
import { useEffect, useState, useRef, memo, useMemo } from 'react';
import { Member } from '@/lib/firestore';
import { getCachedMembers } from '@/lib/cache';

// Designation hierarchy for sorting
const designationOrder: { [key: string]: number } = {
  'leader': 1,
  'president': 2,
  'vice president': 3,
  'secretary': 4,
  'department head': 5,
  'technical team head': 5,
  'treasurer': 5,
  'team lead': 6,
  'executive': 7,
  'member': 8,
};

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataReady, setDataReady] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        // Performance monitoring
        console.time('Members Page Load');

        // Use cached data (instant if preloaded on landing page)
        const data = await getCachedMembers();

        console.timeLog('Members Page Load', `Fetched ${data.length} members`);

        // Sort members by designation hierarchy, then by oldest first
        const sortedMembers = data.sort((a, b) => {
          const roleA = a.role?.toLowerCase() || 'member';
          const roleB = b.role?.toLowerCase() || 'member';

          const orderA = designationOrder[roleA] || 99;
          const orderB = designationOrder[roleB] || 99;

          // First sort by designation
          if (orderA !== orderB) {
            return orderA - orderB;
          }

          // If same designation, sort by joinedAt (oldest first)
          const dateA = a.joinedAt?.toMillis() || a.createdAt?.toMillis() || 0;
          const dateB = b.joinedAt?.toMillis() || b.createdAt?.toMillis() || 0;
          return dateA - dateB;
        });

        console.timeLog('Members Page Load', 'Sorted members');

        // Load all members instantly for fast loading
        setMembers(sortedMembers);
        setDataReady(true);
        setLoading(false);

        console.timeEnd('Members Page Load');

      } catch (error) {
        console.error('Failed to fetch members:', error);
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  // Memoize grouped members to avoid recalculating on every render
  const groupedMembers = useMemo(() => {
    const groups = {
      president: [] as Member[],
      secretary: [] as Member[],
      departmentHeads: [] as Member[],
      teamLead: [] as Member[],
      executive: [] as Member[],
      members: [] as Member[]
    };

    // Single pass through members array
    members.forEach(member => {
      const role = member.role?.toLowerCase() || '';
      
      if (role.includes('president')) {
        groups.president.push(member);
      } else if (role.includes('secretary') || role.includes('secratary')) {
        groups.secretary.push(member);
      } else if ((role.includes('department head') || role.includes('technical team head') || role.includes('treasurer'))) {
        groups.departmentHeads.push(member);
      } else if (role.includes('team lead')) {
        groups.teamLead.push(member);
      } else if (role.includes('executive')) {
        groups.executive.push(member);
      } else {
        groups.members.push(member);
      }
    });

    return groups;
  }, [members]);

  const MemberCard = memo(({ member, index }: { member: Member; index: number }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [showImage, setShowImage] = useState(false);

    // Load image progressively after text content is shown
    useEffect(() => {
      if (member.profilePhotoThumbDataUrl || member.image) {
        // Small delay to prioritize text rendering
        const timer = setTimeout(() => setShowImage(true), Math.min(index * 10, 200));
        return () => clearTimeout(timer);
      }
    }, [member.profilePhotoThumbDataUrl, member.image, index]);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          duration: 0.3,
          ease: "easeOut",
          type: "spring",
          stiffness: 300,
          damping: 25,
          delay: Math.min(index * 0.01, 0.2) // Very fast staggered animation
        }}
      >
        <GradientCard>
          <div className="flex flex-col items-center text-center">
            {/* Show text content immediately */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 rounded-full mb-2 md:mb-4 overflow-hidden border-2 border-cyan-500/30 relative bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              {(member.profilePhotoThumbDataUrl || member.image) && showImage && !imageError ? (
                <>
                  <img
                    src={member.profilePhotoThumbDataUrl || member.image || ''}
                    alt={member.name}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                    loading="lazy"
                  />
                  {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin"></div>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full w-full h-full flex items-center justify-center text-white text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
              )}
            </div>

            {/* Text content loads immediately */}
            <h3 className="text-xs sm:text-sm md:text-base lg:text-xl font-bold text-white mb-0.5 md:mb-1 line-clamp-2">{member.name}</h3>
            <p className="text-cyan-400 font-semibold mb-1 md:mb-2 text-[10px] sm:text-xs md:text-sm line-clamp-1">{member.role}</p>
            {member.bio && (
              <p className="text-gray-400 text-[9px] sm:text-xs md:text-sm mb-2 md:mb-4 line-clamp-2 hidden lg:block">{member.bio}</p>
            )}
            <div className="flex space-x-1.5 sm:space-x-2 md:space-x-3">
              {member.email && (
                <motion.a
                  whileHover={{ scale: 1.2, y: -2 }}
                  href={`mailto:${member.email}`}
                  className="text-gray-400 hover:text-teal-400 transition-colors"
                >
                  <Mail className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                </motion.a>
              )}
              <motion.a
                whileHover={{ scale: 1.2, y: -2 }}
                href="#"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                <Linkedin className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.2, y: -2 }}
                href="#"
                className="text-gray-400 hover:text-cyan-400 transition-colors"
              >
                <Github className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
              </motion.a>
            </div>
          </div>
        </GradientCard>
      </motion.div>
    );
  });

  // Loading skeleton component
  const MemberSkeleton = memo(({ index }: { index: number }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        duration: 0.3,
        ease: "easeOut",
        delay: index * 0.01
      }}
    >
      <GradientCard>
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 rounded-full mb-2 md:mb-4 bg-gradient-to-br from-gray-700 to-gray-800 animate-pulse border-2 border-cyan-500/20"></div>
          <div className="h-4 bg-gradient-to-r from-gray-700 to-gray-800 rounded mb-2 w-20 animate-pulse"></div>
          <div className="h-3 bg-gradient-to-r from-cyan-500/20 to-cyan-600/20 rounded mb-1 w-16 animate-pulse"></div>
          <div className="h-3 bg-gradient-to-r from-gray-600 to-gray-700 rounded mb-2 w-12 animate-pulse"></div>
          <div className="flex space-x-2">
            <div className="w-4 h-4 bg-gradient-to-r from-gray-600 to-gray-700 rounded animate-pulse"></div>
            <div className="w-4 h-4 bg-gradient-to-r from-gray-600 to-gray-700 rounded animate-pulse"></div>
            <div className="w-4 h-4 bg-gradient-to-r from-gray-600 to-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
      </GradientCard>
    </motion.div>
  ));

  MemberSkeleton.displayName = 'MemberSkeleton';

  const MemberSection = ({ title, members, gradient, sectionIndex }: { title: string; members: Member[]; gradient: string; sectionIndex: number }) => {
    if (members.length === 0) return null;
    
    return (
      <div className="mb-12">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className={`text-2xl md:text-3xl lg:text-4xl font-bold mb-6 bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}
        >
          {title}
        </motion.h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 lg:gap-6">
          {members.map((member, index) => (
            <MemberCard key={member.id} member={member} index={index} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent">
            Our Team
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Meet the passionate individuals driving innovation and excellence in our club
          </p>
        </motion.div>

        {!dataReady ? (
          <div className="space-y-12">
            {/* Show skeleton sections while loading */}
            <div>
              <div className="h-8 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded mb-6 w-32 animate-pulse mx-auto"></div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 lg:gap-6">
                {Array.from({ length: 6 }, (_, i) => (
                  <MemberSkeleton key={`president-${i}`} index={i} />
                ))}
              </div>
            </div>
            <div>
              <div className="h-8 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded mb-6 w-28 animate-pulse mx-auto"></div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 lg:gap-6">
                {Array.from({ length: 4 }, (_, i) => (
                  <MemberSkeleton key={`secretary-${i}`} index={i + 6} />
                ))}
              </div>
            </div>
            <div>
              <div className="h-8 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rounded mb-6 w-40 animate-pulse mx-auto"></div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 lg:gap-6">
                {Array.from({ length: 8 }, (_, i) => (
                  <MemberSkeleton key={`heads-${i}`} index={i + 10} />
                ))}
              </div>
            </div>
            <div>
              <div className="h-8 bg-gradient-to-r from-cyan-400/20 to-teal-400/20 rounded mb-6 w-32 animate-pulse mx-auto"></div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 lg:gap-6">
                {Array.from({ length: 12 }, (_, i) => (
                  <MemberSkeleton key={`members-${i}`} index={i + 18} />
                ))}
              </div>
            </div>
          </div>
        ) : members.length === 0 ? (
          <div className="text-center text-gray-400 min-h-[400px] flex items-center justify-center">
            <p>No members found. Check your Firestore database.</p>
          </div>
        ) : (
          <div>
            <MemberSection 
              title="President" 
              members={groupedMembers.president}
              gradient="from-yellow-400 via-orange-400 to-red-400"
              sectionIndex={0}
            />
            
            <MemberSection 
              title="Secretary" 
              members={groupedMembers.secretary}
              gradient="from-purple-400 via-pink-400 to-red-400"
              sectionIndex={1}
            />
            
            <MemberSection 
              title="Department Heads" 
              members={groupedMembers.departmentHeads}
              gradient="from-indigo-400 via-purple-400 to-pink-400"
              sectionIndex={2}
            />

            <MemberSection 
              title="Team Lead" 
              members={groupedMembers.teamLead}
              gradient="from-blue-400 via-cyan-400 to-teal-400"
              sectionIndex={3}
            />
            
            <MemberSection 
              title="Executive Members" 
              members={groupedMembers.executive}
              gradient="from-green-400 via-emerald-400 to-teal-400"
              sectionIndex={3}
            />
            
            <MemberSection 
              title="Members" 
              members={groupedMembers.members}
              gradient="from-cyan-400 via-teal-400 to-emerald-400"
              sectionIndex={4}
            />
          </div>
        )}
      </div>
    </div>
  );
}
