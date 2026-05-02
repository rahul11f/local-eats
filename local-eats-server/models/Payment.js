const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      unique: true,
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant'
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    type: {
      type: String,
      enum: ['order_payment', 'subscription_payment', 'refund'],
      required: true
    },
    // BUSINESS LOGIC: Revenue tracking for subscriptions and delivery fees
    purpose: {
      type: String,
      enum: [
        'food_order', // Customer payment for food
        'delivery_fee', // Delivery fee from customer
        'subscription_basic', // ₹199/month subscription
        'subscription_premium', // ₹399/month subscription
        'refund'
      ],
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'INR'
    },
    // BUSINESS LOGIC: Razorpay integration for payments
    razorpay: {
      orderId: String,
      paymentId: String,
      signature: String
    },
    paymentMethod: {
      type: String,
      enum: ['upi', 'card', 'netbanking', 'wallet', 'cash_on_delivery'],
      default: 'upi'
    },
    status: {
      type: String,
      enum: ['initiated', 'processing', 'completed', 'failed', 'refunded'],
      default: 'initiated'
    },
    description: String,
    failureReason: String,
    // BUSINESS LOGIC: Settlement to restaurant (after 0% commission deduction)
    settlement: {
      settledAt: Date,
      bankAccountId: String,
      status: {
        type: String,
        enum: ['pending', 'processed', 'failed'],
        default: 'pending'
      },
      settlementAmount: Number
    },
    metadata: {
      ip: String,
      userAgent: String,
      notes: String
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
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ 'razorpay.paymentId': 1 });
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ restaurant: 1, createdAt: -1 });
paymentSchema.index({ order: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ type: 1, purpose: 1 });

// Index for analytics queries
paymentSchema.index({ createdAt: -1, status: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
