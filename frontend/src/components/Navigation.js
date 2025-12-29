import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isPropertyManager, isHomeowner, isTenant } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const DropdownMenu = ({ label, items, isActive }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div
        className="relative"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <button
          className={`px-3 py-2 text-sm transition-colors ${
            isActive
              ? 'text-gray-900 font-medium border-b-2 border-gray-900'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {label}
          <svg
            className={`inline-block ml-1 w-4 h-4 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-100 rounded-lg shadow-lg py-2 z-50">
            {items.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  navigate(item.path);
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
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
            className="cursor-pointer"
          >
            <img 
              src="/logo.png" 
              alt="PropertyHub Logo" 
              className="h-32 w-auto"
            />
          </motion.div>

          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex items-center gap-1 absolute left-1/2 transform -translate-x-1/2">
            <button
              onClick={() => navigate('/dashboard')}
              className={`px-3 py-2 text-sm transition-colors ${
                isActive('/dashboard')
                  ? 'text-gray-900 font-medium border-b-2 border-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Dashboard
            </button>

            {/* Property Manager Nav */}
            {isPropertyManager && (
              <>
                <button
                  onClick={() => navigate('/properties')}
                  className={`px-3 py-2 text-sm transition-colors ${
                    isActive('/properties')
                      ? 'text-gray-900 font-medium border-b-2 border-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Properties
                </button>
                <button
                  onClick={() => navigate('/leases')}
                  className={`px-3 py-2 text-sm transition-colors ${
                    isActive('/leases')
                      ? 'text-gray-900 font-medium border-b-2 border-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Leases
                </button>
                <button
                  onClick={() => navigate('/payments')}
                  className={`px-3 py-2 text-sm transition-colors ${
                    isActive('/payments')
                      ? 'text-gray-900 font-medium border-b-2 border-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Payments
                </button>
                <DropdownMenu
                  label="More"
                  isActive={
                    isActive('/homeowners') ||
                    isActive('/applications') ||
                    isActive('/maintenance')
                  }
                  items={[
                    { label: 'Homeowners', path: '/homeowners' },
                    { label: 'Applications', path: '/applications' },
                    { label: 'Maintenance', path: '/maintenance' },
                  ]}
                />
              </>
            )}

            {/* Homeowner Nav */}
            {isHomeowner && (
              <>
                <button
                  onClick={() => navigate('/properties')}
                  className={`px-3 py-2 text-sm transition-colors ${
                    isActive('/properties')
                      ? 'text-gray-900 font-medium border-b-2 border-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Properties
                </button>
                <button
                  onClick={() => navigate('/leases')}
                  className={`px-3 py-2 text-sm transition-colors ${
                    isActive('/leases')
                      ? 'text-gray-900 font-medium border-b-2 border-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Leases
                </button>
                <button
                  onClick={() => navigate('/payments')}
                  className={`px-3 py-2 text-sm transition-colors ${
                    isActive('/payments')
                      ? 'text-gray-900 font-medium border-b-2 border-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Payments
                </button>
                <DropdownMenu
                  label="More"
                  isActive={
                    isActive('/applications') || isActive('/maintenance')
                  }
                  items={[
                    { label: 'Applications', path: '/applications' },
                    { label: 'Maintenance', path: '/maintenance' },
                  ]}
                />
              </>
            )}

            {/* Tenant Nav */}
            {isTenant && (
              <>
                <button
                  onClick={() => navigate('/browse-properties')}
                  className={`px-3 py-2 text-sm transition-colors ${
                    isActive('/browse-properties')
                      ? 'text-gray-900 font-medium border-b-2 border-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Browse
                </button>
                <button
                  onClick={() => navigate('/leases')}
                  className={`px-3 py-2 text-sm transition-colors ${
                    isActive('/leases')
                      ? 'text-gray-900 font-medium border-b-2 border-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  My Rental
                </button>
                <button
                  onClick={() => navigate('/payments')}
                  className={`px-3 py-2 text-sm transition-colors ${
                    isActive('/payments')
                      ? 'text-gray-900 font-medium border-b-2 border-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Payments
                </button>
                <DropdownMenu
                  label="More"
                  isActive={
                    isActive('/maintenance') || isActive('/announcements')
                  }
                  items={[
                    { label: 'Maintenance', path: '/maintenance' },
                    { label: 'Announcements', path: '/announcements' },
                  ]}
                />
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