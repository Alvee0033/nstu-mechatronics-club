'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { getMembers, addMember, updateMember, deleteMember, Member } from '@/lib/firestore';
import { invalidateMembersCache } from '@/lib/cache';
import { Timestamp } from 'firebase/firestore';
import AdminProtectedRoute from '@/components/admin/AdminProtectedRoute';

function AdminMembersContent() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [formData, setFormData] = useState<Partial<Member>>({
    name: '',
    role: '',
    department: '',
    year: '',
    email: '',
    phone: '',
    bio: '',
  });
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [thumbPreview, setThumbPreview] = useState<string>('');
  // Email modal state
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sendingEmails, setSendingEmails] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: number; failed: number }>({ success: 0, failed: 0 });

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    setLoading(true);
    const data = await getMembers();
    setMembers(data);
    setLoading(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isThumb: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        if (isThumb) {
          setThumbPreview(dataUrl);
          setFormData({ ...formData, profilePhotoThumbDataUrl: dataUrl });
        } else {
          setPhotoPreview(dataUrl);
          setFormData({ ...formData, profilePhotoDataUrl: dataUrl });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMember?.id) {
        await updateMember(editingMember.id, formData);
      } else {
        await addMember(formData as Omit<Member, 'id'>);
      }

      // Invalidate cache so fresh data is loaded
      invalidateMembersCache();

      setShowModal(false);
      resetForm();
      loadMembers();
    } catch (error) {
      console.error('Error saving member:', error);
      alert('Failed to save member');
    }
  };

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setFormData(member);
    setPhotoPreview(member.profilePhotoDataUrl || member.image || '');
    setThumbPreview(member.profilePhotoThumbDataUrl || '');
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this member?')) {
      try {
        await deleteMember(id);

        // Invalidate cache so fresh data is loaded
        invalidateMembersCache();

        loadMembers();
      } catch (error) {
        console.error('Error deleting member:', error);
        alert('Failed to delete member');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      role: '',
      department: '',
      year: '',
      email: '',
      phone: '',
      bio: '',
    });
    setEditingMember(null);
    setPhotoPreview('');
    setThumbPreview('');
  };

  const filteredMembers = members.filter((member) =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate department statistics
  const departmentStats = useMemo(() => {
    const stats = new Map<string, number>();

    filteredMembers.forEach((member) => {
      const dept = member.department?.trim() || 'Not Specified';
      stats.set(dept, (stats.get(dept) || 0) + 1);
    });

    return Array.from(stats.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredMembers]);

  // Color palette for pie chart - Neon Cyberpunk Theme
  const COLORS = [
    '#00f3ff', // neon-cyan
    '#0066ff', // neon-blue
    '#0aff00', // neon-green
    '#ff00ff', // neon-magenta
    '#ffff00', // neon-yellow
    '#ff6600', // neon-orange
    '#ff0066', // neon-pink
    '#00ffff', // electric-cyan
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 relative">
      {/* Background Grid */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#00f3ff05_1px,transparent_1px),linear-gradient(to_bottom,#00f3ff05_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 text-neon-cyan tracking-[0.3em] text-xs font-mono">
              <div className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse shadow-[0_0_10px_rgba(0,243,255,0.8)]" />
              MEMBER_DATABASE
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2 font-display text-white tracking-tight">
              OPERATIVE <span className="text-neon-cyan">MANAGEMENT</span>
            </h1>
            <p className="text-cyan-100/60 text-sm md:text-base font-mono">ADMIN_CONTROL_PANEL // ADD_EDIT_REMOVE</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="cyber-button px-6 py-3 text-sm font-mono uppercase tracking-wider w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add_Operative
            </button>

            {/* Bulk Email Button */}
            <button
              onClick={() => {
                setEmailSubject('Announcement from NSTU Mechatronics Club');
                setEmailBody('Hello {{name}},\n\nWe have an update for you:\n\n- Insert your message here -\n\nBest,\nNSTU Mechatronics Club');
                setShowEmailModal(true);
              }}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-xs bg-white/5 border border-white/20 text-cyan-100/80 hover:border-neon-cyan hover:text-neon-cyan transition-all font-mono uppercase tracking-wider"
            >
              Bulk_Email
            </button>
          </div>
        </div>

        {/* Bulk Email Modal */}
        {showEmailModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-800 rounded-lg md:rounded-xl border border-gray-700 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-4 md:p-6 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-gray-800 z-10">
                <h2 className="text-xl md:text-2xl font-bold text-white">Send Bulk Email to Members</h2>
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="p-4 md:p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Message (use {"{{name}}"} for personalization)</label>
                  <textarea
                    rows={8}
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="text-sm text-gray-400">Sending to: <span className="text-white">{filteredMembers.length}</span> members (filtered)</div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={async () => {
                      // Validate inputs
                      if (!emailSubject.trim() || !emailBody.trim()) {
                        alert('Subject and message are required.');
                        return;
                      }

                      if (filteredMembers.length === 0) {
                        alert('No members to send to (filtered list is empty).');
                        return;
                      }

                      setSendingEmails(true);
                      setSendResult({ success: 0, failed: 0 });

                      try {
                        // Get member IDs to send to
                        const memberIds = filteredMembers.map(m => m.id).filter(Boolean);

                        // Call server endpoint
                        const response = await fetch('/api/email/send-bulk', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            subject: emailSubject,
                            message: emailBody,
                            memberIds: memberIds,
                          }),
                        });

                        const result = await response.json();

                        if (!response.ok) {
                          throw new Error(result.error || 'Failed to send emails');
                        }

                        setSendResult({ success: result.sent, failed: result.failed });
                        alert(`Emails sent successfully!\nSent: ${result.sent}\nFailed: ${result.failed}\nTotal: ${result.total}`);

                        if (result.errors && result.errors.length > 0) {
                          console.log('Email errors:', result.errors);
                        }

                      } catch (error) {
                        console.error('Bulk email error:', error);
                        alert(`Failed to send bulk emails: ${error instanceof Error ? error.message : 'Unknown error'}`);
                      } finally {
                        setSendingEmails(false);
                      }
                    }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all font-medium"
                    disabled={sendingEmails}
                  >
                    {sendingEmails ? 'Sending...' : 'Send Emails'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowEmailModal(false)}
                    className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
                    disabled={sendingEmails}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neon-cyan" />
          <input
            type="text"
            placeholder="SEARCH_DATABASE..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 text-sm bg-black/50 border border-neon-cyan/30 text-white placeholder-cyan-100/40 focus:outline-none focus:border-neon-cyan font-mono uppercase tracking-wider shadow-[inset_0_0_20px_rgba(0,243,255,0.05)] transition-all"
          />
        </div>

        {/* Department Statistics Pie Chart - Cyberpunk Style */}
        {!loading && departmentStats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 relative"
          >
            {/* Background Grid */}
            <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#00f3ff05_1px,transparent_1px),linear-gradient(to_bottom,#00f3ff05_1px,transparent_1px)] bg-[size:40px_40px] rounded-xl" />

            <div className="holo-card p-6 md:p-8 relative overflow-hidden">
              {/* Animated Scanline Effect */}
              <div className="animate-scanline" />

              {/* Header Section */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 relative z-10">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-neon-cyan tracking-[0.3em] text-xs font-mono">
                    <div className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse shadow-[0_0_10px_rgba(0,243,255,0.8)]" />
                    ANALYTICS_MODULE
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-1 font-display text-white tracking-tight">
                    DEPARTMENT <span className="text-neon-cyan">DISTRIBUTION</span>
                  </h2>
                  <p className="text-cyan-100/60 text-sm md:text-base font-mono">
                    TOTAL_OPERATIVES: <span className="text-neon-cyan font-bold">{filteredMembers.length}</span>
                  </p>
                </div>

                {/* Stats Badge */}
                <div className="mt-4 lg:mt-0 px-4 py-2 bg-neon-cyan/10 border border-neon-cyan/30 rounded-none">
                  <div className="text-xs font-mono text-neon-cyan/70 uppercase tracking-wider">Active Departments</div>
                  <div className="text-2xl font-bold text-neon-cyan font-display">{departmentStats.length}</div>
                </div>
              </div>

              {/* Chart Container */}
              <div className="relative">
                {/* Corner Decorations */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-neon-cyan" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-neon-cyan" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-neon-cyan" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-neon-cyan" />

                <div className="w-full bg-black/30 border border-neon-cyan/20 p-4 relative" style={{ height: '450px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={departmentStats}
                        cx="50%"
                        cy="50%"
                        labelLine={{
                          stroke: '#00f3ff',
                          strokeWidth: 1,
                        }}
                        label={({ name, percent }) => {
                          const percentage = percent ? (percent * 100).toFixed(0) : 0;
                          return `${name}: ${percentage}%`;
                        }}
                        outerRadius={140}
                        innerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                        stroke="#000"
                        strokeWidth={2}
                      >
                        {departmentStats.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            style={{
                              filter: `drop-shadow(0 0 8px ${COLORS[index % COLORS.length]}80)`,
                            }}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#02040a',
                          border: '1px solid #00f3ff',
                          borderRadius: '0',
                          color: '#fff',
                          fontFamily: 'monospace',
                          boxShadow: '0 0 20px rgba(0, 243, 255, 0.3)',
                        }}
                        itemStyle={{
                          color: '#00f3ff',
                          fontWeight: 'bold',
                        }}
                        formatter={(value: number, name: string) => [
                          `${value} OPERATIVES`,
                          name.toUpperCase()
                        ]}
                      />
                      <Legend
                        wrapperStyle={{
                          paddingTop: '20px',
                          fontFamily: 'monospace',
                        }}
                        formatter={(value) => (
                          <span style={{
                            color: '#e0f2fe',
                            fontSize: '12px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}>
                            {value}
                          </span>
                        )}
                        iconType="square"
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Center Text */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                    <div className="text-4xl md:text-5xl font-bold text-neon-cyan font-display drop-shadow-[0_0_20px_rgba(0,243,255,0.8)]">
                      {filteredMembers.length}
                    </div>
                    <div className="text-xs font-mono text-cyan-100/60 uppercase tracking-widest mt-1">
                      Total
                    </div>
                  </div>
                </div>
              </div>

              {/* Department List */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                {departmentStats.map((dept, index) => (
                  <div
                    key={index}
                    className="bg-black/40 border border-white/10 p-3 hover:border-neon-cyan/50 transition-all group"
                  >
                    <div
                      className="w-3 h-3 mb-2 rounded-sm"
                      style={{
                        backgroundColor: COLORS[index % COLORS.length],
                        boxShadow: `0 0 10px ${COLORS[index % COLORS.length]}80`,
                      }}
                    />
                    <div className="text-xs font-mono text-white/80 uppercase mb-1 truncate group-hover:text-neon-cyan transition-colors">
                      {dept.name}
                    </div>
                    <div className="text-lg font-bold text-neon-cyan font-display">
                      {dept.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Members Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(0,243,255,0.5)]" />
            <p className="mt-4 text-neon-cyan font-mono text-sm animate-pulse">LOADING_DATABASE...</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block holo-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-black/50 border-b border-neon-cyan/30">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-wider text-neon-cyan">Avatar</th>
                      <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-wider text-neon-cyan">Operative_ID</th>
                      <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-wider text-neon-cyan">Rank</th>
                      <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-wider text-neon-cyan">Division</th>
                      <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-wider text-neon-cyan">Contact_Data</th>
                      <th className="px-4 py-3 text-right text-xs font-mono uppercase tracking-wider text-neon-cyan">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredMembers.map((member, index) => (
                      <tr
                        key={member.id}
                        className="hover:bg-neon-cyan/5 transition-colors group"
                        style={{
                          animation: `fadeIn 0.3s ease-in-out ${index * 0.05}s both`
                        }}
                      >
                        <td className="px-4 py-3">
                          {(member.profilePhotoThumbDataUrl || member.image) ? (
                            <img
                              src={member.profilePhotoThumbDataUrl || member.image}
                              alt={member.name}
                              className="w-10 h-10 rounded-none object-cover border border-neon-cyan/30 group-hover:border-neon-cyan transition-colors"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-none bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center text-neon-cyan font-bold text-xs font-mono">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-white font-mono text-sm group-hover:text-neon-cyan transition-colors">{member.name}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-white/5 border border-white/10 text-cyan-100/70 text-[10px] font-mono uppercase tracking-wider">
                            {member.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-cyan-100/60 font-mono text-xs">{member.department || 'N/A'}</td>
                        <td className="px-4 py-3">
                          <div className="text-xs font-mono">
                            <div className="text-cyan-100/60">{member.email}</div>
                            <div className="text-cyan-100/40">{member.phone}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(member)}
                              className="p-2 text-neon-cyan hover:bg-neon-cyan/10 border border-transparent hover:border-neon-cyan/30 transition-all"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(member.id!)}
                              className="p-2 text-red-400 hover:bg-red-400/10 border border-transparent hover:border-red-400/30 transition-all"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-3">
              {filteredMembers.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="holo-card p-4 group"
                >
                  <div className="flex items-start gap-3 mb-3">
                    {(member.profilePhotoThumbDataUrl || member.image) ? (
                      <img
                        src={member.profilePhotoThumbDataUrl || member.image}
                        alt={member.name}
                        className="w-14 h-14 rounded-none object-cover border border-neon-cyan/30 group-hover:border-neon-cyan transition-colors flex-shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-none bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center text-neon-cyan font-bold text-sm font-mono flex-shrink-0">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-white truncate font-mono group-hover:text-neon-cyan transition-colors">{member.name}</h3>
                      <span className="inline-block px-2 py-0.5 bg-white/5 border border-white/10 text-cyan-100/70 text-[10px] font-mono uppercase tracking-wider mt-1">
                        {member.role}
                      </span>
                      <p className="text-xs text-cyan-100/60 font-mono mt-1">{member.department || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs mb-3 font-mono border-t border-white/5 pt-3">
                    {member.email && (
                      <div className="flex items-start gap-2">
                        <span className="text-neon-cyan/70 min-w-[50px]">EMAIL:</span>
                        <span className="text-cyan-100/60 break-all">{member.email}</span>
                      </div>
                    )}
                    {member.phone && (
                      <div className="flex items-start gap-2">
                        <span className="text-neon-cyan/70 min-w-[50px]">PHONE:</span>
                        <span className="text-cyan-100/60">{member.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(member)}
                      className="flex-1 px-3 py-2 bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan hover:text-black transition-all text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2"
                    >
                      <Edit2 className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(member.id!)}
                      className="flex-1 px-3 py-2 bg-red-400/10 border border-red-400/30 text-red-400 hover:bg-red-400 hover:text-black transition-all text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-800 rounded-lg md:rounded-xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-4 md:p-6 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-gray-800 z-10">
                <h2 className="text-xl md:text-2xl font-bold text-white">
                  {editingMember ? 'Edit Member' : 'Add New Member'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
                {/* Photos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Profile Photo (Full Size)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, false)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-cyan-500 file:text-white hover:file:bg-cyan-600"
                    />
                    {photoPreview && (
                      <img src={photoPreview} alt="Preview" className="mt-2 w-32 h-32 rounded-lg object-cover" />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Thumbnail Photo
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, true)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-cyan-500 file:text-white hover:file:bg-cyan-600"
                    />
                    {thumbPreview && (
                      <img src={thumbPreview} alt="Thumb" className="mt-2 w-32 h-32 rounded-lg object-cover" />
                    )}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Role *</label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">Select a role</option>
                    <optgroup label="Leadership">
                      <option value="President">President</option>
                      <option value="Vice President">Vice President</option>
                    </optgroup>
                    <optgroup label="Secretary Positions">
                      <option value="General Secretary">General Secretary</option>
                      <option value="Joint Secretary">Joint Secretary</option>
                      <option value="Organizing Secretary">Organizing Secretary</option>
                      <option value="Communication Secretary">Communication Secretary</option>
                      <option value="Publication Secretary">Publication Secretary</option>
                      <option value="Program Secretary">Program Secretary</option>
                    </optgroup>
                    <optgroup label="Financial">
                      <option value="Treasurer">Treasurer</option>
                    </optgroup>
                    <optgroup label="Department & Team">
                      <option value="Technical Team Head">Technical Team Head</option>
                      <option value="Team Lead">Team Lead</option>
                      <option value="Department Head">Department Head</option>
                    </optgroup>
                    <optgroup label="Executive">
                      <option value="Head of Executive">Head of Executive</option>
                      <option value="Executive Member">Executive Member</option>
                      <option value="Executive">Executive</option>
                    </optgroup>
                    <optgroup label="General">
                      <option value="Member">Member</option>
                    </optgroup>
                  </select>
                </div>

                {/* Department & Year */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Department</label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Year</label>
                    <input
                      type="text"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                  <textarea
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all font-medium"
                  >
                    {editingMember ? 'Update Member' : 'Add Member'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminMembers() {
  return (
    <AdminProtectedRoute>
      <AdminMembersContent />
    </AdminProtectedRoute>
  );
}
