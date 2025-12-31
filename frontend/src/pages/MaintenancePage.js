import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { maintenanceAPI, leaseAPI } from '../services/api';
import { motion } from 'framer-motion';
import Navigation from '../components/Navigation';

const MaintenancePage = () => {
  const { user, isTenant } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadRequests = async () => {
    try {
      const data = await maintenanceAPI.getAll();
      setRequests(data.requests);
    } catch (error) {
      console.error('Error loading maintenance requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-700';
      case 'medium': return 'bg-blue-100 text-blue-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'urgent': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {isTenant ? 'My Maintenance Requests' : 'Maintenance Requests'}
            </h1>
            <p className="text-gray-600">
              {isTenant ? 'Report and track issues with your property' : 'View and manage tenant maintenance requests'}
            </p>
          </div>
          {isTenant && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-medium hover:shadow-lg transition-all"
            >
              + Report Issue
            </motion.button>
          )}
        </motion.div>

        {/* Requests List */}
        {requests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card text-center py-12"
          >
            <div className="text-6xl mb-4">🔧</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No Maintenance Requests
            </h3>
            <p className="text-gray-600 mb-6">
              {isTenant ? 'Everything is working perfectly!' : 'No pending requests from tenants'}
            </p>
            {isTenant && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-medium hover:shadow-lg transition-all"
              >
                Report an Issue
              </motion.button>
            )}
          </motion.div>
        ) : (
          <div className="space-y-4">
            {requests.map((request, index) => (
              <motion.div
                key={request._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <h3 className="text-xl font-bold text-gray-900">
                        {request.title}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                        {request.status.replace('_', ' ')}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                        {request.priority} priority
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      📍 {request.property?.address}, {request.property?.city}
                    </p>
                    <p className="text-gray-700 mb-3">{request.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Category: <span className="font-medium capitalize">{request.category}</span></span>
                      <span>•</span>
                      <span>Submitted: {new Date(request.createdAt).toLocaleDateString()}</span>
                      {request.resolvedAt && (
                        <>
                          <span>•</span>
                          <span className="text-green-600 font-medium">Resolved: {new Date(request.resolvedAt).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>

                    {/* Resolution Notification */}
                    {request.status === 'resolved' && request.resolutionNotes && (
                      <div className="mt-3 p-4 bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-300 rounded-xl">
                        <div className="flex items-start gap-2">
                          <span className="text-2xl">✅</span>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-green-800 mb-1">Issue Resolved!</p>
                            <p className="text-sm text-green-700">{request.resolutionNotes}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  {!isTenant && request.status !== 'resolved' && request.status !== 'cancelled' && (
                    <UpdateStatusButton request={request} onUpdate={loadRequests} />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Request Modal */}
      {showCreateModal && (
        <CreateRequestModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadRequests();
          }}
        />
      )}
    </div>
  );
};

// Update Status Button Component
const UpdateStatusButton = ({ request, onUpdate }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [updating, setUpdating] = useState(false);

  const updateStatus = async (status, resolutionNotes = '') => {
    setUpdating(true);
    try {
      await maintenanceAPI.updateStatus(request._id, { status, resolutionNotes });
      onUpdate();
      setShowMenu(false);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleResolve = () => {
    const notes = prompt('Enter resolution notes (optional):');
    updateStatus('resolved', notes || 'Issue resolved');
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowMenu(!showMenu)}
        disabled={updating}
        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-medium hover:shadow-lg transition-all text-sm"
      >
        {updating ? 'Updating...' : 'Update Status'}
      </motion.button>
      {showMenu && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 z-10 overflow-hidden"
        >
          {request.status === 'submitted' && (
            <button
              onClick={() => updateStatus('in_progress')}
              className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors text-sm font-medium text-blue-700 border-b border-gray-100"
            >
              🔄 Mark In Progress
            </button>
          )}
          <button
            onClick={handleResolve}
            className="w-full text-left px-4 py-3 hover:bg-green-50 transition-colors text-sm font-medium text-green-700"
          >
            ✅ Mark as Resolved
          </button>
        </motion.div>
      )}
    </div>
  );
};

// Create Request Modal - FIXED TO ONLY SHOW TENANT'S LEASED PROPERTY
const CreateRequestModal = ({ onClose, onSuccess }) => {
  const [leases, setLeases] = useState([]);
  const [formData, setFormData] = useState({
    property: '',
    title: '',
    description: '',
    category: 'other',
    priority: 'medium',
  });
  const [loading, setLoading] = useState(false);
  const [loadingLeases, setLoadingLeases] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUserLeases();
  }, []);

  // ✅ FIXED: Only load properties where user has an active lease
  const loadUserLeases = async () => {
    try {
      const data = await leaseAPI.getAll();
      // Filter to only active leases
      const activeLeases = (data.leases || []).filter(lease => lease.status === 'active');
      setLeases(activeLeases);
      
      // Auto-select if only one active lease
      if (activeLeases.length === 1) {
        setFormData(prev => ({
          ...prev,
          property: activeLeases[0].property._id
        }));
      }
    } catch (err) {
      console.error('Error loading leases:', err);
      setError('Failed to load your leased properties');
    } finally {
      setLoadingLeases(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await maintenanceAPI.create(formData);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Report Maintenance Issue
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
              {error}
            </div>
          )}

          {/* Show warning if no active leases */}
          {!loadingLeases && leases.length === 0 && (
            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-amber-800 font-medium mb-2">⚠️ No Active Lease Found</p>
              <p className="text-sm text-amber-700">
                You don't have any active leases. Please apply for a property first before reporting maintenance issues.
              </p>
              <button
                onClick={() => window.location.href = '/browse-properties'}
                className="mt-3 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-sm font-medium hover:shadow-lg transition-all"
              >
                Browse Properties
              </button>
            </div>
          )}

          {loadingLeases ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your leased properties...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Your Leased Property</label>
                <select
                  name="property"
                  value={formData.property}
                  onChange={handleChange}
                  className="input"
                  required
                  disabled={leases.length === 0}
                >
                  <option value="">Select property</option>
                  {leases.map((lease) => (
                    <option key={lease._id} value={lease.property._id}>
                      {lease.property.address}, {lease.property.city}
                      {lease.unit && ` - Unit ${lease.unit.unitNumber}`}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  ✅ Only showing properties where you have an active lease
                </p>
              </div>

              <div>
                <label className="label">Issue Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g., Leaking faucet in kitchen"
                  maxLength="100"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="input"
                    required
                  >
                    <option value="plumbing">Plumbing</option>
                    <option value="electrical">Electrical</option>
                    <option value="structural">Structural</option>
                    <option value="appliance">Appliance</option>
                    <option value="hvac">HVAC</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="label">Priority</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="input"
                    required
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="input"
                  rows="4"
                  placeholder="Describe the issue in detail..."
                  required
                ></textarea>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-white border-2 border-gray-900 text-gray-900 rounded-full font-medium hover:bg-gray-50 transition-all"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || leases.length === 0}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default MaintenancePage;