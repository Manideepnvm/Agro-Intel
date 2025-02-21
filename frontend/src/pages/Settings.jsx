import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaEdit, FaCheck, FaGlobe, FaShieldAlt, FaCog, FaLeaf, FaBriefcase, FaLanguage, FaCamera, FaExclamationCircle } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import { useLanguage } from '../contexts/LanguageContext';

const Settings = () => {
  const { language, setLanguage, translate } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [imageError, setImageError] = useState('');

  const [userDetails, setUserDetails] = useState({
    // Basic Information
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    profileImage: null,
    location: {
      address: '123 Farm Street',
      city: 'Agro City',
      state: 'State',
      pincode: '123456',
      country: 'Country'
    },
    preferredLanguage: 'English',
    
    // User Type
    userType: 'farmer',
    farmingScale: 'small', // small/mid/large
    
    // Agriculture Details
    farmDetails: {
      landArea: '50',
      cultivationType: 'Organic',
      experience: '10',
      crops: ['Wheat', 'Rice', 'Corn'],
    },
    
    // Business Details
    businessDetails: {
      name: '',
      category: '',
      gstNumber: '',
      licenseNumber: ''
    },
    
    // Preferences
    preferences: {
      enableAI: true,
      marketplaceRole: 'both', // buying/selling/both
      paymentMethods: ['UPI', 'Bank Transfer'],
      notifications: true,
      marketUpdates: true
    },
    
    // Security
    security: {
      twoFactorEnabled: false,
      lastPasswordChange: '2024-01-01',
      verificationStatus: 'verified',
      preferredLoginMethod: 'phone'
    },
    languagePreferences: {
      primaryLanguage: 'en',
      secondaryLanguages: [], // Array of language codes
      requireTranslation: false,
      preferredCommunication: 'primary' // primary/any/translation
    },
  });

  const [editedDetails, setEditedDetails] = useState(userDetails);

  // Tabs configuration
  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: FaUser },
    { id: 'language', label: 'Language', icon: FaLanguage },
    { id: 'agriculture', label: 'Agriculture', icon: FaLeaf },
    { id: 'business', label: 'Business', icon: FaBriefcase },
    { id: 'preferences', label: 'Preferences', icon: FaCog },
    { id: 'security', label: 'Security', icon: FaShieldAlt }
  ];

  // Available options for dropdowns
  const options = {
    languages: [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
      { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
      { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
      { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
      { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
      { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
      { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
      { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
      { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' }
    ],
    userTypes: ['farmer', 'buyer', 'service_provider'],
    farmingScales: ['small', 'mid', 'large'],
    cultivationTypes: ['Organic', 'Traditional', 'Hydroponic', 'Mixed'],
    crops: ['Wheat', 'Rice', 'Corn', 'Soybeans', 'Cotton', 'Sugarcane'],
    businessCategories: ['Retailer', 'Wholesaler', 'Distributor', 'Agro Services'],
    paymentMethods: ['UPI', 'Bank Transfer', 'Cash on Delivery', 'Credit Card'],
    loginMethods: ['phone', 'email', 'both']
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        // API call would go here
        // const response = await fetch('/api/user/profile');
        // const data = await response.json();
        // setUserDetails(data);
        // setEditedDetails(data);
      } catch (error) {
        console.error('Error fetching profile data:', error);
        // Handle error state appropriately
      }
    };

    fetchUserDetails();
  }, []);

  const handleInputChange = (e, section = null) => {
    const { name, value, type, checked } = e.target;
    setEditedDetails(prev => {
      if (section) {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [name]: type === 'checkbox' ? checked : value
          }
        };
      }
      return {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        setImageError('Only JPG and PNG files are allowed');
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setImageError('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedDetails(prev => ({
          ...prev,
          profileImage: reader.result
        }));
        setImageError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Here you would make an API call to update the profile
      // const response = await fetch('/api/user/profile', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(editedDetails)
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUserDetails(editedDetails);
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      console.error('Failed to update profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedDetails(userDetails);
    setIsEditing(false);
    setMessage({ type: '', text: '' });
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    setEditedDetails(prev => ({
      ...prev,
      languagePreferences: {
        ...prev.languagePreferences,
        primaryLanguage: newLanguage
      }
    }));
  };

  const renderBasicInfo = () => (
    <div className="space-y-6">
      {/* Profile Image Section */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-600 border-4 border-green-500/30">
            {editedDetails.profileImage ? (
              <img
                src={editedDetails.profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <FaUser className="w-16 h-16" />
              </div>
            )}
            {isEditing && (
              <label className="absolute bottom-0 right-0 bg-green-500 p-2 rounded-full cursor-pointer hover:bg-green-600 transition-colors duration-200 group">
                <FaCamera className="w-4 h-4 text-white" />
                <input
                  type="file"
                  className="hidden"
                  accept=".jpg,.jpeg,.png"
                  onChange={handleImageChange}
                />
                <div className="absolute bottom-full right-0 mb-2 w-48 bg-black/90 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  Click to upload profile photo (JPG or PNG)
                </div>
              </label>
            )}
          </div>
          {imageError && (
            <div className="mt-2 text-red-400 text-sm flex items-center gap-1">
              <FaExclamationCircle className="w-4 h-4" />
              <span>{imageError}</span>
            </div>
          )}
          <div className="mt-2 text-center text-gray-400 text-sm">
            {isEditing ? (
              "Click the camera icon to upload a photo"
            ) : (
              editedDetails.profileImage ? "Profile Photo" : "No photo uploaded"
            )}
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300">First Name</label>
          <input
            type="text"
            name="firstName"
            value={editedDetails.firstName}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="mt-1 w-full px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Last Name</label>
          <input
            type="text"
            name="lastName"
            value={editedDetails.lastName}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="mt-1 w-full px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Email</label>
          <input
            type="email"
            name="email"
            value={editedDetails.email}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="mt-1 w-full px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Phone</label>
          <input
            type="tel"
            name="phone"
            value={editedDetails.phone}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="mt-1 w-full px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white"
          />
        </div>
      </div>

      {/* Location Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-300">Address</label>
          <input
            type="text"
            name="address"
            value={editedDetails.location.address}
            onChange={(e) => handleInputChange(e, 'location')}
            disabled={!isEditing}
            className="mt-1 w-full px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">City</label>
          <input
            type="text"
            name="city"
            value={editedDetails.location.city}
            onChange={(e) => handleInputChange(e, 'location')}
            disabled={!isEditing}
            className="mt-1 w-full px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">State</label>
          <input
            type="text"
            name="state"
            value={editedDetails.location.state}
            onChange={(e) => handleInputChange(e, 'location')}
            disabled={!isEditing}
            className="mt-1 w-full px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Pincode</label>
          <input
            type="text"
            name="pincode"
            value={editedDetails.location.pincode}
            onChange={(e) => handleInputChange(e, 'location')}
            disabled={!isEditing}
            className="mt-1 w-full px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Country</label>
          <input
            type="text"
            name="country"
            value={editedDetails.location.country}
            onChange={(e) => handleInputChange(e, 'location')}
            disabled={!isEditing}
            className="mt-1 w-full px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white"
          />
        </div>
      </div>
    </div>
  );

  const renderLanguagePreferences = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white flex items-center gap-2">
        <FaLanguage className="w-5 h-5" />
        {translate('profile.language')}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300">
            {translate('profile.primaryLanguage')}
          </label>
          <select
            name="primaryLanguage"
            value={language}
            onChange={handleLanguageChange}
            disabled={!isEditing}
            className="mt-1 w-full px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white"
          >
            {options.languages.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.name} ({lang.nativeName})
              </option>
            ))}
          </select>
        </div>

        {/* Secondary Languages (Multi-select) */}
        <div>
          <label className="block text-sm font-medium text-gray-300">
            Additional Languages (Select multiple)
          </label>
          <select
            multiple
            name="secondaryLanguages"
            value={editedDetails.languagePreferences.secondaryLanguages}
            onChange={(e) => {
              const values = Array.from(e.target.selectedOptions, option => option.value);
              setEditedDetails(prev => ({
                ...prev,
                languagePreferences: {
                  ...prev.languagePreferences,
                  secondaryLanguages: values
                }
              }));
            }}
            disabled={!isEditing}
            className="mt-1 w-full px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white"
            size={4}
          >
            {options.languages
              .filter(lang => lang.code !== editedDetails.languagePreferences.primaryLanguage)
              .map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.name} ({lang.nativeName})
                </option>
              ))}
          </select>
        </div>

        {/* Translation Preferences */}
        <div className="col-span-2">
          <div className="flex items-center space-x-3 mb-4">
            <input
              type="checkbox"
              name="requireTranslation"
              checked={editedDetails.languagePreferences.requireTranslation}
              onChange={(e) => handleInputChange(e, 'languagePreferences')}
              disabled={!isEditing}
              className="w-4 h-4 rounded border-gray-600"
            />
            <label className="text-sm font-medium text-gray-300">
              Enable automatic translation for marketplace communications
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              Communication Preference
            </label>
            <select
              name="preferredCommunication"
              value={editedDetails.languagePreferences.preferredCommunication}
              onChange={(e) => handleInputChange(e, 'languagePreferences')}
              disabled={!isEditing}
              className="mt-1 w-full px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white"
            >
              <option value="primary">Primary Language Only</option>
              <option value="any">Any Known Language</option>
              <option value="translation">Allow Translated Content</option>
            </select>
          </div>
        </div>

        {/* Language Proficiency Indicators */}
        <div className="col-span-2 bg-black/20 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Your Language Profile</h3>
          <div className="space-y-2">
            {[editedDetails.languagePreferences.primaryLanguage, 
              ...editedDetails.languagePreferences.secondaryLanguages]
              .map(langCode => {
                const lang = options.languages.find(l => l.code === langCode);
                return lang ? (
                  <div key={lang.code} className="flex items-center gap-2">
                    <FaGlobe className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300">
                      {lang.name} ({lang.nativeName})
                      {langCode === editedDetails.languagePreferences.primaryLanguage && 
                        " - Primary Language"}
                    </span>
                  </div>
                ) : null;
              })}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAgricultureDetails = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white flex items-center gap-2">
        <FaLeaf className="w-5 h-5" />
        Agriculture Information
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300">User Type</label>
          <select
            name="userType"
            value={editedDetails.userType}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="mt-1 w-full px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white"
          >
            {options.userTypes.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        {editedDetails.userType === 'farmer' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300">Farming Scale</label>
              <select
                name="farmingScale"
                value={editedDetails.farmingScale}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="mt-1 w-full px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white"
              >
                {options.farmingScales.map(scale => (
                  <option key={scale} value={scale}>
                    {scale.charAt(0).toUpperCase() + scale.slice(1)} Scale
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">Land Area (acres)</label>
              <input
                type="number"
                name="landArea"
                value={editedDetails.farmDetails.landArea}
                onChange={(e) => handleInputChange(e, 'farmDetails')}
                disabled={!isEditing}
                className="mt-1 w-full px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">Cultivation Type</label>
              <select
                name="cultivationType"
                value={editedDetails.farmDetails.cultivationType}
                onChange={(e) => handleInputChange(e, 'farmDetails')}
                disabled={!isEditing}
                className="mt-1 w-full px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white"
              >
                {options.cultivationTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">Years of Experience</label>
              <input
                type="number"
                name="experience"
                value={editedDetails.farmDetails.experience}
                onChange={(e) => handleInputChange(e, 'farmDetails')}
                disabled={!isEditing}
                className="mt-1 w-full px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-300">Main Crops</label>
              <select
                multiple
                name="crops"
                value={editedDetails.farmDetails.crops}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => option.value);
                  setEditedDetails(prev => ({
                    ...prev,
                    farmDetails: {
                      ...prev.farmDetails,
                      crops: values
                    }
                  }));
                }}
                disabled={!isEditing}
                className="mt-1 w-full px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white"
                size={4}
              >
                {options.crops.map(crop => (
                  <option key={crop} value={crop}>{crop}</option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>
    </div>
  );

  const renderBusinessDetails = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white flex items-center gap-2">
        <FaBriefcase className="w-5 h-5" />
        Business Information
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-300">Business Name</label>
          <input
            type="text"
            name="name"
            value={editedDetails.businessDetails.name}
            onChange={(e) => handleInputChange(e, 'businessDetails')}
            disabled={!isEditing}
            className="mt-1 w-full px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">Business Category</label>
          <select
            name="category"
            value={editedDetails.businessDetails.category}
            onChange={(e) => handleInputChange(e, 'businessDetails')}
            disabled={!isEditing}
            className="mt-1 w-full px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white"
          >
            <option value="">Select Category</option>
            {options.businessCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">GST Number</label>
          <input
            type="text"
            name="gstNumber"
            value={editedDetails.businessDetails.gstNumber}
            onChange={(e) => handleInputChange(e, 'businessDetails')}
            disabled={!isEditing}
            className="mt-1 w-full px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">License Number</label>
          <input
            type="text"
            name="licenseNumber"
            value={editedDetails.businessDetails.licenseNumber}
            onChange={(e) => handleInputChange(e, 'businessDetails')}
            disabled={!isEditing}
            className="mt-1 w-full px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white"
          />
        </div>
      </div>
    </div>
  );

  const renderPreferences = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            name="enableAI"
            checked={editedDetails.preferences.enableAI}
            onChange={(e) => handleInputChange(e, 'preferences')}
            disabled={!isEditing}
            className="w-4 h-4 rounded border-gray-600"
          />
          <label className="text-sm font-medium text-gray-300">Enable AI Yield Predictions</label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">Marketplace Role</label>
          <select
            name="marketplaceRole"
            value={editedDetails.preferences.marketplaceRole}
            onChange={(e) => handleInputChange(e, 'preferences')}
            disabled={!isEditing}
            className="mt-1 w-full px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white"
          >
            <option value="buying">Buying Only</option>
            <option value="selling">Selling Only</option>
            <option value="both">Both</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">Preferred Payment Methods</label>
          <select
            multiple
            name="paymentMethods"
            value={editedDetails.preferences.paymentMethods}
            onChange={(e) => {
              const values = Array.from(e.target.selectedOptions, option => option.value);
              setEditedDetails(prev => ({
                ...prev,
                preferences: {
                  ...prev.preferences,
                  paymentMethods: values
                }
              }));
            }}
            disabled={!isEditing}
            className="mt-1 w-full px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white"
            size={4}
          >
            {options.paymentMethods.map(method => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            name="twoFactorEnabled"
            checked={editedDetails.security.twoFactorEnabled}
            onChange={(e) => handleInputChange(e, 'security')}
            disabled={!isEditing}
            className="w-4 h-4 rounded border-gray-600"
          />
          <label className="text-sm font-medium text-gray-300">Enable Two-Factor Authentication</label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">Preferred Login Method</label>
          <select
            name="preferredLoginMethod"
            value={editedDetails.security.preferredLoginMethod}
            onChange={(e) => handleInputChange(e, 'security')}
            disabled={!isEditing}
            className="mt-1 w-full px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white"
          >
            {options.loginMethods.map(method => (
              <option key={method} value={method}>
                {method.charAt(0).toUpperCase() + method.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4">
          <p className="text-yellow-400 text-sm">
            Verification Status: {editedDetails.security.verificationStatus.toUpperCase()}
          </p>
          <p className="text-yellow-400/70 text-xs mt-1">
            Last password change: {new Date(editedDetails.security.lastPasswordChange).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl"
        >
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">
              {translate('profile.title')}
            </h1>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg"
              disabled={isSaving}
            >
              {isEditing ? <FaCheck className="w-4 h-4" /> : <FaEdit className="w-4 h-4" />}
              <span>{isEditing ? 'Save' : 'Edit'}</span>
            </motion.button>
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
                    : 'bg-black/30 text-gray-300 hover:bg-black/50'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <tab.icon className="w-4 h-4" />
                <span>{translate(`profile.${tab.id}`)}</span>
              </motion.button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === 'basic' && renderBasicInfo()}
            {activeTab === 'language' && renderLanguagePreferences()}
            {activeTab === 'agriculture' && renderAgricultureDetails()}
            {activeTab === 'business' && renderBusinessDetails()}
            {activeTab === 'preferences' && renderPreferences()}
            {activeTab === 'security' && renderSecurity()}
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex justify-end space-x-4 mt-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg"
                disabled={isSaving}
              >
                {translate('profile.cancel')}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                className="px-4 py-2 bg-green-500 text-white rounded-lg flex items-center space-x-2"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <motion.div
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <span>{translate('profile.saving')}</span>
                  </>
                ) : (
                  <>
                    <FaCheck className="w-4 h-4" />
                    <span>{translate('profile.saveChanges')}</span>
                  </>
                )}
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Settings; 