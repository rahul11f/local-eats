const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RestaurantOwner',
      required: true
    },
    name: {
      type: String,
      required: [true, 'Please provide restaurant name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    description: String,
    phone: {
      type: String,
      required: true,
      match: [/^[6-9]\d{9}$/, 'Please provide a valid Indian phone number']
    },
    email: String,
    // BUSINESS LOGIC: Restaurant subscription plan
    subscription: {
      plan: {
        type: String,
        enum: ['basic', 'premium', 'none'],
        default: 'none'
      },
      monthlyFee: {
        // Basic: ₹199/month, Premium: ₹399/month
        type: Number,
        default: 0
      },
      startDate: Date,
      endDate: Date,
      isActive: {
        type: Boolean,
        default: false
      },
      autoRenew: {
        type: Boolean,
        default: true
      }
    },
    address: {
      street: String,
      area: String,
      city: {
        type: String,
        default: 'Kahalgaon'
      },
      zipcode: String,
      latitude: Number,
      longitude: Number
    },
    operatingHours: [
      {
        day: {
          type: String,
          enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        },
        open: String, // HH:MM format
        close: String,
        isOpen: Boolean
      }
    ],
    // BUSINESS LOGIC: Delivery zones and minimum order
    deliveryZones: [
      {
        radius: Number, // in km
        deliveryFee: Number, // ₹0-30 based on distance
        isActive: Boolean
      }
    ],
    minOrderValue: {
      type: Number,
      default: 100 // ₹100 minimum order
    },
    cuisine: [String],
    avgRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 4.5
    },
    totalRatings: {
      type: Number,
      default: 0
    },
    totalOrders: {
      type: Number,
      default: 0
    },
    isApproved: {
      type: Boolean,
      default: false
    },
    approvedAt: Date,
    isActive: {
      type: Boolean,
      default: true
    },
    logo: String, // Image URL from Cloudinary
    banner: String,
    documents: {
      registrationCertificate: String,
      fssaiLicense: String,
      gstCertificate: String
    },
    bank: {
      accountHolder: String,
      accountNumber: String,
      ifscCode: String,
      bankName: String
    },
    // BUSINESS LOGIC: Platform takes 0% commission per order
    // Revenue comes from subscription fees only
    commissionPercentage: {
      type: Number,
      default: 0 // ZERO commission model
    },
    analytics: {
      monthlyRevenue: Number,
      monthlyOrders: Number,
      avgOrderValue: Number,
      lastUpdated: Date
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Index for frequently queried fields
restaurantSchema.index({ name: 'text', cuisine: 1 });
restaurantSchema.index({ isApproved: 1, isActive: 1 });
restaurantSchema.index({ 'address.latitude': 1, 'address.longitude': 1 });
restaurantSchema.index({ createdAt: -1 });

// Get nearby restaurants (for location-based search)
restaurantSchema.statics.findNearby = function (lat, lng, maxDistance = 5) {
  return this.find({
    'address.latitude': { $gte: lat - maxDistance, $lte: lat + maxDistance },
    'address.longitude': { $gte: lng - maxDistance, $lte: lng + maxDistance },
    isApproved: true,
    isActive: true
  });
};

module.exports = mongoose.model('Restaurant', restaurantSchema);
