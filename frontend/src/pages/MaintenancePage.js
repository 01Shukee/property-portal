import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { maintenanceAPI, propertyAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation'; // ADD THIS IMPORT

const MaintenancePage = () => {
  const { user, isTenant } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadRequests();
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
      case 'submitted': return 'badge-warning';
      case 'in_progress': return 'badge-info';
      case 'resolved': return 'badge-success';
      case 'cancelled': return 'badge-danger';
      default: return 'badge-info';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'text-gray-600';
      case 'medium': return 'text-blue-600';
      case 'high': return 'text-orange-600';
      case 'urgent': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Use shared Navigation component */}
      <Navigation />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">
              {isTenant ? 'My Maintenance Requests' : 'Maintenance Requests'}
            </h1>
            <p className="text-gray-600">
              {isTenant ? 'Report and track issues with your property' : 'View and manage tenant maintenance requests'}
            </p>
          </div>
          {isTenant && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
            >
              + Report Issue
            </button>
          )}
        </div>

        {/* Requests List */}
        {requests.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">🔧</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No Maintenance Requests
            </h3>
            <p className="text-gray-600 mb-6">
              {isTenant ? 'Everything is working perfectly!' : 'No pending requests from tenants'}
            </p>
            {isTenant && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn btn-primary"
              >
                Report an Issue
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request._id} className="card hover:shadow-xl transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {request.title}
                      </h3>
                      <span className={`badge ${getStatusColor(request.status)}`}>
                        {request.status.replace('_', ' ')}
                      </span>
                      <span className={`badge ${getPriorityColor(request.priority)}`}>
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

                    {/* TENANT SEES RESOLUTION NOTIFICATION */}
                    {request.status === 'resolved' && request.resolutionNotes && (
                      <div className="mt-3 p-4 bg-green-50 border-2 border-green-300 rounded-lg">
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
              </div>
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

// Update Status Button Component (for managers/owners)
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
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="btn btn-secondary text-sm"
        disabled={updating}
      >
        {updating ? 'Updating...' : 'Update Status'}
      </button>
      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
          {request.status === 'submitted' && (
            <button
              onClick={() => updateStatus('in_progress')}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors text-sm"
            >
              Mark In Progress
            </button>
          )}
          <button
            onClick={handleResolve}
            className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors text-sm text-green-600"
          >
            Mark as Resolved
          </button>
        </div>
      )}
    </div>
  );
};

// Create Request Modal Component
const CreateRequestModal = ({ onClose, onSuccess }) => {
  const [properties, setProperties] = useState([]);
  const [formData, setFormData] = useState({
    property: '',
    title: '',
    description: '',
    category: 'other',
    priority: 'medium',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const data = await propertyAPI.getAll();
      setProperties(data.properties || []);
    } catch (err) {
      console.error('Error loading properties:', err);
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
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-display font-bold text-gray-900">
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Property</label>
              <select
                name="property"
                value={formData.property}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="">Select property</option>
                {properties.map((property) => (
                  <option key={property._id} value={property._id}>
                    {property.address}, {property.city}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Note: In production, this would be auto-filled with your rented property
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
                className="flex-1 btn btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" disabled={loading} className="flex-1 btn btn-primary">
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;