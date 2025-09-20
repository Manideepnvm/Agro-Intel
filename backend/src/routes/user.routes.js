const express = require('express');
const router = express.Router();
const { admin } = require('../config/firebase-admin');
const User = require('../models/user.model');
const multer = require('multer');
const cacheManager = require('../config/redis');
const { 
  cacheResponse, 
  cacheUserProfile, 
  invalidateCache, 
  cacheSession,
  cacheQuery,
  rateLimiter 
} = require('../middleware/cache');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Create cached query helper for User model
const CachedUser = cacheQuery(User, 900); // 15 minutes cache

// Middleware to verify Firebase token with session caching
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Check if we have cached session for this token
    const tokenHash = require('crypto').createHash('sha256').update(token).digest('hex');
    const cachedAuth = await cacheManager.get(`auth:${tokenHash}`);
    
    if (cachedAuth) {
      console.log('Using cached authentication');
      req.user = cachedAuth;
      return next();
    }

    // Verify token with Firebase
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    
    // Cache the authentication for 1 hour (tokens are valid for longer)
    await cacheManager.set(`auth:${tokenHash}`, decodedToken, 3600);
    
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Enhanced validation middleware
const validateProfileUpdate = (req, res, next) => {
  const updates = req.body;
  
  if (!updates) {
    return res.status(400).json({ message: 'No update data provided' });
  }

  // Remove any undefined or null values
  Object.keys(updates).forEach(key => {
    if (updates[key] === undefined || updates[key] === null || updates[key] === '') {
      delete updates[key];
    }
  });

  // Validate nested objects
  if (updates.preferences) {
    if (typeof updates.preferences !== 'object') {
      return res.status(400).json({ message: 'Invalid preferences format' });
    }
    
    // Validate language
    if (updates.preferences.language) {
      const validLanguages = ['en', 'hi', 'te', 'ta', 'kn', 'ml', 'mr', 'gu', 'bn', 'pa'];
      if (!validLanguages.includes(updates.preferences.language)) {
        return res.status(400).json({ message: 'Invalid language preference' });
      }
    }
    
    // Validate theme
    if (updates.preferences.theme) {
      const validThemes = ['light', 'dark'];
      if (!validThemes.includes(updates.preferences.theme)) {
        return res.status(400).json({ message: 'Invalid theme preference' });
      }
    }
  }

  if (updates.farmDetails) {
    if (typeof updates.farmDetails !== 'object') {
      return res.status(400).json({ message: 'Invalid farm details format' });
    }
    
    // Validate farm size
    if (updates.farmDetails.farmSize !== undefined) {
      const size = parseFloat(updates.farmDetails.farmSize);
      if (isNaN(size) || size < 0) {
        return res.status(400).json({ message: 'Invalid farm size' });
      }
      updates.farmDetails.farmSize = size;
    }
    
    // Validate farm type
    if (updates.farmDetails.farmType) {
      const validTypes = ['Organic', 'Traditional', 'Hydroponic', 'Mixed'];
      if (!validTypes.includes(updates.farmDetails.farmType)) {
        delete updates.farmDetails.farmType;
      }
    }
  }

  // Validate email format if provided
  if (updates.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(updates.email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
  }

  // Validate phone number format if provided
  if (updates.phoneNumber) {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(updates.phoneNumber)) {
      return res.status(400).json({ message: 'Invalid phone number format' });
    }
  }

  next();
};

// Create default user profile with better structure
const createDefaultProfile = (uid, email, name = '') => ({
  uid,
  email,
  displayName: name,
  photoURL: '',
  phoneNumber: '',
  preferences: {
    language: 'en',
    notifications: {
      email: true,
      push: true
    },
    theme: 'dark'
  },
  farmDetails: {
    farmName: '',
    farmSize: 0,
    farmType: '',
    farmLocation: {
      type: 'Point',
      coordinates: [0, 0]
    },
    mainCrops: []
  },
  userType: 'farmer',
  isEmailVerified: false,
  isPhoneVerified: false,
  address: {
    street: '',
    city: '',
    state: '',
    country: '',
    zipCode: ''
  }
});

// Apply rate limiting to all routes
router.use(rateLimiter(15 * 60 * 1000, 200)); // 200 requests per 15 minutes

// Create or update user profile
router.post('/profile', 
  authenticateToken, 
  validateProfileUpdate,
  invalidateCache([
    'user:profile:*',
    'user:session:*',
    'query:User:*'
  ]),
  async (req, res) => {
    try {
      const uid = req.user.uid;
      let user = await User.findOne({ uid });
      
      if (!user) {
        const defaultProfile = createDefaultProfile(uid, req.user.email, req.user.name);
        user = new User(defaultProfile);
      }

      // Update with provided data
      Object.keys(req.body).forEach(key => {
        if (key !== 'uid' && key !== '_id' && key !== 'createdAt') {
          if (typeof req.body[key] === 'object' && user[key]) {
            // Merge nested objects
            user[key] = { ...user[key].toObject(), ...req.body[key] };
          } else {
            user[key] = req.body[key];
          }
        }
      });

      user.updatedAt = new Date();
      await user.save();

      // Cache the updated profile
      await cacheManager.cacheUserProfile(uid, user, 1800);
      
      // Cache session data
      const sessionData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        userType: user.userType,
        preferences: user.preferences
      };
      await cacheManager.cacheUserSession(uid, sessionData, 7200);

      res.json(user);
    } catch (error) {
      console.error('Create profile error:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

// Get user profile with caching
router.get('/profile', 
  authenticateToken, 
  cacheUserProfile,
  async (req, res) => {
    try {
      const uid = req.user.uid;
      
      // Try cached version first (handled by middleware)
      let user = await CachedUser.findOne({ uid });
      
      if (!user) {
        console.log(`Creating new profile for user: ${uid}`);
        const defaultProfile = createDefaultProfile(uid, req.user.email, req.user.name);
        user = new User(defaultProfile);
        await user.save();
        
        // Cache the new profile
        await cacheManager.cacheUserProfile(uid, user, 1800);
      }
      
      res.json(user);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

// Update user profile with advanced caching
router.put('/profile', 
  authenticateToken, 
  validateProfileUpdate, 
  invalidateCache([
    'user:profile:*',
    'user:session:*',
    'query:User:findOne:*',
    'response:GET:/api/users/profile:*'
  ]),
  async (req, res) => {
    try {
      const updates = { ...req.body };
      const uid = req.user.uid;
      
      // Clean up farmDetails if it exists
      if (updates.farmDetails) {
        Object.keys(updates.farmDetails).forEach(key => {
          if (updates.farmDetails[key] === '' || updates.farmDetails[key] === null) {
            delete updates.farmDetails[key];
          }
        });

        // Ensure farmLocation is properly formatted
        if (updates.farmDetails.farmLocation) {
          if (!Array.isArray(updates.farmDetails.farmLocation.coordinates)) {
            updates.farmDetails.farmLocation.coordinates = [0, 0];
          }
          updates.farmDetails.farmLocation.type = 'Point';
        }
      }

      // Remove sensitive/immutable fields
      const immutableFields = ['uid', '_id', 'email', 'createdAt', '__v'];
      immutableFields.forEach(field => delete updates[field]);

      const user = await User.findOneAndUpdate(
        { uid },
        { 
          $set: {
            ...updates,
            updatedAt: new Date()
          }
        },
        { 
          new: true, 
          runValidators: true,
          upsert: true,
          setDefaultsOnInsert: true
        }
      );

      // Update caches
      await Promise.all([
        cacheManager.cacheUserProfile(uid, user, 1800),
        cacheManager.cacheUserSession(uid, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          userType: user.userType,
          preferences: user.preferences
        }, 7200)
      ]);

      res.json(user);
    } catch (error) {
      console.error('Update profile error:', error);
      if (error.name === 'ValidationError') {
        return res.status(400).json({ 
          message: 'Validation error', 
          details: Object.values(error.errors).map(err => err.message)
        });
      }
      res.status(400).json({ message: error.message });
    }
  }
);

// Upload profile picture with caching
router.post('/profile/picture', 
  authenticateToken, 
  rateLimiter(15 * 60 * 1000, 10), // More restrictive rate limiting for uploads
  upload.single('image'), 
  invalidateCache([
    'user:profile:*',
    'response:GET:/api/users/profile:*'
  ]),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No image file provided' });
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ 
          message: 'Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.' 
        });
      }

      // Validate file size (5MB as per multer config)
      const maxSize = 5 * 1024 * 1024;
      if (req.file.size > maxSize) {
        return res.status(400).json({ 
          message: 'File is too large. Maximum size is 5MB.' 
        });
      }

      const uid = req.user.uid;
      
      // Convert image to base64
      const base64Image = req.file.buffer.toString('base64');
      const imageUrl = `data:${req.file.mimetype};base64,${base64Image}`;

      // Save to Firebase Realtime Database
      const db = admin.database();
      const imageRef = db.ref(`profile-pictures/${uid}`);
      await imageRef.set({
        photoURL: imageUrl,
        updatedAt: admin.database.ServerValue.TIMESTAMP,
        fileSize: req.file.size,
        mimeType: req.file.mimetype
      });

      // Update user profile in MongoDB
      const user = await User.findOneAndUpdate(
        { uid },
        { 
          $set: { 
            photoURL: imageUrl,
            updatedAt: new Date()
          }
        },
        { new: true, upsert: true }
      );

      // Update cache
      await cacheManager.cacheUserProfile(uid, user, 1800);

      res.json({ 
        url: imageUrl,
        message: 'Profile picture uploaded successfully'
      });

    } catch (error) {
      console.error('Profile picture upload error:', error);
      res.status(500).json({ 
        message: error.message || 'Failed to upload profile picture'
      });
    }
  }
);

// Get user preferences with caching
router.get('/preferences', 
  authenticateToken,
  cacheResponse(1800, (req) => `user:preferences:${req.user.uid}`),
  async (req, res) => {
    try {
      const uid = req.user.uid;
      const user = await CachedUser.findOne({ uid }, 'preferences');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json(user.preferences);
    } catch (error) {
      console.error('Get preferences error:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

// Update user preferences
router.put('/preferences', 
  authenticateToken,
  invalidateCache([
    'user:profile:*',
    'user:preferences:*',
    'user:session:*',
    'response:GET:/api/users/preferences:*'
  ]),
  async (req, res) => {
    try {
      const uid = req.user.uid;
      const { preferences } = req.body;

      if (!preferences || typeof preferences !== 'object') {
        return res.status(400).json({ message: 'Invalid preferences data' });
      }

      const user = await User.findOneAndUpdate(
        { uid },
        { 
          $set: { 
            preferences,
            updatedAt: new Date()
          }
        },
        { new: true, runValidators: true }
      );

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update caches
      await Promise.all([
        cacheManager.cacheUserProfile(uid, user, 1800),
        cacheManager.set(`user:preferences:${uid}`, preferences, 1800)
      ]);

      res.json(user.preferences);
    } catch (error) {
      console.error('Update preferences error:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

// Get user farm details with caching
router.get('/farm-details', 
  authenticateToken,
  cacheResponse(900, (req) => `user:farm:${req.user.uid}`),
  async (req, res) => {
    try {
      const uid = req.user.uid;
      const user = await CachedUser.findOne({ uid }, 'farmDetails');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json(user.farmDetails);
    } catch (error) {
      console.error('Get farm details error:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

// Update farm details
router.put('/farm-details', 
  authenticateToken,
  invalidateCache([
    'user:profile:*',
    'user:farm:*',
    'response:GET:/api/users/farm-details:*',
    'query:User:*'
  ]),
  async (req, res) => {
    try {
      const uid = req.user.uid;
      const { farmDetails } = req.body;

      if (!farmDetails || typeof farmDetails !== 'object') {
        return res.status(400).json({ message: 'Invalid farm details data' });
      }

      // Validate and clean farm details
      if (farmDetails.farmSize !== undefined) {
        const size = parseFloat(farmDetails.farmSize);
        if (isNaN(size) || size < 0) {
          return res.status(400).json({ message: 'Invalid farm size' });
        }
        farmDetails.farmSize = size;
      }

      if (farmDetails.farmLocation && farmDetails.farmLocation.coordinates) {
        if (!Array.isArray(farmDetails.farmLocation.coordinates) || 
            farmDetails.farmLocation.coordinates.length !== 2) {
          return res.status(400).json({ message: 'Invalid farm location coordinates' });
        }
        farmDetails.farmLocation.type = 'Point';
      }

      const user = await User.findOneAndUpdate(
        { uid },
        { 
          $set: { 
            farmDetails,
            updatedAt: new Date()
          }
        },
        { new: true, runValidators: true }
      );

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update caches
      await Promise.all([
        cacheManager.cacheUserProfile(uid, user, 1800),
        cacheManager.set(`user:farm:${uid}`, farmDetails, 900)
      ]);

      res.json(user.farmDetails);
    } catch (error) {
      console.error('Update farm details error:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

// Get nearby farmers (with location-based caching)
router.get('/nearby-farmers', 
  authenticateToken,
  async (req, res) => {
    try {
      const { longitude, latitude, maxDistance = 10000 } = req.query; // maxDistance in meters
      
      if (!longitude || !latitude) {
        return res.status(400).json({ message: 'Longitude and latitude are required' });
      }

      const lon = parseFloat(longitude);
      const lat = parseFloat(latitude);
      
      if (isNaN(lon) || isNaN(lat)) {
        return res.status(400).json({ message: 'Invalid coordinates' });
      }

      // Create cache key based on location and distance
      const locationKey = `${Math.round(lon * 1000)}:${Math.round(lat * 1000)}:${maxDistance}`;
      const cacheKey = `nearby:farmers:${locationKey}`;
      
      // Check cache first
      const cachedResult = await cacheManager.get(cacheKey);
      if (cachedResult) {
        console.log(`Nearby farmers cache HIT for: ${locationKey}`);
        return res.json(cachedResult);
      }

      // Query nearby farmers
      const nearbyFarmers = await User.find({
        'farmDetails.farmLocation': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [lon, lat]
            },
            $maxDistance: parseInt(maxDistance)
          }
        },
        uid: { $ne: req.user.uid } // Exclude current user
      })
      .select('uid displayName farmDetails photoURL userType')
      .limit(50)
      .lean();

      // Cache for 5 minutes (location data changes frequently)
      await cacheManager.set(cacheKey, nearbyFarmers, 300);
      
      console.log(`Nearby farmers cache MISS for: ${locationKey}`);
      res.json(nearbyFarmers);
    } catch (error) {
      console.error('Get nearby farmers error:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

// Delete user account
router.delete('/profile', 
  authenticateToken,
  rateLimiter(60 * 60 * 1000, 5), // Very restrictive: 5 deletes per hour
  async (req, res) => {
    try {
      const uid = req.user.uid;
      
      // Delete from MongoDB
      const deletedUser = await User.findOneAndDelete({ uid });
      
      if (!deletedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Delete from Firebase Realtime Database
      try {
        const db = admin.database();
        await db.ref(`profile-pictures/${uid}`).remove();
      } catch (firebaseError) {
        console.error('Firebase deletion error:', firebaseError);
        // Continue even if Firebase deletion fails
      }

      // Invalidate all user-related caches
      await Promise.all([
        cacheManager.flushPattern(`user:*:${uid}`),
        cacheManager.flushPattern(`*:${uid}`),
        cacheManager.flushPattern(`auth:*`) // Clear auth cache as well
      ]);

      res.json({ message: 'Account deleted successfully' });
    } catch (error) {
      console.error('Delete account error:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

// Health check endpoint for monitoring
router.get('/health', async (req, res) => {
  try {
    const cacheHealth = await cacheManager.healthCheck();
    const dbHealth = mongoose.connection.readyState === 1;
    
    const status = cacheHealth && dbHealth ? 'healthy' : 'degraded';
    const statusCode = status === 'healthy' ? 200 : 503;
    
    res.status(statusCode).json({
      status,
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealth ? 'up' : 'down',
        cache: cacheHealth ? 'up' : 'down'
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Cache statistics endpoint (admin only)
router.get('/cache-stats', 
  authenticateToken,
  async (req, res) => {
    try {
      // Simple admin check - in production, implement proper role-based auth
      if (!req.user.email || !req.user.email.endsWith('@admin.com')) {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const stats = await cacheManager.getStats();
      res.json(stats);
    } catch (error) {
      console.error('Cache stats error:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

// Clear cache endpoint (admin only)
router.post('/clear-cache', 
  authenticateToken,
  rateLimiter(60 * 60 * 1000, 10),
  async (req, res) => {
    try {
      // Simple admin check - in production, implement proper role-based auth
      if (!req.user.email || !req.user.email.endsWith('@admin.com')) {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const { pattern = '*' } = req.body;
      const deletedCount = await cacheManager.flushPattern(pattern);
      
      res.json({
        message: 'Cache cleared successfully',
        deletedEntries: deletedCount,
        pattern
      });
    } catch (error) {
      console.error('Clear cache error:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

// Error handling middleware
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        message: 'File is too large. Maximum size is 5MB.' 
      });
    }
    return res.status(400).json({ message: err.message });
  }
  
  if (err.type === 'entity.too.large') {
    return res.status(400).json({ 
      message: 'Request data too large. Please reduce the data size.' 
    });
  }
  
  console.error('Route error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

module.exports = router;