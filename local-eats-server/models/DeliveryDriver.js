const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide driver name']
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      match: [/^[6-9]\d{9}$/, 'Please provide a valid Indian phone number']
    },
    email: {
      type: String,
      unique: true,
      sparse: true
    },
    password: {
      type: String,
      required: true,
      select: false
    },
    documents: {
      licenseNumber: {
        type: String,
        required: true,
        unique: true
      },
      licenseExpiry: Date,
      aadharNumber: String,
      vehicleNumber: String,
      insuranceExpiry: Date
    },
    bank: {
      accountHolder: String,
      accountNumber: String,
      ifscCode: String,
      bankName: String
    },
    // BUSINESS LOGIC: Delivery partner earnings
    earnings: {
      totalEarnings: {
        type: Number,
        default: 0
      },
      monthlyEarnings: {
        type: Number,
        default: 0
      },
      totalDeliveries: {
        type: Number,
        default: 0
      },
      monthlyDeliveries: {
        type: Number,
        default: 0
      },
      lastPayoutDate: Date,
      pendingBalance: {
        type: Number,
        default: 0
      }
    },
    // Real-time Location Tracking
    currentLocation: {
      latitude: Number,
      longitude: Number,
      updatedAt: Date,
      accuracy: Number
    },
    onDuty: {
      type: Boolean,
      default: false
    },
    currentOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    // Performance metrics
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 4.8
    },
    totalRatings: {
      type: Number,
      default: 0
    },
    acceptanceRate: {
      type: Number,
      default: 100
    },
    cancellationRate: {
      type: Number,
      default: 0
    },
    avgDeliveryTime: {
      type: Number, // in minutes
      default: 0
    },
    // Status
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended', 'offline'],
      default: 'inactive'
    },
    isApproved: {
      type: Boolean,
      default: false
    },
    approvedAt: Date,
    vehicleType: {
      type: String,
      enum: ['bicycle', 'scooter', 'bike', 'car'],
      default: 'bike'
    },
    fcmToken: String, // For push notifications
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
driverSchema.index({ phone: 1 });
driverSchema.index({ status: 1, onDuty: 1 });
driverSchema.index({ createdAt: -1 });

module.exports = mongoose.model('DeliveryDriver', driverSchema);
