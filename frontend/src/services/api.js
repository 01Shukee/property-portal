import axios from 'axios';

// Base API URL - Change this for production
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - logout user
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Update profile
  updateProfile: async (userData) => {
    const response = await api.put('/auth/update-profile', userData);
    return response.data;
  },

  // Change password
  changePassword: async (passwords) => {
    const response = await api.put('/auth/change-password', passwords);
    return response.data;
  },
};

// Property API calls
export const propertyAPI = {
  getAll: async () => {
    const response = await api.get('/properties');
    return response.data;
  },
  
  create: async (propertyData) => {
    const response = await api.post('/properties', propertyData);
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/properties/${id}`);
    return response.data;
  },
  
  update: async (id, propertyData) => {
    const response = await api.put(`/properties/${id}`, propertyData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/properties/${id}`);
    return response.data;
  }
};

// Maintenance API calls
export const maintenanceAPI = {
  // Get all maintenance requests
  getAll: async () => {
    const response = await api.get('/maintenance');
    return response.data;
  },

  // Get single request
  getById: async (id) => {
    const response = await api.get(`/maintenance/${id}`);
    return response.data;
  },

  // Create request (tenant)
  create: async (requestData) => {
    const response = await api.post('/maintenance', requestData);
    return response.data;
  },

  // Update request status (manager/owner)
  updateStatus: async (id, statusData) => {
    const response = await api.put(`/maintenance/${id}`, statusData);
    return response.data;
  },

  // Cancel request (tenant)
  cancel: async (id) => {
    const response = await api.delete(`/maintenance/${id}`);
    return response.data;
  },
};

// Homeowner API calls
export const homeownerAPI = {
  // Invite homeowner for specific property (Property Manager only)
  inviteForProperty: async (propertyId, homeownerData) => {
    const response = await api.post(`/homeowners/invite/${propertyId}`, homeownerData);
    return response.data;
  },

  // Verify invitation token
  verifyInvitation: async (token) => {
    const response = await api.get(`/homeowners/verify-invitation/${token}`);
    return response.data;
  },

  // Accept invitation
  acceptInvitation: async (token, password) => {
    const response = await api.post(`/homeowners/accept-invitation/${token}`, { password });
    return response.data;
  },
};

// Announcement API calls
export const announcementAPI = {
  // Get all announcements
  getAll: async () => {
    const response = await api.get('/announcements');
    return response.data;
  },

  // Create announcement
  create: async (announcementData) => {
    const response = await api.post('/announcements', announcementData);
    return response.data;
  },

  // Mark as read
  markAsRead: async (id) => {
    const response = await api.put(`/announcements/${id}/read`);
    return response.data;
  },
};

// Payment API calls - UPDATED
export const paymentAPI = {
  // Get all payments
  getAll: async () => {
    const response = await api.get('/payments');
    return response.data;
  },

  // Get single payment
  getById: async (id) => {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },

  // Initialize payment (tenant) - Legacy
  initialize: async (paymentData) => {
    const response = await api.post('/payments/initialize', paymentData);
    return response.data;
  },

  // Initiate payment (tenant) - NEW - auto-fills unit from lease
  initiate: async (paymentData) => {
    const response = await api.post('/payments/initiate', paymentData);
    return response.data;
  },

  // Verify payment
  verify: async (reference) => {
    const response = await api.post(`/payments/verify/${reference}`);
    return response.data;
  },

  // Get payment stats (PM/Homeowner)
  getStats: async () => {
    const response = await api.get('/payments/stats/summary');
    return response.data;
  },
};

// Application API calls
export const applicationAPI = {
  // Get all applications
  getAll: async () => {
    const response = await api.get('/applications');
    return response.data;
  },

  // Get single application
  getById: async (id) => {
    const response = await api.get(`/applications/${id}`);
    return response.data;
  },

  // Submit application (tenant)
  submit: async (applicationData) => {
    const response = await api.post('/applications', applicationData);
    return response.data;
  },

  // Review application (PM/Homeowner)
  review: async (id, reviewData) => {
    const response = await api.put(`/applications/${id}/review`, reviewData);
    return response.data;
  },

  // Withdraw application (tenant)
  withdraw: async (id) => {
    const response = await api.delete(`/applications/${id}`);
    return response.data;
  },
};

// Lease API calls
export const leaseAPI = {
  // Get all leases
  getAll: async () => {
    const response = await api.get('/leases');
    return response.data;
  },

  // Get single lease
  getById: async (id) => {
    const response = await api.get(`/leases/${id}`);
    return response.data;
  },

  // Get all tenants for a property
  getPropertyTenants: async (propertyId) => {
    const response = await api.get(`/leases/property/${propertyId}/tenants`);
    return response.data;
  },

  // Terminate lease (PM/Homeowner)
  terminate: async (id, terminationData) => {
    const response = await api.put(`/leases/${id}/terminate`, terminationData);
    return response.data;
  },
};

// Activity Feed API
export const activityAPI = {
  // Get activity feed for a property
  getPropertyActivity: async (propertyId) => {
    const response = await api.get(`/activity/${propertyId}`);
    return response.data;
  },
};

// Unit API calls
export const unitAPI = {
  // Get all vacant units for browsing
  getBrowseUnits: async () => {
    const response = await api.get('/units/browse');
    return response.data;
  },

  // Get all units for a property
  getPropertyUnits: async (propertyId) => {
    const response = await api.get(`/units/property/${propertyId}`);
    return response.data;
  },

  // Get vacant units for a property
  getVacantUnits: async (propertyId) => {
    const response = await api.get(`/units/property/${propertyId}/vacant`);
    return response.data;
  },

  // Get single unit
  getById: async (id) => {
    const response = await api.get(`/units/${id}`);
    return response.data;
  },

  // Create unit (PM only)
  create: async (unitData) => {
    const response = await api.post('/units', unitData);
    return response.data;
  },

  // Update unit (PM only)
  update: async (id, unitData) => {
    const response = await api.put(`/units/${id}`, unitData);
    return response.data;
  },

  // Delete unit (PM only)
  delete: async (id) => {
    const response = await api.delete(`/units/${id}`);
    return response.data;
  },
};

// Statement API calls
export const statementAPI = {
  // Get tenant statement
  getTenantStatement: async (tenantId, year) => {
    const response = await api.get(`/statements/tenant/${tenantId}?year=${year || new Date().getFullYear()}`);
    return response.data;
  },

  // Get property statement
  getPropertyStatement: async (propertyId, year) => {
    const response = await api.get(`/statements/property/${propertyId}?year=${year || new Date().getFullYear()}`);
    return response.data;
  },
};

// Tenant Invitation API calls
export const tenantInvitationAPI = {
  // Invite tenant to unit
  inviteToUnit: async (unitId, invitationData) => {
    const response = await api.post(`/tenant-invitations/invite/${unitId}`, invitationData);
    return response.data;
  },

  // Verify invitation token
  verifyInvitation: async (token) => {
    const response = await api.get(`/tenant-invitations/verify/${token}`);
    return response.data;
  },

  // Accept invitation
  acceptInvitation: async (token, password) => {
    const response = await api.post(`/tenant-invitations/accept/${token}`, { password });
    return response.data;
  },
};

export default api;