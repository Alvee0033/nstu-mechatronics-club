'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Activity,
  DollarSign,
  X,
  FileText,
  Trash2,
  Eye,
  Plus,
  Search,
  Upload,
} from 'lucide-react';
import {
  getTransactions,
  addTransaction,
  deleteTransaction,
  getFinancialStats,
  type Transaction,
  type FinancialStats,
} from '@/lib/firestore';
import { Timestamp } from 'firebase/firestore';
import AdminProtectedRoute from '@/components/admin/AdminProtectedRoute';

const CATEGORIES = {
  income: ['Event Registration', 'Membership Fees', 'Sponsorship', 'Donations', 'Other Income'],
  expense: ['Equipment Purchase', 'Venue Rental', 'Marketing', 'Supplies', 'Travel', 'Food & Beverage', 'Other Expense']
};

function InvoicesPageContent() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<FinancialStats>({
    totalRevenue: 0,
    totalExpenses: 0,
    netBalance: 0,
    transactionCount: 0,
    categoryBreakdown: {},
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    type: 'income' as 'income' | 'expense',
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    invoiceFile: null as File | null,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [transactionsData, statsData] = await Promise.all([
        getTransactions(),
        getFinancialStats(),
      ]);
      setTransactions(transactionsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const transaction: Omit<Transaction, 'id'> = {
        type: formData.type,
        category: formData.category,
        amount: parseFloat(formData.amount),
        description: formData.description,
        date: Timestamp.fromDate(new Date(formData.date)),
        invoiceFileName: formData.invoiceFile?.name,
      };

      if (formData.invoiceFile) {
        const reader = new FileReader();
        reader.onloadend = async () => {
          transaction.invoiceUrl = reader.result as string;
          await addTransaction(transaction);
          await loadData();
          resetForm();
          setShowAddModal(false);
        };
        reader.readAsDataURL(formData.invoiceFile);
      } else {
        await addTransaction(transaction);
        await loadData();
        resetForm();
        setShowAddModal(false);
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('Failed to add transaction. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    try {
      await deleteTransaction(id);
      await loadData();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Failed to delete transaction.');
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'income',
      category: '',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      invoiceFile: null,
    });
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesFilter = filter === 'all' || t.type === filter;
    const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         t.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const formatCurrency = (amount: number) => {
    return `৳${amount.toLocaleString('en-BD')}`;
  };

  const formatDate = (timestamp: Timestamp) => {
    return timestamp.toDate().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const categoryBreakdownArray = Object.entries(stats.categoryBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const totalCategoryExpenses = Object.values(stats.categoryBreakdown).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black py-16 md:py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Invoice & Expense Manager
              </h1>
              <p className="text-gray-400 text-sm md:text-base">
                Manage club finances, upload invoices, and track expenses
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Add Transaction
            </button>
          </div>
        </motion.div>

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-5 md:p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs text-white/70 font-medium">Total</span>
              </div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                {loading ? '...' : formatCurrency(stats.totalRevenue)}
              </div>
              <div className="text-sm text-white/80 mb-1">Total Revenue</div>
              <div className="text-xs text-green-200">All-time income</div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="bg-gradient-to-br from-red-600 to-pink-700 rounded-2xl p-5 md:p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs text-white/70 font-medium">Total</span>
              </div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                {loading ? '...' : formatCurrency(stats.totalExpenses)}
              </div>
              <div className="text-sm text-white/80 mb-1">Total Expenses</div>
              <div className="text-xs text-red-200">All-time spending</div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-5 md:p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  stats.netBalance >= 0 ? 'bg-green-900/30 text-green-300' : 'bg-red-900/30 text-red-300'
                }`}>
                  {stats.netBalance >= 0 ? 'Profit' : 'Loss'}
                </span>
              </div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                {loading ? '...' : formatCurrency(Math.abs(stats.netBalance))}
              </div>
              <div className="text-sm text-white/80 mb-1">Net Balance</div>
              <div className="text-xs text-purple-200">
                {stats.totalRevenue > 0 ? `${((stats.netBalance / stats.totalRevenue) * 100).toFixed(1)}% margin` : 'N/A'}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search & Filter + Category Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="lg:col-span-2">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-5 md:p-6">
              <h2 className="text-lg md:text-xl font-bold text-white mb-4">Search & Filter</h2>
              
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search transactions..."
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => setFilter('all')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      filter === 'all' ? 'bg-cyan-600 text-white' : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    All ({transactions.length})
                  </button>
                  <button 
                    onClick={() => setFilter('income')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      filter === 'income' ? 'bg-green-600 text-white' : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Income ({transactions.filter(t => t.type === 'income').length})
                  </button>
                  <button 
                    onClick={() => setFilter('expense')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      filter === 'expense' ? 'bg-red-600 text-white' : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Expense ({transactions.filter(t => t.type === 'expense').length})
                  </button>
                </div>

                <div className="text-sm text-gray-400">
                  Showing {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-5 md:p-6">
              <h2 className="text-lg md:text-xl font-bold text-white mb-4">Top Expenses</h2>
              
              {categoryBreakdownArray.length > 0 ? (
                <div className="space-y-3">
                  {categoryBreakdownArray.map(([category, amount], index) => (
                    <div key={category}>
                      <div className="flex justify-between text-xs md:text-sm mb-1">
                        <span className="text-gray-300 truncate mr-2">{category}</span>
                        <span className="text-white font-medium whitespace-nowrap">{formatCurrency(amount)}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            index === 0 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                            index === 1 ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                            index === 2 ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                            index === 3 ? 'bg-gradient-to-r from-green-500 to-teal-500' :
                            'bg-gradient-to-r from-yellow-500 to-amber-500'
                          }`}
                          style={{width: `${(amount / totalCategoryExpenses) * 100}%`}}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm text-center py-4">No expense data available</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Transactions Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-5 md:p-6">
            <h2 className="text-lg md:text-xl font-bold text-white mb-4">Transactions</h2>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-400 mt-4 text-sm">Loading transactions...</p>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">No transactions found</p>
                <p className="text-gray-500 text-sm">Add your first transaction to get started</p>
              </div>
            ) : (
              <>
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Date</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Description</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Category</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Type</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Amount</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map(transaction => (
                        <tr key={transaction.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                          <td className="py-3 px-4 text-sm text-gray-300">{formatDate(transaction.date)}</td>
                          <td className="py-3 px-4 text-sm text-white font-medium">{transaction.description}</td>
                          <td className="py-3 px-4 text-sm text-gray-300">{transaction.category}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              transaction.type === 'income' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                              {transaction.type === 'income' ? 'Income' : 'Expense'}
                            </span>
                          </td>
                          <td className={`py-3 px-4 text-sm font-bold text-right ${
                            transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-2">
                              {transaction.invoiceUrl && (
                                <button
                                  onClick={() => window.open(transaction.invoiceUrl, '_blank')}
                                  className="text-cyan-400 hover:text-cyan-300"
                                  title="View Invoice"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(transaction.id!)}
                                className="text-red-400 hover:text-red-300"
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

                <div className="md:hidden space-y-3">
                  {filteredTransactions.map(transaction => (
                    <div key={transaction.id} className="bg-gray-700/30 rounded-xl p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 mr-2">
                          <p className="text-sm text-white font-medium mb-1">{transaction.description}</p>
                          <p className="text-xs text-gray-400">{formatDate(transaction.date)} • {transaction.category}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                          transaction.type === 'income' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {transaction.type === 'income' ? 'Income' : 'Expense'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={`text-lg font-bold ${
                          transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </span>
                        <div className="flex gap-3">
                          {transaction.invoiceUrl && (
                            <button
                              onClick={() => window.open(transaction.invoiceUrl, '_blank')}
                              className="text-cyan-400 text-sm font-medium"
                            >
                              View
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(transaction.id!)}
                            className="text-red-400 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Add Transaction Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Add Transaction</h2>
                <button
                  onClick={() => !submitting && setShowAddModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                  disabled={submitting}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Transaction Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense', category: '' })}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      required
                    >
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  >
                    <option value="">Select a category</option>
                    {CATEGORIES[formData.type].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Amount (৳)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter transaction details..."
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Upload Invoice/Receipt (Optional)</label>
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-cyan-500 transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={(e) => setFormData({ ...formData, invoiceFile: e.target.files?.[0] || null })}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="w-10 h-10 text-gray-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-400 mb-1">
                        {formData.invoiceFile ? formData.invoiceFile.name : 'Click to upload PDF, PNG, or JPG'}
                      </p>
                      <p className="text-xs text-gray-500">Max size: 10MB</p>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => !submitting && setShowAddModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white font-medium rounded-lg transition-all"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5" />
                        Add Transaction
                      </>
                    )}
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

export default function InvoicesPage() {
  return (
    <AdminProtectedRoute>
      <InvoicesPageContent />
    </AdminProtectedRoute>
  );
}
