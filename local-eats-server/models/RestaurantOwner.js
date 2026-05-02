const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const restaurantOwnerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide owner name'],
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
      required: [true, 'Please provide an email'],
      unique: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false
    },
    aadharNumber: {
      type: String,
      unique: true
    },
    panNumber: String,
    gstNumber: String,
    profilePhoto: String, // Cloudinary URL
    status: {
      type: String,
      enum: ['pending_verification', 'verified', 'rejected', 'suspended'],
      default: 'pending_verification'
    },
    role: {
      type: String,
      default: 'restaurant_owner'
    },
    // BUSINESS LOGIC: Restaurant subscription tracking
    activeSubscription: {
      plan: {
        type: String,
        enum: ['basic', 'premium', 'none'],
        default: 'none'
      },
      startDate: Date,
      endDate: Date,
      isActive: {
        type: Boolean,
        default: false
      },
      // ₹199 for Basic, ₹399 for Premium
      monthlyFee: {
        type: Number,
        default: 0
      },
      nextBillingDate: Date
    },
    accountStatus: {
      isActive: {
        type: Boolean,
        default: true
      },
      lastLoginAt: Date,
      loginAttempts: {
        type: Number,
        default: 0
      },
      lockedUntil: Date
    },
    bankDetails: {
      accountHolder: String,
      accountNumber: String,
      ifscCode: String,
      bankName: String,
      isVerified: {
        type: Boolean,
        default: false
      }
    },
    // BUSINESS LOGIC: Track monthly earnings
    earnings: {
      totalEarnings: {
        type: Number,
        default: 0
      },
      monthlyEarnings: {
        type: Number,
        default: 0
      },
      pendingSettlement: {
        type: Number,
        default: 0
      },
      settledAmount: {
        type: Number,
        default: 0
      }
    },
    preferences: {
      language: {
        type: String,
        default: 'en'
      },
      notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: true },
        pushNotifications: { type: Boolean, default: true }
      }
    },
    documents: {
      gstCertificate: String,
      fssaiLicense: String,
      registrationCertificate: String,
      aadharFront: String,
      aadharBack: String,
      panCard: String
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
restaurantOwnerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to match password
restaurantOwnerSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Index for frequently queried fields
restaurantOwnerSchema.index({ phone: 1, email: 1 });
restaurantOwnerSchema.index({ status: 1 });

module.exports = mongoose.model('RestaurantOwner', restaurantOwnerSchema);
