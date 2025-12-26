import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { propertyAPI, homeownerAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';

const PropertiesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const data = await propertyAPI.getAll();
      setProperties(data.properties);
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading properties...</p>
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
              {user?.role === 'property_manager' ? 'Properties' : 'My Properties'}
            </h1>
            <p className="text-gray-600">
              {user?.role === 'property_manager' 
                ? 'Manage all properties for your homeowners'
                : 'View your property portfolio'}
            </p>
          </div>
          {/* CORRECTED: Only Property Manager can add */}
          {user?.role === 'property_manager' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary"
            >
              + Add Property
            </button>
          )}
        </div>

        {/* Properties Grid */}
        {properties.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">🏢</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No Properties Yet
            </h3>
            <p className="text-gray-600 mb-6">
              {user?.role === 'property_manager'
                ? 'Get started by adding your first property'
                : 'No properties assigned to you yet'}
            </p>
            {/* CORRECTED: Only Property Manager can add */}
            {user?.role === 'property_manager' && (
              <button
                onClick={() => setShowAddModal(true)}
                className="btn btn-primary"
              >
                Add Your First Property
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <div
                key={property._id}
                className="card hover:scale-105 transition-transform cursor-pointer"
              >
                {/* Owner Info - Show for Property Managers */}
                {user?.role === 'property_manager' && property.homeowner && (
                  <div className="mb-3 pb-3 border-b border-gray-100">
                    <p className="text-xs text-gray-500">Owner:</p>
                    <p className="text-sm font-medium text-gray-700">
                      {property.homeowner.name}
                    </p>
                  </div>
                )}

                {/* Status Badge */}
                <div className="mb-4">
                  <span
                    className={`badge ${
                      property.status === 'vacant'
                        ? 'badge-success'
                        : property.status === 'occupied'
                        ? 'badge-info'
                        : 'badge-warning'
                    }`}
                  >
                    {property.status}
                  </span>
                  <span className="badge badge-info ml-2 capitalize">
                    {property.propertyType}
                  </span>
                </div>

                {/* Property Details */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {property.address}
                </h3>
                <p className="text-gray-600 mb-4">
                  {property.city}, {property.state}
                </p>

                {property.description && (
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                    {property.description}
                  </p>
                )}

                {/* Rent and Details */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-2xl font-bold text-primary-600">
                      ₦{property.rentAmount?.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">per year</p>
                  </div>
                  {property.bedrooms && (
                    <div className="text-sm text-gray-600">
                      {property.bedrooms} beds • {property.bathrooms} baths
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Property Modal */}
      {showAddModal && (
        <AddPropertyModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            loadProperties();
          }}
        />
      )}
    </div>
  );
};

// Add Property Modal Component
const AddPropertyModal = ({ onClose, onSuccess }) => {
  const [homeowners, setHomeowners] = useState([]);
  const [formData, setFormData] = useState({
    homeownerId: '',
    address: '',
    city: '',
    state: '',
    propertyType: 'residential',
    bedrooms: '',
    bathrooms: '',
    description: '',
    rentAmount: '',
    status: 'vacant',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadHomeowners();
  }, []);

  const loadHomeowners = async () => {
    try {
      const data = await homeownerAPI.getAll();
      setHomeowners(data.homeowners.filter(h => h.invitationStatus === 'accepted'));
    } catch (err) {
      console.error('Error loading homeowners:', err);
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
      await propertyAPI.create(formData);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-display font-bold text-gray-900">
              Add New Property
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
              {error}
            </div>
          )}

          {/* No Homeowners Warning */}
          {homeowners.length === 0 && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <p className="text-yellow-800 font-medium mb-2">⚠️ No Active Homeowners</p>
              <p className="text-yellow-700 text-sm">
                You need to invite homeowners before adding properties.
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Homeowner Selection */}
            <div>
              <label className="label">Homeowner *</label>
              <select
                name="homeownerId"
                value={formData.homeownerId}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="">Select homeowner</option>
                {homeowners.map((homeowner) => (
                  <option key={homeowner._id} value={homeowner._id}>
                    {homeowner.name} ({homeowner.email})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Which homeowner owns this property?
              </p>
            </div>

            <div>
              <label className="label">Property Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="input"
                placeholder="123 Main Street"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="input"
                  placeholder="Lagos"
                  required
                />
              </div>
              <div>
                <label className="label">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="input"
                  placeholder="Lagos State"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">Property Type</label>
                <select
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleChange}
                  className="input"
                  required
                >
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>
              <div>
                <label className="label">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="input"
                  required
                >
                  <option value="vacant">Vacant</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Under Maintenance</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">Bedrooms</label>
                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  className="input"
                  placeholder="3"
                  min="0"
                />
              </div>
              <div>
                <label className="label">Bathrooms</label>
                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  className="input"
                  placeholder="2"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="label">Annual Rent Amount (₦)</label>
              <input
                type="number"
                name="rentAmount"
                value={formData.rentAmount}
                onChange={handleChange}
                className="input"
                placeholder="1200000"
                min="0"
                required
              />
            </div>

            <div>
              <label className="label">Description (Optional)</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input"
                rows="3"
                placeholder="Modern 3-bedroom apartment with parking..."
              ></textarea>
            </div>

            {/* Buttons */}
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
                disabled={loading || homeowners.length === 0} 
                className="flex-1 btn btn-primary"
              >
                {loading ? 'Creating...' : 'Create Property'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PropertiesPage;