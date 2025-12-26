import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { homeownerAPI } from '../services/api';

const AcceptInvitationPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [homeowner, setHomeowner] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      const data = await homeownerAPI.verifyInvitation(token);
      setHomeowner({
        ...data.homeowner,
        property: data.property
      });
    } catch (err) {
      setError('Invalid or expired invitation link');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setSubmitting(true);
    try {
      await homeownerAPI.acceptInvitation(token, password);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept invitation');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying invitation...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <div className="card max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
            ✅
          </div>
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">
            Welcome to PropertyHub!
          </h2>
          <p className="text-gray-600 mb-6">
            Your account has been activated successfully. You can now login with your credentials.
          </p>
          <Link to="/login" className="btn btn-primary w-full">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center space-x-2 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
            P
          </div>
          <span className="text-2xl font-display font-bold bg-gradient-to-r from-primary-700 to-primary-900 bg-clip-text text-transparent">
            PropertyHub
          </span>
        </Link>

        <div className="card">
          {error && !homeowner ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">❌</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Invalid Invitation
              </h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <Link to="/login" className="btn btn-secondary">
                Go to Login
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  {homeowner?.name.charAt(0).toUpperCase()}
                </div>
                <h1 className="text-2xl font-display font-bold text-gray-900 mb-2">
                  Welcome, {homeowner?.name}!
                </h1>
                <p className="text-gray-600 mb-4">
                  You've been invited to manage a property on PropertyHub.
                </p>
                
                {/* Show property info */}
                {homeowner?.property && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                    <p className="text-blue-600 font-medium mb-1 text-sm">Your Property:</p>
                    <p className="text-blue-900 font-bold">{homeowner.property.address}</p>
                    <p className="text-blue-700 text-sm">{homeowner.property.city}, {homeowner.property.state}</p>
                  </div>
                )}
                
                <p className="text-gray-600">
                  Set your password to get started.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    value={homeowner?.email || ''}
                    className="input bg-gray-50"
                    disabled
                  />
                </div>

                <div>
                  <label className="label">Create Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input"
                    placeholder="••••••••"
                    minLength="6"
                    required
                  />
                </div>

                <div>
                  <label className="label">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input"
                    placeholder="••••••••"
                    minLength="6"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full btn btn-primary"
                >
                  {submitting ? 'Setting up account...' : 'Complete Setup'}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
                  Login here
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AcceptInvitationPage;