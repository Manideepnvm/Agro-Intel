import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext";
import Navbar from "../components/Navbar";
import PropTypes from "prop-types";
import {
  FaNewspaper,
  FaGlobe,
  FaShare,
  FaBookmark,
  FaChartLine,
  FaTractor,
  FaCloudSun
} from "react-icons/fa";

const NewsCard = ({ item }) => {
  const { language } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden"
    >
      <div className="relative">
        <img
          src={item.image}
          alt={item.title[language]}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.target.src = "https://source.unsplash.com/800x600/?agriculture";
          }}
        />
        <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm">
          {item.category}
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-semibold text-white mb-3">
          {item.title[language] || item.title.en}
        </h3>

        <p className="text-gray-300 mb-4">
          {item.content[language] || item.content.en}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>{new Date(item.date).toLocaleDateString()}</span>

          <div className="flex items-center space-x-4">
            <button className="hover:text-green-400 transition-colors">
              <FaShare className="w-4 h-4" />
            </button>
            <button className="hover:text-green-400 transition-colors">
              <FaBookmark className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

NewsCard.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.shape({
      en: PropTypes.string.isRequired,
      hi: PropTypes.string,
      te: PropTypes.string,
      ta: PropTypes.string
    }).isRequired,
    content: PropTypes.shape({
      en: PropTypes.string.isRequired,
      hi: PropTypes.string,
      te: PropTypes.string,
      ta: PropTypes.string
    }).isRequired,
    image: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired
  }).isRequired
};

const Dashboard = () => {
  const { language } = useLanguage();
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true);
      setError(null);

      const apiKey = import.meta.env.VITE_NEWS_API_KEY;
      const url = `https://newsapi.org/v2/everything?q=agriculture OR farming OR crops OR farmers&language=en&sortBy=publishedAt&apiKey=${apiKey}`;

      try {
        const response = await axios.get(url);
        console.log("Fetched News Data:", response.data); // Debugging Log

        if (response.data.articles.length > 0) {
          setNews(
            response.data.articles.map((article, index) => ({
              id: index,
              title: {
                en: article.title || "No Title Available",
                hi: article.title,
                te: article.title,
                ta: article.title
              },
              content: {
                en: article.description || "No content available",
                hi: article.description,
                te: article.description,
                ta: article.description
              },
              image: article.urlToImage || "https://source.unsplash.com/800x600/?agriculture",
              date: article.publishedAt || new Date().toISOString(),
              category: "News"
            }))
          );
        } else {
          throw new Error("No news articles found");
        }
      } catch (err) {
        setError("Failed to fetch news. Please try again later.");
        console.error("Error fetching news:", err);
      }
      setIsLoading(false);
    };

    fetchNews();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Dashboard</h1>

          <div className="flex items-center space-x-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <FaGlobe className="text-green-400" />
              <span className="text-white">{language.toUpperCase()}</span>
            </motion.div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div whileHover={{ scale: 1.02 }} className="bg-white/10 backdrop-blur-lg p-6 rounded-xl">
            <div className="flex items-center space-x-3">
              <FaChartLine className="w-6 h-6 text-green-400" />
              <h2 className="text-xl font-semibold text-white">Market Trends</h2>
            </div>
            <p className="text-gray-300 mt-2">Latest market updates and price trends</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className="bg-white/10 backdrop-blur-lg p-6 rounded-xl">
            <div className="flex items-center space-x-3">
              <FaTractor className="w-6 h-6 text-green-400" />
              <h2 className="text-xl font-semibold text-white">Equipment Status</h2>
            </div>
            <p className="text-gray-300 mt-2">Monitor your farming equipment</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className="bg-white/10 backdrop-blur-lg p-6 rounded-xl">
            <div className="flex items-center space-x-3">
              <FaCloudSun className="w-6 h-6 text-green-400" />
              <h2 className="text-xl font-semibold text-white">Weather Forecast</h2>
            </div>
            <p className="text-gray-300 mt-2">5-day weather prediction for your region</p>
          </motion.div>
        </div>

        {/* News Feed */}
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <FaNewspaper className="w-6 h-6 mr-2 text-green-400" />
          Agricultural News Feed
        </h2>

        {error ? (
          <p className="text-red-400">{error}</p>
        ) : isLoading ? (
          <p className="text-gray-300">Loading news...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
