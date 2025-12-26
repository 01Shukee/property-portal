import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { paymentAPI, propertyAPI } from '../services/api';
import Navigation from '../components/Navigation';
import { useNavigate } from 'react-router-dom';

const PaymentsPage = () => {
  const { user, isTenant } = useAuth();
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    loadPayments();
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
      case 'successful': return 'badge-success';
      case 'pending': return 'badge-warning';
      case 'failed': return 'badge-danger';
      default: return 'badge-secondary';
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payments...</p>
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
              {isTenant ? 'My Payments' : 'Payment History'}
            </h1>
            <p className="text-gray-600">
              {isTenant 
                ? 'View and manage your rent payments' 
                : 'Track all payment transactions'}
            </p>
          </div>
          {isTenant && (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="btn btn-primary"
            >
              💳 Make Payment
            </button>
          )}
        </div>

        {/* Payments List */}
        {payments.length === 0 ? (
          <div className="card text-center py-12">
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
              <button
                onClick={() => setShowPaymentModal(true)}
                className="btn btn-primary"
              >
                Make Payment
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment._id} className="card hover:shadow-xl transition-shadow">
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
                      <span className={`badge ${getStatusColor(payment.status)}`}>
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
                    <p className="text-3xl font-bold text-primary-600">
                      ₦{payment.amount?.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 capitalize">
                      {payment.paymentMethod || 'Card'}
                    </p>
                  </div>
                </div>
              </div>
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

// Make Payment Modal Component
const MakePaymentModal = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [formData, setFormData] = useState({
    propertyId: '',
    amount: '',
    paymentType: 'rent',
    description: '',
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
      
      // Auto-select if only one property
      if (data.properties?.length === 1) {
        setFormData(prev => ({
          ...prev,
          propertyId: data.properties[0]._id,
          amount: data.properties[0].rentAmount || ''
        }));
      }
    } catch (err) {
      console.error('Error loading properties:', err);
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
      const selectedProperty = properties.find(p => p._id === value);
      if (selectedProperty && formData.paymentType === 'rent') {
        setFormData(prev => ({
          ...prev,
          amount: selectedProperty.rentAmount || ''
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
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-display font-bold text-gray-900">
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Property</label>
              <select
                name="propertyId"
                value={formData.propertyId}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="">Select property</option>
                {properties.map((property) => (
                  <option key={property._id} value={property._id}>
                    {property.address}, {property.city} - ₦{property.rentAmount?.toLocaleString()}/year
                  </option>
                ))}
              </select>
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

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-800">
                💳 You will be redirected to Flutterwave to complete your payment securely.
              </p>
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 btn btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading || properties.length === 0} 
                className="flex-1 btn btn-primary"
              >
                {loading ? 'Redirecting...' : 'Proceed to Payment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentsPage;