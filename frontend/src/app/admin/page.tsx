'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  FolderKanban,
  Trophy,
  FileText,
  TrendingUp,
  Activity,
  Eye,
  UserPlus,
  Receipt,
  LogOut,
  Terminal,
  Shield,
  Cpu
} from 'lucide-react';
import { getMembers, getEvents, getProjects, getAchievements, getRegistrations, getFinancialStats, getSettings, updateSettings, Settings } from '@/lib/firestore';
import { isAdminLoggedIn, getAdminUsername, adminLogout } from '@/lib/auth';
import AdminProtectedRoute from '@/components/admin/AdminProtectedRoute';

function AdminDashboardContent() {
  const pathname = usePathname();
  const router = useRouter();
  const [stats, setStats] = useState({
    members: 0,
    events: 0,
    projects: 0,
    achievements: 0,
    applications: 0,
    pendingApplications: 0,
    netBalance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [adminUsername, setAdminUsername] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings>({ applicationsEnabled: true });
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!isAdminLoggedIn()) {
      router.push('/admin/login');
    } else {
      setAdminUsername(getAdminUsername());
    }
  }, [router]);

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      adminLogout();
      router.push('/admin/login');
    }
  };

  const handleToggleApplications = async () => {
    if (settingsLoading) return;

    setSettingsLoading(true);
    try {
      const newSettings = {
        ...settings,
        applicationsEnabled: !settings.applicationsEnabled,
      };
      await updateSettings(newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('Failed to update application settings');
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleDisabledMessageChange = async (message: string) => {
    if (settingsLoading) return;

    setSettingsLoading(true);
    try {
      const newSettings = {
        ...settings,
        disabledMessage: message,
      };
      await updateSettings(newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error('Error updating disabled message:', error);
    } finally {
      setSettingsLoading(false);
    }
  };

  useEffect(() => {
    const loadStats = async () => {
      // Only load stats if authenticated
      if (!isAdminLoggedIn()) return;

      try {
        const [members, events, projects, achievements, applications, financialStats, appSettings] = await Promise.all([
          getMembers(),
          getEvents(),
          getProjects(),
          getAchievements(),
          getRegistrations(),
          getFinancialStats(),
          getSettings(),
        ]);

        setStats({
          members: members.length,
          events: events.length,
          projects: projects.length,
          achievements: achievements.length,
          applications: applications.length,
          pendingApplications: applications.filter(app => app.status === 'pending').length,
          netBalance: financialStats.netBalance,
        });

        setSettings(appSettings);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const menuItems = [
    {
      title: 'Members',
      href: '/admin/members',
      icon: Users,
      description: 'Manage club members',
      count: stats.members,
      color: 'text-neon-cyan',
    },
    {
      title: 'Events',
      href: '/admin/events',
      icon: Calendar,
      description: 'Manage events',
      count: stats.events,
      color: 'text-neon-green',
    },
    {
      title: 'Projects',
      href: '/admin/projects',
      icon: FolderKanban,
      description: 'Manage projects',
      count: stats.projects,
      color: 'text-neon-blue',
    },
    {
      title: 'Achievements',
      href: '/admin/achievements',
      icon: Trophy,
      description: 'Manage achievements',
      count: stats.achievements,
      color: 'text-yellow-400',
    },
    {
      title: 'Invoices',
      href: '/admin/invoices',
      icon: Receipt,
      description: 'Finance & expenses',
      count: loading ? '...' : `৳${(stats.netBalance / 1000).toFixed(1)}k`,
      color: 'text-emerald-400',
    },
    {
      title: 'Applications',
      href: '/admin/applications',
      icon: FileText,
      description: 'Registration applications',
      count: stats.applications,
      badge: stats.pendingApplications > 0 ? stats.pendingApplications : null,
      color: 'text-orange-400',
    },
  ];

  return (
    <div className="min-h-screen bg-black pt-24 pb-12 px-4 relative">
      {/* Background Grid */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#00f3ff05_1px,transparent_1px),linear-gradient(to_bottom,#00f3ff05_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="container mx-auto relative z-10 max-w-6xl">
        {/* Header with User Info and Logout */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-2 text-neon-cyan tracking-[0.3em] text-xs font-mono mb-2">
                <Terminal className="w-4 h-4" /> ADMIN_CONSOLE_V2.0
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-white font-display tracking-tight">
                COMMAND <span className="text-neon-cyan">CENTER</span>
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2 bg-neon-cyan/5 border border-neon-cyan/30 rounded-none">
                <div className="w-8 h-8 rounded-none bg-neon-cyan/10 flex items-center justify-center border border-neon-cyan/50">
                  <Shield className="w-4 h-4 text-neon-cyan" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-cyan-400/60 font-mono uppercase">Operator</span>
                  <span className="text-sm font-bold text-white font-display tracking-wide">{adminUsername}</span>
                </div>
              </div>

              <motion.button
                onClick={handleLogout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 transition-colors font-mono text-sm uppercase tracking-wider"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </motion.button>
            </div>
          </div>

          {/* Application Settings Toggle */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="holo-card p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white font-display tracking-wide flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-neon-cyan" />
                  Recruitment Protocol
                </h3>
                <p className="text-sm text-cyan-100/60 font-mono mt-1">Control new operative registration status</p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-sm font-bold font-mono uppercase tracking-wider ${settings.applicationsEnabled ? 'text-neon-green' : 'text-red-500'}`}>
                  {settings.applicationsEnabled ? 'ACTIVE' : 'LOCKED'}
                </span>
                <button
                  onClick={handleToggleApplications}
                  disabled={settingsLoading}
                  className={`
                    relative inline-flex h-6 w-12 items-center rounded-none transition-colors focus:outline-none border border-white/20
                    ${settings.applicationsEnabled ? 'bg-neon-cyan/20 border-neon-cyan' : 'bg-gray-900'}
                    ${settingsLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform bg-white transition-transform
                      ${settings.applicationsEnabled ? 'translate-x-7 bg-neon-cyan shadow-[0_0_10px_rgba(0,243,255,0.8)]' : 'translate-x-1 bg-gray-500'}
                    `}
                  />
                </button>
              </div>
            </div>

            {!settings.applicationsEnabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-white/10 pt-4 mt-4"
              >
                <label className="block text-xs font-bold text-neon-cyan font-mono uppercase mb-2">
                  Lockdown Message
                </label>
                <textarea
                  value={settings.disabledMessage || ''}
                  onChange={(e) => handleDisabledMessageChange(e.target.value)}
                  placeholder="Enter system message..."
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-neon-cyan focus:shadow-[0_0_15px_rgba(0,243,255,0.2)] transition-all font-mono text-sm resize-none"
                  rows={2}
                  disabled={settingsLoading}
                />
              </motion.div>
            )}
          </motion.div>

          {/* Stats Overview Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
            {/* Total Members Card */}
            <Link href="/admin/members">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="holo-card p-5 group hover:border-neon-cyan transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <Users className="w-6 h-6 text-neon-cyan group-hover:drop-shadow-[0_0_10px_rgba(0,243,255,0.8)] transition-all" />
                  <TrendingUp className="w-4 h-4 text-neon-cyan/50" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-1 font-display tracking-tighter">
                  {loading ? '...' : stats.members}
                </div>
                <div className="text-xs font-mono text-cyan-100/50 uppercase tracking-widest">Operatives</div>
              </motion.div>
            </Link>

            {/* Pending Applications */}
            <Link href="/admin/applications">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="holo-card p-5 group hover:border-yellow-400 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <UserPlus className="w-6 h-6 text-yellow-400 group-hover:drop-shadow-[0_0_10px_rgba(250,204,21,0.8)] transition-all" />
                  {stats.pendingApplications > 0 && (
                    <span className="px-2 py-0.5 bg-yellow-500/20 border border-yellow-500 text-yellow-500 text-[10px] font-bold font-mono rounded-none">
                      {stats.pendingApplications} NEW
                    </span>
                  )}
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-1 font-display tracking-tighter">
                  {loading ? '...' : stats.pendingApplications}
                </div>
                <div className="text-xs font-mono text-white/50 uppercase tracking-widest">Pending</div>
              </motion.div>
            </Link>

            {/* Active Projects */}
            <Link href="/admin/projects">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="holo-card p-5 group hover:border-purple-500 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <FolderKanban className="w-6 h-6 text-purple-500 group-hover:drop-shadow-[0_0_10px_rgba(168,85,247,0.8)] transition-all" />
                  <Activity className="w-4 h-4 text-purple-500/50" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-1 font-display tracking-tighter">
                  {loading ? '...' : stats.projects}
                </div>
                <div className="text-xs font-mono text-white/50 uppercase tracking-widest">Prototypes</div>
              </motion.div>
            </Link>

            {/* Total Events */}
            <Link href="/admin/events">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="holo-card p-5 group hover:border-neon-green transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <Calendar className="w-6 h-6 text-neon-green group-hover:drop-shadow-[0_0_10px_rgba(10,255,0,0.8)] transition-all" />
                  <Eye className="w-4 h-4 text-neon-green/50" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-1 font-display tracking-tighter">
                  {loading ? '...' : stats.events}
                </div>
                <div className="text-xs font-mono text-white/50 uppercase tracking-widest">Missions</div>
              </motion.div>
            </Link>
          </div>
        </motion.div>

        {/* Management Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-2">
            <Cpu className="w-5 h-5 text-neon-cyan" />
            <h2 className="text-xl font-bold text-white font-display tracking-wide">SYSTEM MODULES</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Link href={item.href}>
                    <div className="holo-card p-6 h-full group hover:border-neon-cyan transition-all duration-300 relative overflow-hidden">
                      <div className="absolute inset-0 bg-neon-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      <div className="flex items-start justify-between mb-4 relative z-10">
                        <div className={`p-3 border border-white/10 bg-black/50 ${item.color} group-hover:text-white group-hover:bg-neon-cyan/20 group-hover:border-neon-cyan transition-all duration-300`}>
                          <Icon className="w-6 h-6" />
                        </div>

                        {item.badge && (
                          <span className="px-2 py-1 bg-yellow-500/20 border border-yellow-500 text-yellow-500 text-[10px] font-bold font-mono animate-pulse">
                            {item.badge} ACTION REQ
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-white mb-2 font-display tracking-wide relative z-10 group-hover:text-neon-cyan transition-colors">
                        {item.title}
                      </h3>

                      <div className="flex items-end justify-between relative z-10">
                        <p className="text-xs text-cyan-100/50 font-mono max-w-[60%]">
                          {item.description}
                        </p>
                        <div className={`text-2xl font-bold font-display ${item.color}`}>
                          {loading ? '...' : item.count}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <AdminProtectedRoute>
      <AdminDashboardContent />
    </AdminProtectedRoute>
  );
}
