import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header with Gradient */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="relative">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
              Welcome back, <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{user?.name}</span> 👋
            </h1>
            <p className="text-lg text-gray-600">
              {isPropertyManager && 'Manage your properties efficiently'}
              {isHomeowner && 'Monitor your real estate portfolio'}
              {isTenant && 'Your rental dashboard'}
            </p>
          </div>
        </motion.div>

        {/* PROPERTY MANAGER & HOMEOWNER DASHBOARD */}
        {(isPropertyManager || isHomeowner) && (
          <>
            {/* Stats with Gradients */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all cursor-pointer"
                  onClick={() => navigate('/properties')}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
                  <div className="relative z-10">
                    <div className="text-4xl mb-3">🏢</div>
                    <p className="text-4xl font-bold text-white mb-1">{properties.length}</p>
                    <p className="text-blue-100 text-sm">Properties</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="relative overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all cursor-pointer"
                  onClick={() => navigate('/payments')}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
                  <div className="relative z-10">
                    <div className="text-4xl mb-3">💰</div>
                    <p className="text-2xl font-bold text-white mb-1">
                      ₦{(stats.thisMonthAmount || 0).toLocaleString()}
                    </p>
                    <p className="text-green-100 text-sm">This Month</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all cursor-pointer"
                  onClick={() => navigate('/applications')}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
                  <div className="relative z-10">
                    <div className="text-4xl mb-3">📝</div>
                    <p className="text-4xl font-bold text-white mb-1">
                      {applications.filter(a => a.status === 'pending').length}
                    </p>
                    <p className="text-amber-100 text-sm">Applications</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all cursor-pointer"
                  onClick={() => navigate('/maintenance')}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
                  <div className="relative z-10">
                    <div className="text-4xl mb-3">🔧</div>
                    <p className="text-4xl font-bold text-white mb-1">
                      {maintenance.filter(m => m.status !== 'resolved').length}
                    </p>
                    <p className="text-purple-100 text-sm">Open Issues</p>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Properties Header */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Your Properties</h2>
                <p className="text-gray-600 mt-1">Manage and monitor all your properties</p>
              </div>
              {isPropertyManager && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/properties')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-medium hover:shadow-lg transition-all"
                >
                  + Add Property
                </motion.button>
              )}
            </div>

            {/* Properties List */}
            {properties.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="card text-center py-16"
              >
                <div className="text-7xl mb-4">🏢</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No Properties Yet</h3>
                <p className="text-gray-600 mb-6">Get started by adding your first property</p>
                {isPropertyManager && (
                  <button
                    onClick={() => navigate('/properties')}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-medium hover:shadow-lg transition-all"
                  >
                    Add Your First Property
                  </button>
                )}
              </motion.div>
            ) : (
              <div className="space-y-4">
                {properties.map((property, index) => {
                  const propData = getPropertyData(property._id);
                  const pendingApps = propData.applications.filter(a => 
                    a.status === 'pending' || a.status === 'under_review'
                  );
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
                      index={index}
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
const PropertyCard = ({ property, propData, pendingApplications, openMaintenance, thisMonthPayments, navigate, isPropertyManager, index }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all"
    >
      <div className="p-6">
        {/* Header with gradient accent */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-6 gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl">
                🏢
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{property.address}</h3>
                <p className="text-gray-600 text-sm">
                  {property.city}, {property.state}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-3 py-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 rounded-full text-xs font-medium capitalize">
                {property.status}
              </span>
              <span className="px-3 py-1 bg-gradient-to-r from-blue-50 to-purple-50 text-gray-700 rounded-full text-xs font-medium capitalize">
                {property.propertyType}
              </span>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setExpanded(!expanded)}
            className="px-6 py-2 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-full text-sm font-medium hover:shadow-lg transition-all"
          >
            {expanded ? '← Hide' : 'Details →'}
          </motion.button>
        </div>

        {/* Stats Grid with Icons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">💵</span>
              <p className="text-xs text-blue-700 font-medium">Monthly Rent</p>
            </div>
            <p className="text-lg font-bold text-blue-900">
              ₦{(property.rentAmount / 12)?.toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl border border-green-200">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">📊</span>
              <p className="text-xs text-green-700 font-medium">This Month</p>
            </div>
            <p className="text-lg font-bold text-green-900">
              ₦{thisMonthPayments.toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl border border-amber-200">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">📝</span>
              <p className="text-xs text-amber-700 font-medium">Applications</p>
            </div>
            <p className="text-lg font-bold text-amber-900">{pendingApplications.length}</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-100 rounded-xl border border-purple-200">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">🔧</span>
              <p className="text-xs text-purple-700 font-medium">Issues</p>
            </div>
            <p className="text-lg font-bold text-purple-900">{openMaintenance.length}</p>
          </div>
        </div>

        {/* Expanded Details */}
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-6 mt-6 border-t border-gray-100"
          >
            <PropertyTabbedView 
              property={property} 
              lease={propData.lease} 
              isOwnerView={true}
            />
          </motion.div>
        )}
      </div>
    </motion.div>
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05, y: -5 }}
          className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
          <div className="relative z-10">
            <div className="text-4xl mb-3">🏠</div>
            <p className="text-3xl font-bold text-white mb-1">{activeLease ? 'Active' : 'None'}</p>
            <p className="text-blue-100 text-sm">My Lease</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.05, y: -5 }}
          className="relative overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
          <div className="relative z-10">
            <div className="text-4xl mb-3">💳</div>
            <p className="text-2xl font-bold text-white mb-1">
              ₦{thisMonthPayments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
            </p>
            <p className="text-green-100 text-sm">This Month</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.05, y: -5 }}
          className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
          <div className="relative z-10">
            <div className="text-4xl mb-3">📝</div>
            <p className="text-4xl font-bold text-white mb-1">{pendingApps.length}</p>
            <p className="text-amber-100 text-sm">Applications</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.05, y: -5 }}
          className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
          <div className="relative z-10">
            <div className="text-4xl mb-3">🔧</div>
            <p className="text-4xl font-bold text-white mb-1">{openIssues.length}</p>
            <p className="text-purple-100 text-sm">Open Issues</p>
          </div>
        </motion.div>
      </div>

      {/* Active Lease */}
      {activeLease && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg mb-8"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">🏠</span>
            My Current Rental
          </h2>
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {activeLease.property?.address}
              </h3>
              <p className="text-gray-600 mb-4">
                {activeLease.property?.city}, {activeLease.property?.state}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                  <p className="text-sm text-blue-700 font-medium">Monthly Rent</p>
                  <p className="text-xl font-bold text-blue-900">
                    ₦{activeLease.monthlyRent?.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                  <p className="text-sm text-purple-700 font-medium">Lease Ends</p>
                  <p className="text-xl font-bold text-purple-900">
                    {new Date(activeLease.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/leases')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-medium hover:shadow-lg transition-all"
            >
              View Details →
            </button>
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '🔍', label: 'Browse', onClick: () => navigate('/browse-properties'), gradient: 'from-blue-500 to-blue-600' },
            { icon: '💳', label: 'Pay Rent', onClick: () => navigate('/payments'), gradient: 'from-green-500 to-emerald-600' },
            { icon: '🔧', label: 'Report Issue', onClick: () => navigate('/maintenance'), gradient: 'from-amber-500 to-orange-600' },
            { icon: '📢', label: 'Announcements', onClick: () => navigate('/announcements'), gradient: 'from-purple-500 to-pink-600' }
          ].map((action, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.05 }}
              onClick={action.onClick}
              className={`relative overflow-hidden bg-gradient-to-br ${action.gradient} rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all text-center`}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
              <div className="relative z-10">
                <div className="text-4xl mb-3">{action.icon}</div>
                <p className="font-semibold">{action.label}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </>
  );
};

export default DashboardPage;