const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true
    },
    name: {
      type: String,
      required: [true, 'Please provide item name'],
      trim: true
    },
    description: String,
    category: {
      type: String,
      enum: ['appetizers', 'mains', 'breads', 'rice', 'desserts', 'beverages', 'sides'],
      required: true
    },
    price: {
      type: Number,
      required: [true, 'Please provide price'],
      min: [0, 'Price cannot be negative']
    },
    discountPrice: Number,
    image: String, // Cloudinary URL
    isVegetarian: {
      type: Boolean,
      default: false
    },
    isVegan: {
      type: Boolean,
      default: false
    },
    allergens: [String], // e.g., 'peanuts', 'dairy', 'gluten'
    preparationTime: {
      type: Number, // in minutes
      default: 15
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    availableFrom: String, // HH:MM format
    availableUntil: String,
    quantity: {
      type: Number,
      default: -1 // -1 means unlimited
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    totalRatings: {
      type: Number,
      default: 0
    },
    // BUSINESS LOGIC: Track item popularity for platform analytics
    orderCount: {
      type: Number,
      default: 0
    },
    customizations: [
      {
        name: String, // e.g., 'Extra toppings', 'Size'
        type: {
          type: String,
          enum: ['radio', 'checkbox', 'quantity']
        },
        options: [
          {
            label: String,
            additionalPrice: Number
          }
        ],
        isRequired: Boolean
      }
    ],
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
menuItemSchema.index({ restaurant: 1, isAvailable: 1 });
menuItemSchema.index({ restaurant: 1, category: 1 });
menuItemSchema.index({ name: 'text' });

module.exports = mongoose.model('MenuItem', menuItemSchema);
