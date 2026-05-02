const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const DeliveryDriver = require('../models/DeliveryDriver');

// @desc   Get all users
// @route  GET /api/admin/users
// @access Private (Admin only)
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const users = await User.find()
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments();

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalUsers: total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// @desc   Block/Unblock user
// @route  PUT /api/admin/users/:userId/block
// @access Private (Admin only)
exports.blockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isBlocked } = req.body;

    const user = await User.findByIdAndUpdate(userId, { isBlocked }, { new: true });

    res.status(200).json({
      success: true,
      message: isBlocked ? 'User blocked' : 'User unblocked',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user status',
      error: error.message
    });
  }
};

// @desc   Get pending restaurant approvals
// @route  GET /api/admin/restaurants/pending
// @access Private (Admin only)
exports.getPendingRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ isApproved: false }).populate('owner');

    res.status(200).json({
      success: true,
      data: restaurants
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching pending restaurants',
      error: error.message
    });
  }
};

// @desc   Approve/Reject restaurant
// @route  PUT /api/admin/restaurants/:restaurantId/approve
// @access Private (Admin only)
exports.approveRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { isApproved } = req.body;

    const restaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      {
        isApproved,
        approvedAt: isApproved ? new Date() : null
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: isApproved ? 'Restaurant approved' : 'Restaurant rejected',
      data: restaurant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating restaurant status',
      error: error.message
    });
  }
};

// @desc   Get all restaurants
// @route  GET /api/admin/restaurants
// @access Private (Admin only)
exports.getRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find().populate('owner');

    res.status(200).json({
      success: true,
      data: restaurants
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching restaurants',
      error: error.message
    });
  }
};

// @desc   Get delivery partners
// @route  GET /api/admin/drivers
// @access Private (Admin only)
exports.getDrivers = async (req, res) => {
  try {
    const drivers = await DeliveryDriver.find().select('-password');

    res.status(200).json({
      success: true,
      data: drivers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching drivers',
      error: error.message
    });
  }
};

// @desc   Approve delivery driver
// @route  PUT /api/admin/drivers/:driverId/approve
// @access Private (Admin only)
exports.approveDriver = async (req, res) => {
  try {
    const { driverId } = req.params;
    const { isApproved } = req.body;

    const driver = await DeliveryDriver.findByIdAndUpdate(
      driverId,
      {
        isApproved,
        approvedAt: isApproved ? new Date() : null,
        status: isApproved ? 'active' : 'inactive'
      },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: isApproved ? 'Driver approved' : 'Driver rejected',
      data: driver
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating driver status',
      error: error.message
    });
  }
};

// @desc   Get platform analytics
// @route  GET /api/admin/analytics
// @access Private (Admin only)
// BUSINESS LOGIC: Track revenue from subscriptions and delivery fees
exports.getAnalytics = async (req, res) => {
  try {
    // Total metrics
    const totalUsers = await User.countDocuments();
    const totalRestaurants = await Restaurant.countDocuments({ isApproved: true });
    const totalOrders = await Order.countDocuments();
    const totalDrivers = await DeliveryDriver.countDocuments({ isApproved: true });

    // Revenue breakdown
    const completedOrders = await Order.find({ status: 'delivered' });
    const totalOrderRevenue = completedOrders.reduce((sum, order) => sum + order.pricing.deliveryFee, 0);

    // Subscription revenue (monthly fees)
    const activeSubscriptions = await Restaurant.find({
      'subscription.isActive': true
    });
    const monthlySubscriptionRevenue = activeSubscriptions.reduce(
      (sum, restaurant) => sum + (restaurant.subscription.monthlyFee || 0),
      0
    );

    // Today's metrics
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = await Order.find({
      createdAt: { $gte: today }
    });

    const todayRevenue = completedOrders
      .filter((o) => o.timeline.deliveredAt >= today)
      .reduce((sum, order) => sum + order.pricing.deliveryFee, 0);

    res.status(200).json({
      success: true,
      data: {
        platform: {
          totalUsers,
          totalRestaurants,
          totalOrders,
          totalDrivers,
          avgOrderValue: totalOrders > 0 ? (totalOrderRevenue / totalOrders).toFixed(2) : 0
        },
        revenue: {
          // BUSINESS LOGIC: Revenue from delivery fees only
          totalDeliveryFeeRevenue: totalOrderRevenue.toFixed(2),
          // BUSINESS LOGIC: Monthly subscription revenue (₹199-399 per restaurant)
          monthlySubscriptionRevenue: monthlySubscriptionRevenue.toFixed(2),
          totalRevenue: (totalOrderRevenue + monthlySubscriptionRevenue).toFixed(2),
          commissionPercentage: 0, // ZERO commission model
          note: 'Zero commission model - revenue from subscription fees (Basic: ₹199, Premium: ₹399) and delivery fees (₹10-30 per order)'
        },
        todayMetrics: {
          ordersCount: todayOrders.length,
          deliveredOrders: todayOrders.filter((o) => o.status === 'delivered').length,
          todayRevenue: todayRevenue.toFixed(2)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message
    });
  }
};

// @desc   Manually assign order to driver
// @route  PUT /api/admin/orders/:orderId/assign-driver
// @access Private (Admin only)
exports.assignDriver = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { driverId } = req.body;

    // Check if driver is available
    const driver = await DeliveryDriver.findById(driverId);
    if (!driver || driver.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Driver not available'
      });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        driver: driverId,
        status: 'picked_up'
      },
      { new: true }
    ).populate('driver');

    // Update driver's current order
    driver.currentOrder = orderId;
    driver.onDuty = true;
    await driver.save();

    res.status(200).json({
      success: true,
      message: 'Driver assigned successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error assigning driver',
      error: error.message
    });
  }
};

// @desc   Get order monitoring dashboard
// @route  GET /api/admin/orders/monitoring
// @access Private (Admin only)
exports.getOrderMonitoring = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customer', 'name phone')
      .populate('restaurant', 'name')
      .populate('driver', 'name phone')
      .sort({ createdAt: -1 })
      .limit(50);

    const statusBreakdown = {
      pending: orders.filter((o) => o.status === 'pending').length,
      confirmed: orders.filter((o) => o.status === 'confirmed').length,
      preparing: orders.filter((o) => o.status === 'preparing').length,
      ready: orders.filter((o) => o.status === 'ready').length,
      in_transit: orders.filter((o) => o.status === 'in_transit').length,
      delivered: orders.filter((o) => o.status === 'delivered').length,
      cancelled: orders.filter((o) => o.status === 'cancelled').length
    };

    res.status(200).json({
      success: true,
      data: {
        orders,
        statusBreakdown
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching order monitoring data',
      error: error.message
    });
  }
};
