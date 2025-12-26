import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { propertyAPI, homeownerAPI, unitAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';

const PropertiesPage = () => {
  const { user, isPropertyManager } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [unitCounts, setUnitCounts] = useState({});

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const data = await propertyAPI.getAll();
      setProperties(data.properties);
      
      // Load unit counts for each property
      const counts = {};
      await Promise.all(
        data.properties.map(async (property) => {
          try {
            const unitsData = await unitAPI.getPropertyUnits(property._id);
            counts[property._id] = unitsData.units.length;
          } catch (error) {
            counts[property._id] = 0;
          }
        })
      );
      setUnitCounts(counts);
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteHomeowner = (property) => {
    setSelectedProperty(property);
    setShowInviteModal(true);
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
              {isPropertyManager ? 'My Properties' : 'My Properties'}
            </h1>
            <p className="text-gray-600">
              {isPropertyManager 
                ? 'Manage and monitor all your properties' 
                : 'View your properties and details'}
            </p>
          </div>
          {isPropertyManager && (
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
              {isPropertyManager 
                ? 'Get started by adding your first property' 
                : 'No properties assigned to you yet'}
            </p>
            {isPropertyManager && (
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
                className="card hover:scale-105 transition-transform"
              >
                {/* Status Badge */}
                <div className="mb-4 flex justify-between items-start">
                  <div>
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
                  {isPropertyManager && (
                    <span
                      className={`badge ${
                        property.homeownerInvitationStatus === 'accepted'
                          ? 'badge-success'
                          : property.homeownerInvitationStatus === 'pending'
                          ? 'badge-warning'
                          : 'badge-secondary'
                      }`}
                    >
                      {property.homeownerInvitationStatus === 'accepted' 
                        ? '✓ Owner Assigned' 
                        : property.homeownerInvitationStatus === 'pending'
                        ? '⏳ Pending Invite'
                        : '👤 No Owner'}
                    </span>
                  )}
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

                {/* Homeowner Info */}
                {property.homeowner && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-600 font-medium mb-1">Property Owner:</p>
                    <p className="text-sm text-blue-900 font-semibold">{property.homeowner.name}</p>
                    <p className="text-xs text-blue-700">{property.homeowner.email}</p>
                  </div>
                )}

                {/* Rent and Details */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-100 mb-4">
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

                {/* Unit Count Badge */}
                <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-purple-600 font-medium">Units in Building</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {unitCounts[property._id] || 0}
                      </p>
                    </div>
                    <div className="text-3xl">🏢</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  {/* Manage Units Button - Always visible */}
                  <button
                    onClick={() => navigate(`/properties/${property._id}/units`)}
                    className="w-full btn btn-primary text-sm"
                  >
                    🏢 Manage Units ({unitCounts[property._id] || 0})
                  </button>

                  {/* Invite/Resend Homeowner Button */}
                  {isPropertyManager && !property.homeowner && (
                    <button
                      onClick={() => handleInviteHomeowner(property)}
                      className="w-full btn btn-secondary text-sm"
                    >
                      Invite Homeowner
                    </button>
                  )}
                  {isPropertyManager && property.homeownerInvitationStatus === 'pending' && (
                    <button
                      onClick={() => handleInviteHomeowner(property)}
                      className="w-full btn btn-secondary text-sm"
                    >
                      Resend Invitation
                    </button>
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

      {/* Invite Homeowner Modal */}
      {showInviteModal && selectedProperty && (
        <InviteHomeownerModal
          property={selectedProperty}
          onClose={() => {
            setShowInviteModal(false);
            setSelectedProperty(null);
          }}
          onSuccess={() => {
            setShowInviteModal(false);
            setSelectedProperty(null);
            loadProperties();
          }}
        />
      )}
    </div>
  );
};

// Add Property Modal Component (NO homeowner selection)
const AddPropertyModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
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

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
              {error}
            </div>
          )}

          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-blue-800 text-sm">
              💡 After creating the property, you can add units and invite a homeowner to manage it.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                <label className="label">Bedrooms (optional)</label>
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
                <label className="label">Bathrooms (optional)</label>
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
              <p className="text-xs text-gray-500 mt-1">
                This is the base rent. Individual units can have different rates.
              </p>
            </div>

            <div>
              <label className="label">Description (Optional)</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input"
                rows="3"
                placeholder="Modern building with multiple units, parking available..."
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
                {loading ? 'Creating...' : 'Create Property'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Invite Homeowner Modal Component
const InviteHomeownerModal = ({ property, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: property.pendingHomeownerName || '',
    email: property.pendingHomeownerEmail || '',
    phone: property.pendingHomeownerPhone || '',
    address: property.pendingHomeownerAddress || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [invitationLink, setInvitationLink] = useState('');

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
      const result = await homeownerAPI.inviteForProperty(property._id, formData);
      
      // Check if it's an existing homeowner (auto-assigned)
      if (result.isExistingHomeowner) {
        alert(`Property successfully assigned to ${result.homeowner.name}!`);
        onSuccess();
      } else {
        // New homeowner - show invitation link
        setInvitationLink(result.invitationLink);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send invitation');
      setLoading(false);
    }
  };

  if (invitationLink) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full p-6">
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">
            ✅ Invitation Sent!
          </h2>
          <p className="text-gray-600 mb-4">
            An email has been sent to the homeowner with the invitation link. You can also copy and share it directly:
          </p>
          <div className="bg-gray-50 p-4 rounded-xl mb-6 break-all">
            <code className="text-sm text-primary-600">{invitationLink}</code>
          </div>
          <button onClick={onSuccess} className="w-full btn btn-primary">
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-display font-bold text-gray-900">
              Invite Homeowner
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-blue-800 font-medium mb-1">Property:</p>
            <p className="text-blue-900 font-bold">{property.address}</p>
            <p className="text-blue-700 text-sm">{property.city}, {property.state}</p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input"
                placeholder="john@example.com"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Invitation will be sent to this email
              </p>
            </div>

            <div>
              <label className="label">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input"
                placeholder="+234 800 000 0000"
                required
              />
            </div>

            <div>
              <label className="label">Address (Optional)</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="input"
                placeholder="Lagos, Nigeria"
              />
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
                {loading ? 'Sending Invitation...' : 'Send Invitation'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PropertiesPage;