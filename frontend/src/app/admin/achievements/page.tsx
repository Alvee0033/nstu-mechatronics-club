'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import { getAchievements, addAchievement, updateAchievement, deleteAchievement, Achievement } from '@/lib/firestore';
import { Timestamp } from 'firebase/firestore';
import AdminProtectedRoute from '@/components/admin/AdminProtectedRoute';

function AdminAchievementsContent() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [formData, setFormData] = useState<Partial<Achievement>>({
    title: '',
    description: '',
    category: '',
    awardedBy: '',
  });
  const [achievementDate, setAchievementDate] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [teamMembers, setTeamMembers] = useState('');

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    setLoading(true);
    const data = await getAchievements();
    setAchievements(data);
    setLoading(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setImagePreview(dataUrl);
        setFormData({ ...formData, image: dataUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const achievementData = {
        ...formData,
        date: Timestamp.fromDate(new Date(achievementDate)),
        teamMembers: teamMembers.split(',').map(t => t.trim()).filter(Boolean),
      } as Omit<Achievement, 'id'>;

      if (editingAchievement?.id) {
        await updateAchievement(editingAchievement.id, achievementData);
      } else {
        await addAchievement(achievementData);
      }
      setShowModal(false);
      resetForm();
      loadAchievements();
    } catch (error: any) {
      console.error('Error saving achievement:', error);
      
      // Show more specific error messages
      let errorMessage = 'Failed to save achievement';
      if (error?.code) {
        switch (error.code) {
          case 'permission-denied':
            errorMessage = 'Permission denied. Please check your authentication.';
            break;
          case 'resource-exhausted':
            errorMessage = 'Quota exceeded. Please try again later or upgrade your Firebase plan.';
            break;
          case 'unavailable':
            errorMessage = 'Service temporarily unavailable. Please try again.';
            break;
          case 'deadline-exceeded':
            errorMessage = 'Request timed out. Please try again.';
            break;
          default:
            errorMessage = `Error: ${error.code}`;
        }
      }
      
      alert(errorMessage);
    }
  };

  const handleEdit = (achievement: Achievement) => {
    setEditingAchievement(achievement);
    setFormData(achievement);
    setImagePreview(achievement.image || '');
    setTeamMembers(achievement.teamMembers?.join(', ') || '');
    if (achievement.date) {
      const date = achievement.date.toDate();
      setAchievementDate(date.toISOString().split('T')[0]);
    }
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this achievement?')) {
      try {
        await deleteAchievement(id);
        loadAchievements();
      } catch (error) {
        console.error('Error deleting achievement:', error);
        alert('Failed to delete achievement');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      awardedBy: '',
    });
    setEditingAchievement(null);
    setAchievementDate('');
    setImagePreview('');
    setTeamMembers('');
  };

  const filteredAchievements = achievements.filter((achievement) =>
    achievement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    achievement.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    achievement.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 py-16 md:py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-3 md:gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-1 md:mb-2">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-transparent bg-clip-text">
                Manage Achievements
              </span>
            </h1>
            <p className="text-gray-400 text-sm md:text-base">Add, edit, or remove club achievements</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-5 md:px-6 py-2.5 md:py-3 text-sm md:text-base bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all w-full sm:w-auto justify-center"
          >
            <Plus className="w-5 h-5" />
            Add Achievement
          </button>
        </div>

        <div className="mb-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search achievements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAchievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden hover:border-cyan-500/50 transition-all"
              >
                {achievement.image && (
                  <img src={achievement.image} alt={achievement.title} className="w-full h-48 object-cover" />
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{achievement.title}</h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{achievement.description}</p>
                  <div className="space-y-2 text-sm text-gray-500 mb-4">
                    {achievement.date && (
                      <div>🏆 {achievement.date.toDate().toLocaleDateString()}</div>
                    )}
                    {achievement.awardedBy && <div>📜 {achievement.awardedBy}</div>}
                    {achievement.category && (
                      <span className="inline-block px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs">
                        {achievement.category}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(achievement)}
                      className="flex-1 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center justify-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(achievement.id!)}
                      className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-800 rounded-xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-gray-800 z-10">
                <h2 className="text-2xl font-bold text-white">
                  {editingAchievement ? 'Edit Achievement' : 'Add New Achievement'}
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

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Achievement Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-cyan-500 file:text-white hover:file:bg-cyan-600"
                  />
                  {imagePreview && (
                    <img src={imagePreview} alt="Preview" className="mt-2 w-full h-48 rounded-lg object-cover" />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Date *</label>
                  <input
                    type="date"
                    required
                    value={achievementDate}
                    onChange={(e) => setAchievementDate(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                      placeholder="e.g., National, International"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Awarded By</label>
                    <input
                      type="text"
                      value={formData.awardedBy}
                      onChange={(e) => setFormData({ ...formData, awardedBy: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Team Members (comma separated)</label>
                  <input
                    type="text"
                    value={teamMembers}
                    onChange={(e) => setTeamMembers(e.target.value)}
                    placeholder="e.g., John Doe, Jane Smith"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all font-medium"
                  >
                    {editingAchievement ? 'Update Achievement' : 'Add Achievement'}
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

export default function AdminAchievements() {
  return (
    <AdminProtectedRoute>
      <AdminAchievementsContent />
    </AdminProtectedRoute>
  );
}
