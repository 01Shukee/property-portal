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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-gray-50 to-blue-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-10 h-10 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50 relative overflow-hidden">
      {/* Decorative Background Illustrations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Top Right Circle */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full opacity-30 blur-3xl"></div>
        
        {/* Bottom Left Circle */}
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-green-100 to-blue-100 rounded-full opacity-30 blur-3xl"></div>
        
        {/* Middle Right Small Circle */}
        <div className="absolute top-1/2 -right-20 w-64 h-64 bg-gradient-to-bl from-purple-100 to-pink-100 rounded-full opacity-20 blur-2xl"></div>
        
        {/* Geometric Shapes */}
        <svg className="absolute top-20 left-10 w-32 h-32 opacity-5" viewBox="0 0 100 100">
          <rect x="10" y="10" width="80" height="80" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500" transform="rotate(45 50 50)" />
        </svg>
        
        <svg className="absolute bottom-40 right-20 w-24 h-24 opacity-5" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-500" />
          <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-500" />
        </svg>
        
        <svg className="absolute top-1/3 left-1/4 w-20 h-20 opacity-5" viewBox="0 0 100 100">
          <polygon points="50,10 90,90 10,90" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500" />
        </svg>
        
        {/* Dotted Pattern */}
        <div className="absolute top-1/4 right-1/3 grid grid-cols-3 gap-4 opacity-10">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="w-2 h-2 bg-blue-400 rounded-full"></div>
          ))}
        </div>
      </div>

      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 relative z-10">
        {/* Header with Illustration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 relative"
        >
          {/* Decorative element behind header */}
          <div className="absolute -top-8 -left-8 w-32 h-32 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-20 blur-2xl"></div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between relative z-10 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-2 uppercase tracking-wider">Dashboard</p>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-1">
                Welcome back, <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{user?.name}</span>
              </h1>
              <p className="text-lg text-gray-600">
                {isPropertyManager && 'Manage your properties efficiently'}
                {isHomeowner && 'Monitor your real estate portfolio'}
                {isTenant && 'Your rental dashboard'}
              </p>
            </div>
            <div className="text-left md:text-right">
              <div className="relative">
                {/* Decorative circle behind date */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-20 blur-xl"></div>
                <div className="relative z-10 bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 shadow-sm">
                  <p className="text-sm text-gray-500">Today</p>
                  <p className="text-lg text-gray-900 font-semibold">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* PROPERTY MANAGER & HOMEOWNER */}
        {(isPropertyManager || isHomeowner) && (
          <ManagerView
            stats={stats}
            properties={properties}
            applications={applications}
            maintenance={maintenance}
            payments={payments}
            leases={leases}
            navigate={navigate}
            isPropertyManager={isPropertyManager}
            getPropertyData={getPropertyData}
          />
        )}

        {/* TENANT */}
        {isTenant && (
          <TenantView
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

// Manager View with Decorative Elements
const ManagerView = ({ stats, properties, applications, maintenance, payments, leases, navigate, isPropertyManager, getPropertyData }) => {
  return (
    <>
      {/* Stats Grid with Illustrations */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
          {[
            { label: 'Total Properties', value: properties.length, icon: '🏢', color: 'blue', route: '/properties' },
            { label: 'Revenue This Month', value: `₦${(stats.thisMonthAmount || 0).toLocaleString()}`, icon: '💰', color: 'green', route: '/payments' },
            { label: 'Pending Applications', value: applications.filter(a => a.status === 'pending').length, icon: '📝', color: 'yellow', route: '/applications' },
            { label: 'Open Issues', value: maintenance.filter(m => m.status !== 'resolved').length, icon: '🔧', color: 'red', route: '/maintenance' }
          ].map((stat, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
              onClick={() => navigate(stat.route)}
              className="relative overflow-hidden bg-white/80 backdrop-blur-sm hover:bg-white rounded-xl p-6 border border-gray-200 transition-all text-left shadow-sm group"
            >
              {/* Decorative corner accent */}
              <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${
                stat.color === 'blue' ? 'from-blue-100 to-blue-200' :
                stat.color === 'green' ? 'from-green-100 to-green-200' :
                stat.color === 'yellow' ? 'from-yellow-100 to-orange-200' :
                'from-red-100 to-red-200'
              } rounded-bl-full opacity-20 group-hover:opacity-30 transition-opacity`}></div>
              
              <div className="flex items-start justify-between mb-4 relative z-10">
                <span className="text-2xl">{stat.icon}</span>
                <span className={`w-2 h-2 rounded-full ${
                  stat.color === 'blue' ? 'bg-blue-500' :
                  stat.color === 'green' ? 'bg-green-500' :
                  stat.color === 'yellow' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}></span>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-2 relative z-10">{stat.value}</p>
              <p className="text-sm text-gray-600 relative z-10">{stat.label}</p>
            </motion.button>
          ))}
        </div>
      )}

      {/* Properties Section */}
      <div className="relative">
        {/* Decorative element */}
        <div className="absolute -top-10 right-0 w-40 h-40 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full opacity-20 blur-3xl"></div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 relative z-10">
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

        {properties.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-16 text-center border border-gray-200 shadow-sm relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-10 left-10 w-32 h-32 bg-blue-100 rounded-full opacity-20 blur-2xl"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-100 rounded-full opacity-20 blur-2xl"></div>
            
            <p className="text-6xl mb-4 relative z-10">🏢</p>
            <h3 className="text-2xl font-bold text-gray-900 mb-2 relative z-10">No Properties Yet</h3>
            <p className="text-gray-600 mb-6 relative z-10">Get started by adding your first property</p>
            {isPropertyManager && (
              <button
                onClick={() => navigate('/properties')}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-medium hover:shadow-lg transition-all relative z-10"
              >
                Add Your First Property
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4 relative z-10">
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
      </div>
    </>
  );
};

// Property Card Component with Expandable Details
const PropertyCard = ({ property, propData, pendingApplications, openMaintenance, thisMonthPayments, navigate, isPropertyManager, index }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -2 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all"
    >
      <div className="p-6">
        {/* Header with gradient accent */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-6 gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
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

        {/* Stats Grid with Icons and Click Handlers */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => navigate(`/properties/${property._id}/units`)}
            className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-md transition-all text-left"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">💵</span>
              <p className="text-xs text-blue-700 font-medium">Monthly Rent</p>
            </div>
            <p className="text-lg font-bold text-blue-900">
              ₦{(property.rentAmount / 12)?.toLocaleString()}
            </p>
          </button>
          <button
            onClick={() => navigate('/payments')}
            className="p-4 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl border border-green-200 hover:shadow-md transition-all text-left"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">📊</span>
              <p className="text-xs text-green-700 font-medium">This Month</p>
            </div>
            <p className="text-lg font-bold text-green-900">
              ₦{thisMonthPayments.toLocaleString()}
            </p>
          </button>
          <button
            onClick={() => navigate('/applications')}
            className="p-4 bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl border border-amber-200 hover:shadow-md transition-all text-left"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">📝</span>
              <p className="text-xs text-amber-700 font-medium">Applications</p>
            </div>
            <p className="text-lg font-bold text-amber-900">{pendingApplications.length}</p>
          </button>
          <button
            onClick={() => navigate('/maintenance')}
            className="p-4 bg-gradient-to-br from-purple-50 to-pink-100 rounded-xl border border-purple-200 hover:shadow-md transition-all text-left"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">🔧</span>
              <p className="text-xs text-purple-700 font-medium">Issues</p>
            </div>
            <p className="text-lg font-bold text-purple-900">{openMaintenance.length}</p>
          </button>
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

// Tenant View with Illustrations
const TenantView = ({ applications, leases, maintenance, payments, navigate }) => {
  const activeLease = leases.find(l => l.status === 'active');
  const pendingApps = applications.filter(a => ['pending', 'under_review'].includes(a.status));
  const openIssues = maintenance.filter(m => m.status !== 'resolved');
  const thisMonth = payments.filter(p => {
    const paidDate = new Date(p.paidAt);
    const now = new Date();
    return p.status === 'successful' && 
           paidDate.getMonth() === now.getMonth() && 
           paidDate.getFullYear() === now.getFullYear();
  }).reduce((sum, p) => sum + p.amount, 0);

  return (
    <>
      {/* Stats with Illustrations and Click Handlers */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {[
          { label: 'Lease Status', value: activeLease ? 'Active' : 'None', icon: '🏠', color: 'blue', route: '/leases' },
          { label: 'Paid This Month', value: `₦${thisMonth.toLocaleString()}`, icon: '💳', color: 'green', route: '/payments' },
          { label: 'Applications', value: pendingApps.length, icon: '📝', color: 'yellow', route: '/applications' },
          { label: 'Open Issues', value: openIssues.length, icon: '🔧', color: 'red', route: '/maintenance' }
        ].map((stat, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -4 }}
            onClick={() => navigate(stat.route)}
            className="relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-sm group hover:shadow-md transition-all text-left"
          >
            {/* Decorative corner */}
            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${
              stat.color === 'blue' ? 'from-blue-100 to-blue-200' :
              stat.color === 'green' ? 'from-green-100 to-green-200' :
              stat.color === 'yellow' ? 'from-yellow-100 to-orange-200' :
              'from-red-100 to-red-200'
            } rounded-bl-full opacity-20 group-hover:opacity-30 transition-opacity`}></div>
            
            <div className="flex items-start justify-between mb-4 relative z-10">
              <span className="text-2xl">{stat.icon}</span>
              <span className={`w-2 h-2 rounded-full ${
                stat.color === 'blue' ? 'bg-blue-500' :
                stat.color === 'green' ? 'bg-green-500' :
                stat.color === 'yellow' ? 'bg-yellow-500' :
                'bg-red-500'
              }`}></span>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2 relative z-10">{stat.value}</p>
            <p className="text-sm text-gray-600 relative z-10">{stat.label}</p>
          </motion.button>
        ))}
      </div>

      {/* Active Lease with Illustration */}
      {activeLease && (
        <div className="relative bg-white/80 backdrop-blur-sm rounded-xl p-8 mb-12 border border-gray-200 shadow-sm overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-green-100 to-blue-100 rounded-full opacity-20 blur-2xl"></div>
          
          <p className="text-sm text-gray-500 uppercase tracking-wider mb-2 relative z-10">Current Rental</p>
          <h3 className="text-3xl font-bold text-gray-900 mb-2 relative z-10">{activeLease.property?.address}</h3>
          <p className="text-gray-600 mb-8 relative z-10">{activeLease.property?.city}, {activeLease.property?.state}</p>
          <div className="grid grid-cols-2 gap-6 relative z-10">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-100">
              <p className="text-sm text-blue-700 mb-2 font-medium">Monthly Rent</p>
              <p className="text-2xl font-bold text-blue-900">₦{activeLease.monthlyRent?.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-100">
              <p className="text-sm text-purple-700 mb-2 font-medium">Lease Ends</p>
              <p className="text-2xl font-bold text-purple-900">{new Date(activeLease.endDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions with Illustrations */}
      <div className="relative">
        {/* Decorative element */}
        <div className="absolute -top-10 right-20 w-32 h-32 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full opacity-20 blur-3xl"></div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-6 relative z-10">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4 relative z-10">
          {[
            { label: 'Browse Properties', icon: '🔍', route: '/browse-properties', color: 'blue' },
            { label: 'Pay Rent', icon: '💳', route: '/payments', color: 'green' },
            { label: 'Report Issue', icon: '🔧', route: '/maintenance', color: 'yellow' },
            { label: 'Announcements', icon: '📢', route: '/announcements', color: 'purple' }
          ].map((action, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
              onClick={() => navigate(action.route)}
              className="relative overflow-hidden bg-white/80 backdrop-blur-sm hover:bg-white border border-gray-200 rounded-xl p-6 transition-all text-left shadow-sm hover:shadow-md group"
            >
              {/* Decorative corner */}
              <div className={`absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr ${
                action.color === 'blue' ? 'from-blue-100 to-blue-200' :
                action.color === 'green' ? 'from-green-100 to-green-200' :
                action.color === 'yellow' ? 'from-yellow-100 to-orange-200' :
                'from-purple-100 to-purple-200'
              } rounded-tr-full opacity-20 group-hover:opacity-30 transition-opacity`}></div>
              
              <span className="text-3xl mb-3 block relative z-10">{action.icon}</span>
              <p className="font-semibold text-gray-900 relative z-10">{action.label}</p>
            </motion.button>
          ))}
        </div>
      </div>
    </>
  );
};

export default DashboardPage;