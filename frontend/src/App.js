import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PropertiesPage from './pages/PropertiesPage';
import BrowsePropertiesPage from './pages/BrowsePropertiesPage';
import MaintenancePage from './pages/MaintenancePage';
import HomeownersPage from './pages/HomeownersPage'; // ADD THIS IMPORT
import AcceptInvitationPage from './pages/AcceptInvitationPage'; // ADD THIS IMPORT
import AnnouncementsPage from './pages/AnnouncementsPage';
import PaymentsPage from './pages/PaymentsPage';
import PaymentCallbackPage from './pages/PaymentCallbackPage';
import ApplicationsPage from './pages/ApplicationsPage';
import LeasesPage from './pages/LeasesPage';
import UnitsPage from './pages/UnitsPage';
import StatementPage from './pages/StatementPage';
import AcceptTenantInvitationPage from './pages/AcceptTenantInvitationPage';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Guest Route Component (redirect to dashboard if already logged in)
const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />

      {/* Guest Routes (only accessible when not logged in) */}
      <Route
        path="/login"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        }
      />

      {/* Protected Routes (only accessible when logged in) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/properties"
        element={
          <ProtectedRoute>
            <PropertiesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/browse-properties"
        element={
          <ProtectedRoute>
            <BrowsePropertiesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/maintenance"
        element={
          <ProtectedRoute>
            <MaintenancePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/homeowners"
        element={
          <ProtectedRoute>
            <HomeownersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/announcements"
        element={
          <ProtectedRoute>
            <AnnouncementsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payments"
        element={
          <ProtectedRoute>
            <PaymentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment-callback"
        element={
          <ProtectedRoute>
            <PaymentCallbackPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/applications"
        element={
          <ProtectedRoute>
            <ApplicationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leases"
        element={
          <ProtectedRoute>
            <LeasesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/properties/:propertyId/units"
        element={
          <ProtectedRoute>
            <UnitsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/statements/:type/:id"
        element={
          <ProtectedRoute>
            <StatementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/accept-tenant-invitation/:token"
        element={<AcceptTenantInvitationPage />}
      />


      {/* Public Invitation Route */}
      <Route path="/accept-invitation/:token" element={<AcceptInvitationPage />} />

      {/* 404 - Redirect to home */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;