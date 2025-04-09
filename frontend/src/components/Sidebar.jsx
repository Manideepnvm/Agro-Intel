import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaHome, 
  FaChartBar, 
  FaStore, 
  FaCog, 
  FaSignOutAlt,
  FaBars,
  FaTimes
} from 'react-icons/fa';
import { authService } from '../services/auth.service';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  
  const menuItems = [
    { path: '/dashboard', icon: FaHome, label: 'Dashboard' },
    { path: '/analytics', icon: FaChartBar, label: 'Analytics' },
    { path: '/marketplace', icon: FaStore, label: 'Marketplace' },
    { path: '/settings', icon: FaCog, label: 'Settings' }
  ];

  const handleLogout = async () => {
    try {
      await authService.logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <motion.div 
      className={`bg-gray-800 h-screen ${
        isCollapsed ? 'w-20' : 'w-64'
      } transition-all duration-300 relative`}
      initial={false}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute right-0 top-4 transform translate-x-1/2 bg-gray-700 rounded-full p-2 text-gray-300 hover:bg-gray-600 z-10"
      >
        {isCollapsed ? <FaBars size={16} /> : <FaTimes size={16} />}
      </button>

      {/* Logo */}
      <div className="p-6">
        <Link to="/dashboard" className="flex items-center space-x-3">
          <img 
            src="/logo.png" 
            alt="Logo" 
            className="w-10 h-10"
          />
          {!isCollapsed && (
            <span className="text-xl font-bold text-white">
              Agro-Intel
            </span>
          )}
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="mt-8">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 transition-colors duration-200 ${
                    isActive ? 'bg-gray-700 text-white' : ''
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-green-500' : ''}`} />
                  {!isCollapsed && (
                    <span className="ml-3">{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="absolute bottom-0 w-full p-6">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors duration-200"
        >
          <FaSignOutAlt className="w-5 h-5" />
          {!isCollapsed && (
            <span className="ml-3">Logout</span>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar; 