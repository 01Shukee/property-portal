import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { applicationAPI } from '../services/api';
import { motion } from 'framer-motion';
import Navigation from '../components/Navigation';

const ApplicationsPage = () => {
  const { user, isPropertyManager, isHomeowner, isTenant } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);

  useEffect(() => {
    loadApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadApplications = async () => {
    try {
      const data = await applicationAPI.getAll();
      setApplications(data.applications);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = (application) => {
    setSelectedApplication(application);
    setShowReviewModal(true);
  };

  const handleWithdraw = async (applicationId) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) {
      return;
    }

    try {
      await applicationAPI.withdraw(applicationId);
      loadApplications();
      alert('Application withdrawn successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to withdraw application');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'under_review': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'withdrawn': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading applications...</p>
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
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {isTenant ? 'My Applications' : 'Tenant Applications'}
          </h1>
          <p className="text-gray-600">
            {isTenant 
              ? 'Track your rental applications' 
              : 'Review and manage tenant applications'}
          </p>
        </motion.div>

        {/* Applications List */}
        {applications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card text-center py-12"
          >
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No Applications Yet
            </h3>
            <p className="text-gray-600">
              {isTenant 
                ? 'Start browsing properties to submit your first application' 
                : 'No applications to review at this time'}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {applications.map((application, index) => (
              <motion.div
                key={application._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                  <div className="flex-1 mb-4 md:mb-0">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <h3 className="text-xl font-bold text-gray-900">
                        Unit {application.unit?.unitNumber} - {application.property?.address}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(application.status)}`}>
                        {application.status.replace('_', ' ')}
                      </span>
                      {application.blockedFromProperty && (
                        <span className="px-3 py-1 bg-red-100 text-red-800 border border-red-200 rounded-full text-xs font-medium">
                          🚫 Blocked
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-3">
                      📍 {application.property?.city}, {application.property?.state}
                    </p>

                    {/* Unit Details */}
                    <div className="mb-3 p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                      <p className="text-sm text-blue-800 capitalize">
                        <strong>Unit Type:</strong> {application.unit?.unitType}
                      </p>
                      <p className="text-sm text-blue-800">
                        <strong>Monthly Rent:</strong> ₦{(application.unit?.rentAmount / 12)?.toLocaleString()}
                      </p>
                    </div>

                    {/* Applicant Info (for PM/Homeowner) */}
                    {!isTenant && application.tenant && (
                      <div className="mb-3 p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                        <p className="text-sm font-medium text-gray-900 mb-2">
                          👤 Applicant: {application.tenant.name}
                        </p>
                        <p className="text-sm text-gray-700">
                          📧 {application.tenant.email} | 📱 {application.tenant.phone}
                        </p>
                      </div>
                    )}

                    {/* Application Details */}
                    <div className="grid md:grid-cols-3 gap-4 text-sm mb-3">
                      <div>
                        <p className="text-gray-500">Move-in Date</p>
                        <p className="font-medium text-gray-900">
                          {new Date(application.moveInDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Lease Duration</p>
                        <p className="font-medium text-gray-900">
                          {application.leaseDuration} months
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Occupants</p>
                        <p className="font-medium text-gray-900">
                          {application.numberOfOccupants} {application.hasPets ? '+ Pets' : ''}
                        </p>
                      </div>
                    </div>

                    {/* Employment Info */}
                    {application.employment && (
                      <div className="mb-3 p-3 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl border border-green-200">
                        <p className="text-sm text-green-800 capitalize">
                          <strong>Employment:</strong> {application.employment.status.replace('_', ' ')}
                          {application.employment.company && ` at ${application.employment.company}`}
                        </p>
                        {application.employment.monthlyIncome && (
                          <p className="text-sm text-green-700">
                            <strong>Income:</strong> ₦{application.employment.monthlyIncome?.toLocaleString()}/month
                          </p>
                        )}
                      </div>
                    )}

                    {/* Review Info */}
                    {application.reviewedAt && (
                      <div className="mt-3 p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                        <p className="text-sm text-gray-700 mb-1">
                          <strong>Reviewed on:</strong> {new Date(application.reviewedAt).toLocaleDateString()}
                          {application.reviewedBy && ` by ${application.reviewedBy.name}`}
                        </p>
                        {application.reviewNotes && (
                          <p className="text-sm text-gray-600">
                            <strong>Notes:</strong> {application.reviewNotes}
                          </p>
                        )}
                        {application.blockedFromProperty && application.blockReason && (
                          <p className="text-sm text-red-600 mt-2">
                            <strong>⚠️ Block Reason:</strong> {application.blockReason}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Submitted Date */}
                    <p className="text-xs text-gray-500 mt-3">
                      Submitted: {new Date(application.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="md:ml-4 flex flex-col gap-2 md:min-w-[150px]">
                    {/* PM/Homeowner Actions */}
                    {(isPropertyManager || isHomeowner) && ['pending', 'under_review'].includes(application.status) && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleReview(application)}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-medium hover:shadow-lg transition-all text-sm whitespace-nowrap"
                      >
                        Review Application
                      </motion.button>
                    )}

                    {/* Tenant Actions */}
                    {isTenant && ['pending', 'under_review'].includes(application.status) && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleWithdraw(application._id)}
                        className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full font-medium hover:shadow-lg transition-all text-sm whitespace-nowrap"
                      >
                        Withdraw
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedApplication && (
        <ReviewApplicationModal
          application={selectedApplication}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedApplication(null);
          }}
          onSuccess={() => {
            setShowReviewModal(false);
            setSelectedApplication(null);
            loadApplications();
          }}
        />
      )}
    </div>
  );
};

// Review Application Modal Component
const ReviewApplicationModal = ({ application, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    status: 'under_review',
    reviewNotes: '',
    blockTenant: false,
    blockReason: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.status === 'rejected' && formData.blockTenant && !formData.blockReason.trim()) {
      setError('Please provide a reason for blocking this tenant');
      setLoading(false);
      return;
    }

    try {
      await applicationAPI.review(application._id, formData);
      
      if (formData.status === 'approved') {
        alert('Application approved! Lease has been created and tenant notified.');
      } else if (formData.status === 'rejected') {
        if (formData.blockTenant) {
          alert('Application rejected and tenant has been blocked from this property.');
        } else {
          alert('Application rejected. Tenant can apply to other units in this property.');
        }
      } else {
        alert('Application moved to under review.');
      }
      
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to review application');
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
              Review Application
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Application Summary */}
          <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl">
            <p className="text-blue-800 font-medium mb-1">Applicant:</p>
            <p className="text-blue-900 font-bold">{application.tenant?.name}</p>
            <p className="text-blue-700 text-sm">
              Unit {application.unit?.unitNumber} - {application.property?.address}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
              {error}
            </div>
          )}

          {/* Warning for Approval */}
          {formData.status === 'approved' && (
            <div className="mb-4 p-4 bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-300 rounded-xl">
              <p className="text-green-800 font-medium mb-2">✅ Approving this application will:</p>
              <ul className="text-sm text-green-700 space-y-1 ml-4">
                <li>• Create an active lease for this tenant</li>
                <li>• Mark the unit as occupied</li>
                <li>• Automatically reject all other pending applications for this unit</li>
                <li>• Send approval email to tenant</li>
              </ul>
            </div>
          )}

          {/* Warning for Rejection with Block */}
          {formData.status === 'rejected' && formData.blockTenant && (
            <div className="mb-4 p-4 bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 rounded-xl">
              <p className="text-red-800 font-medium mb-2">🚫 Blocking this tenant will:</p>
              <ul className="text-sm text-red-700 space-y-1 ml-4">
                <li>• Prevent them from applying to ANY unit in this property</li>
                <li>• This action cannot be easily undone</li>
                <li>• They will see a message that they're blocked</li>
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Decision *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="under_review">Under Review</option>
                <option value="approved">Approve Application</option>
                <option value="rejected">Reject Application</option>
              </select>
            </div>

            <div>
              <label className="label">Review Notes *</label>
              <textarea
                name="reviewNotes"
                value={formData.reviewNotes}
                onChange={handleChange}
                className="input"
                rows="4"
                placeholder="Provide feedback or reason for your decision..."
                required
              ></textarea>
            </div>

            {/* Block Tenant Option */}
            {formData.status === 'rejected' && (
              <div className="p-4 border-2 border-red-200 bg-gradient-to-br from-red-50 to-red-100 rounded-xl">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="blockTenant"
                    checked={formData.blockTenant}
                    onChange={handleChange}
                    className="w-5 h-5 mt-1"
                  />
                  <div>
                    <span className="text-sm font-bold text-red-900 block">
                      🚫 Block this tenant from applying to this property again
                    </span>
                    <span className="text-xs text-red-700">
                      They will not be able to apply to any unit in this building. Use this for problematic applicants.
                    </span>
                  </div>
                </label>

                {formData.blockTenant && (
                  <div className="mt-4">
                    <label className="label">Block Reason (Required) *</label>
                    <textarea
                      name="blockReason"
                      value={formData.blockReason}
                      onChange={handleChange}
                      className="input"
                      rows="3"
                      placeholder="e.g., False information provided, poor rental history, etc."
                      required={formData.blockTenant}
                    ></textarea>
                    <p className="text-xs text-red-600 mt-1">
                      This reason will be stored but NOT shown to the tenant.
                    </p>
                  </div>
                )}
              </div>
            )}

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
                className={`flex-1 px-6 py-3 rounded-full font-medium text-white transition-all ${
                  formData.status === 'approved' 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-lg' 
                    : formData.status === 'rejected'
                    ? 'bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg'
                }`}
              >
                {loading ? 'Processing...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ApplicationsPage;