import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { paymentAPI, leaseAPI } from '../services/api';
import { motion } from 'framer-motion';
import Navigation from '../components/Navigation';

const PaymentsPage = () => {
  const { user, isTenant } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    loadPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPayments = async () => {
    try {
      const data = await paymentAPI.getAll();
      setPayments(data.payments);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'successful': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentTypeIcon = (type) => {
    switch (type) {
      case 'rent': return '🏠';
      case 'deposit': return '💰';
      case 'maintenance': return '🔧';
      case 'utilities': return '⚡';
      default: return '💳';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payments...</p>
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
              {isTenant ? 'My Payments' : 'Payment History'}
            </h1>
            <p className="text-gray-600">
              {isTenant 
                ? 'View and manage your rent payments' 
                : 'Track all payment transactions'}
            </p>
          </div>
          {isTenant && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowPaymentModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-medium hover:shadow-lg transition-all"
            >
              💳 Make Payment
            </motion.button>
          )}
        </motion.div>

        {/* Payments List */}
        {payments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card text-center py-12"
          >
            <div className="text-6xl mb-4">💳</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No Payments Yet
            </h3>
            <p className="text-gray-600 mb-6">
              {isTenant 
                ? 'Make your first payment to get started' 
                : 'No payment records available'}
            </p>
            {isTenant && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowPaymentModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-medium hover:shadow-lg transition-all"
              >
                Make Payment
              </motion.button>
            )}
          </motion.div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment, index) => (
              <motion.div
                key={payment._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1 mb-4 md:mb-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl">{getPaymentTypeIcon(payment.paymentType)}</span>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 capitalize">
                          {payment.paymentType} Payment
                        </h3>
                        <p className="text-sm text-gray-600">
                          📍 {payment.property?.address}, {payment.property?.city}
                        </p>
                      </div>
                    </div>
                    
                    {payment.description && (
                      <p className="text-gray-700 mb-2">{payment.description}</p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                      <span>Receipt: {payment.receiptNumber}</span>
                      <span>•</span>
                      <span>{new Date(payment.createdAt).toLocaleDateString()}</span>
                      {payment.paidAt && (
                        <>
                          <span>•</span>
                          <span>Paid: {new Date(payment.paidAt).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                    
                    {!isTenant && payment.tenant && (
                      <div className="mt-2 text-sm text-gray-600">
                        👤 Tenant: {payment.tenant.name} ({payment.tenant.email})
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      ₦{payment.amount?.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 capitalize">
                      {payment.paymentMethod || 'Card'}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Make Payment Modal */}
      {showPaymentModal && (
        <MakePaymentModal
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => {
            setShowPaymentModal(false);
            loadPayments();
          }}
        />
      )}
    </div>
  );
};

// Make Payment Modal Component - FIXED TO ONLY SHOW TENANT'S LEASED PROPERTIES
const MakePaymentModal = ({ onClose, onSuccess }) => {
  const [leases, setLeases] = useState([]);
  const [formData, setFormData] = useState({
    propertyId: '',
    amount: '',
    paymentType: 'rent',
    description: '',
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
        const lease = activeLeases[0];
        setFormData(prev => ({
          ...prev,
          propertyId: lease.property._id,
          amount: lease.property.rentAmount || (lease.monthlyRent * 12) || ''
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
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Auto-fill amount when property is selected
    if (name === 'propertyId') {
      const selectedLease = leases.find(l => l.property._id === value);
      if (selectedLease && formData.paymentType === 'rent') {
        setFormData(prev => ({
          ...prev,
          amount: selectedLease.property.rentAmount || (selectedLease.monthlyRent * 12) || ''
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await paymentAPI.initialize(formData);
      
      // Redirect to Flutterwave payment page
      if (result.paymentLink) {
        window.location.href = result.paymentLink;
      } else {
        setError('Failed to get payment link');
        setLoading(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initialize payment');
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
              Make Payment
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
                You don't have any active leases. Please apply for a property first before making payments.
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
                  name="propertyId"
                  value={formData.propertyId}
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
                      {' - '}₦{(lease.property.rentAmount || lease.monthlyRent * 12)?.toLocaleString()}/year
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  ✅ Only showing properties where you have an active lease
                </p>
              </div>

              <div>
                <label className="label">Payment Type</label>
                <select
                  name="paymentType"
                  value={formData.paymentType}
                  onChange={handleChange}
                  className="input"
                  required
                >
                  <option value="rent">Rent</option>
                  <option value="deposit">Deposit</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="utilities">Utilities</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="label">Amount (₦)</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="input"
                  placeholder="1200000"
                  min="100"
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
                  placeholder="e.g., Annual rent payment for 2025"
                ></textarea>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
                <p className="text-sm text-purple-800">
                  💳 You will be redirected to Flutterwave to complete your payment securely.
                </p>
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
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Redirecting...' : 'Proceed to Payment'}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentsPage;