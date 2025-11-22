'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 py-16 md:py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-3 md:gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-1 md:mb-2">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-transparent bg-clip-text">
                Manage Members
              </span>
            </h1>
            <p className="text-gray-400 text-sm md:text-base">Add, edit, or remove club members</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-5 md:px-6 py-2.5 md:py-3 text-sm md:text-base bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4 md:w-5 md:h-5" />
            Add Member
          </button>

            {/* Bulk Email Button */}
            <button
              onClick={() => {
                // Pre-fill subject/body with a simple template
                setEmailSubject('Announcement from NSTU Mechatronics Club');
                setEmailBody('Hello {{name}},\n\nWe have an update for you:\n\n- Insert your message here -\n\nBest,\nNSTU Mechatronics Club');
                setShowEmailModal(true);
              }}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm bg-white/6 text-white rounded-lg hover:bg-white/8 transition-all"
            >
              Send Bulk Email
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
          <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2.5 md:py-3 text-sm md:text-base bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Members Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                <thead className="bg-gray-800 border-b border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Photo</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Department</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Contact</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        {(member.profilePhotoThumbDataUrl || member.image) ? (
                          <img
                            src={member.profilePhotoThumbDataUrl || member.image}
                            alt={member.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-cyan-500/30"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-white">{member.name}</td>
                      <td className="px-6 py-4 text-gray-300">{member.role}</td>
                      <td className="px-6 py-4 text-gray-300">{member.department}</td>
                      <td className="px-6 py-4 text-gray-300">
                        <div className="text-sm">
                          <div>{member.email}</div>
                          <div className="text-gray-500">{member.phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(member)}
                            className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(member.id!)}
                            className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
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
          <div className="lg:hidden space-y-4">
            {filteredMembers.map((member) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800/50 border border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-start gap-4 mb-4">
                  {(member.profilePhotoThumbDataUrl || member.image) ? (
                    <img
                      src={member.profilePhotoThumbDataUrl || member.image}
                      alt={member.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-cyan-500/30 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white truncate">{member.name}</h3>
                    <p className="text-sm text-cyan-400">{member.role}</p>
                    <p className="text-sm text-gray-400">{member.department}</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm mb-4">
                  {member.email && (
                    <div>
                      <span className="text-gray-500">Email:</span>
                      <span className="text-gray-300 ml-2 break-all">{member.email}</span>
                    </div>
                  )}
                  {member.phone && (
                    <div>
                      <span className="text-gray-500">Phone:</span>
                      <span className="text-gray-300 ml-2">{member.phone}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(member)}
                    className="flex-1 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(member.id!)}
                    className="flex-1 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
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
