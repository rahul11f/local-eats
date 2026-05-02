const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');
const RestaurantOwner = require('../models/RestaurantOwner');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const { sendEmail } = require('../utils/email');

// @desc    Get all restaurants (with filters and search)
// @route   GET /api/restaurants
// @access  Public
exports.getAllRestaurants = asyncHandler(async (req, res, next) => {
  const { search, cuisine, lat, lng, distance = 5 } = req.query;

  let query = { isApproved: true, isActive: true };

  // Text search on name and cuisine
  if (search) {
    query.$text = { $search: search };
  }

  // Cuisine filter
  if (cuisine) {
    query.cuisine = cuisine;
  }

  // Location-based search
  if (lat && lng) {
    query['address.latitude'] = { $gte: lat - distance, $lte: lat + distance };
    query['address.longitude'] = { $gte: lng - distance, $lte: lng + distance };
  }

  const restaurants = await Restaurant.find(query).populate('owner', 'name phone email');

  res.status(200).json({
    success: true,
    total: restaurants.length,
    restaurants
  });
});

// @desc    Get single restaurant with menu
// @route   GET /api/restaurants/:id
// @access  Public
exports.getRestaurant = asyncHandler(async (req, res, next) => {
  const restaurant = await Restaurant.findById(req.params.id)
    .populate('owner', 'name phone email')
    .populate('menu');

  if (!restaurant || !restaurant.isApproved) {
    throw new AppError('Restaurant not found', 404);
  }

  const menuItems = await MenuItem.find({ restaurant: req.params.id, isAvailable: true });

  res.status(200).json({
    success: true,
    restaurant,
    menu: menuItems
  });
});

// @desc    Create restaurant (Owner signup)
// @route   POST /api/restaurants
// @access  Public
exports.createRestaurant = asyncHandler(async (req, res, next) => {
  const { ownerName, ownerPhone, ownerEmail, ownerPassword, restaurantName, phone, cuisines, address } = req.body;

  // Create owner first
  let owner = await RestaurantOwner.findOne({ phone: ownerPhone });
  if (owner) {
    throw new AppError('Owner already exists', 400);
  }

  owner = await RestaurantOwner.create({
    name: ownerName,
    phone: ownerPhone,
    email: ownerEmail,
    password: ownerPassword
  });

  // Create restaurant
  const restaurant = await Restaurant.create({
    owner: owner._id,
    name: restaurantName,
    phone,
    cuisine: cuisines,
    address,
    isApproved: false // Requires admin approval
  });

  // Send notification to admin
  await sendEmail({
    email: process.env.ADMIN_EMAIL,
    subject: 'New Restaurant Signup - LocalEats Kahalgaon',
    html: `<h2>New Restaurant Application</h2><p>Restaurant: ${restaurantName}</p><p>Owner: ${ownerName}</p><p>Please review and approve.</p>`
  });

  res.status(201).json({
    success: true,
    message: 'Restaurant registered successfully. Awaiting admin approval.',
    restaurant
  });
});

// @desc    Update restaurant (Owner)
// @route   PUT /api/restaurants/:id
// @access  Private (Owner)
exports.updateRestaurant = asyncHandler(async (req, res, next) => {
  const { name, description, address, operatingHours, minOrderValue, deliveryZones } = req.body;

  const restaurant = await Restaurant.findById(req.params.id);
  if (!restaurant) {
    throw new AppError('Restaurant not found', 404);
  }

  // Check if owner is authorized
  if (restaurant.owner.toString() !== req.ownerId && req.ownerRole !== 'admin') {
    throw new AppError('Not authorized to update this restaurant', 403);
  }

  Object.assign(restaurant, {
    name,
    description,
    address,
    operatingHours,
    minOrderValue,
    deliveryZones
  });

  await restaurant.save();

  res.status(200).json({
    success: true,
    message: 'Restaurant updated successfully',
    restaurant
  });
});

// @desc    Get restaurant dashboard (Orders, earnings, analytics)
// @route   GET /api/restaurants/:id/dashboard
// @access  Private (Owner)
exports.getRestaurantDashboard = asyncHandler(async (req, res, next) => {
  const restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    throw new AppError('Restaurant not found', 404);
  }

  // Check authorization
  if (restaurant.owner.toString() !== req.ownerId && req.ownerRole !== 'admin') {
    throw new AppError('Not authorized', 403);
  }

  // Get recent orders
  const recentOrders = await Order.find({ restaurant: req.params.id })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('customer', 'name phone');

  // Get pending orders
  const pendingOrders = await Order.find({
    restaurant: req.params.id,
    status: { $in: ['pending', 'confirmed', 'preparing'] }
  }).populate('customer', 'name phone');

  res.status(200).json({
    success: true,
    dashboard: {
      restaurant,
      recentOrders,
      pendingOrders,
      totalOrders: restaurant.totalOrders,
      avgRating: restaurant.avgRating,
      monthlyRevenue: restaurant.analytics?.monthlyRevenue || 0,
      monthlyOrders: restaurant.analytics?.monthlyOrders || 0
    }
  });
});

// @desc    Get all restaurant orders
// @route   GET /api/restaurants/:id/orders
// @access  Private (Owner)
exports.getRestaurantOrders = asyncHandler(async (req, res, next) => {
  const { status, page = 1, limit = 20 } = req.query;

  const restaurant = await Restaurant.findById(req.params.id);
  if (!restaurant || restaurant.owner.toString() !== req.ownerId) {
    throw new AppError('Not authorized', 403);
  }

  let query = { restaurant: req.params.id };
  if (status) {
    query.status = status;
  }

  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('customer', 'name phone')
    .populate('items.menuItem');

  const total = await Order.countDocuments(query);

  res.status(200).json({
    success: true,
    total,
    page,
    limit,
    orders
  });
});

// @desc    Update order status
// @route   PUT /api/restaurants/:id/orders/:orderId/status
// @access  Private (Owner)
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  const order = await Order.findById(req.params.orderId);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Check authorization
  if (order.restaurant.toString() !== req.params.id) {
    throw new AppError('Not authorized', 403);
  }

  order.status = status;
  if (status === 'ready') {
    order.tracking.estimatedDeliveryTime = new Date(Date.now() + 30 * 60 * 1000); // 30 min from now
  }

  await order.save();

  // Emit socket event for real-time update
  req.io?.emit('order_status_updated', {
    orderId: order._id,
    status,
    timestamp: new Date()
  });

  res.status(200).json({
    success: true,
    message: 'Order status updated',
    order
  });
});

// @desc    View subscription and billing
// @route   GET /api/restaurants/:id/subscription
// @access  Private (Owner)
exports.getSubscriptionStatus = asyncHandler(async (req, res, next) => {
  const restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    throw new AppError('Restaurant not found', 404);
  }

  // BUSINESS LOGIC: Subscription plans - Basic ₹199/month, Premium ₹399/month
  const plans = [
    {
      name: 'basic',
      monthlyFee: 199,
      features: ['Basic menu management', 'Order notifications', 'Standard support']
    },
    {
      name: 'premium',
      monthlyFee: 399,
      features: [
        'Advanced menu management',
        'Analytics dashboard',
        'Priority support',
        'SMS notifications',
        'Custom branding'
      ]
    }
  ];

  res.status(200).json({
    success: true,
    currentSubscription: restaurant.subscription,
    availablePlans: plans
  });
});

// @desc    Upgrade subscription
// @route   POST /api/restaurants/:id/subscription/upgrade
// @access  Private (Owner)
exports.upgradeSubscription = asyncHandler(async (req, res, next) => {
  const { plan } = req.body; // 'basic' or 'premium'

  const restaurant = await Restaurant.findById(req.params.id);
  if (!restaurant) {
    throw new AppError('Restaurant not found', 404);
  }

  // BUSINESS LOGIC: Set subscription plan
  const monthlyFees = { basic: 199, premium: 399 };

  restaurant.subscription = {
    plan,
    monthlyFee: monthlyFees[plan],
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    isActive: true,
    autoRenew: true
  };

  await restaurant.save();

  res.status(200).json({
    success: true,
    message: `Upgraded to ${plan} plan. Monthly fee: ₹${monthlyFees[plan]}`,
    subscription: restaurant.subscription
  });
});
