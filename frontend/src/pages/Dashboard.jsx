import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <Navbar />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto px-4 py-8"
      >
        <h1 className="text-4xl font-bold text-white mb-8">Dashboard</h1>
        
        {/* Add your dashboard content here */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white/10 backdrop-blur-lg p-6 rounded-xl"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
            <p className="text-gray-300">Your recent activity will appear here...</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white/10 backdrop-blur-lg p-6 rounded-xl"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Market Updates</h2>
            <p className="text-gray-300">Latest market information will be shown here...</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white/10 backdrop-blur-lg p-6 rounded-xl"
          >
            <h2 className="text-xl font-semibold text-white mb-4">AI Insights</h2>
            <p className="text-gray-300">AI-powered agricultural insights will appear here...</p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard; 