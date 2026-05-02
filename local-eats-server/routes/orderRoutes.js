const express = require('express');
const router = express.Router();
const { authenticateCustomer, authenticateDriver } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const {
  createOrder,
  verifyPayment,
  getOrder,
  getUserOrders,
  cancelOrder,
  rateOrder,
  updateDriverLocation
} = require('../controllers/orderController');

// Customer routes (protected)
router.post('/', authenticateCustomer, validate(schemas.createOrder), createOrder);
router.post('/verify-payment', authenticateCustomer, verifyPayment);
router.get('/', authenticateCustomer, getUserOrders);
router.get('/:id', authenticateCustomer, getOrder);
router.put('/:id/cancel', authenticateCustomer, cancelOrder);
router.put('/:id/rate', authenticateCustomer, validate(schemas.rateOrder), rateOrder);

// Driver routes (protected)
router.put('/:id/driver-location', authenticateDriver, updateDriverLocation);

module.exports = router;
