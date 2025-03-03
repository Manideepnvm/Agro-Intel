const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  country: String,
  zipCode: String
});

const preferencesSchema = new mongoose.Schema({
  language: {
    type: String,
    enum: ['en', 'hi', 'te', 'ta', 'kn', 'ml', 'mr', 'gu', 'bn', 'pa'],
    default: 'en'
  },
  notifications: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true }
  },
  theme: {
    type: String,
    enum: ['light', 'dark'],
    default: 'dark'
  }
});

const farmDetailsSchema = new mongoose.Schema({
  farmName: String,
  farmSize: {
    type: Number,
    min: 0
  },
  farmType: {
    type: String,
    enum: ['Organic', 'Traditional', 'Hydroponic', 'Mixed', ''],
    default: ''
  },
  farmLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]  // [longitude, latitude]
    }
  },
  mainCrops: [{
    type: String
  }]
});

const userSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  displayName: {
    type: String,
    trim: true
  },
  photoURL: {
    type: String,
    default: ''
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  address: addressSchema,
  preferences: {
    type: preferencesSchema,
    default: () => ({})
  },
  farmDetails: {
    type: farmDetailsSchema,
    default: () => ({
      farmLocation: {
        type: 'Point',
        coordinates: [0, 0]
      }
    })
  },
  userType: {
    type: String,
    enum: ['farmer', 'buyer', 'service_provider'],
    default: 'farmer'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
userSchema.index({ 'farmDetails.farmLocation': '2dsphere' });
userSchema.index({ email: 1 });
userSchema.index({ uid: 1 });

const User = mongoose.model('User', userSchema);
module.exports = User; 