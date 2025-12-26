import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { announcementAPI, propertyAPI } from '../services/api';
import Navigation from '../components/Navigation';

const AnnouncementsPage = () => {
  const { user, isPropertyManager, isHomeowner } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const data = await announcementAPI.getAll();
      setAnnouncements(data.announcements);
    } catch (error) {
      console.error('Error loading announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'urgent': return 'badge-danger';
      case 'maintenance': return 'badge-warning';
      case 'payment': return 'badge-info';
      default: return 'badge-success';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading announcements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">
              Announcements
            </h1>
            <p className="text-gray-600">
              {isPropertyManager || isHomeowner 
                ? 'Communicate with your tenants' 
                : 'Stay updated with important notices'}
            </p>
          </div>
          {(isPropertyManager || isHomeowner) && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
            >
              + New Announcement
            </button>
          )}
        </div>

        {/* Announcements List */}
        {announcements.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">📢</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No Announcements Yet
            </h3>
            <p className="text-gray-600 mb-6">
              {isPropertyManager || isHomeowner
                ? 'Create your first announcement to inform tenants'
                : 'No announcements from your property manager yet'}
            </p>
            {(isPropertyManager || isHomeowner) && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn btn-primary"
              >
                Create Announcement
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div key={announcement._id} className="card">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {announcement.title}
                      </h3>
                      <span className={`badge ${getTypeColor(announcement.type)}`}>
                        {announcement.type}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3">{announcement.message}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>By: {announcement.createdBy?.name}</span>
                      <span>•</span>
                      <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{announcement.targetProperties?.length} {announcement.targetProperties?.length === 1 ? 'property' : 'properties'}</span>
                    </div>
                    {announcement.targetProperties && announcement.targetProperties.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {announcement.targetProperties.map((property) => (
                          <span key={property._id} className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-700">
                            📍 {property.address}, {property.city}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Announcement Modal */}
      {showCreateModal && (
        <CreateAnnouncementModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadAnnouncements();
          }}
        />
      )}
    </div>
  );
};

// Create Announcement Modal
const CreateAnnouncementModal = ({ onClose, onSuccess }) => {
  const [properties, setProperties] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    targetProperties: [],
    type: 'general',
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

  const handlePropertyToggle = (propertyId) => {
    setFormData((prev) => ({
      ...prev,
      targetProperties: prev.targetProperties.includes(propertyId)
        ? prev.targetProperties.filter((id) => id !== propertyId)
        : [...prev.targetProperties, propertyId],
    }));
  };

  const handleSelectAll = () => {
    setFormData((prev) => ({
      ...prev,
      targetProperties: prev.targetProperties.length === properties.length
        ? []
        : properties.map((p) => p._id),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.targetProperties.length === 0) {
      setError('Please select at least one property');
      setLoading(false);
      return;
    }

    try {
      await announcementAPI.create(formData);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create announcement');
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
              New Announcement
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
              <label className="label">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="input"
                placeholder="Water shutdown scheduled"
                maxLength="100"
                required
              />
            </div>

            <div>
              <label className="label">Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="general">General</option>
                <option value="maintenance">Maintenance</option>
                <option value="payment">Payment</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="label">Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                className="input"
                rows="4"
                placeholder="Enter your announcement details..."
                required
              ></textarea>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="label mb-0">Target Properties</label>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  {formData.targetProperties.length === properties.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="border-2 border-gray-200 rounded-xl p-4 max-h-60 overflow-y-auto">
                {properties.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No properties available</p>
                ) : (
                  <div className="space-y-2">
                    {properties.map((property) => (
                      <label
                        key={property._id}
                        className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.targetProperties.includes(property._id)}
                          onChange={() => handlePropertyToggle(property._id)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-900">
                          {property.address}, {property.city}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {formData.targetProperties.length} {formData.targetProperties.length === 1 ? 'property' : 'properties'} selected
              </p>
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 btn btn-secondary"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading || properties.length === 0} 
                className="flex-1 btn btn-primary"
              >
                {loading ? 'Creating...' : 'Create Announcement'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementsPage;