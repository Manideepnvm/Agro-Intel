const express = require('express');
const router = express.Router();
const { admin } = require('../config/firebase-admin');
const User = require('../models/user.model');
const multer = require('multer');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Middleware to verify Firebase token
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Validation middleware
const validateProfileUpdate = (req, res, next) => {
  const updates = req.body;
  
  // Basic validation
  if (!updates) {
    return res.status(400).json({ message: 'No update data provided' });
  }

  // Remove any undefined or null values
  Object.keys(updates).forEach(key => {
    if (updates[key] === undefined || updates[key] === null) {
      delete updates[key];
    }
  });

  // Validate nested objects
  if (updates.preferences) {
    if (typeof updates.preferences !== 'object') {
      return res.status(400).json({ message: 'Invalid preferences format' });
    }
  }

  if (updates.farmDetails) {
    if (typeof updates.farmDetails !== 'object') {
      return res.status(400).json({ message: 'Invalid farm details format' });
    }
  }

  next();
};

// Create default user profile
const createDefaultProfile = (uid, email, name = '') => ({
  uid,
  email,
  displayName: name,
  preferences: {
    language: 'en',
    notifications: {
      email: true,
      push: true
    },
    theme: 'dark'
  },
  farmDetails: {
    farmLocation: {
      type: 'Point',
      coordinates: [0, 0]
    }
  }
});

// Create or update user profile
router.post('/profile', authenticateToken, async (req, res) => {
  try {
    let user = await User.findOne({ uid: req.user.uid });
    
    if (!user) {
      user = new User({
        uid: req.user.uid,
        email: req.user.email,
        displayName: req.user.name || '',
        photoURL: req.user.picture || '',
        preferences: {
          language: 'en',
          notifications: {
            email: true,
            push: true
          },
          theme: 'dark'
        }
      });
    }

    await user.save();
    res.json(user);
  } catch (error) {
    console.error('Create profile error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    let user = await User.findOne({ uid: req.user.uid });
    
    if (!user) {
      const defaultProfile = createDefaultProfile(
        req.user.uid,
        req.user.email,
        req.user.name
      );
      user = new User(defaultProfile);
      await user.save();
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update user profile
router.put('/profile', authenticateToken, validateProfileUpdate, async (req, res) => {
  try {
    const updates = req.body;
    
    // Clean up farmDetails if it exists
    if (updates.farmDetails) {
      // Remove empty strings from farmDetails
      Object.keys(updates.farmDetails).forEach(key => {
        if (updates.farmDetails[key] === '') {
          delete updates.farmDetails[key];
        }
      });

      // If farmType is empty or invalid, remove it
      if (!['Organic', 'Traditional', 'Hydroponic', 'Mixed'].includes(updates.farmDetails.farmType)) {
        delete updates.farmDetails.farmType;
      }

      // Ensure farmLocation is properly formatted
      if (updates.farmDetails.farmLocation) {
        if (!Array.isArray(updates.farmDetails.farmLocation.coordinates)) {
          updates.farmDetails.farmLocation.coordinates = [0, 0];
        }
        updates.farmDetails.farmLocation.type = 'Point';
      }
    }

    // Remove sensitive fields
    delete updates.uid;
    delete updates._id;
    delete updates.email;
    delete updates.createdAt;

    const user = await User.findOneAndUpdate(
      { uid: req.user.uid },
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
});

// Upload profile picture
router.post('/profile/picture', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ 
        message: 'Invalid file type. Please upload a JPEG, PNG, or GIF image.' 
      });
    }

    // Validate file size (1MB)
    const maxSize = 5 * 1024 * 1024; // 1MB
    if (req.file.size > maxSize) {
      return res.status(400).json({ 
        message: 'File is too large. Maximum size is 1MB.' 
      });
    }

    // Convert image to base64
    const base64Image = req.file.buffer.toString('base64');
    const imageUrl = `data:${req.file.mimetype};base64,${base64Image}`;

    // Save to Firebase Realtime Database
    const db = admin.database();
    const imageRef = db.ref(`profile-pictures/${req.user.uid}`);
    await imageRef.set({
      photoURL: imageUrl,
      updatedAt: admin.database.ServerValue.TIMESTAMP
    });

    // Update user profile in MongoDB
    await User.findOneAndUpdate(
      { uid: req.user.uid },
      { 
        $set: { 
          photoURL: imageUrl,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    res.json({ url: imageUrl });

  } catch (error) {
    console.error('Profile picture upload error:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to upload profile picture'
    });
  }
});

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