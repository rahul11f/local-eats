const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters']
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
    addresses: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          default: () => new mongoose.Types.ObjectId()
        },
        label: {
          type: String,
          enum: ['home', 'work', 'other'],
          default: 'home'
        },
        street: String,
        area: String,
        city: {
          type: String,
          default: 'Kahalgaon'
        },
        zipcode: String,
        latitude: Number,
        longitude: Number,
        isDefault: {
          type: Boolean,
          default: false
        }
      }
    ],
    preferences: {
      cuisines: [String],
      dietaryRestrictions: [String],
      notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: true },
        push: { type: Boolean, default: true }
      }
    },
    totalOrders: {
      type: Number,
      default: 0
    },
    totalSpent: {
      type: Number,
      default: 0
    },
    avgRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    isBlocked: {
      type: Boolean,
      default: false
    },
    referralCode: String,
    referredBy: mongoose.Schema.Types.ObjectId,
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer'
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
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to match password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Index for frequently queried fields
userSchema.index({ phone: 1, email: 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);
