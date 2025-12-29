import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const LandingPage = () => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const features = [
    {
      icon: "🏢",
      title: "Property Managers",
      description: "Manage properties, units, tenants, and payments effortlessly",
      action: "Get Started",
      onClick: () => navigate('/register')
    },
    {
      icon: "🏠",
      title: "Tenants",
      description: "Browse units, apply online, pay rent, report maintenance",
      action: "Find Home",
      onClick: () => navigate('/browse-properties') // Allow browsing without login
    },
    {
      icon: "👤",
      title: "Homeowners",
      description: "Monitor your properties, track income, view reports",
      action: "Join Now",
      onClick: () => navigate('/register')
    }
  ];

  const stats = [
    { number: "500+", label: "Properties" },
    { number: "2000+", label: "Happy Tenants" },
    { number: "99%", label: "Satisfaction" },
    { number: "24/7", label: "Support" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent cursor-pointer"
            onClick={() => navigate('/')}
          >
            PropertyHub
          </motion.div>

          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
              className="px-6 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Sign In
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/register')}
              className="px-6 py-2 bg-black text-white rounded-full font-medium"
            >
              Get Started
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              variants={itemVariants}
              className="inline-block mb-6"
            >
              <span className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
                ✨ Modern Property Management
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight"
            >
              Property Management,
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Simplified
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto"
            >
              The all-in-one platform for property managers, tenants, and homeowners.
              Modern, efficient, and beautifully simple.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex items-center justify-center gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/register')}
                className="px-8 py-4 bg-black text-white rounded-full text-lg font-medium"
              >
                Start Free Trial
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/browse-properties')}
                className="px-8 py-4 border-2 border-gray-900 text-gray-900 rounded-full text-lg font-medium hover:bg-gray-50"
              >
                Browse Properties
              </motion.button>
            </motion.div>

            {/* Floating elements */}
            <motion.div
              variants={floatingVariants}
              animate="animate"
              className="mt-20 relative h-96"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-80 h-80 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"></div>
              </div>

              {/* Mock dashboard preview */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="relative z-10 max-w-5xl mx-auto"
              >
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                  <div className="bg-gray-900 p-4 flex items-center gap-2">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="flex-1 text-center text-white text-sm font-medium">
                      PropertyHub Dashboard
                    </div>
                  </div>
                  <div className="p-8 bg-gradient-to-br from-gray-50 to-white">
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                          <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
                          <div className="h-6 bg-gray-900 rounded w-16"></div>
                        </div>
                      ))}
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                      <div className="space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                            <div className="flex-1">
                              <div className="h-3 bg-gray-200 rounded w-32 mb-2"></div>
                              <div className="h-2 bg-gray-100 rounded w-48"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-gray-900 mb-4">
              Built for Everyone
            </h2>
            <p className="text-xl text-gray-600">
              Whether you manage properties, rent a home, or own real estate
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                whileHover={{ y: -10 }}
                onHoverStart={() => setHoveredCard(index)}
                onHoverEnd={() => setHoveredCard(null)}
                className="relative group"
              >
                <div className="bg-white rounded-3xl p-8 h-full border-2 border-gray-100 hover:border-gray-900 transition-all duration-300">
                  {/* Icon - NO rotation */}
                  <div className="text-6xl mb-6">
                    {feature.icon}
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>

                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {feature.description}
                  </p>

                  <motion.button
                    whileHover={{ x: 5 }}
                    onClick={feature.onClick}
                    className="flex items-center gap-2 text-gray-900 font-medium group-hover:gap-4 transition-all"
                  >
                    {feature.action}
                    <span>→</span>
                  </motion.button>
                </div>

                {/* Animated border on hover */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: hoveredCard === index ? 1 : 0 }}
                  className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500 to-purple-500 -z-10 blur-xl"
                  style={{ transform: 'scale(1.05)' }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2"
                >
                  {stat.number}
                </motion.div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-300 mb-12">
              Join thousands of users managing their properties efficiently
            </p>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(255,255,255,0.2)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-white text-gray-900 rounded-full text-lg font-medium"
            >
              Start Free Trial →
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            PropertyHub
          </div>
          <p className="text-gray-600 mb-6">
            Modern property management for the modern world
          </p>
          <div className="flex justify-center gap-8 text-sm text-gray-500">
            <a href="#" className="hover:text-gray-900">Privacy</a>
            <a href="#" className="hover:text-gray-900">Terms</a>
            <a href="#" className="hover:text-gray-900">Contact</a>
          </div>
          <p className="text-gray-400 text-sm mt-6">
            © 2025 PropertyHub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;