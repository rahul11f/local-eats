const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Payment = require('../models/Payment');
const Razorpay = require('razorpay');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const { sendEmail } = require('../utils/email');
const { v4: uuidv4 } = require('uuid');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Helper function to calculate delivery fee based on distance
const calculateDeliveryFee = (distance) => {
  // BUSINESS LOGIC: Delivery fee calculation
  // ₹0 for <500m, ₹15 for <2km, ₹30 for <5km
  if (distance < 0.5) return 0;
  if (distance < 2) return 15;
  if (distance < 5) return 30;
  return 40; // Default for >5km
};

// Helper function to calculate distance between two coordinates
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Radius of Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = asyncHandler(async (req, res, next) => {
  const { restaurant: restaurantId, items, deliveryAddress, paymentMethod } = req.body;
  const customerId = req.userId;

  // Validate restaurant
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant || !restaurant.isApproved) {
    throw new AppError('Restaurant not found or not available', 404);
  }

  // Validate items and calculate subtotal
  let subtotal = 0;
  const orderItems = [];

  for (const item of items) {
    const menuItem = await MenuItem.findById(item.menuItem);
    if (!menuItem || !menuItem.isAvailable) {
      throw new AppError(`Item ${item.menuItem} is not available`, 400);
    }

    const itemPrice = menuItem.price;
    const customizationsPrice = item.customizations?.reduce(
      (sum, cust) => sum + (cust.additionalPrice || 0),
      0
    ) || 0;

    const itemTotal = (itemPrice + customizationsPrice) * item.quantity;
    subtotal += itemTotal;

    orderItems.push({
      menuItem: menuItem._id,
      name: menuItem.name,
      price: itemPrice,
      quantity: item.quantity,
      customizations: item.customizations || [],
      itemTotal
    });
  }

  // Check minimum order value
  if (subtotal < restaurant.minOrderValue) {
    throw new AppError(
      `Minimum order value is ₹${restaurant.minOrderValue}`,
      400
    );
  }

  // Calculate delivery fee based on distance
  const distance = calculateDistance(
    restaurant.address.latitude,
    restaurant.address.longitude,
    deliveryAddress.latitude,
    deliveryAddress.longitude
  );
  const deliveryFee = calculateDeliveryFee(distance);

  // BUSINESS LOGIC: Platform takes 0% commission
  const platformCommission = 0;

  // Assume 5% taxes
  const taxes = Math.round(subtotal * 0.05);

  // Total amount
  const total = subtotal + deliveryFee + taxes + platformCommission;

  // Create order
  const order = await Order.create({
    customer: customerId,
    restaurant: restaurantId,
    items: orderItems,
    pricing: {
      subtotal,
      platformCommission,
      deliveryFee,
      taxes,
      total
    },
    deliveryAddress: {
      ...deliveryAddress,
      city: deliveryAddress.city || 'Kahalgaon'
    },
    payment: {
      method: paymentMethod
    },
    tracking: {
      restaurantLocation: {
        latitude: restaurant.address.latitude,
        longitude: restaurant.address.longitude
      }
    }
  });

  // Create Razorpay order for payment
  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(total * 100), // Amount in paise
    currency: 'INR',
    receipt: order._id.toString(),
    payment_capture: 1 // Auto-capture payment
  });

  // Update order with Razorpay order ID
  order.payment.razorpayOrderId = razorpayOrder.id;
  await order.save();

  // Send order confirmation to customer
  const user = await User.findById(customerId);
  await sendEmail({
    email: user.email,
    subject: `Order Placed - ${order.orderNumber}`,
    html: `<h2>Order Confirmed</h2><p>Order Number: ${order.orderNumber}</p><p>Total Amount: ₹${total}</p><p>Expected Delivery: 45-60 minutes</p>`
  });

  // Notify restaurant
  const restaurantOwner = await Restaurant.findById(restaurantId).populate('owner');
  if (restaurantOwner?.owner?.email) {
    await sendEmail({
      email: restaurantOwner.owner.email,
      subject: `New Order - ${order.orderNumber}`,
      html: `<h2>New Order Received</h2><p>Order Number: ${order.orderNumber}</p><p>Items: ${items.length}</p><p>Please confirm within 2 minutes</p>`
    });
  }

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    order: {
      orderNumber: order.orderNumber,
      orderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: total,
      currency: 'INR'
    }
  });
});

// @desc    Verify payment and complete order
// @route   POST /api/orders/verify-payment
// @access  Private
exports.verifyPayment = asyncHandler(async (req, res, next) => {
  const { orderId, razorpayPaymentId, razorpaySignature } = req.body;

  // Verify signature
  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${razorpayPaymentId}`)
    .digest('hex');

  if (expectedSignature !== razorpaySignature) {
    throw new AppError('Payment verification failed', 400);
  }

  // Update order status
  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  order.payment.razorpayPaymentId = razorpayPaymentId;
  order.payment.razorpaySignature = razorpaySignature;
  order.payment.status = 'completed';
  order.payment.paidAt = new Date();
  order.status = 'pending'; // Waiting for restaurant confirmation
  await order.save();

  // Create payment record
  await Payment.create({
    transactionId: uuidv4(),
    order: orderId,
    user: order.customer,
    restaurant: order.restaurant,
    type: 'order_payment',
    purpose: 'food_order',
    amount: order.pricing.total,
    razorpay: {
      orderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature
    },
    status: 'completed',
    paymentMethod: order.payment.method
  });

  // Update customer's total spent and order count
  await User.findByIdAndUpdate(
    order.customer,
    {
      $inc: { totalOrders: 1, totalSpent: order.pricing.total }
    }
  );

  // Update restaurant's total orders
  await Restaurant.findByIdAndUpdate(
    order.restaurant,
    {
      $inc: { totalOrders: 1 }
    }
  );

  res.status(200).json({
    success: true,
    message: 'Payment verified and order confirmed',
    order: {
      orderId: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      amount: order.pricing.total
    }
  });
});

// @desc    Get order details with tracking
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate('restaurant', 'name address avgRating')
    .populate('driver', 'name phone')
    .populate('items.menuItem', 'name');

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Check if user has access to this order
  if (order.customer.toString() !== req.userId && req.userRole !== 'admin') {
    throw new AppError('Not authorized to view this order', 403);
  }

  res.status(200).json({
    success: true,
    order
  });
});

// @desc    Get user's order history
// @route   GET /api/orders
// @access  Private
exports.getUserOrders = asyncHandler(async (req, res, next) => {
  const { status, page = 1, limit = 10 } = req.query;

  let query = { customer: req.userId };
  if (status) {
    query.status = status;
  }

  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('restaurant', 'name image')
    .populate('items.menuItem', 'name');

  const total = await Order.countDocuments(query);

  res.status(200).json({
    success: true,
    total,
    page,
    limit,
    orders
  });
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = asyncHandler(async (req, res, next) => {
  const { reason } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Check authorization
  if (order.customer.toString() !== req.userId) {
    throw new AppError('Not authorized to cancel this order', 403);
  }

  // Cannot cancel completed or already cancelled orders
  if (['delivered', 'cancelled', 'failed'].includes(order.status)) {
    throw new AppError(`Cannot cancel a ${order.status} order`, 400);
  }

  order.status = 'cancelled';
  order.cancellation = {
    cancelledBy: 'customer',
    reason,
    cancelledAt: new Date(),
    refundStatus: 'pending'
  };
  await order.save();

  // Process refund if payment was completed
  if (order.payment.status === 'completed') {
    // Refund logic would go here
    order.payment.status = 'refunded';
    await order.save();
  }

  res.status(200).json({
    success: true,
    message: 'Order cancelled successfully',
    order
  });
});

// @desc    Rate order
// @route   PUT /api/orders/:id/rate
// @access  Private
exports.rateOrder = asyncHandler(async (req, res, next) => {
  const { customerRating, driverRating, review } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.status !== 'delivered') {
    throw new AppError('Can only rate delivered orders', 400);
  }

  order.rating = {
    customerRating,
    driverRating,
    review,
    ratedAt: new Date()
  };

  await order.save();

  // Update restaurant and driver ratings
  if (customerRating) {
    const restaurant = await Restaurant.findById(order.restaurant);
    restaurant.totalRatings += 1;
    restaurant.avgRating = (restaurant.avgRating * (restaurant.totalRatings - 1) + customerRating) / restaurant.totalRatings;
    await restaurant.save();
  }

  res.status(200).json({
    success: true,
    message: 'Order rated successfully',
    order
  });
});

// @desc    Update driver location (real-time tracking)
// @route   PUT /api/orders/:id/driver-location
// @access  Private (Driver)
exports.updateDriverLocation = asyncHandler(async (req, res, next) => {
  const { latitude, longitude } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  order.tracking.driverLocation = {
    latitude,
    longitude,
    updatedAt: new Date()
  };

  await order.save();

  // Emit socket event for real-time location update
  req.io?.emit('driver_location_updated', {
    orderId: order._id,
    location: { latitude, longitude },
    timestamp: new Date()
  });

  res.status(200).json({
    success: true,
    message: 'Location updated'
  });
});
