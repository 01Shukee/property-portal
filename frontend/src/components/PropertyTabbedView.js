import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { leaseAPI, maintenanceAPI, activityAPI } from '../services/api';

const PropertyTabbedView = ({ property, lease, isOwnerView = false }) => {
  const { user, isTenant } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [tenants, setTenants] = useState([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState({
    tenants: false,
    maintenance: false,
    activities: false
  });

  // Load data based on active tab
  useEffect(() => {
    if (activeTab === 'tenants') {
      loadTenants();
    } else if (activeTab === 'maintenance') {
      loadMaintenance();
    } else if (activeTab === 'activity') {
      loadActivities();
    }
  }, [activeTab]);

  const loadTenants = async () => {
    setLoading(prev => ({ ...prev, tenants: true }));
    try {
      const data = await leaseAPI.getPropertyTenants(property._id);
      setTenants(data.leases);
    } catch (error) {
      console.error('Error loading tenants:', error);
    } finally {
      setLoading(prev => ({ ...prev, tenants: false }));
    }
  };

  const loadMaintenance = async () => {
    setLoading(prev => ({ ...prev, maintenance: true }));
    try {
      const data = await maintenanceAPI.getAll();
      // Filter for this property
      const propertyMaintenance = data.requests.filter(
        r => r.property?._id === property._id
      );
      setMaintenanceRequests(propertyMaintenance);
    } catch (error) {
      console.error('Error loading maintenance:', error);
    } finally {
      setLoading(prev => ({ ...prev, maintenance: false }));
    }
  };

  const loadActivities = async () => {
    setLoading(prev => ({ ...prev, activities: true }));
    try {
      const data = await activityAPI.getPropertyActivity(property._id);
      setActivities(data.activities);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(prev => ({ ...prev, activities: false }));
    }
  };

  const getDaysRemaining = (endDate) => {
    const days = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getTimeSince = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const getActivityIcon = (activity) => {
    if (activity.activityType === 'announcement') {
      switch (activity.type) {
        case 'maintenance': return '🔧';
        case 'payment': return '💰';
        case 'urgent': return '⚠️';
        default: return '📢';
      }
    } else {
      switch (activity.status) {
        case 'pending': return '🔴';
        case 'in_progress': return '🟡';
        case 'resolved': return '✅';
        default: return '🔧';
      }
    }
  };

  const tabs = [
    { id: 'overview', label: '📋 Overview', icon: '📋' },
    { id: 'tenants', label: '👥 Tenants', icon: '👥' },
    { id: 'maintenance', label: '🔧 Maintenance', icon: '🔧' },
    { id: 'activity', label: '📱 Feed', icon: '📱' }
  ];

  return (
    <div>
      {/* Tab Navigation */}
      <div className="card mb-6">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium rounded-lg transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="card">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <OverviewTab property={property} lease={lease} isOwnerView={isOwnerView} />
        )}

        {/* TENANTS TAB */}
        {activeTab === 'tenants' && (
          <TenantsTab
            tenants={tenants}
            loading={loading.tenants}
            property={property}
          />
        )}

        {/* MAINTENANCE TAB */}
        {activeTab === 'maintenance' && (
          <MaintenanceTab
            requests={maintenanceRequests}
            loading={loading.maintenance}
            property={property}
            onRefresh={loadMaintenance}
          />
        )}

        {/* ACTIVITY FEED TAB */}
        {activeTab === 'activity' && (
          <ActivityTab
            activities={activities}
            loading={loading.activities}
            onRefresh={loadActivities}
            getActivityIcon={getActivityIcon}
            getTimeSince={getTimeSince}
          />
        )}
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ property, lease, isOwnerView }) => {
  const getDaysRemaining = (endDate) => {
    const days = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const daysRemaining = lease ? getDaysRemaining(lease.endDate) : 0;
  const isExpiringSoon = daysRemaining > 0 && daysRemaining <= 30;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-1">
          {property.address}
        </h3>
        <p className="text-lg text-gray-600">
          📍 {property.city}, {property.state}
        </p>
      </div>

      {/* Property Details */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-blue-50 rounded-xl">
          <p className="text-sm text-blue-600 mb-1">Property Type</p>
          <p className="text-lg font-bold text-blue-900 capitalize">
            {property.propertyType}
          </p>
        </div>
        <div className="p-4 bg-green-50 rounded-xl">
          <p className="text-sm text-green-600 mb-1">Status</p>
          <p className="text-lg font-bold text-green-900 capitalize">
            {property.status}
          </p>
        </div>
        <div className="p-4 bg-purple-50 rounded-xl">
          <p className="text-sm text-purple-600 mb-1">Annual Rent</p>
          <p className="text-lg font-bold text-purple-900">
            ₦{property.rentAmount?.toLocaleString()}
          </p>
        </div>
        {property.bedrooms && (
          <div className="p-4 bg-amber-50 rounded-xl">
            <p className="text-sm text-amber-600 mb-1">Layout</p>
            <p className="text-lg font-bold text-amber-900">
              {property.bedrooms} Bed • {property.bathrooms} Bath
            </p>
          </div>
        )}
      </div>

      {/* Lease Information (if exists) */}
      {lease && (
        <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200">
          <h4 className="text-xl font-bold text-blue-900 mb-4">
            {isOwnerView ? 'Current Lease' : 'Your Lease'}
          </h4>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-blue-700 mb-1">Monthly Rent</p>
              <p className="text-2xl font-bold text-blue-900">
                ₦{lease.monthlyRent?.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-700 mb-1">Start Date</p>
              <p className="text-lg font-bold text-blue-900">
                {new Date(lease.startDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-700 mb-1">End Date</p>
              <p className="text-lg font-bold text-blue-900">
                {new Date(lease.endDate).toLocaleDateString()}
              </p>
              {lease.status === 'active' && (
                <p className={`text-xs mt-1 ${isExpiringSoon ? 'text-yellow-700' : 'text-blue-700'}`}>
                  {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Expired'}
                </p>
              )}
            </div>
          </div>

          {lease.tenant && isOwnerView && (
            <div className="mt-4 pt-4 border-t border-blue-300">
              <p className="text-sm text-blue-700 mb-2">Tenant Information</p>
              <p className="font-bold text-blue-900">{lease.tenant.name}</p>
              <p className="text-sm text-blue-800">
                📧 {lease.tenant.email} | 📱 {lease.tenant.phone}
              </p>
            </div>
          )}

          {lease.specialTerms && (
            <div className="mt-4 pt-4 border-t border-blue-300">
              <p className="text-sm text-blue-700 mb-1">Special Terms</p>
              <p className="text-sm text-blue-800">{lease.specialTerms}</p>
            </div>
          )}
        </div>
      )}

      {/* Description */}
      {property.description && (
        <div>
          <h4 className="text-lg font-bold text-gray-900 mb-2">About This Property</h4>
          <p className="text-gray-700">{property.description}</p>
        </div>
      )}

      {/* Homeowner Info (if PM/Tenant viewing) */}
      {property.homeowner && (
        <div className="p-4 bg-gray-50 rounded-xl">
          <h4 className="text-lg font-bold text-gray-900 mb-3">Property Owner</h4>
          <p className="font-medium text-gray-900">{property.homeowner.name}</p>
          <p className="text-sm text-gray-600">
            📧 {property.homeowner.email} | 📱 {property.homeowner.phone}
          </p>
        </div>
      )}
    </div>
  );
};

// Tenants Tab Component
const TenantsTab = ({ tenants, loading, property }) => {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading tenants...</p>
      </div>
    );
  }

  const activeTenants = tenants.filter(t => t.status === 'active');
  const pastTenants = tenants.filter(t => t.status !== 'active');

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Tenants in This Building
        </h3>
        <p className="text-gray-600">
          Connect with other tenants at {property.address}
        </p>
      </div>

      {activeTenants.length === 0 && pastTenants.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👥</div>
          <p className="text-gray-600">No tenants yet</p>
        </div>
      ) : (
        <>
          {/* Active Tenants */}
          {activeTenants.length > 0 && (
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-4">
                Current Tenants ({activeTenants.length})
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                {activeTenants.map((lease) => (
                  <div key={lease._id} className="p-4 border-2 border-green-200 bg-green-50 rounded-xl">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                          {lease.tenant?.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{lease.tenant?.name}</p>
                          <span className="badge badge-success text-xs">Active</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-600">
                        📧 {lease.tenant?.email}
                      </p>
                      <p className="text-gray-600">
                        📱 {lease.tenant?.phone}
                      </p>
                      <p className="text-gray-500 text-xs mt-2">
                        Moved in: {new Date(lease.startDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Past Tenants */}
          {pastTenants.length > 0 && (
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-4">
                Past Tenants ({pastTenants.length})
              </h4>
              <div className="space-y-3">
                {pastTenants.map((lease) => (
                  <div key={lease._id} className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{lease.tenant?.name}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(lease.startDate).toLocaleDateString()} - {new Date(lease.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`badge ${
                        lease.status === 'terminated' ? 'badge-danger' : 'badge-secondary'
                      }`}>
                        {lease.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Maintenance Tab Component
const MaintenanceTab = ({ requests, loading, property, onRefresh }) => {
  const { isTenant } = useAuth();

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading maintenance...</p>
      </div>
    );
  }

  const activeIssues = requests.filter(r => r.status !== 'resolved' && r.status !== 'cancelled');
  const resolvedIssues = requests.filter(r => r.status === 'resolved');

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'badge-warning';
      case 'in_progress': return 'badge-info';
      case 'resolved': return 'badge-success';
      case 'cancelled': return 'badge-secondary';
      default: return 'badge-secondary';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'badge-danger';
      case 'high': return 'badge-warning';
      case 'medium': return 'badge-info';
      case 'low': return 'badge-secondary';
      default: return 'badge-secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Maintenance Issues
          </h3>
          <p className="text-gray-600">
            Track all maintenance for {property.address}
          </p>
        </div>
        <button onClick={onRefresh} className="btn btn-secondary text-sm">
          🔄 Refresh
        </button>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔧</div>
          <p className="text-gray-600">No maintenance issues</p>
        </div>
      ) : (
        <>
          {/* Active Issues */}
          {activeIssues.length > 0 && (
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-4">
                Active Issues ({activeIssues.length})
              </h4>
              <div className="space-y-4">
                {activeIssues.map((request) => (
                  <div key={request._id} className="p-4 border-2 border-amber-200 bg-amber-50 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-gray-900">{request.title}</h4>
                      <div className="flex gap-2">
                        <span className={`badge ${getStatusColor(request.status)}`}>
                          {request.status.replace('_', ' ')}
                        </span>
                        <span className={`badge ${getPriorityColor(request.priority)}`}>
                          {request.priority}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{request.description}</p>
                    <p className="text-xs text-gray-500">
                      Reported: {new Date(request.createdAt).toLocaleDateString()}
                      {!isTenant && request.tenant && ` • By: ${request.tenant.name}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resolved Issues (Last 7 days) */}
          {resolvedIssues.length > 0 && (
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-4">
                Recently Resolved ({resolvedIssues.length})
              </h4>
              <div className="space-y-4">
                {resolvedIssues.map((request) => (
                  <div key={request._id} className="p-4 border-2 border-green-200 bg-green-50 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-gray-900">✅ {request.title}</h4>
                      <span className="badge badge-success">Resolved</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{request.description}</p>
                    {request.resolutionNotes && (
                      <div className="mt-2 p-3 bg-white rounded-lg">
                        <p className="text-sm font-medium text-green-800 mb-1">Resolution:</p>
                        <p className="text-sm text-green-700">{request.resolutionNotes}</p>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Resolved: {new Date(request.resolvedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-xs text-gray-600 text-center">
          ℹ️ Resolved issues are automatically removed after 7 days
        </p>
      </div>
    </div>
  );
};

// Activity Tab Component
const ActivityTab = ({ activities, loading, onRefresh, getActivityIcon, getTimeSince }) => {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading activity...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Activity Feed
          </h3>
          <p className="text-gray-600">Recent updates and announcements</p>
        </div>
        <button onClick={onRefresh} className="btn btn-secondary text-sm">
          🔄 Refresh
        </button>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-gray-600">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={`${activity.activityType}-${activity._id}`}
              className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className="flex gap-3">
                <div className="text-3xl flex-shrink-0">
                  {getActivityIcon(activity)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      {activity.activityType === 'announcement' ? (
                        <div>
                          <h4 className="font-bold text-gray-900">{activity.title}</h4>
                          <p className="text-sm text-gray-500">
                            by {activity.createdBy?.name} • {activity.createdBy?.role?.replace('_', ' ')}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <h4 className="font-bold text-gray-900">{activity.title}</h4>
                          <p className="text-sm text-gray-500">
                            {activity.category} • {activity.priority} priority
                          </p>
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {getTimeSince(activity.activityDate)}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-2 whitespace-pre-line">
                    {activity.activityType === 'announcement' 
                      ? activity.message 
                      : activity.description}
                  </p>
                  <div className="flex flex-wrap gap-2 items-center">
                    {activity.activityType === 'maintenance' && (
                      <span
                        className={`badge ${
                          activity.status === 'resolved'
                            ? 'badge-success'
                            : activity.status === 'in_progress'
                            ? 'badge-warning'
                            : 'badge-info'
                        }`}
                      >
                        {activity.status.replace('_', ' ')}
                      </span>
                    )}
                    {activity.status === 'resolved' && activity.resolutionNotes && (
                      <div className="w-full mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm font-medium text-green-800 mb-1">
                          ✅ Resolution:
                        </p>
                        <p className="text-sm text-green-700">
                          {activity.resolutionNotes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-xs text-gray-600 text-center">
          ℹ️ Old updates are automatically removed after 7 days
        </p>
      </div>
    </div>
  );
};

export default PropertyTabbedView;