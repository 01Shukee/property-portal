import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const features = [
    {
      icon: '🏢',
      title: 'Property Portfolio',
      description: 'Manage unlimited properties with ease. Track occupancy, rent, and maintenance all in one place.',
    },
    {
      icon: '💰',
      title: 'Flexible Payments',
      description: 'Accept rent via card, bank transfer, USSD, or cash. Built for Nigerian payment methods.',
    },
    {
      icon: '🔧',
      title: 'Maintenance Tracking',
      description: 'Tenants report issues, managers track and resolve. Everyone stays informed with notifications.',
    },
    {
      icon: '📢',
      title: 'Announcements',
      description: 'Communicate instantly with all tenants or specific properties. Keep everyone in the loop.',
    },
    {
      icon: '📝',
      title: 'Tenant Applications',
      description: 'Accept applications online, review, and approve. Schedule viewings right from the platform.',
    },
    {
      icon: '📊',
      title: 'Real-time Dashboard',
      description: 'See payment status, pending maintenance, and vacancy rates at a glance.',
    },
  ];

  const roles = [
    {
      title: 'Property Managers',
      description: 'Manage entire portfolios, track payments, coordinate maintenance, and communicate with tenants effortlessly.',
      color: 'from-blue-500 to-indigo-600',
    },
    {
      title: 'Homeowners',
      description: 'Monitor your properties, verify payments, and stay informed about maintenance without the hassle.',
      color: 'from-purple-500 to-pink-600',
    },
    {
      title: 'Tenants',
      description: 'Pay rent online, report issues, receive updates, and communicate with your property manager easily.',
      color: 'from-amber-500 to-orange-600',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="glass fixed w-full z-50 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
                P
              </div>
              <span className="text-2xl font-display font-bold bg-gradient-to-r from-primary-700 to-primary-900 bg-clip-text text-transparent">
                PropertyHub
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                How It Works
              </a>
              <Link to="/login" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-200 rounded-full blur-3xl opacity-20 -z-10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-200 rounded-full blur-3xl opacity-20 -z-10"></div>

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <div className="inline-block mb-4 px-4 py-2 bg-primary-100 rounded-full">
                <span className="text-primary-700 font-semibold text-sm">🇳🇬 Built for Nigerian Property Market</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-display font-bold text-gray-900 mb-6 leading-tight">
                Manage Your Properties{' '}
                <span className="bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
                  Effortlessly
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                The all-in-one platform for property managers, homeowners, and tenants. 
                Track rent, manage maintenance, and communicate seamlessly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register" className="btn btn-primary text-lg">
                  Start Free Trial
                </Link>
                <a href="#features" className="btn btn-secondary text-lg">
                  Learn More
                </a>
              </div>
              <div className="mt-8 flex items-center space-x-8 text-sm text-gray-600">
                <div>
                  <div className="text-2xl font-bold text-gray-900">500+</div>
                  <div>Properties Managed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">1000+</div>
                  <div>Active Users</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">₦50M+</div>
                  <div>Rent Processed</div>
                </div>
              </div>
            </div>

            {/* Hero Image/Illustration */}
            <div className="relative animate-slide-up hidden lg:block">
              <div className="relative w-full h-[500px] bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl shadow-2xl p-8 overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
                <div className="relative z-10 h-full flex items-center justify-center text-white text-6xl">
                  🏘️
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">
              Everything You Need in One Place
            </h2>
            <p className="text-xl text-gray-600">
              Powerful features designed specifically for property management in Nigeria
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card hover:scale-105 transition-transform duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-display font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">
              Perfect for Every Role
            </h2>
            <p className="text-xl text-gray-600">
              Whether you're managing properties, owning them, or renting one
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {roles.map((role, index) => (
              <div
                key={index}
                className="card bg-gradient-to-br hover:scale-105 transition-transform duration-300"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${role.color} rounded-2xl mb-4 flex items-center justify-center text-white text-2xl font-bold shadow-lg`}>
                  {index + 1}
                </div>
                <h3 className="text-2xl font-display font-bold text-gray-900 mb-3">
                  {role.title}
                </h3>
                <p className="text-gray-600">{role.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
            Ready to Simplify Property Management?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join hundreds of property managers and homeowners already using PropertyHub
          </p>
          <Link to="/register" className="btn bg-white text-primary-700 hover:bg-gray-100 text-lg inline-block">
            Get Started for Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white text-lg font-bold">
              P
            </div>
            <span className="text-xl font-display font-bold">PropertyHub</span>
          </div>
          <p className="text-gray-400 mb-6">
            Simplifying property management across Nigeria
          </p>
          <div className="flex justify-center space-x-6 text-sm text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact Us</a>
          </div>
          <p className="text-gray-500 mt-8 text-sm">
            © 2025 PropertyHub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
