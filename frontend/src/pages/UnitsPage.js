import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { unitAPI, propertyAPI, tenantInvitationAPI } from '../services/api';
import Navigation from '../components/Navigation';

const UnitsPage = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { isPropertyManager } = useAuth();
  const [property, setProperty] = useState(null);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Add state for invite modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedUnitForInvite, setSelectedUnitForInvite] = useState(null);

  useEffect(() => {
    loadData();
  }, [propertyId]);

  const loadData = async () => {
    try {
      const [propData, unitsData] = await Promise.all([
        propertyAPI.getById(propertyId),
        unitAPI.getPropertyUnits(propertyId)
      ]);
      setProperty(propData.property);
      setUnits(unitsData.units);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (unit) => {
    setSelectedUnit(unit);
    setShowEditModal(true);
  };

  // Add handler for invite tenant
  const handleInviteTenant = (unit) => {
    setSelectedUnitForInvite(unit);
    setShowInviteModal(true);
  };

  const handleDelete = async (unitId) => {
    if (!window.confirm('Are you sure you want to delete this unit?')) {
      return;
    }

    try {
      await unitAPI.delete(unitId);
      loadData();
      alert('Unit deleted successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete unit');
    }
  };

  // Add handler for cancel reservation
  const handleCancelReservation = async (unitId) => {
    if (!window.confirm('Are you sure you want to cancel this reservation? The unit will become available again.')) {
      return;
    }

    try {
      await unitAPI.update(unitId, { status: 'vacant' });
      loadData();
      alert('Reservation cancelled. Unit is now available.');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to cancel reservation');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'vacant': return 'badge-success';
      case 'occupied': return 'badge-info';
      case 'maintenance': return 'badge-warning';
      case 'reserved': return 'badge-warning'; // Yellow for reserved
      default: return 'badge-secondary';
    }
  };

  const getUnitTypeIcon = (type) => {
    switch (type) {
      case 'apartment': return '🏢';
      case 'studio': return '🏠';
      case 'warehouse': return '🏭';
      case 'office': return '🏢';
      case 'shop': return '🏪';
      default: return '🏘️';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading units...</p>
        </div>
      </div>
    );
  }

  const occupiedUnits = units.filter(u => u.status === 'occupied').length;
  const vacantUnits = units.filter(u => u.status === 'vacant').length;
  const totalRent = units.reduce((sum, u) => sum + (u.rentAmount || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/properties')}
            className="text-primary-600 hover:text-primary-700 font-medium mb-4"
          >
            ← Back to Properties
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">
                {property?.address}
              </h1>
              <p className="text-lg text-gray-600">
                📍 {property?.city}, {property?.state}
              </p>
            </div>
            {isPropertyManager && (
              <button
                onClick={() => setShowAddModal(true)}
                className="btn btn-primary"
              >
                + Add Unit
              </button>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <p className="text-blue-100 text-sm mb-1">Total Units</p>
            <p className="text-3xl font-bold">{units.length}</p>
          </div>
          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
            <p className="text-green-100 text-sm mb-1">Occupied</p>
            <p className="text-3xl font-bold">{occupiedUnits}</p>
          </div>
          <div className="card bg-gradient-to-br from-amber-500 to-amber-600 text-white">
            <p className="text-amber-100 text-sm mb-1">Vacant</p>
            <p className="text-3xl font-bold">{vacantUnits}</p>
          </div>
          <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <p className="text-purple-100 text-sm mb-1">Total Annual Rent</p>
            <p className="text-2xl font-bold">₦{totalRent.toLocaleString()}</p>
          </div>
        </div>

        {/* Units Grid */}
        {units.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">🏢</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No Units Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Add units to this property to start managing tenants
            </p>
            {isPropertyManager && (
              <button
                onClick={() => setShowAddModal(true)}
                className="btn btn-primary"
              >
                Add Your First Unit
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {units.map((unit) => (
              <div key={unit._id} className="card hover:shadow-xl transition-shadow">
                {/* Unit Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{getUnitTypeIcon(unit.unitType)}</div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Unit {unit.unitNumber}
                      </h3>
                      <p className="text-sm text-gray-600 capitalize">{unit.unitType}</p>
                    </div>
                  </div>
                  <span className={`badge ${getStatusColor(unit.status)}`}>
                    {unit.status === 'reserved' ? '⏳ Reserved' : unit.status}
                  </span>
                </div>

                {/* Reservation Info */}
                {unit.status === 'reserved' && (
                  <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-600 font-medium mb-1">⏳ Reservation Status:</p>
                    <p className="text-sm text-yellow-800">
                      This unit is reserved for an invited tenant. The reservation will expire automatically after 7 days if not accepted.
                    </p>
                  </div>
                )}

                {/* Unit Details */}
                {(unit.bedrooms > 0 || unit.bathrooms > 0) && (
                  <div className="mb-3 text-sm text-gray-600">
                    {unit.bedrooms} Bed • {unit.bathrooms} Bath
                    {unit.squareFeet && ` • ${unit.squareFeet} sq ft`}
                  </div>
                )}

                {unit.description && (
                  <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                    {unit.description}
                  </p>
                )}

                {/* Current Tenant */}
                {unit.currentTenant && (
                  <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-600 mb-1">Current Tenant:</p>
                    <p className="text-sm font-medium text-blue-900">{unit.currentTenant.name}</p>
                    <p className="text-xs text-blue-700">{unit.currentTenant.email}</p>
                  </div>
                )}

                {/* Rent */}
                <div className="pt-3 border-t border-gray-200 mb-4">
                  <p className="text-2xl font-bold text-primary-600">
                    ₦{unit.rentAmount?.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">per year</p>
                </div>

                {/* Actions */}
                {isPropertyManager && (
                  <div className="flex flex-col gap-2">
                    {unit.status === 'vacant' && (
                      <button
                        onClick={() => handleInviteTenant(unit)}
                        className="btn btn-primary text-sm"
                      >
                        Invite Tenant
                      </button>
                    )}
                    
                    {unit.status === 'reserved' && (
                      <button
                        onClick={() => handleCancelReservation(unit._id)}
                        className="btn btn-secondary text-sm bg-yellow-600 hover:bg-yellow-700 text-white"
                      >
                        Cancel Reservation
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleEdit(unit)}
                      className="btn btn-secondary text-sm"
                    >
                      Edit
                    </button>
                    
                    {unit.status !== 'occupied' && unit.status !== 'reserved' && (
                      <button
                        onClick={() => handleDelete(unit._id)}
                        className="btn btn-secondary text-sm text-red-600"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Unit Modal */}
      {showAddModal && (
        <UnitFormModal
          propertyId={propertyId}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            loadData();
          }}
        />
      )}

      {/* Edit Unit Modal */}
      {showEditModal && selectedUnit && (
        <UnitFormModal
          propertyId={propertyId}
          unit={selectedUnit}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUnit(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedUnit(null);
            loadData();
          }}
        />
      )}

      {/* Invite Tenant Modal */}
      {showInviteModal && selectedUnitForInvite && (
        <InviteTenantModal
          unit={selectedUnitForInvite}
          property={property}
          onClose={() => {
            setShowInviteModal(false);
            setSelectedUnitForInvite(null);
          }}
          onSuccess={() => {
            setShowInviteModal(false);
            setSelectedUnitForInvite(null);
            loadData();
          }}
        />
      )}
    </div>
  );
};

// Unit Form Modal Component
const UnitFormModal = ({ propertyId, unit, onClose, onSuccess }) => {
  const isEditing = !!unit;
  const [formData, setFormData] = useState({
    property: propertyId,
    unitNumber: unit?.unitNumber || '',
    unitType: unit?.unitType || 'apartment',
    bedrooms: unit?.bedrooms || 0,
    bathrooms: unit?.bathrooms || 0,
    squareFeet: unit?.squareFeet || '',
    rentAmount: unit?.rentAmount || '',
    status: unit?.status || 'vacant',
    floor: unit?.floor || '',
    description: unit?.description || '',
    features: unit?.features?.join(', ') || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Convert features string to array
      const submitData = {
        ...formData,
        features: formData.features ? formData.features.split(',').map(f => f.trim()).filter(f => f) : []
      };

      if (isEditing) {
        await unitAPI.update(unit._id, submitData);
      } else {
        await unitAPI.create(submitData);
      }
      
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} unit`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-display font-bold text-gray-900">
              {isEditing ? 'Edit Unit' : 'Add New Unit'}
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
            {/* Basic Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">Unit Number *</label>
                <input
                  type="text"
                  name="unitNumber"
                  value={formData.unitNumber}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g., 101, A1, Shop 5"
                  required
                />
              </div>

              <div>
                <label className="label">Unit Type *</label>
                <select
                  name="unitType"
                  value={formData.unitType}
                  onChange={handleChange}
                  className="input"
                  required
                >
                  <option value="apartment">Apartment</option>
                  <option value="studio">Studio</option>
                  <option value="warehouse">Warehouse</option>
                  <option value="office">Office</option>
                  <option value="shop">Shop</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Layout */}
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="label">Bedrooms</label>
                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  className="input"
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
                  min="0"
                />
              </div>

              <div>
                <label className="label">Square Feet</label>
                <input
                  type="number"
                  name="squareFeet"
                  value={formData.squareFeet}
                  onChange={handleChange}
                  className="input"
                  min="0"
                  placeholder="Optional"
                />
              </div>
            </div>

            {/* Financial & Status */}
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="label">Annual Rent (₦) *</label>
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
                <label className="label">Status *</label>
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
                  <option value="reserved">Reserved</option>
                </select>
              </div>

              <div>
                <label className="label">Floor Level</label>
                <input
                  type="number"
                  name="floor"
                  value={formData.floor}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g., 1, 2, 3"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="label">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input"
                rows="3"
                placeholder="Describe this unit..."
              ></textarea>
            </div>

            {/* Features */}
            <div>
              <label className="label">Features (comma-separated)</label>
              <input
                type="text"
                name="features"
                value={formData.features}
                onChange={handleChange}
                className="input"
                placeholder="e.g., Balcony, Parking, Air Conditioning"
              />
              <p className="text-xs text-gray-500 mt-1">
                Separate multiple features with commas
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
                disabled={loading} 
                className="flex-1 btn btn-primary"
              >
                {loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Unit' : 'Create Unit')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Invite Tenant Modal Component
const InviteTenantModal = ({ unit, property, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    moveInDate: '',
    leaseDuration: 12
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [invitationLink, setInvitationLink] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Use the correct API call
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/tenant-invitations/invite/${unit._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send invitation');
      }
      
      setInvitationLink(data.invitationLink);
    } catch (err) {
      setError(err.message || 'Failed to send invitation');
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
            The tenant invitation has been sent. Copy this link and share it with the tenant:
          </p>
          <div className="bg-gray-50 p-4 rounded-xl mb-6 break-all">
            <code className="text-sm text-primary-600">{invitationLink}</code>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            💡 The unit has been marked as "Reserved" until the tenant accepts or the invitation expires (7 days).
          </p>
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
              Invite Tenant to Unit {unit.unitNumber}
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
            <p className="text-blue-800 font-medium mt-3 mb-1">Unit Details:</p>
            <p className="text-blue-900">
              Unit {unit.unitNumber} • {unit.unitType} • ₦{(unit.rentAmount / 12).toLocaleString()}/month
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Tenant Full Name *</label>
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
              <label className="label">Email Address *</label>
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
              <label className="label">Phone Number *</label>
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

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">Move-in Date *</label>
                <input
                  type="date"
                  name="moveInDate"
                  value={formData.moveInDate}
                  onChange={handleChange}
                  className="input"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div>
                <label className="label">Lease Duration *</label>
                <select
                  name="leaseDuration"
                  value={formData.leaseDuration}
                  onChange={handleChange}
                  className="input"
                  required
                >
                  <option value="6">6 Months</option>
                  <option value="12">12 Months (1 Year)</option>
                  <option value="24">24 Months (2 Years)</option>
                  <option value="36">36 Months (3 Years)</option>
                </select>
              </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> The unit will be marked as "Reserved" once you send the invitation. 
                If the tenant doesn't accept within 7 days, the unit will become available again.
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

export default UnitsPage;