import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { leaseAPI, maintenanceAPI, paymentAPI } from '../services/api';
import { motion } from 'framer-motion';
import Navigation from '../components/Navigation';
import PropertyTabbedView from '../components/PropertyTabbedView';

const LeasesPage = () => {
  const { user, isTenant, isPropertyManager, isHomeowner } = useAuth();
  const [leases, setLeases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLease, setSelectedLease] = useState(null);
  const [showTerminateModal, setShowTerminateModal] = useState(false);

  useEffect(() => {
    loadLeases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadLeases = async () => {
    try {
      const data = await leaseAPI.getAll();
      setLeases(data.leases);
    } catch (error) {
      console.error('Error loading leases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTerminate = (lease) => {
    setSelectedLease(lease);
    setShowTerminateModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'expired': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'terminated': return 'bg-red-100 text-red-800 border-red-200';
      case 'renewed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDaysRemaining = (endDate) => {
    const days = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leases...</p>
        </div>
      </div>
    );
  }

  // TENANT VIEW
  if (isTenant) {
    const activeLease = leases.find(l => l.status === 'active');

    if (!activeLease) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
          <Navigation />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card text-center py-12"
            >
              <div className="text-6xl mb-4">🏠</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                No Active Lease
              </h3>
              <p className="text-gray-600 mb-6">
                You don't have an active lease yet. Browse properties to apply!
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/browse-properties'}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-medium hover:shadow-lg transition-all"
              >
                Browse Properties
              </motion.button>
            </motion.div>
          </div>
        </div>
      );
    }

    return <TenantLeaseView lease={activeLease} />;
  }

  // PROPERTY MANAGER / HOMEOWNER VIEW
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Lease Agreements
          </h1>
          <p className="text-gray-600">
            Manage all active and past leases
          </p>
        </motion.div>

        {/* Leases List */}
        {leases.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card text-center py-12"
          >
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No Leases Yet
            </h3>
            <p className="text-gray-600">
              No active leases at the moment
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {leases.map((lease, index) => {
              const daysRemaining = getDaysRemaining(lease.endDate);
              const isExpiringSoon = daysRemaining > 0 && daysRemaining <= 30;

              return (
                <motion.div
                  key={lease._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                    <div className="flex-1 mb-4 md:mb-0">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <h3 className="text-xl font-bold text-gray-900">
                          {lease.property?.address}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(lease.status)}`}>
                          {lease.status}
                        </span>
                        {isExpiringSoon && lease.status === 'active' && (
                          <span className="px-3 py-1 bg-amber-100 text-amber-800 border border-amber-200 rounded-full text-xs font-medium">
                            ⏰ Expiring Soon
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3">
                        📍 {lease.property?.city}, {lease.property?.state}
                      </p>

                      {lease.tenant && (
                        <div className="mb-3 p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                          <p className="text-sm font-medium text-gray-900">
                            👤 Tenant: {lease.tenant.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            📧 {lease.tenant.email} | 📱 {lease.tenant.phone}
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                        <div>
                          <p className="text-gray-500">Start Date</p>
                          <p className="font-medium text-gray-900">
                            {new Date(lease.startDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">End Date</p>
                          <p className="font-medium text-gray-900">
                            {new Date(lease.endDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Monthly Rent</p>
                          <p className="font-medium text-gray-900">
                            ₦{lease.monthlyRent?.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Duration</p>
                          <p className="font-medium text-gray-900">
                            {lease.leaseDuration} months
                          </p>
                        </div>
                      </div>

                      {lease.status === 'active' && daysRemaining > 0 && (
                        <div className={`p-3 rounded-xl border ${isExpiringSoon ? 'bg-gradient-to-br from-amber-50 to-orange-100 border-amber-200' : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'}`}>
                          <p className={`text-sm font-medium ${isExpiringSoon ? 'text-amber-800' : 'text-blue-800'}`}>
                            {daysRemaining} days remaining
                          </p>
                        </div>
                      )}

                      {lease.terminatedAt && (
                        <div className="mt-3 p-3 bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl">
                          <p className="text-sm font-medium text-red-800 mb-1">
                            Terminated on {new Date(lease.terminatedAt).toLocaleDateString()}
                          </p>
                          {lease.terminationReason && (
                            <p className="text-sm text-red-700">Reason: {lease.terminationReason}</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {(isPropertyManager || isHomeowner) && lease.status === 'active' && (
                      <div className="md:ml-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleTerminate(lease)}
                          className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full font-medium hover:shadow-lg transition-all text-sm whitespace-nowrap"
                        >
                          Terminate Lease
                        </motion.button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Terminate Modal */}
      {showTerminateModal && selectedLease && (
        <TerminateLeaseModal
          lease={selectedLease}
          onClose={() => {
            setShowTerminateModal(false);
            setSelectedLease(null);
          }}
          onSuccess={() => {
            setShowTerminateModal(false);
            setSelectedLease(null);
            loadLeases();
          }}
        />
      )}
    </div>
  );
};

// Tenant Lease View
const TenantLeaseView = ({ lease }) => {
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            My Rental 🏠
          </h1>
          <p className="text-gray-600">
            Everything you need in one place
          </p>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <motion.button
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowPaymentModal(true)}
            className="p-6 bg-gradient-to-br from-green-500 to-emerald-600 hover:shadow-xl rounded-2xl transition-all text-left text-white"
          >
            <div className="text-4xl mb-3">💳</div>
            <h4 className="font-bold text-lg mb-1">Pay Rent</h4>
            <p className="text-sm text-green-100">Make a payment quickly</p>
          </motion.button>

          <motion.button
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowMaintenanceModal(true)}
            className="p-6 bg-gradient-to-br from-blue-600 to-purple-600 hover:shadow-xl rounded-2xl transition-all text-left text-white"
          >
            <div className="text-4xl mb-3">🔧</div>
            <h4 className="font-bold text-lg mb-1">Report Issue</h4>
            <p className="text-sm text-blue-100">Submit maintenance request</p>
          </motion.button>
        </div>

        {/* Tabbed Property View */}
        <PropertyTabbedView 
          property={lease.property} 
          lease={lease} 
          isOwnerView={false}
        />
      </div>

      {/* Modals */}
      {showMaintenanceModal && (
        <MaintenanceModal
          lease={lease}
          onClose={() => setShowMaintenanceModal(false)}
        />
      )}

      {showPaymentModal && (
        <PaymentModal
          lease={lease}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  );
};

// Maintenance Modal
const MaintenanceModal = ({ lease, onClose }) => {
  const [formData, setFormData] = useState({
    property: lease.property._id,
    title: '',
    description: '',
    category: 'other',
    priority: 'medium',
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
      await maintenanceAPI.create(formData);
      alert('Maintenance request submitted successfully!');
      onClose();
      window.location.href = '/maintenance';
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request');
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

          <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl">
            <p className="text-blue-800 font-medium">Property:</p>
            <p className="text-blue-900 font-bold">{lease.property.address}</p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-medium hover:shadow-lg transition-all"
              >
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

// Payment Modal
const PaymentModal = ({ lease, onClose }) => {
  const monthlyRent = lease.monthlyRent;
  const sixMonthRent = monthlyRent * 6;
  const oneYearRent = monthlyRent * 12;

  const [paymentOption, setPaymentOption] = useState('6months');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getAmount = () => {
    return paymentOption === '6months' ? sixMonthRent : oneYearRent;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const amount = getAmount();
      const response = await paymentAPI.initiate({
        amount,
        paymentType: 'rent',
        paymentFor: 'rent'
      });

      if (response.paymentUrl) {
        window.location.href = response.paymentUrl;
      } else {
        setError('Payment URL not received. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.error?.message) {
        setError(`Error: ${errorData.error.message}`);
      } else if (errorData?.message) {
        setError(`Error: ${errorData.message}`);
      } else {
        setError('Failed to initiate payment. Please try again.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl max-w-md w-full"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              💳 Pay Rent
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl">
            <p className="text-blue-800 font-medium mb-1">Your Rental</p>
            <p className="text-blue-900 font-bold">{lease.property.address}</p>
            <p className="text-blue-700 text-sm">
              Unit {lease.unit?.unitNumber} • {lease.property.city}
            </p>
            <p className="text-blue-800 text-sm mt-2">
              <strong>Monthly Rent:</strong> ₦{monthlyRent.toLocaleString()}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
              <p className="font-medium mb-1">Payment Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Select Payment Duration</label>
              
              <label
                className="flex items-center p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 mb-3 transition-all"
                style={{
                  borderColor: paymentOption === '6months' ? '#3b82f6' : '#e5e7eb'
                }}
              >
                <input
                  type="radio"
                  name="paymentOption"
                  value="6months"
                  checked={paymentOption === '6months'}
                  onChange={(e) => setPaymentOption(e.target.value)}
                  className="w-5 h-5"
                />
                <div className="ml-3 flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">6 Months</span>
                    <span className="text-xl font-bold text-blue-600">
                      ₦{sixMonthRent.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    ₦{monthlyRent.toLocaleString()} × 6 months
                  </p>
                </div>
              </label>

              <label
                className="flex items-center p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-all"
                style={{
                  borderColor: paymentOption === '1year' ? '#3b82f6' : '#e5e7eb'
                }}
              >
                <input
                  type="radio"
                  name="paymentOption"
                  value="1year"
                  checked={paymentOption === '1year'}
                  onChange={(e) => setPaymentOption(e.target.value)}
                  className="w-5 h-5"
                />
                <div className="ml-3 flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">1 Year</span>
                    <span className="text-xl font-bold text-blue-600">
                      ₦{oneYearRent.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    ₦{monthlyRent.toLocaleString()} × 12 months
                  </p>
                  <span className="inline-block mt-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                    Best Value
                  </span>
                </div>
              </label>
            </div>

            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl">
              <p className="text-sm text-purple-800">
                <strong>💡 Payment Info:</strong> You'll be redirected to Flutterwave to complete your payment securely.
              </p>
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-white border-2 border-gray-900 text-gray-900 rounded-full font-medium hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-medium hover:shadow-lg transition-all"
              >
                {loading ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span>
                    Processing...
                  </>
                ) : (
                  `Pay ₦${getAmount().toLocaleString()}`
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

// Terminate Lease Modal
const TerminateLeaseModal = ({ lease, onClose, onSuccess }) => {
  const [terminationReason, setTerminationReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await leaseAPI.terminate(lease._id, { terminationReason });
      alert('Lease terminated successfully');
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to terminate lease');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl max-w-md w-full"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Terminate Lease
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="mb-6 p-4 bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl">
            <p className="text-red-800 text-sm font-medium mb-2">⚠️ Warning</p>
            <p className="text-red-700 text-sm">
              This will end the lease and mark the property as vacant.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Reason for Termination</label>
              <textarea
                value={terminationReason}
                onChange={(e) => setTerminationReason(e.target.value)}
                className="input"
                rows="4"
                placeholder="Please provide a reason..."
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
                disabled={loading} 
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full font-medium hover:shadow-lg transition-all"
              >
                {loading ? 'Terminating...' : 'Terminate'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default LeasesPage;