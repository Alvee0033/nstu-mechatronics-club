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
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Events',
      href: '/admin/events',
      icon: Calendar,
      description: 'Manage events',
      count: stats.events,
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Projects',
      href: '/admin/projects',
      icon: FolderKanban,
      description: 'Manage projects',
      count: stats.projects,
      gradient: 'from-orange-500 to-red-500',
    },
    {
      title: 'Achievements',
      href: '/admin/achievements',
      icon: Trophy,
      description: 'Manage achievements',
      count: stats.achievements,
      gradient: 'from-green-500 to-teal-500',
    },
    {
      title: 'Invoices',
      href: '/admin/invoices',
      icon: Receipt,
      description: 'Finance & expenses',
      count: loading ? '...' : `৳${(stats.netBalance / 1000).toFixed(1)}k`,
      gradient: 'from-emerald-500 to-green-500',
    },
    {
      title: 'Applications',
      href: '/admin/applications',
      icon: FileText,
      description: 'Registration applications',
      count: stats.applications,
      badge: stats.pendingApplications > 0 ? stats.pendingApplications : null,
      gradient: 'from-yellow-500 to-orange-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black py-16 md:py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with User Info and Logout */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 md:mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                Admin Dashboard
              </h1>
              <p className="text-gray-400 text-sm md:text-base">
                Welcome back, <span className="text-cyan-400 font-semibold">{adminUsername}</span>!
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                {adminUsername?.charAt(0).toUpperCase() || 'A'}
              </div>
              <motion.button
                onClick={handleLogout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 transition-colors"
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
            className="mt-6 bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 md:p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Member Applications</h3>
                <p className="text-sm text-gray-400">Control whether new member applications are accepted</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-medium ${settings.applicationsEnabled ? 'text-green-400' : 'text-red-400'}`}>
                  {settings.applicationsEnabled ? 'Enabled' : 'Disabled'}
                </span>
                <button
                  onClick={handleToggleApplications}
                  disabled={settingsLoading}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900
                    ${settings.applicationsEnabled ? 'bg-cyan-500' : 'bg-gray-600'}
                    ${settingsLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${settings.applicationsEnabled ? 'translate-x-6' : 'translate-x-1'}
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
                className="border-t border-gray-700/50 pt-4"
              >
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Disabled Message
                </label>
                <textarea
                  value={settings.disabledMessage || ''}
                  onChange={(e) => handleDisabledMessageChange(e.target.value)}
                  placeholder="Enter a message to show when applications are disabled..."
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                  rows={3}
                  disabled={settingsLoading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  This message will be shown to users when they try to register. Use ❤️ for heart emoji.
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Stats Overview Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {/* Total Members Card */}
            <Link href="/admin/members">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-4 md:p-5 relative overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-200"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-5 h-5 md:w-6 md:h-6 text-white/80" />
                    <TrendingUp className="w-4 h-4 text-white/60" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                    {loading ? '...' : stats.members}
                  </div>
                  <div className="text-xs md:text-sm text-white/70">Total Members</div>
                </div>
              </motion.div>
            </Link>

            {/* Pending Applications */}
            <Link href="/admin/applications">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 md:p-5 cursor-pointer hover:scale-105 hover:border-gray-600 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <UserPlus className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" />
                  {stats.pendingApplications > 0 && (
                    <span className="px-2 py-0.5 bg-yellow-500 text-black text-xs font-bold rounded-full">
                      {stats.pendingApplications}
                    </span>
                  )}
                </div>
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                  {loading ? '...' : stats.pendingApplications}
                </div>
                <div className="text-xs md:text-sm text-gray-400">Pending Requests</div>
              </motion.div>
            </Link>

            {/* Active Projects */}
            <Link href="/admin/projects">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 md:p-5 cursor-pointer hover:scale-105 hover:border-gray-600 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <FolderKanban className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
                  <Activity className="w-4 h-4 text-purple-400/60" />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                  {loading ? '...' : stats.projects}
                </div>
                <div className="text-xs md:text-sm text-gray-400">Active Projects</div>
              </motion.div>
            </Link>

            {/* Total Events */}
            <Link href="/admin/events">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 md:p-5 cursor-pointer hover:scale-105 hover:border-gray-600 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <Calendar className="w-5 h-5 md:w-6 md:h-6 text-green-400" />
                  <Eye className="w-4 h-4 text-green-400/60" />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                  {loading ? '...' : stats.events}
                </div>
                <div className="text-xs md:text-sm text-gray-400">Total Events</div>
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
          <h2 className="text-lg md:text-xl font-bold text-white mb-4">Manage Content</h2>
          
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
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
                    <div
                      className={`
                        relative group rounded-2xl border transition-all duration-300 h-full
                        ${
                          isActive
                            ? 'bg-gradient-to-br ' + item.gradient + ' border-transparent'
                            : 'bg-gray-800/30 backdrop-blur-sm border-gray-700/50 hover:border-gray-600 hover:bg-gray-800/50'
                        }
                      `}
                    >
                      <div className="p-4 md:p-5">
                        {/* Header with Icon and Badge */}
                        <div className="flex items-center justify-between mb-3">
                          <div
                            className={`
                              w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-all
                              ${
                                isActive
                                  ? 'bg-white/20'
                                  : 'bg-gray-700/50 group-hover:bg-gray-700'
                              }
                            `}
                          >
                            <Icon className={`w-5 h-5 md:w-6 md:h-6 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                          </div>
                          
                          {item.badge && (
                            <span className="px-2 py-0.5 bg-yellow-500 text-black text-xs font-bold rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className={`text-base md:text-lg font-bold mb-1 ${isActive ? 'text-white' : 'text-gray-200 group-hover:text-white'}`}>
                          {item.title}
                        </h3>

                        {/* Count and Arrow */}
                        <div className="flex items-center justify-between">
                          <div className={`text-2xl md:text-3xl font-bold ${isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                            {loading ? '...' : item.count}
                          </div>
                          <svg
                            className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${isActive ? 'text-white/70' : 'text-gray-500'}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                        
                        {/* Description - Hidden on mobile for compactness */}
                        <p className={`text-xs mt-2 hidden sm:block ${isActive ? 'text-white/60' : 'text-gray-500'}`}>
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Recent Activity Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8"
        >
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-bold text-white">Recent Activity</h2>
              <button className="text-sm text-cyan-400 hover:text-cyan-300">View all</button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">New achievement added</p>
                  <p className="text-xs text-gray-400">2 hours ago</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">5 new member applications</p>
                  <p className="text-xs text-gray-400">5 hours ago</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">Upcoming event scheduled</p>
                  <p className="text-xs text-gray-400">1 day ago</p>
                </div>
              </div>
            </div>
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
