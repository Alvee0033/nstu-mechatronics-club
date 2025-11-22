'use client';

import { motion } from 'framer-motion';
import { Github, Linkedin, Mail, Terminal, User, Shield, Cpu, Zap, ScrollText } from 'lucide-react';
import { useEffect, useState, memo, useMemo } from 'react';
import { Member } from '@/lib/firestore';
import { getCachedMembers } from '@/lib/cache';

// Designation hierarchy for sorting
const designationOrder: { [key: string]: number } = {
  'leader': 1,
  'president': 2,
  'vice president': 3,
  'secretary': 4,
  'joint secretary': 4,
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
        const data = await getCachedMembers();

        const sortedMembers = data.sort((a, b) => {
          const roleA = a.role?.toLowerCase() || 'member';
          const roleB = b.role?.toLowerCase() || 'member';
          const orderA = designationOrder[roleA] || 99;
          const orderB = designationOrder[roleB] || 99;

          if (orderA !== orderB) return orderA - orderB;

          const dateA = a.joinedAt?.toMillis() || a.createdAt?.toMillis() || 0;
          const dateB = b.joinedAt?.toMillis() || b.createdAt?.toMillis() || 0;
          return dateA - dateB;
        });

        setMembers(sortedMembers);
        setDataReady(true);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch members:', error);
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const groupedMembers = useMemo(() => {
    const groups = {
      president: [] as Member[],
      secretary: [] as Member[],
      departmentHeads: [] as Member[],
      teamLead: [] as Member[],
      executive: [] as Member[],
      members: [] as Member[]
    };

    members.forEach(member => {
      const role = member.role?.toLowerCase() || '';

      if (role.includes('president')) groups.president.push(member);
      else if (role.includes('secretary') || role.includes('secratary')) groups.secretary.push(member);
      else if ((role.includes('department head') || role.includes('technical team head') || role.includes('treasurer'))) groups.departmentHeads.push(member);
      else if (role.includes('team lead')) groups.teamLead.push(member);
      else if (role.includes('executive')) groups.executive.push(member);
      else groups.members.push(member);
    });

    return groups;
  }, [members]);

  const MemberCard = memo(({ member, index, variant = 'standard' }: { member: Member; index: number; variant?: 'standard' | 'premium' | 'elite' }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    // Variant styles
    const styles = {
      elite: { // President
        card: "border-neon-cyan/50 shadow-[0_0_30px_rgba(0,243,255,0.2)] bg-neon-cyan/5",
        imgBorder: "border-neon-cyan shadow-[0_0_20px_rgba(0,243,255,0.5)]",
        text: "text-neon-cyan",
        badge: "bg-neon-cyan text-black border-neon-cyan",
        size: "w-32 h-32 sm:w-40 sm:h-40"
      },
      premium: { // Secretary
        card: "border-neon-blue/50 shadow-[0_0_20px_rgba(0,102,255,0.2)] bg-neon-blue/5",
        imgBorder: "border-neon-blue shadow-[0_0_15px_rgba(0,102,255,0.5)]",
        text: "text-neon-blue",
        badge: "bg-neon-blue/20 text-neon-blue border-neon-blue",
        size: "w-28 h-28 sm:w-32 sm:h-32"
      },
      standard: { // Others
        card: "border-white/10 hover:border-neon-cyan/50",
        imgBorder: "border-neon-cyan/30 group-hover:border-neon-cyan",
        text: "group-hover:text-neon-cyan",
        badge: "bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30",
        size: "w-24 h-24 sm:w-28 sm:h-28"
      }
    };

    const style = styles[variant];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.05 }}
        className="h-full"
      >
        <div className={`holo-card h-full flex flex-col items-center text-center p-6 group relative overflow-hidden transition-all duration-300 ${style.card}`}>
          {/* Corner Accents for Elite/Premium */}
          {(variant === 'elite' || variant === 'premium') && (
            <>
              <div className={`absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 ${variant === 'elite' ? 'border-neon-cyan' : 'border-neon-blue'}`} />
              <div className={`absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 ${variant === 'elite' ? 'border-neon-cyan' : 'border-neon-blue'}`} />
              <div className={`absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 ${variant === 'elite' ? 'border-neon-cyan' : 'border-neon-blue'}`} />
              <div className={`absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 ${variant === 'elite' ? 'border-neon-cyan' : 'border-neon-blue'}`} />
            </>
          )}

          {/* Profile Image */}
          <div className={`relative ${style.size} mb-4`}>
            <div className={`absolute inset-0 rounded-full border-2 transition-all duration-500 ${style.imgBorder} ${variant === 'elite' ? 'animate-pulse-glow' : ''}`} />
            <div className="absolute inset-1 rounded-full overflow-hidden bg-black">
              {(member.profilePhotoThumbDataUrl || member.image) && !imageError ? (
                <img
                  src={member.profilePhotoThumbDataUrl || member.image || ''}
                  alt={member.name}
                  className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                  loading="lazy"
                />
              ) : (
                <div className={`w-full h-full flex items-center justify-center bg-white/5 ${style.text} font-display text-2xl font-bold`}>
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col items-center w-full">
            <h3 className={`text-lg sm:text-xl font-bold text-white mb-1 font-display tracking-wide transition-colors ${style.text}`}>
              {member.name}
            </h3>

            {/* Designation Badge */}
            <div className={`inline-flex items-center gap-1 px-3 py-1 border rounded-none mb-3 ${style.badge}`}>
              <Shield className="w-3 h-3" />
              <span className="text-[10px] font-bold uppercase tracking-wider font-mono">
                {member.role || 'OPERATIVE'}
              </span>
            </div>

            {member.bio && (
              <p className="text-cyan-100/60 text-xs sm:text-sm mb-4 line-clamp-2 font-sans leading-relaxed">
                {member.bio}
              </p>
            )}

            {/* Social Links */}
            <div className="flex items-center gap-3 mt-auto">
              {member.email && (
                <motion.a
                  whileHover={{ scale: 1.1, color: '#00f3ff' }}
                  href={`mailto:${member.email}`}
                  className="text-white/40 hover:text-neon-cyan transition-colors"
                >
                  <Mail size={18} />
                </motion.a>
              )}
              <motion.a
                whileHover={{ scale: 1.1, color: '#0066ff' }}
                href="#"
                className="text-white/40 hover:text-neon-blue transition-colors"
              >
                <Linkedin size={18} />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1, color: '#0aff00' }}
                href="#"
                className="text-white/40 hover:text-neon-green transition-colors"
              >
                <Github size={18} />
              </motion.a>
            </div>
          </div>
        </div>
      </motion.div>
    );
  });

  MemberCard.displayName = 'MemberCard';

  const MemberSection = ({ title, members, icon: Icon, variant = 'standard' }: { title: string; members: Member[]; icon: any; variant?: 'standard' | 'premium' | 'elite' }) => {
    if (members.length === 0) return null;

    // Adjust grid based on variant to give more space to leaders
    const gridClass = variant === 'elite' || variant === 'premium'
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 justify-center" // Larger cards, fewer columns
      : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";

    const titleColor = variant === 'elite' ? 'text-neon-cyan' : variant === 'premium' ? 'text-neon-blue' : 'text-white';
    const iconColor = variant === 'elite' ? 'text-black bg-neon-cyan' : variant === 'premium' ? 'text-white bg-neon-blue' : 'text-neon-cyan bg-neon-cyan/10';

    return (
      <div className="mb-16">
        <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-4">
          <div className={`p-2 rounded-none border border-white/10 ${iconColor}`}>
            <Icon className={`w-6 h-6 ${variant === 'elite' ? 'text-black' : ''}`} />
          </div>
          <h2 className={`text-2xl md:text-3xl font-bold font-display tracking-tight ${titleColor}`}>
            {title} <span className="text-white/30 text-sm font-mono ml-2">({members.length})</span>
          </h2>
        </div>

        <div className={`grid gap-6 ${gridClass}`}>
          {members.map((member, index) => (
            <MemberCard key={member.id} member={member} index={index} variant={variant} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pt-32 pb-12 px-4 relative">
      {/* Background Grid */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#00f3ff05_1px,transparent_1px),linear-gradient(to_bottom,#00f3ff05_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-2 mb-4 text-neon-cyan tracking-[0.5em] text-sm font-mono">
            <Terminal className="w-4 h-4" /> PERSONNEL_DATABASE
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 font-display text-white tracking-tight">
            CLUB <span className="text-neon-cyan">OPERATIVES</span>
          </h1>
          <p className="text-cyan-100/60 text-lg max-w-2xl mx-auto font-sans">
            Meet the elite engineers and visionaries driving our mission forward.
          </p>
        </motion.div>

        {!dataReady ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-16 h-16 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(0,243,255,0.5)] mb-4" />
            <p className="text-neon-cyan font-mono text-sm animate-pulse">ACCESSING_PERSONNEL_FILES...</p>
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/60 text-lg font-mono">DATABASE_EMPTY.</p>
          </div>
        ) : (
          <div>
            {/* President Section - Elite Tier */}
            <MemberSection
              title="Club Presidency"
              members={groupedMembers.president}
              icon={Shield}
              variant="elite"
            />

            {/* Secretary Section - Premium Tier */}
            <MemberSection
              title="Secretariat"
              members={groupedMembers.secretary}
              icon={ScrollText}
              variant="premium"
            />

            <MemberSection
              title="Department Heads"
              members={groupedMembers.departmentHeads}
              icon={Cpu}
            />

            <MemberSection
              title="Team Leads"
              members={groupedMembers.teamLead}
              icon={Zap}
            />

            <MemberSection
              title="Executive Officers"
              members={groupedMembers.executive}
              icon={User}
            />

            <MemberSection
              title="Active Operatives"
              members={groupedMembers.members}
              icon={User}
            />
          </div>
        )}
      </div>
    </div>
  );
}
