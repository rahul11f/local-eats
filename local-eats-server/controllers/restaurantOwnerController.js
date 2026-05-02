const RestaurantOwner = require('../models/RestaurantOwner');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc   Register restaurant
// @route  POST /api/restaurants/register
// @access Public
exports.registerRestaurant = async (req, res) => {
  try {
    const {
      name,
      ownerName,
      ownerPhone,
      ownerEmail,
      password,
      confirmPassword,
      restaurantPhone,
      address,
      cuisine,
      documents
    } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    // Create restaurant owner
    const owner = await RestaurantOwner.create({
      name: ownerName,
      phone: ownerPhone,
      email: ownerEmail,
      password
    });

    // Create restaurant
    const restaurant = await Restaurant.create({
      owner: owner._id,
      name,
      phone: restaurantPhone,
      email: ownerEmail,
      address,
      cuisine,
      documents
    });

    // Update owner with restaurant reference
    owner.restaurant = restaurant._id;
    await owner.save();

    const token = generateToken(owner._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Awaiting approval.',
      token,
      restaurant: {
        id: restaurant._id,
        name: restaurant.name,
        isApproved: restaurant.isApproved
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error registering restaurant',
      error: error.message
    });
  }
};

// @desc   Login restaurant owner
// @route  POST /api/restaurants/login
// @access Public
exports.loginRestaurant = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide phone and password'
      });
    }

    const owner = await RestaurantOwner.findOne({ phone }).select('+password').populate('restaurant');

    if (!owner) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatchPassword = await owner.matchPassword(password);
    if (!isMatchPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!owner.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated'
      });
    }

    const token = generateToken(owner._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      restaurant: {
        id: owner.restaurant._id,
        name: owner.restaurant.name,
        isApproved: owner.restaurant.isApproved,
        subscription: owner.restaurant.subscription
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
};

// @desc   Get restaurant dashboard data
// @route  GET /api/restaurants/dashboard
// @access Private
exports.getDashboard = async (req, res) => {
  try {
    const owner = await RestaurantOwner.findById(req.user.id).populate('restaurant');

    if (!owner || !owner.restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    const restaurant = owner.restaurant;

    // Get today's orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = await Order.find({
      restaurant: restaurant._id,
      createdAt: { $gte: today }
    });

    // Calculate metrics
    const totalOrders = todayOrders.length;
    const completedOrders = todayOrders.filter((o) => o.status === 'delivered').length;
    const totalRevenue = todayOrders.reduce((sum, order) => sum + order.pricing.total, 0);

    res.status(200).json({
      success: true,
      data: {
        restaurant: {
          id: restaurant._id,
          name: restaurant.name,
          isApproved: restaurant.isApproved,
          subscription: restaurant.subscription,
          rating: restaurant.avgRating,
          totalOrders: restaurant.totalOrders
        },
        todayMetrics: {
          totalOrders,
          completedOrders,
          totalRevenue,
          completionRate: totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(2) : 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard',
      error: error.message
    });
  }
};

// @desc   Get pending orders
// @route  GET /api/restaurants/orders
// @access Private
exports.getOrders = async (req, res) => {
  try {
    const { status } = req.query;

    const owner = await RestaurantOwner.findById(req.user.id).populate('restaurant');
    const restaurant = owner.restaurant;

    let query = { restaurant: restaurant._id };
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('customer', 'name phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

// @desc   Update order status
// @route  PUT /api/restaurants/orders/:orderId/status
// @access Private
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { orderId } = req.params;

    const owner = await RestaurantOwner.findById(req.user.id).populate('restaurant');
    const order = await Order.findById(orderId);

    if (!order || order.restaurant.toString() !== owner.restaurant._id.toString()) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.status = status;
    if (status === 'ready') {
      order.timeline.readyAt = new Date();
    }
    if (status === 'preparing') {
      order.timeline.preparingAt = new Date();
    }

    await order.save();

    // Emit Socket.IO event for real-time update
    // This will be handled in server.js with socket.io

    res.status(200).json({
      success: true,
      message: 'Order status updated',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating order',
      error: error.message
    });
  }
};

// @desc   Add menu item
// @route  POST /api/restaurants/menu
// @access Private
exports.addMenuItem = async (req, res) => {
  try {
    const owner = await RestaurantOwner.findById(req.user.id).populate('restaurant');
    const { name, category, price, description, vegetarian, vegan, allergens } = req.body;

    const menuItem = await MenuItem.create({
      restaurant: owner.restaurant._id,
      name,
      category,
      price,
      description,
      vegetarian,
      vegan,
      allergens
    });

    res.status(201).json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding menu item',
      error: error.message
    });
  }
};

// @desc   Update menu item
// @route  PUT /api/restaurants/menu/:itemId
// @access Private
exports.updateMenuItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { name, price, isAvailable, preparationTime } = req.body;

    const menuItem = await MenuItem.findByIdAndUpdate(
      itemId,
      { name, price, isAvailable, preparationTime },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating menu item',
      error: error.message
    });
  }
};

// @desc   Delete menu item
// @route  DELETE /api/restaurants/menu/:itemId
// @access Private
exports.deleteMenuItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    await MenuItem.findByIdAndDelete(itemId);

    res.status(200).json({
      success: true,
      message: 'Menu item deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting menu item',
      error: error.message
    });
  }
};

// @desc   Get all menu items
// @route  GET /api/restaurants/menu
// @access Private
exports.getMenu = async (req, res) => {
  try {
    const owner = await RestaurantOwner.findById(req.user.id).populate('restaurant');

    const menuItems = await MenuItem.find({ restaurant: owner.restaurant._id }).sort('category');

    res.status(200).json({
      success: true,
      data: menuItems
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching menu',
      error: error.message
    });
  }
};
