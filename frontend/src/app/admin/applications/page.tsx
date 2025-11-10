'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { getRegistrations, updateRegistrationStatus, approveApplicationAndAddMember, Registration } from '@/lib/firestore';
import { invalidateMembersCache } from '@/lib/cache';
import AdminProtectedRoute from '@/components/admin/AdminProtectedRoute';

function AdminApplicationsContent() {
  const [applications, setApplications] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedApp, setSelectedApp] = useState<Registration | null>(null);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    const data = await getRegistrations();
    console.log('Loaded applications:', data); // Debug log
    setApplications(data);
    setLoading(false);
  };

  const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected', application?: Registration) => {
    try {
      if (status === 'approved' && application) {
        // Approve and move to members
        const success = await approveApplicationAndAddMember(id, application);
        if (success) {
          // Invalidate cache since we added a new member
          invalidateMembersCache();
          alert('Application approved! Member has been added to the members section.');
        } else {
          throw new Error('Failed to approve and add member');
        }
      } else {
        // Just update status for rejection
        await updateRegistrationStatus(id, status);
      }
      loadApplications();
      setSelectedApp(null);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update application status');
    }
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      (app.fullName?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
      (app.name?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
      (app.email?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
      (app.studentId?.toLowerCase() ?? '').includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">Approved</span>;
      case 'rejected':
        return <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium">Rejected</span>;
      default:
        return <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium">Pending</span>;
    }
  };

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-transparent bg-clip-text">
              Registration Applications
            </span>
          </h1>
          <p className="text-gray-400 text-sm md:text-base">Review and manage member applications</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="p-3 md:p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
            <div className="text-xl md:text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-xs md:text-sm text-gray-400">Total</div>
          </div>
          <div className="p-3 md:p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <div className="text-xl md:text-2xl font-bold text-yellow-400">{stats.pending}</div>
            <div className="text-xs md:text-sm text-gray-400">Pending</div>
          </div>
          <div className="p-3 md:p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="text-xl md:text-2xl font-bold text-green-400">{stats.approved}</div>
            <div className="text-xs md:text-sm text-gray-400">Approved</div>
          </div>
          <div className="p-3 md:p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="text-xl md:text-2xl font-bold text-red-400">{stats.rejected}</div>
            <div className="text-xs md:text-sm text-gray-400">Rejected</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2.5 md:py-3 text-sm md:text-base bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Applications Table */}
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
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Student ID</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Department</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Contact</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Date</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                  {filteredApplications.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-gray-400">
                        No applications found
                      </td>
                    </tr>
                  ) : (
                    filteredApplications.map((app) => (
                      <tr key={app.id} className="hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4">
                          {(app.profilePhotoThumbDataUrl || app.profilePhotoDataUrl || app.photoUrl) ? (
                            <img
                              src={app.profilePhotoThumbDataUrl || app.profilePhotoDataUrl || app.photoUrl}
                              alt={(app.fullName || app.name) || 'User'}
                              className="w-12 h-12 rounded-full object-cover border-2 border-cyan-500/30"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
                              {(app.fullName || app.name)?.charAt(0).toUpperCase() || '?'}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-white font-medium">
                          {(app.fullName || app.name) || <span className="text-gray-500 italic">No name</span>}
                        </td>
                        <td className="px-6 py-4 text-gray-300">{app.studentId || '-'}</td>
                        <td className="px-6 py-4 text-gray-300">
                          {app.department || '-'} - {app.year || '-'}
                        </td>
                        <td className="px-6 py-4 text-gray-300">
                          <div className="text-sm">
                            <div>{app.email || '-'}</div>
                            <div className="text-gray-500">{app.phone || '-'}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(app.status)}</td>
                        <td className="px-6 py-4 text-gray-400 text-sm">
                          {app.createdAt?.toDate().toLocaleDateString() || '-'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setSelectedApp(app)}
                              className="p-2 text-cyan-400 hover:bg-cyan-400/10 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {app.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleStatusUpdate(app.id!, 'approved', app)}
                                  className="p-2 text-green-400 hover:bg-green-400/10 rounded-lg transition-colors"
                                  title="Approve"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(app.id!, 'rejected')}
                                  className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                  title="Reject"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {filteredApplications.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                No applications found
              </div>
            ) : (
              filteredApplications.map((app) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800/50 border border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-start gap-4 mb-4">
                    {(app.profilePhotoThumbDataUrl || app.profilePhotoDataUrl || app.photoUrl) ? (
                      <img
                        src={app.profilePhotoThumbDataUrl || app.profilePhotoDataUrl || app.photoUrl}
                        alt={(app.fullName || app.name) || 'User'}
                        className="w-16 h-16 rounded-full object-cover border-2 border-cyan-500/30 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                        {(app.fullName || app.name)?.charAt(0).toUpperCase() || '?'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-white truncate">
                        {(app.fullName || app.name) || <span className="text-gray-500 italic">No name</span>}
                      </h3>
                      <p className="text-sm text-gray-400 truncate">{app.studentId || '-'}</p>
                      <div className="mt-1">{getStatusBadge(app.status)}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm mb-4">
                    <div>
                      <span className="text-gray-500">Department:</span>
                      <span className="text-gray-300 ml-2">{app.department || '-'} - {app.year || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Email:</span>
                      <span className="text-gray-300 ml-2 break-all">{app.email || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Phone:</span>
                      <span className="text-gray-300 ml-2">{app.phone || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Date:</span>
                      <span className="text-gray-300 ml-2">{app.createdAt?.toDate().toLocaleDateString() || '-'}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedApp(app)}
                      className="flex-1 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                    {app.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(app.id!, 'approved', app)}
                          className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                          title="Approve"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(app.id!, 'rejected')}
                          className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                          title="Reject"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </>
        )}

        {/* Detail Modal */}
        {selectedApp && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-800 rounded-xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-gray-800 z-10">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedApp.fullName || selectedApp.name}</h2>
                  <p className="text-gray-400">{selectedApp.email}</p>
                </div>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {(selectedApp.profilePhotoThumbDataUrl || selectedApp.profilePhotoDataUrl || selectedApp.photoUrl) && (
                  <div className="flex justify-center">
                    <img
                      src={selectedApp.profilePhotoDataUrl || selectedApp.profilePhotoThumbDataUrl || selectedApp.photoUrl}
                      alt={selectedApp.fullName || selectedApp.name || 'User'}
                      className="w-32 h-32 rounded-full object-cover border-4 border-cyan-500/30"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400">Student ID</label>
                    <p className="text-white font-medium">{selectedApp.studentId}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Status</label>
                    <div className="mt-1">{getStatusBadge(selectedApp.status)}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Department</label>
                    <p className="text-white font-medium">{selectedApp.department}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Year</label>
                    <p className="text-white font-medium">{selectedApp.year}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Phone</label>
                    <p className="text-white font-medium">{selectedApp.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Applied On</label>
                    <p className="text-white font-medium">
                      {selectedApp.createdAt?.toDate().toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {selectedApp.interests && (
                  <div>
                    <label className="text-sm text-gray-400">Interests</label>
                    <p className="text-white">{selectedApp.interests}</p>
                  </div>
                )}

                {selectedApp.experience && (
                  <div>
                    <label className="text-sm text-gray-400">Experience</label>
                    <p className="text-white">{selectedApp.experience}</p>
                  </div>
                )}

                {selectedApp.motivation && (
                  <div>
                    <label className="text-sm text-gray-400">Motivation</label>
                    <p className="text-white">{selectedApp.motivation}</p>
                  </div>
                )}

                {selectedApp.status === 'pending' && (
                  <div className="flex gap-4 pt-4 border-t border-gray-700">
                    <button
                      onClick={() => handleStatusUpdate(selectedApp.id!, 'approved', selectedApp)}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-medium flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Approve & Add to Members
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedApp.id!, 'rejected')}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all font-medium flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-5 h-5" />
                      Reject Application
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminApplications() {
  return (
    <AdminProtectedRoute>
      <AdminApplicationsContent />
    </AdminProtectedRoute>
  );
}
