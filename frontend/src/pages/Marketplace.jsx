import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import Navbar from '../components/Navbar';
import { 
  FaMicrophone, FaFilter, FaShoppingCart, 
  FaStore, FaLeaf, FaTractor, FaHandshake, FaWhatsapp,
  FaMapMarkerAlt, FaRupeeSign, FaBullhorn 
} from 'react-icons/fa';
import MarketplaceData from '../../types/MarketplaceData';
import PropTypes from 'prop-types';

const Marketplace = () => {
  const { translate } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isVoiceSearchActive, setIsVoiceSearchActive] = useState(false);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    priceRange: [0, 100000],
    location: '',
    sortBy: 'recent',
    type: 'all' // buy/sell/bid
  });
  const [data,setData] = useState([])

  const loadData = async () => {
    await setData(MarketplaceData.marketplace)
  }
  console.log(MarketplaceData)

  const categories = [
    { id: 'all', label: 'All Items', icon: FaStore },
    { id: 'crops', label: 'Crops & Produce', icon: FaLeaf },
    { id: 'seeds', label: 'Seeds & Fertilizers', icon: FaTractor },
    { id: 'organic', label: 'Organic Products', icon: FaLeaf },
    { id: 'land', label: 'Land & Lease', icon: FaHandshake }
  ];

  useEffect(()=>{
    loadData()
  },[])

  useEffect(() => {
    fetchProducts();
  }, [activeCategory, filters]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      // API call would go here
      // const response = await fetch('/api/marketplace/products');
      // const data = await response.json();
      // Simulated data
      const mockProducts = [
        {
          id: 1,
          title: 'Organic Rice',
          description: 'Fresh organic rice from Tamil Nadu farms',
          price: 5000,
          quantity: '1 Quintal',
          location: 'Chennai',
          category: 'crops',
          images: ['rice1.jpg'],
          seller: {
            name: 'Raman Kumar',
            rating: 4.5,
            verified: true
          }
        },
        // Add more mock products
      ];
      setProducts(mockProducts);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setIsVoiceSearchActive(false);
      };
      recognition.start();
      setIsVoiceSearchActive(true);
    }
  };

  const ProductCard = ({ product }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-lg rounded-xl p-4 hover:bg-white/20 transition-all duration-300"
    >
      <div className="relative">
        <img 
          src={product.images} 
          alt={product.title}
          className="w-full h-48 object-cover rounded-lg"
        />
        <span className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-sm">
          {product.category}
        </span>
      </div>
      
      <div className="mt-4">
        <h3 className="text-lg font-semibold text-white">{product.title}</h3>
        <p className="text-gray-300 text-sm mt-1">{product.description}</p>
        
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center text-green-400">
            <FaRupeeSign className="w-4 h-4" />
            <span className="font-semibold">{product.price}</span>
            <span className="text-gray-400 text-sm ml-1">/ {product.quantity}</span>
          </div>
          
          <div className="flex items-center text-gray-400 text-sm">
            <FaMapMarkerAlt className="w-4 h-4 mr-1" />
            {product.location}
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <button className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-600 transition-colors">
            <FaWhatsapp className="w-4 h-4" />
            <span>Contact Seller</span>
          </button>
          
          <button className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg hover:bg-blue-500/30 transition-colors">
            Add to Cart
          </button>
        </div>
      </div>
    </motion.div>
  );

  // Prop validation for ProductCard
  ProductCard.propTypes = {
    product: PropTypes.shape({
      images: PropTypes.arrayOf(PropTypes.string).isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
      quantity: PropTypes.string.isRequired,
      category: PropTypes.string.isRequired,
      location: PropTypes.string.isRequired,
    }).isRequired,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="flex items-center space-x-4 mb-8">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={translate('marketplace.searchPlaceholder')}
              className="w-full px-4 py-3 bg-white/10 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
            />
            <button
              onClick={handleVoiceSearch}
              className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-400 transition-colors ${
                isVoiceSearchActive ? 'text-green-500 animate-pulse' : ''
              }`}
            >
              <FaMicrophone className="w-5 h-5" />
            </button>
          </div>
          
          <button className="p-3 bg-white/10 border border-gray-700 rounded-lg text-gray-400 hover:text-white hover:bg-white/20 transition-all">
            <FaFilter className="w-5 h-5" />
          </button>
        </div>

        {/* Categories */}
        <div className="flex space-x-4 overflow-x-auto pb-4 mb-8">
          {data?.map(category => (
            // <motion.button
            //   key={category.id}
            //   onClick={() => setActiveCategory(category.id)}
            //   className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap ${
            //     activeCategory === category.id
            //       ? 'bg-green-500 text-white'
            //       : 'bg-white/10 text-gray-300 hover:bg-white/20'
            //   }`}
            //   whileHover={{ scale: 1.05 }}
            //   whileTap={{ scale: 0.95 }}
            // >
            //   <category.icon className="w-4 h-4" />
            //   <span>{category.label}</span>
            // </motion.button>
            <div 
              key={data.id}
            >
              <h1>{data.category}</h1>
            </div>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            // Loading skeletons
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse bg-white/10 rounded-xl p-4">
                <div className="bg-white/20 h-48 rounded-lg mb-4" />
                <div className="bg-white/20 h-4 rounded w-3/4 mb-2" />
                <div className="bg-white/20 h-4 rounded w-1/2" />
              </div>
            ))
          ) : (
            data.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>

        {/* Community Section */}
        <div className="mt-12 bg-white/5 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
            <FaBullhorn className="w-6 h-6 mr-2 text-green-400" />
            Community Hub
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Forum Card */}
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-2">Farmer Forums</h3>
              <p className="text-gray-400 text-sm">Join discussions about farming techniques and market prices</p>
            </div>
            
            {/* Support Card */}
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-2">24/7 Support</h3>
              <button className="flex items-center space-x-2 text-green-400 hover:text-green-300">
                <FaWhatsapp className="w-5 h-5" />
                <span>Chat with Support</span>
              </button>
            </div>
            
            {/* Guides Card */}
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-2">Helpful Guides</h3>
              <p className="text-gray-400 text-sm">Learn how to get the most out of the marketplace</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketplace; 