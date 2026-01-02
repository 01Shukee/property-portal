import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [showPassword, setShowPassword] = useState(false); // ✅ NEW: Password visibility

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData);
    
    if (result.success) {
      if (result.hasMultipleAccounts && !formData.role) {
        setAvailableRoles(result.availableRoles || []);
        setShowRoleSelector(true);
        setLoading(false);
        return;
      }
      
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const handleRoleSelect = async (selectedRole) => {
    setLoading(true);
    setError('');

    const result = await login({
      ...formData,
      role: selectedRole
    });
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      'tenant': 'Tenant',
      'homeowner': 'Homeowner',
      'property_manager': 'Property Manager'
    };
    return roleNames[role] || role;
  };

  const getRoleIcon = (role) => {
    const icons = {
      'tenant': '🏠',
      'homeowner': '🏡',
      'property_manager': '👔'
    };
    return icons[role] || '👤';
  };

  const getRoleColor = (role) => {
    const colors = {
      'tenant': 'from-blue-500 to-blue-600',
      'homeowner': 'from-green-500 to-emerald-600',
      'property_manager': 'from-purple-500 to-purple-600'
    };
    return colors[role] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate('/')}
            className="cursor-pointer mb-12"
          >
            <img 
              src="/logo (1).png" 
              alt="PropertyHub Logo" 
              className="h-12 w-auto"
            />
          </motion.div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">
              {showRoleSelector ? 'Select Account' : 'Sign In'}
            </h1>
            <p className="text-gray-600">
              {showRoleSelector ? 'You have multiple accounts. Choose one to continue.' : 'Access your account'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm"
            >
              {error}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {!showRoleSelector ? (
              /* Login Form */
              <motion.form
                key="login-form"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                    placeholder="you@company.com"
                    required
                  />
                </div>

                {/* ✅ NEW: Password with visibility toggle */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 pr-12 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                    />
                    <span className="text-gray-600">Keep me signed in</span>
                  </label>
                  <Link to="/forgot-password" className="text-gray-900 hover:text-gray-700 font-medium">
                    Forgot password?
                  </Link>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </motion.button>
              </motion.form>
            ) : (
              /* Role Selector */
              <motion.div
                key="role-selector"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    📧 <strong>{formData.email}</strong> has multiple accounts
                  </p>
                </div>

                {availableRoles.map((role, index) => (
                  <motion.button
                    key={role}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleRoleSelect(role)}
                    disabled={loading}
                    className={`w-full p-5 bg-gradient-to-r ${getRoleColor(role)} text-white rounded-xl shadow-lg hover:shadow-xl transition-all text-left flex items-center gap-4 disabled:opacity-50`}
                  >
                    <div className="text-4xl">{getRoleIcon(role)}</div>
                    <div className="flex-1">
                      <p className="font-semibold text-lg">{getRoleDisplayName(role)}</p>
                      <p className="text-sm opacity-90">Continue as {getRoleDisplayName(role).toLowerCase()}</p>
                    </div>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.button>
                ))}

                <button
                  onClick={() => {
                    setShowRoleSelector(false);
                    setFormData({ ...formData, role: '' });
                    setError('');
                  }}
                  className="w-full mt-4 py-3 text-gray-600 hover:text-gray-900 font-medium"
                >
                  ← Back to login
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {!showRoleSelector && (
            <>
              {/* Divider */}
              <div className="mt-8 mb-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">New to PropertyHub?</span>
                  </div>
                </div>
              </div>

              {/* Sign Up Link */}
              <Link 
                to="/register" 
                className="block w-full text-center py-3 border-2 border-gray-900 text-gray-900 rounded-lg font-medium hover:bg-gray-900 hover:text-white transition-all"
              >
                Create an Account
              </Link>
            </>
          )}
        </motion.div>
      </div>

      {/* Right Side - Professional Info Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 items-center justify-center p-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-lg"
        >
          <div className="mb-12">
            <h2 className="text-4xl font-semibold text-white mb-4 leading-tight">
              Professional Property Management Platform
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              Streamline operations, increase efficiency, and manage your portfolio with confidence.
            </p>
          </div>
          
          {/* Features */}
          <div className="space-y-6">
            {[
              {
                title: 'Financial Management',
                description: 'Track payments, generate reports, and manage revenue streams'
              },
              {
                title: 'Tenant Relations',
                description: 'Centralize communications and tenant information'
              },
              {
                title: 'Maintenance Operations',
                description: 'Monitor requests and coordinate service providers'
              },
              {
                title: 'Analytics & Reporting',
                description: 'Data-driven insights for informed decision making'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="border-l-2 border-gray-700 pl-4"
              >
                <h3 className="text-white font-medium mb-1">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-12 pt-8 border-t border-gray-800">
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-semibold text-white mb-1">10K+</div>
                <div className="text-sm text-gray-400">Properties</div>
              </div>
              <div>
                <div className="text-3xl font-semibold text-white mb-1">50K+</div>
                <div className="text-sm text-gray-400">Active Users</div>
              </div>
              <div>
                <div className="text-3xl font-semibold text-white mb-1">99.9%</div>
                <div className="text-sm text-gray-400">Uptime</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;