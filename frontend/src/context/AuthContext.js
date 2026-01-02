import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const data = await authAPI.getCurrentUser();
          setUser(data.user);
        } catch (err) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Register function
  const register = async (userData) => {
    try {
      setError(null);
      const data = await authAPI.register(userData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      return { success: false, message };
    }
  };

  // ✅ FIXED: Login function that returns multiple accounts info
  const login = async (credentials) => {
    try {
      setError(null);
      const data = await authAPI.login(credentials);
      
      // ✅ NEW: Return multiple accounts info from backend
      if (data.hasMultipleAccounts && !credentials.role) {
        // User has multiple accounts but didn't specify role
        return { 
          success: true, 
          hasMultipleAccounts: true,
          availableRoles: data.availableRoles,
          needsRoleSelection: true
        };
      }
      
      // Normal login - save token and user
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      
      return { 
        success: true,
        hasMultipleAccounts: data.hasMultipleAccounts,
        availableRoles: data.availableRoles
      };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      return { success: false, message };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Update user in context
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // ✅ NEW: Switch account function
  const switchAccount = async (targetRole) => {
    try {
      setError(null);
      const data = await authAPI.switchAccount(targetRole);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to switch account';
      setError(message);
      return { success: false, message };
    }
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    updateUser,
    switchAccount, // ✅ NEW: Export switch account function
    isAuthenticated: !!user,
    isPropertyManager: user?.role === 'property_manager',
    isHomeowner: user?.role === 'homeowner',
    isTenant: user?.role === 'tenant',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};