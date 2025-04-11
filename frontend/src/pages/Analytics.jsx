import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import Navbar from '../components/Navbar';
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  FaChartLine, FaChartPie,
  FaRupeeSign, FaUsers, FaRobot
} from 'react-icons/fa';

const Analytics = () => {
  const { translate } = useLanguage();
  const [activeTab, setActiveTab] = useState('sales');
  const [timeRange, setTimeRange] = useState('month');
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    sales: [],
    trends: [],
    buyers: [],
    predictions: []
  });

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'];

  const tabs = [
    { id: 'sales', label: 'Sales & Earnings', icon: FaChartLine },
    { id: 'trends', label: 'Market Trends', icon: FaChartPie },
    { id: 'buyers', label: 'Buyer Insights', icon: FaUsers },
    { id: 'predictions', label: 'AI Predictions', icon: FaRobot }
  ];

  useEffect(() => {
    fetchAnalyticsData();
  }, [activeTab, timeRange]);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // Simulated data - replace with actual API calls
      const mockData = {
        sales: [
          { month: 'Jan', sales: 4000, earnings: 24000 },
          { month: 'Feb', sales: 3000, earnings: 18000 },
          { month: 'Mar', sales: 5000, earnings: 30000 },
          // Add more months...
        ],
        trends: [
          { name: 'Rice', value: 400, price: 35 },
          { name: 'Wheat', value: 300, price: 28 },
          { name: 'Cotton', value: 300, price: 45 },
          { name: 'Peas', value: 200, price: 52 }
        ],
        buyers: [
          { category: 'Retailers', count: 45 },
          { category: 'Wholesalers', count: 25 },
          { category: 'Direct', count: 30 }
        ],
        predictions: [
          { crop: 'Rice', confidence: 85, suggestion: 'Good time to sow' },
          { crop: 'Wheat', confidence: 65, suggestion: 'Wait for rain' },
          { crop: 'Cotton', confidence: 90, suggestion: 'Ideal conditions' }
        ]
      };
      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderSalesAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Sales Summary Cards */}
        <div className="bg-white/10 rounded-xl p-4">
          <h3 className="text-lg font-semibold text-white mb-2">Total Sales</h3>
          <div className="flex items-center text-green-400">
            <FaRupeeSign className="w-4 h-4 mr-1" />
            <span className="text-2xl font-bold">72,000</span>
          </div>
          <p className="text-gray-400 text-sm mt-1">+15% from last month</p>
        </div>
        {/* Add more summary cards */}
      </div>

      <div className="bg-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Sales Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={analyticsData.sales}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="month" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
              itemStyle={{ color: '#fff' }}
            />
            <Area
              type="monotone"
              dataKey="earnings"
              stroke="#10B981"
              fill="#10B981"
              fillOpacity={0.2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderMarketTrends = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Price Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                itemStyle={{ color: '#fff' }}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#3B82F6"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Market Share</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.trends}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
              >
                {analyticsData.trends.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                itemStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderAIPredictions = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {analyticsData.predictions.map((prediction, index) => (
          <div key={index} className="bg-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">{prediction.crop}</h3>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-400 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
                  <path fill="currentColor" d="M537.6 226.6c4.1-10.7 6.4-22.4 6.4-34.6 0-53-43-96-96-96-19.7 0-38.1 6-53.3 16.2C367 64.2 315.3 32 256 32c-88.4 0-160 71.6-160 160 0 2.7.1 5.4.2 8.1C40.2 219.8 0 273.2 0 336c0 79.5 64.5 144 144 144h368c70.7 0 128-57.3 128-128 0-61.9-44-113.6-102.4-125.4z"/>
                </svg>
                <span className="text-blue-400">{prediction.confidence}% Confidence</span>
              </div>
            </div>
            <p className="text-gray-300">{prediction.suggestion}</p>
            <div className="mt-4 bg-white/5 rounded-lg p-3">
              <h4 className="text-sm font-medium text-white mb-2">AI Recommendations:</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Best time to sow: Next week</li>
                <li>• Expected yield: 2.5 tons/acre</li>
                <li>• Market price trend: Upward</li>
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            {translate('analytics.title')}
          </h1>
          
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-white/10 border border-gray-700 rounded-lg px-4 py-2 text-white"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-8 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                activeTab === tab.id
                  ? 'bg-green-500 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse bg-white/10 rounded-xl p-6">
                  <div className="h-4 bg-white/20 rounded w-3/4 mb-4" />
                  <div className="h-32 bg-white/20 rounded mb-4" />
                  <div className="h-4 bg-white/20 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {activeTab === 'sales' && renderSalesAnalytics()}
              {activeTab === 'trends' && renderMarketTrends()}
              {activeTab === 'buyers' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white/10 rounded-xl p-6">
                    <h3 className="text-xl font-semibold mb-4">Buyer Demographics</h3>
                    <p>Buyer insights data will be displayed here</p>
                  </div>
                </div>
              )}
              {activeTab === 'predictions' && renderAIPredictions()}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics; 