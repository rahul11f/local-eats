const express = require('express');
const router = express.Router();
const { authenticateRestaurantOwner, authenticateCustomer } = require('../middleware/auth');
const {
  getAllRestaurants,
  getRestaurant,
  createRestaurant,
  updateRestaurant,
  getRestaurantDashboard,
  getRestaurantOrders,
  updateOrderStatus,
  getSubscriptionStatus,
  upgradeSubscription
} = require('../controllers/restaurantController');

// Public routes
router.get('/', getAllRestaurants);
router.get('/:id', getRestaurant);

// Restaurant owner routes (protected)
router.post('/', createRestaurant);
router.put('/:id', authenticateRestaurantOwner, updateRestaurant);
router.get('/:id/dashboard', authenticateRestaurantOwner, getRestaurantDashboard);
router.get('/:id/orders', authenticateRestaurantOwner, getRestaurantOrders);
router.put('/:id/orders/:orderId/status', authenticateRestaurantOwner, updateOrderStatus);
router.get('/:id/subscription', authenticateRestaurantOwner, getSubscriptionStatus);
router.post('/:id/subscription/upgrade', authenticateRestaurantOwner, upgradeSubscription);

module.exports = router;
