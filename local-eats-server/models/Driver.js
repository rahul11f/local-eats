const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const driverSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide driver name'],
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Please provide a phone number'],
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
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false
    },
    aadharNumber: {
      type: String,
      required: true,
      unique: true
    },
    licenseNumber: {
      type: String,
      required: true,
      unique: true
    },
    licenseExpiry: Date,
    profilePhoto: String, // Cloudinary URL
    address: {
      street: String,
      area: String,
      city: {
        type: String,
        default: 'Kahalgaon'
      },
      zipcode: String
    },
    // BUSINESS LOGIC: Driver status and availability
    status: {
      type: String,
      enum: [
        'pending_verification', // Awaiting admin approval
        'verified', // Approved by admin
        'active', // Ready to accept orders
        'inactive', // Not available
        'suspended', // Suspended by admin
        'rejected' // Application rejected
      ],
      default: 'pending_verification'
    },
    availability: {
      isOnline: {
        type: Boolean,
        default: false
      },
      isOnTrip: {
        type: Boolean,
        default: false
      },
      lastSeenAt: Date,
      currentLocation: {
        latitude: Number,
        longitude: Number,
        updatedAt: Date
      }
    },
    // BUSINESS LOGIC: Driver earnings and ratings
    earnings: {
      totalEarnings: {
        type: Number,
        default: 0
      },
      monthlyEarnings: {
        type: Number,
        default: 0
      },
      completedOrders: {
        type: Number,
        default: 0
      },
      pendingSettlement: {
        type: Number,
        default: 0
      }
    },
    rating: {
      avgRating: {
        type: Number,
        min: 0,
        max: 5,
        default: 5
      },
      totalRatings: {
        type: Number,
        default: 0
      },
      cancellations: {
        type: Number,
        default: 0
      }
    },
    bankDetails: {
      accountHolder: String,
      accountNumber: String,
      ifscCode: String,
      bankName: String
    },
    documents: {
      aadharFront: String,
      aadharBack: String,
      licensePhoto: String,
      profilePhoto: String,
      vehicleRegistration: String,
      vehicleInsurance: String
    },
    vehicle: {
      type: {
        type: String,
        enum: ['two-wheeler', 'three-wheeler', 'four-wheeler'],
        default: 'two-wheeler'
      },
      registrationNumber: String,
      model: String,
      color: String
    },
    preferences: {
      language: {
        type: String,
        default: 'en'
      },
      notifications: {
        sms: { type: Boolean, default: true },
        pushNotifications: { type: Boolean, default: true }
      }
    },
    backgroundVerification: {
      status: {
        type: String,
        enum: ['pending', 'verified', 'failed'],
        default: 'pending'
      },
      verifiedAt: Date,
      verificationProvider: String
    },
    // BUSINESS LOGIC: Commission structure for drivers
    commissionStructure: {
      // Drivers earn per order completed (typically ₹30-50)
      perOrderCommission: {
        type: Number,
        default: 30
      },
      // Performance-based bonus
      bonusPercentage: {
        type: Number,
        default: 0
      }
    },
    accountStatus: {
      isActive: {
        type: Boolean,
        default: true
      },
      suspendedAt: Date,
      suspensionReason: String,
      verifiedAt: Date
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

// Hash password before saving
driverSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to match password
driverSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Index for frequently queried fields
driverSchema.index({ phone: 1, email: 1 });
driverSchema.index({ status: 1, 'availability.isOnline': 1 });
driverSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Driver', driverSchema);
