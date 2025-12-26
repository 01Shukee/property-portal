import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { propertyAPI, applicationAPI, maintenanceAPI, paymentAPI, leaseAPI } from '../services/api';
import PropertyTabbedView from '../components/PropertyTabbedView';

const DashboardPage = () => {
  const { user, isPropertyManager, isHomeowner, isTenant } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [applications, setApplications] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [payments, setPayments] = useState([]);
  const [leases, setLeases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load all data in parallel
      const [propsData, appsData, maintData, paymentsData, leasesData] = await Promise.all([
        propertyAPI.getAll().catch(() => ({ properties: [] })),
        applicationAPI.getAll().catch(() => ({ applications: [] })),
        maintenanceAPI.getAll().catch(() => ({ requests: [] })),
        paymentAPI.getAll().catch(() => ({ payments: [] })),
        leaseAPI.getAll().catch(() => ({ leases: [] }))
      ]);

      setProperties(propsData.properties || []);
      setApplications(appsData.applications || []);
      setMaintenance(maintData.requests || []);
      setPayments(paymentsData.payments || []);
      setLeases(leasesData.leases || []);

      // Calculate stats
      if (isPropertyManager || isHomeowner) {
        try {
          const statsData = await paymentAPI.getStats();
          setStats(statsData.stats);
        } catch (err) {
          console.error('Error loading stats:', err);
        }
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get data for specific property
  const getPropertyData = (propertyId) => {
    return {
      applications: applications.filter(a => a.property?._id === propertyId),
      maintenance: maintenance.filter(m => m.property?._id === propertyId),
      payments: payments.filter(p => p.property?._id === propertyId),
      lease: leases.find(l => l.property?._id === propertyId && l.status === 'active')
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-lg text-gray-600">
            {isPropertyManager && 'Here\'s what\'s happening with your properties'}
            {isHomeowner && 'Monitor your properties and tenants'}
            {isTenant && 'Your rental dashboard'}
          </p>
        </div>

        {/* PROPERTY MANAGER & HOMEOWNER DASHBOARD */}
        {(isPropertyManager || isHomeowner) && (
          <>
            {/* Quick Stats */}
            {stats && (
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-blue-100 text-sm mb-1">Total Properties</p>
                      <p className="text-3xl font-bold">{properties.length}</p>
                    </div>
                    <div className="text-3xl">🏢</div>
                  </div>
                </div>

                <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-green-100 text-sm mb-1">This Month</p>
                      <p className="text-2xl font-bold">₦{stats.thisMonthAmount?.toLocaleString()}</p>
                    </div>
                    <div className="text-3xl">💰</div>
                  </div>
                </div>

                <div className="card bg-gradient-to-br from-amber-500 to-amber-600 text-white">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-amber-100 text-sm mb-1">Pending Apps</p>
                      <p className="text-3xl font-bold">
                        {applications.filter(a => a.status === 'pending').length}
                      </p>
                    </div>
                    <div className="text-3xl">📝</div>
                  </div>
                </div>

                <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-red-100 text-sm mb-1">Open Issues</p>
                      <p className="text-3xl font-bold">
                        {maintenance.filter(m => m.status !== 'resolved').length}
                      </p>
                    </div>
                    <div className="text-3xl">🔧</div>
                  </div>
                </div>
              </div>
            )}

            {/* Properties Section */}
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-display font-bold text-gray-900">
                Your Properties
              </h2>
              {isPropertyManager && (
                <button
                  onClick={() => navigate('/properties')}
                  className="btn btn-primary"
                >
                  + Add Property
                </button>
              )}
            </div>

            {properties.length === 0 ? (
              <div className="card text-center py-12">
                <div className="text-6xl mb-4">🏢</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  No Properties Yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Get started by adding your first property
                </p>
                {isPropertyManager && (
                  <button
                    onClick={() => navigate('/properties')}
                    className="btn btn-primary"
                  >
                    Add Your First Property
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {properties.map((property) => {
                  const propData = getPropertyData(property._id);
                  const pendingApps = propData.applications.filter(a => a.status === 'pending' || a.status === 'under_review');
                  const openMaintenance = propData.maintenance.filter(m => m.status !== 'resolved');
                  const thisMonthPayments = propData.payments.filter(p => {
                    const paidDate = new Date(p.paidAt);
                    const now = new Date();
                    return p.status === 'successful' && 
                           paidDate.getMonth() === now.getMonth() && 
                           paidDate.getFullYear() === now.getFullYear();
                  });
                  const totalThisMonth = thisMonthPayments.reduce((sum, p) => sum + p.amount, 0);

                  return (
                    <PropertyCard
                      key={property._id}
                      property={property}
                      propData={propData}
                      pendingApplications={pendingApps}
                      openMaintenance={openMaintenance}
                      thisMonthPayments={totalThisMonth}
                      navigate={navigate}
                      isPropertyManager={isPropertyManager}
                    />
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* TENANT DASHBOARD */}
        {isTenant && (
          <TenantDashboard
            applications={applications}
            leases={leases}
            maintenance={maintenance}
            payments={payments}
            navigate={navigate}
          />
        )}
      </div>
    </div>
  );
};

// Property Card Component
const PropertyCard = ({ property, propData, pendingApplications, openMaintenance, thisMonthPayments, navigate, isPropertyManager }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-2xl font-bold text-gray-900">
              {property.address}
            </h3>
            <span
              className={`badge ${
                property.status === 'vacant'
                  ? 'badge-success'
                  : property.status === 'occupied'
                  ? 'badge-info'
                  : 'badge-warning'
              }`}
            >
              {property.status}
            </span>
          </div>
          <p className="text-gray-600">
            📍 {property.city}, {property.state} • {property.propertyType}
          </p>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="btn btn-secondary text-sm"
        >
          {expanded ? 'Hide Details' : 'View Details'}
        </button>
      </div>

      {/* Quick Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-600 mb-1">Monthly Rent</p>
          <p className="text-lg font-bold text-blue-900">
            ₦{(property.rentAmount / 12)?.toLocaleString()}
          </p>
        </div>
        <div className="p-3 bg-green-50 rounded-lg">
          <p className="text-xs text-green-600 mb-1">This Month</p>
          <p className="text-lg font-bold text-green-900">
            ₦{thisMonthPayments.toLocaleString()}
          </p>
        </div>
        <div className="p-3 bg-amber-50 rounded-lg">
          <p className="text-xs text-amber-600 mb-1">Applications</p>
          <p className="text-lg font-bold text-amber-900">
            {pendingApplications.length}
          </p>
        </div>
        <div className="p-3 bg-red-50 rounded-lg">
          <p className="text-xs text-red-600 mb-1">Maintenance</p>
          <p className="text-lg font-bold text-red-900">
            {openMaintenance.length}
          </p>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="pt-4 border-t border-gray-200">
          <PropertyTabbedView 
            property={property} 
            lease={propData.lease} 
            isOwnerView={true}
          />
        </div>
      )}
    </div>
  );
};

// Tenant Dashboard Component
const TenantDashboard = ({ applications, leases, maintenance, payments, navigate }) => {
  const activeLease = leases.find(l => l.status === 'active');
  const pendingApps = applications.filter(a => ['pending', 'under_review'].includes(a.status));
  const openIssues = maintenance.filter(m => m.status !== 'resolved');
  const thisMonthPayments = payments.filter(p => {
    const paidDate = new Date(p.paidAt);
    const now = new Date();
    return p.status === 'successful' && 
           paidDate.getMonth() === now.getMonth() && 
           paidDate.getFullYear() === now.getFullYear();
  });

  return (
    <>
      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <p className="text-blue-100 text-sm mb-1">My Lease</p>
          <p className="text-2xl font-bold">{activeLease ? 'Active' : 'None'}</p>
        </div>
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <p className="text-green-100 text-sm mb-1">This Month Paid</p>
          <p className="text-xl font-bold">
            ₦{thisMonthPayments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
          </p>
        </div>
        <div className="card bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <p className="text-amber-100 text-sm mb-1">Applications</p>
          <p className="text-2xl font-bold">{pendingApps.length} Pending</p>
        </div>
        <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
          <p className="text-red-100 text-sm mb-1">Issues</p>
          <p className="text-2xl font-bold">{openIssues.length} Open</p>
        </div>
      </div>

      {/* Active Lease */}
      {activeLease && (
        <div className="card mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🏠 My Current Rental</h2>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {activeLease.property?.address}
              </h3>
              <p className="text-gray-600 mb-3">
                {activeLease.property?.city}, {activeLease.property?.state}
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Monthly Rent</p>
                  <p className="font-bold text-gray-900">₦{activeLease.monthlyRent?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Lease Ends</p>
                  <p className="font-bold text-gray-900">
                    {new Date(activeLease.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            <button onClick={() => navigate('/leases')} className="btn btn-secondary">
              View Lease
            </button>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => navigate('/browse-properties')}
          className="card hover:shadow-lg transition-shadow text-center p-6"
        >
          <div className="text-4xl mb-2">🔍</div>
          <p className="font-bold text-gray-900">Browse Properties</p>
        </button>
        <button
          onClick={() => navigate('/payments')}
          className="card hover:shadow-lg transition-shadow text-center p-6"
        >
          <div className="text-4xl mb-2">💳</div>
          <p className="font-bold text-gray-900">Make Payment</p>
        </button>
        <button
          onClick={() => navigate('/maintenance')}
          className="card hover:shadow-lg transition-shadow text-center p-6"
        >
          <div className="text-4xl mb-2">🔧</div>
          <p className="font-bold text-gray-900">Report Issue</p>
        </button>
        <button
          onClick={() => navigate('/announcements')}
          className="card hover:shadow-lg transition-shadow text-center p-6"
        >
          <div className="text-4xl mb-2">📢</div>
          <p className="font-bold text-gray-900">Announcements</p>
        </button>
      </div>
    </>
  );
};

export default DashboardPage;