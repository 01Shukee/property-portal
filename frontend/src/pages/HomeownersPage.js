import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { propertyAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';

const HomeownersPage = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const data = await propertyAPI.getAll();
      setProperties(data.properties);
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique homeowners from properties
  const getUniqueHomeowners = () => {
    const homeownerMap = new Map();
    properties.forEach(property => {
      if (property.homeowner) {
        homeownerMap.set(property.homeowner._id, {
          ...property.homeowner,
          propertyCount: (homeownerMap.get(property.homeowner._id)?.propertyCount || 0) + 1
        });
      }
    });
    return Array.from(homeownerMap.values());
  };

  const homeowners = getUniqueHomeowners();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading homeowners...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">
              Homeowners
            </h1>
            <p className="text-gray-600">
              View all homeowners and their properties
            </p>
          </div>
          <button
            onClick={() => navigate('/properties')}
            className="btn btn-primary"
          >
            Go to Properties
          </button>
        </div>

        {/* Info Banner */}
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-blue-800 text-sm">
            💡 To invite a homeowner, go to <strong>Properties</strong> and click "Invite Homeowner" on a specific property.
          </p>
        </div>

        {/* Homeowners List */}
        {homeowners.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No Homeowners Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create a property first, then invite a homeowner to manage it
            </p>
            <button
              onClick={() => navigate('/properties')}
              className="btn btn-primary"
            >
              Go to Properties
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {homeowners.map((homeowner) => (
              <div key={homeowner._id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {homeowner.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="badge badge-success">
                    Active
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {homeowner.name}
                </h3>
                <p className="text-gray-600 text-sm mb-1">
                  📧 {homeowner.email}
                </p>
                <p className="text-gray-600 text-sm mb-1">
                  📱 {homeowner.phone}
                </p>
                {homeowner.address && (
                  <p className="text-gray-600 text-sm mb-3">
                    📍 {homeowner.address}
                  </p>
                )}

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-900">
                    {homeowner.propertyCount} {homeowner.propertyCount === 1 ? 'Property' : 'Properties'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeownersPage;