const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver'
    },
    items: [
      {
        menuItem: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'MenuItem'
        },
        name: String,
        price: Number,
        quantity: Number,
        customizations: [
          {
            name: String,
            option: String,
            additionalPrice: Number
          }
        ],
        itemTotal: Number
      }
    ],
    // BUSINESS LOGIC: Order amount calculation
    pricing: {
      subtotal: Number,
      // BUSINESS LOGIC: Platform takes 0% commission
      platformCommission: {
        type: Number,
        default: 0 // ₹0 - zero commission model
      },
      // BUSINESS LOGIC: Delivery fee based on distance
      // ₹0 for <500m, ₹15 for <2km, ₹30 for <5km
      deliveryFee: {
        type: Number,
        default: 0
      },
      taxes: Number,
      discount: {
        type: Number,
        default: 0
      },
      total: Number
    },
    // BUSINESS LOGIC: Order status workflow
    status: {
      type: String,
      enum: [
        'pending', // Order placed, waiting for restaurant confirmation
        'confirmed', // Restaurant confirmed the order
        'preparing', // Restaurant is preparing the order
        'ready', // Order ready for pickup
        'picked_up', // Driver picked up the order
        'in_transit', // Order in transit to customer
        'delivered', // Order delivered successfully
        'cancelled', // Order cancelled
        'failed' // Payment or delivery failed
      ],
      default: 'pending'
    },
    deliveryAddress: {
      name: String,
      phone: String,
      street: String,
      area: String,
      city: {
        type: String,
        default: 'Kahalgaon'
      },
      zipcode: String,
      latitude: Number,
      longitude: Number,
      instructions: String // Delivery instructions (e.g., "Ring bell twice")
    },
    // BUSINESS LOGIC: Delivery tracking with real-time updates
    tracking: {
      restaurantLocation: {
        latitude: Number,
        longitude: Number
      },
      driverLocation: {
        latitude: Number,
        longitude: Number,
        updatedAt: Date
      },
      estimatedDeliveryTime: Date,
      actualDeliveryTime: Date
    },
    // BUSINESS LOGIC: Payment handling with Razorpay
    payment: {
      method: {
        type: String,
        enum: ['card', 'upi', 'wallet', 'cash_on_delivery'],
        default: 'upi'
      },
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String,
      status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
      },
      paidAt: Date,
      refundedAt: Date,
      refundAmount: Number
    },
    // BUSINESS LOGIC: Ratings and reviews
    rating: {
      customerRating: {
        type: Number,
        min: 1,
        max: 5
      },
      driverRating: {
        type: Number,
        min: 1,
        max: 5
      },
      review: String,
      ratedAt: Date
    },
    cancellation: {
      cancelledBy: {
        type: String,
        enum: ['customer', 'restaurant', 'driver', 'admin']
      },
      reason: String,
      cancelledAt: Date,
      refundStatus: {
        type: String,
        enum: ['pending', 'processed', 'failed']
      }
    },
    notes: String,
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
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ restaurant: 1, createdAt: -1 });
orderSchema.index({ driver: 1, status: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ orderNumber: 1 });

// Pre-save hook to generate order number
orderSchema.pre('save', async function (next) {
  if (!this.isNew) return next();

  const count = await mongoose.model('Order').countDocuments();
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  this.orderNumber = `ORD-${date}-${String(count + 1).padStart(5, '0')}`;
  next();
});

module.exports = mongoose.model('Order', orderSchema);
