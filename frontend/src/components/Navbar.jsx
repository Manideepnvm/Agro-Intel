import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHome, FaStore, FaChartLine, FaUserCircle, FaCog, FaSignOutAlt } from 'react-icons/fa';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { icon: FaHome, label: 'Dashboard', path: '/dashboard' },
    { icon: FaStore, label: 'Marketplace', path: '/marketplace' },
    { icon: FaChartLine, label: 'Analytics', path: '/analytics' },
    { icon: FaUserCircle, label: 'Profile', path: '/profile' },
    { icon: FaCog, label: 'Settings', path: '/settings' },
  ];

  const handleLogout = () => {
    // Add logout logic here
    navigate('/');
  };

  return (
    <nav className="bg-black/90 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center space-x-4"
          >
            <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
              Agro-Intel
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <motion.button
                key={item.label}
                onClick={() => navigate(item.path)}
                className="flex items-center space-x-2 text-gray-300 hover:text-green-400 transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </motion.button>
            ))}
            <motion.button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-red-400 hover:text-red-300 transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaSignOutAlt className="h-5 w-5" />
              <span>Logout</span>
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <motion.div
          initial={false}
          animate={{ height: isOpen ? 'auto' : 0 }}
          className={`md:hidden overflow-hidden ${isOpen ? 'border-t border-gray-700' : ''}`}
        >
          <div className="space-y-1 pb-3 pt-2">
            {menuItems.map((item) => (
              <motion.button
                key={item.label}
                onClick={() => {
                  navigate(item.path);
                  setIsOpen(false);
                }}
                className="w-full flex items-center space-x-2 px-4 py-2 text-gray-300 hover:bg-gray-800 transition-colors duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </motion.button>
            ))}
            <motion.button
              onClick={handleLogout}
              className="w-full flex items-center space-x-2 px-4 py-2 text-red-400 hover:bg-gray-800 transition-colors duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaSignOutAlt className="h-5 w-5" />
              <span>Logout</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </nav>
  );
};

export default Navbar; 