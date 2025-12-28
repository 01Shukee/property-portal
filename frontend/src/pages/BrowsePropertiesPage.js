import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { unitAPI, applicationAPI } from '../services/api';
import Navigation from '../components/Navigation';

const BrowsePropertiesPage = () => {
  const { user } = useAuth();
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);

  useEffect(() => {
    loadUnits();
  }, []);

  const loadUnits = async () => {
    try {
      const data = await unitAPI.getBrowseUnits();
      setUnits(data.units);
    } catch (error) {
      console.error('Error loading units:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (unit) => {
    setSelectedUnit(unit);
    setShowApplicationModal(true);
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
          <p className="text-gray-600">Loading available units...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">
            Available Units
          </h1>
          <p className="text-gray-600">
            Find your perfect home from {units.length} available units
          </p>
        </div>

        {/* Units Grid */}
        {units.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No Units Available
            </h3>
            <p className="text-gray-600">
              Check back later for new listings
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {units.map((unit) => (
              <div
                key={unit._id}
                className="card hover:shadow-2xl transition-all"
              >
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
                  <span className="badge badge-success">Available</span>
                </div>

                {/* Property & Manager Info */}
                <div className="mb-4 space-y-2">
                  {/* Building Info */}
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-600 font-medium mb-1">Building:</p>
                    <p className="text-sm font-bold text-blue-900">{unit.property.address}</p>
                    <p className="text-xs text-blue-700">
                      📍 {unit.property.city}, {unit.property.state}
                    </p>
                    {unit.property.propertyType && (
                      <p className="text-xs text-blue-600 mt-1 capitalize">
                        Type: {unit.property.propertyType}
                      </p>
                    )}
                  </div>

                  {/* Property Manager Contact */}
                  {unit.property.propertyManager && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-xs text-green-600 font-medium mb-1">Property Manager:</p>
                      <p className="text-sm font-bold text-green-900">
                        {unit.property.propertyManager.name}
                      </p>
                      <div className="mt-2 space-y-1">
                        {unit.property.propertyManager.email && (
                          <a
                            href={`mailto:${unit.property.propertyManager.email}`}
                            className="text-xs text-green-700 hover:text-green-900 flex items-center gap-1 hover:underline"
                          >
                            📧 {unit.property.propertyManager.email}
                          </a>
                        )}
                        {unit.property.propertyManager.phone && (
                          <a
                            href={`tel:${unit.property.propertyManager.phone}`}
                            className="text-xs text-green-700 hover:text-green-900 flex items-center gap-1 hover:underline"
                          >
                            📞 {unit.property.propertyManager.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Unit Details */}
                {(unit.bedrooms > 0 || unit.bathrooms > 0) && (
                  <div className="mb-3 flex items-center gap-4 text-sm text-gray-600">
                    {unit.bedrooms > 0 && (
                      <div className="flex items-center gap-1">
                        <span>🛏️</span>
                        <span>{unit.bedrooms} Bed</span>
                      </div>
                    )}
                    {unit.bathrooms > 0 && (
                      <div className="flex items-center gap-1">
                        <span>🚿</span>
                        <span>{unit.bathrooms} Bath</span>
                      </div>
                    )}
                    {unit.squareFeet && (
                      <div className="flex items-center gap-1">
                        <span>📏</span>
                        <span>{unit.squareFeet} sq ft</span>
                      </div>
                    )}
                  </div>
                )}

                {unit.description && (
                  <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                    {unit.description}
                  </p>
                )}

                {/* Features */}
                {unit.features && unit.features.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-600 mb-2">Features:</p>
                    <div className="flex flex-wrap gap-2">
                      {unit.features.slice(0, 3).map((feature, idx) => (
                        <span key={idx} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                          {feature}
                        </span>
                      ))}
                      {unit.features.length > 3 && (
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                          +{unit.features.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Rent */}
                <div className="pt-4 border-t border-gray-200 mb-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Monthly Rent</p>
                      <p className="text-2xl font-bold text-primary-600">
                        ₦{(unit.rentAmount / 12).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Annual</p>
                      <p className="text-sm font-medium text-gray-700">
                        ₦{unit.rentAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Apply Button */}
                <button
                  onClick={() => handleApply(unit)}
                  className="w-full btn btn-primary"
                >
                  Apply Now
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Application Modal */}
      {showApplicationModal && selectedUnit && (
        <ApplicationModal
          unit={selectedUnit}
          onClose={() => {
            setShowApplicationModal(false);
            setSelectedUnit(null);
          }}
          onSuccess={() => {
            setShowApplicationModal(false);
            setSelectedUnit(null);
            alert('Application submitted successfully!');
          }}
        />
      )}
    </div>
  );
};

// Application Modal Component
const ApplicationModal = ({ unit, onClose, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    propertyId: unit.property._id,
    unitId: unit._id,
    moveInDate: '',
    leaseDuration: 12,
    employment: {
      status: 'employed',
      company: '',
      position: '',
      monthlyIncome: ''
    },
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    },
    previousLandlord: {
      name: '',
      phone: '',
      address: ''
    },
    numberOfOccupants: 1,
    hasPets: false,
    petDetails: '',
    additionalNotes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e, section = null) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;

    if (section) {
      setFormData({
        ...formData,
        [section]: {
          ...formData[section],
          [name]: val
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: val
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await applicationAPI.submit(formData);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application');
      setLoading(false);
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full my-8">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-display font-bold text-gray-900">
                Apply to Unit {unit.unitNumber}
              </h2>
              <p className="text-sm text-gray-600">{unit.property.address}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Progress Steps */}
          <div className="mb-6 flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    currentStep >= step
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step}
                </div>
                {step < 4 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      currentStep > step ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Lease Details */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Lease Details</h3>
                
                <div>
                  <label className="label">Desired Move-in Date</label>
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
                  <label className="label">Lease Duration</label>
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

                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Monthly Rent:</strong> ₦{(unit.rentAmount / 12).toLocaleString()}
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    <strong>Annual Rent:</strong> ₦{unit.rentAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Employment Info */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Employment Information</h3>
                
                <div>
                  <label className="label">Employment Status</label>
                  <select
                    name="status"
                    value={formData.employment.status}
                    onChange={(e) => handleChange(e, 'employment')}
                    className="input"
                    required
                  >
                    <option value="employed">Employed</option>
                    <option value="self_employed">Self-Employed</option>
                    <option value="unemployed">Unemployed</option>
                    <option value="student">Student</option>
                    <option value="retired">Retired</option>
                  </select>
                </div>

                {(formData.employment.status === 'employed' || formData.employment.status === 'self_employed') && (
                  <>
                    <div>
                      <label className="label">Company Name</label>
                      <input
                        type="text"
                        name="company"
                        value={formData.employment.company}
                        onChange={(e) => handleChange(e, 'employment')}
                        className="input"
                        placeholder="ABC Corporation"
                      />
                    </div>

                    <div>
                      <label className="label">Position</label>
                      <input
                        type="text"
                        name="position"
                        value={formData.employment.position}
                        onChange={(e) => handleChange(e, 'employment')}
                        className="input"
                        placeholder="Software Engineer"
                      />
                    </div>

                    <div>
                      <label className="label">Monthly Income (₦)</label>
                      <input
                        type="number"
                        name="monthlyIncome"
                        value={formData.employment.monthlyIncome}
                        onChange={(e) => handleChange(e, 'employment')}
                        className="input"
                        placeholder="500000"
                        min="0"
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 3: Contacts */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Emergency Contact</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="label">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.emergencyContact.name}
                        onChange={(e) => handleChange(e, 'emergencyContact')}
                        className="input"
                        placeholder="Jane Doe"
                        required
                      />
                    </div>

                    <div>
                      <label className="label">Relationship</label>
                      <input
                        type="text"
                        name="relationship"
                        value={formData.emergencyContact.relationship}
                        onChange={(e) => handleChange(e, 'emergencyContact')}
                        className="input"
                        placeholder="Sister"
                      />
                    </div>

                    <div>
                      <label className="label">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.emergencyContact.phone}
                        onChange={(e) => handleChange(e, 'emergencyContact')}
                        className="input"
                        placeholder="+234 800 000 0000"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Previous Landlord (Optional)</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="label">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.previousLandlord.name}
                        onChange={(e) => handleChange(e, 'previousLandlord')}
                        className="input"
                        placeholder="Mr. Smith"
                      />
                    </div>

                    <div>
                      <label className="label">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.previousLandlord.phone}
                        onChange={(e) => handleChange(e, 'previousLandlord')}
                        className="input"
                        placeholder="+234 800 000 0000"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Additional Info */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Additional Information</h3>
                
                <div>
                  <label className="label">Number of Occupants</label>
                  <input
                    type="number"
                    name="numberOfOccupants"
                    value={formData.numberOfOccupants}
                    onChange={handleChange}
                    className="input"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="hasPets"
                      checked={formData.hasPets}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium text-gray-700">I have pets</span>
                  </label>
                </div>

                {formData.hasPets && (
                  <div>
                    <label className="label">Pet Details</label>
                    <textarea
                      name="petDetails"
                      value={formData.petDetails}
                      onChange={handleChange}
                      className="input"
                      rows="3"
                      placeholder="Dog, Golden Retriever, 2 years old..."
                      required
                    ></textarea>
                  </div>
                )}

                <div>
                  <label className="label">Additional Notes (Optional)</label>
                  <textarea
                    name="additionalNotes"
                    value={formData.additionalNotes}
                    onChange={handleChange}
                    className="input"
                    rows="3"
                    placeholder="Any additional information you'd like to provide..."
                  ></textarea>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-6 pt-6 border-t border-gray-200">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 btn btn-secondary"
                >
                  Previous
                </button>
              )}
              
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 btn btn-primary"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 btn btn-primary"
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BrowsePropertiesPage;