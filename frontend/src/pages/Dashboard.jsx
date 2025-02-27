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
  FaCloudSun,
  FaMapMarkerAlt,
  FaSearch
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

const WeatherCard = ({ location }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const fetchWeather = async (city) => {
    try {
      setLoading(true);
      const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
      );
      
      // Process 5-day forecast
      const forecasts = response.data.list.filter((item, index) => index % 8 === 0);
      setWeather({
        current: forecasts[0],
        daily: forecasts,
        city: response.data.city.name
      });
      setError(null);
    } catch (err) {
      setError("Failed to fetch weather data");
      console.error("Weather fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(location);
  }, [location]);

  const handleLocationSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchWeather(searchQuery);
      setSearchQuery("");
      setShowSearch(false);
    }
  };

  if (loading) return <p className="text-gray-300">Loading weather data...</p>;
  if (error) return <p className="text-red-400">{error}</p>;
  if (!weather) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-lg p-6 rounded-xl relative"
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <FaCloudSun className="w-6 h-6 text-green-400" />
          <h2 className="text-xl font-semibold text-white">Weather Forecast</h2>
        </div>
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <FaMapMarkerAlt className="w-5 h-5" />
        </button>
      </div>

      {showSearch && (
        <form onSubmit={handleLocationSearch} className="mb-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter city name..."
              className="flex-1 px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <FaSearch className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      <div className="text-gray-300 mb-4">
        <p className="text-lg font-semibold text-white">{weather.city}</p>
        <p className="text-3xl font-bold text-white mb-2">
          {Math.round(weather.current.main.temp)}°C
        </p>
        <p>{weather.current.weather[0].description}</p>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {weather.daily.map((day, index) => (
          <div key={index} className="text-center">
            <p className="text-sm text-gray-400">
              {new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}
            </p>
            <p className="text-lg font-semibold text-white">
              {Math.round(day.main.temp)}°C
            </p>
            <img
              src={`http://openweathermap.org/img/wn/${day.weather[0].icon}.png`}
              alt={day.weather[0].description}
              className="w-8 h-8 mx-auto"
            />
          </div>
        ))}
      </div>
    </motion.div>
  );
};

WeatherCard.propTypes = {
  location: PropTypes.string.isRequired
};

const Dashboard = () => {
  const { language } = useLanguage();
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [defaultLocation, setDefaultLocation] = useState("Delhi");

  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true);
      setError(null);

      const apiKey = import.meta.env.VITE_NEWS_API_KEY;
      const url = `https://newsapi.org/v2/everything?q=agriculture AND India&language=en&sortBy=publishedAt&apiKey=${apiKey}`;

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

          <WeatherCard location={defaultLocation} />
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
