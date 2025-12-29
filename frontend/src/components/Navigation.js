import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navigation = () => {
  const navigate = useNavigate();
  const { user, logout, isPropertyManager, isHomeowner, isTenant } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const NavLink = ({ onClick, children, icon }) => (
    <button
      onClick={() => {
        onClick();
        setShowMobileMenu(false);
      }}
      className="w-full text-left px-4 py-2.5 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg font-medium transition-colors flex items-center gap-2"
    >
      <span className="text-lg">{icon}</span>
      {children}
    </button>
  );

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white text-lg font-bold">
              P
            </div>
            <span className="text-xl font-bold text-gray-900">PropertyHub</span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg font-medium transition-colors"
            >
              Dashboard
            </button>

            {/* Property Manager Nav */}
            {isPropertyManager && (
              <>
                <button
                  onClick={() => navigate('/homeowners')}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                >
                  Homeowners
                </button>
                <button
                  onClick={() => navigate('/properties')}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                >
                  Properties
                </button>
                <button
                  onClick={() => navigate('/applications')}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                >
                  Applications
                </button>
                <button
                  onClick={() => navigate('/leases')}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                >
                  Leases
                </button>
                <button
                  onClick={() => navigate('/maintenance')}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                >
                  Maintenance
                </button>
                <button
                  onClick={() => navigate('/payments')}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                >
                  Payments
                </button>
              </>
            )}

            {/* Homeowner Nav */}
            {isHomeowner && (
              <>
                <button
                  onClick={() => navigate('/properties')}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                >
                  Properties
                </button>
                <button
                  onClick={() => navigate('/applications')}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                >
                  Applications
                </button>
                <button
                  onClick={() => navigate('/leases')}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                >
                  Leases
                </button>
                <button
                  onClick={() => navigate('/maintenance')}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                >
                  Maintenance
                </button>
                <button
                  onClick={() => navigate('/payments')}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                >
                  Payments
                </button>
              </>
            )}

            {/* Tenant Nav */}
            {isTenant && (
              <>
                <button
                  onClick={() => navigate('/browse-properties')}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                >
                  Browse
                </button>
                <button
                  onClick={() => navigate('/leases')}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                >
                  My Rental
                </button>
                <button
                  onClick={() => navigate('/payments')}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                >
                  Payments
                </button>
                <button
                  onClick={() => navigate('/maintenance')}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                >
                  Maintenance
                </button>
                <button
                  onClick={() => navigate('/announcements')}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                >
                  Announcements
                </button>
              </>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* User Info - Desktop */}
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role?.replace('_', ' ')}
              </p>
            </div>

            {/* Logout - Desktop */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="hidden md:block px-4 py-2 text-sm font-medium text-white bg-black rounded-full transition-all hover:bg-gray-800"
            >
              Logout
            </motion.button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 text-gray-700 hover:bg-gray-50 rounded-lg"
            >
              {showMobileMenu ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {showMobileMenu && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileMenu(false)}
              className="md:hidden fixed inset-0 bg-black/20 z-40 top-16"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="md:hidden fixed top-16 right-0 bottom-0 w-64 bg-white border-l border-gray-100 shadow-xl z-50 overflow-y-auto"
            >
              <div className="p-4">
                {/* User Info */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900">{user?.name}</p>
                  <p className="text-sm text-gray-500 capitalize">
                    {user?.role?.replace('_', ' ')}
                  </p>
                </div>

                {/* Navigation Links */}
                <div className="space-y-1">
                  <NavLink onClick={() => navigate('/dashboard')} icon="🏠">
                    Dashboard
                  </NavLink>

                  {isPropertyManager && (
                    <>
                      <NavLink onClick={() => navigate('/homeowners')} icon="👥">
                        Homeowners
                      </NavLink>
                      <NavLink onClick={() => navigate('/properties')} icon="🏢">
                        Properties
                      </NavLink>
                      <NavLink onClick={() => navigate('/applications')} icon="📝">
                        Applications
                      </NavLink>
                      <NavLink onClick={() => navigate('/leases')} icon="📄">
                        Leases
                      </NavLink>
                      <NavLink onClick={() => navigate('/maintenance')} icon="🔧">
                        Maintenance
                      </NavLink>
                      <NavLink onClick={() => navigate('/payments')} icon="💰">
                        Payments
                      </NavLink>
                    </>
                  )}

                  {isHomeowner && (
                    <>
                      <NavLink onClick={() => navigate('/properties')} icon="🏢">
                        Properties
                      </NavLink>
                      <NavLink onClick={() => navigate('/applications')} icon="📝">
                        Applications
                      </NavLink>
                      <NavLink onClick={() => navigate('/leases')} icon="📄">
                        Leases
                      </NavLink>
                      <NavLink onClick={() => navigate('/maintenance')} icon="🔧">
                        Maintenance
                      </NavLink>
                      <NavLink onClick={() => navigate('/payments')} icon="💰">
                        Payments
                      </NavLink>
                    </>
                  )}

                  {isTenant && (
                    <>
                      <NavLink onClick={() => navigate('/browse-properties')} icon="🔍">
                        Browse Properties
                      </NavLink>
                      <NavLink onClick={() => navigate('/leases')} icon="🏠">
                        My Rental
                      </NavLink>
                      <NavLink onClick={() => navigate('/payments')} icon="💳">
                        Payments
                      </NavLink>
                      <NavLink onClick={() => navigate('/maintenance')} icon="🔧">
                        Maintenance
                      </NavLink>
                      <NavLink onClick={() => navigate('/announcements')} icon="📢">
                        Announcements
                      </NavLink>
                    </>
                  )}
                </div>

                {/* Logout */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 text-white bg-black rounded-full font-medium hover:bg-gray-800 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navigation;