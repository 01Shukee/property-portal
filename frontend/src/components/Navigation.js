import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
  const navigate = useNavigate();
  const { user, logout, isPropertyManager, isHomeowner, isTenant } = useAuth();
  const [showPropertiesMenu, setShowPropertiesMenu] = useState(false);
  const [showTenantsMenu, setShowTenantsMenu] = useState(false);
  const [showFinanceMenu, setShowFinanceMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="glass border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Side - Logo and Links */}
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white text-lg font-bold">
                P
              </div>
              <span className="text-xl font-display font-bold text-gray-900">
                PropertyHub
              </span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex space-x-1">
              {/* Dashboard - Always visible */}
              <button
                onClick={() => navigate('/dashboard')}
                className="px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                🏠 Dashboard
              </button>

              {/* PROPERTY MANAGER NAVIGATION */}
              {isPropertyManager && (
                <>
                  {/* Properties Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowPropertiesMenu(!showPropertiesMenu);
                        setShowTenantsMenu(false);
                        setShowFinanceMenu(false);
                      }}
                      className="px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg font-medium transition-colors flex items-center gap-1"
                    >
                      🏢 Properties
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {showPropertiesMenu && (
                      <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                        <button
                          onClick={() => {
                            navigate('/homeowners');
                            setShowPropertiesMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          👥 Homeowners
                        </button>
                        <button
                          onClick={() => {
                            navigate('/properties');
                            setShowPropertiesMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          🏘️ All Properties
                        </button>
                        <button
                          onClick={() => {
                            navigate('/maintenance');
                            setShowPropertiesMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          🔧 Maintenance
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Tenants Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowTenantsMenu(!showTenantsMenu);
                        setShowPropertiesMenu(false);
                        setShowFinanceMenu(false);
                      }}
                      className="px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg font-medium transition-colors flex items-center gap-1"
                    >
                      👤 Tenants
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {showTenantsMenu && (
                      <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                        <button
                          onClick={() => {
                            navigate('/applications');
                            setShowTenantsMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          📝 Applications
                        </button>
                        <button
                          onClick={() => {
                            navigate('/leases');
                            setShowTenantsMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          📄 Leases
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Finance - Single button */}
                  <button
                    onClick={() => navigate('/payments')}
                    className="px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                  >
                    💰 Payments
                  </button>
                </>
              )}

              {/* HOMEOWNER NAVIGATION */}
              {isHomeowner && (
                <>
                  <button
                    onClick={() => navigate('/properties')}
                    className="px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                  >
                    🏘️ My Properties
                  </button>

                  {/* Tenants Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowTenantsMenu(!showTenantsMenu);
                      }}
                      className="px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg font-medium transition-colors flex items-center gap-1"
                    >
                      👤 Tenants
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {showTenantsMenu && (
                      <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                        <button
                          onClick={() => {
                            navigate('/applications');
                            setShowTenantsMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          📝 Applications
                        </button>
                        <button
                          onClick={() => {
                            navigate('/leases');
                            setShowTenantsMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          📄 Leases
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => navigate('/maintenance')}
                    className="px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                  >
                    🔧 Maintenance
                  </button>

                  <button
                    onClick={() => navigate('/payments')}
                    className="px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                  >
                    💰 Payments
                  </button>
                </>
              )}

              {/* TENANT NAVIGATION - SUPER SIMPLE */}
              {isTenant && (
                <>
                  <button
                    onClick={() => navigate('/browse-properties')}
                    className="px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                  >
                    🔍 Browse
                  </button>

                  <button
                    onClick={() => navigate('/leases')}
                    className="px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                  >
                    🏠 My Rental
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Right Side - User Info and Logout */}
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role?.replace('_', ' ')}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg transition-all shadow-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Close dropdowns when clicking outside */}
      {(showPropertiesMenu || showTenantsMenu || showFinanceMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowPropertiesMenu(false);
            setShowTenantsMenu(false);
            setShowFinanceMenu(false);
          }}
        ></div>
      )}
    </nav>
  );
};

export default Navigation;