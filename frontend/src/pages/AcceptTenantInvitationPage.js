import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const AcceptTenantInvitationPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [invitationData, setInvitationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await api.get(`/tenant-invitations/verify/${token}`);
      setInvitationData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);

    try {
      await api.post(`/tenant-invitations/accept/${token}`, { password });
      alert('✅ Invitation accepted! You can now login with your credentials.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept invitation');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying invitation...</p>
        </div>
      </div>
    );
  }

  if (error && !invitationData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invitation</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="btn btn-primary w-full"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="card max-w-2xl w-full">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🏠</div>
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
            You're Invited!
          </h1>
          <p className="text-gray-600">
            Accept your invitation to move into your new home
          </p>
        </div>

        {/* Invitation Details */}
        <div className="mb-6 p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl">
          <h3 className="font-bold text-blue-900 mb-4 text-lg">Rental Details</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-blue-700">Property:</span>
              <span className="font-bold text-blue-900">{invitationData?.property.address}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-blue-700">Location:</span>
              <span className="font-bold text-blue-900">
                {invitationData?.property.city}, {invitationData?.property.state}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-blue-700">Unit:</span>
              <span className="font-bold text-blue-900 capitalize">
                Unit {invitationData?.unit.unitNumber} ({invitationData?.unit.unitType})
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-blue-700">Monthly Rent:</span>
              <span className="font-bold text-blue-900 text-xl">
                ₦{(invitationData?.unit.rentAmount / 12)?.toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-blue-700">Annual Rent:</span>
              <span className="font-bold text-blue-900">
                ₦{invitationData?.unit.rentAmount?.toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-between items-center pt-3 border-t border-blue-300">
              <span className="text-blue-700">Move-in Date:</span>
              <span className="font-bold text-blue-900">
                {new Date(invitationData?.invitation.moveInDate).toLocaleDateString()}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-blue-700">Lease Duration:</span>
              <span className="font-bold text-blue-900">
                {invitationData?.invitation.leaseDuration} months
              </span>
            </div>
          </div>
        </div>

        {/* Tenant Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-xl">
          <p className="text-sm text-gray-600 mb-1">Invited as:</p>
          <p className="font-bold text-gray-900">{invitationData?.tenant.name}</p>
          <p className="text-sm text-gray-700">{invitationData?.tenant.email}</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
            {error}
          </div>
        )}

        {/* Set Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Set Your Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="Enter password (min 6 characters)"
              required
              minLength="6"
            />
          </div>

          <div>
            <label className="label">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input"
              placeholder="Re-enter password"
              required
              minLength="6"
            />
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-sm text-green-800">
              <strong>✅ By accepting this invitation:</strong>
            </p>
            <ul className="text-sm text-green-700 mt-2 ml-4 space-y-1">
              <li>• Your lease will be created automatically</li>
              <li>• You'll get access to your tenant portal</li>
              <li>• You can make payments and report maintenance issues</li>
              <li>• Your account will be activated immediately</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full btn btn-primary text-lg py-3"
          >
            {submitting ? 'Accepting Invitation...' : '✅ Accept Invitation & Create Account'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-6">
          This invitation will expire in 7 days
        </p>
      </div>
    </div>
  );
};

export default AcceptTenantInvitationPage;