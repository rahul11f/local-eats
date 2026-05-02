const express = require('express');
const router = express.Router();
const { validate, schemas } = require('../middleware/validation');
const { authenticateCustomer } = require('../middleware/auth');
const {
  registerCustomer,
  loginCustomer,
  getProfile,
  updateProfile,
  addAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
  logout
} = require('../controllers/authController');

// Public routes
router.post('/register', validate(schemas.userRegistration), registerCustomer);
router.post('/login', validate(schemas.userLogin), loginCustomer);

// Protected routes
router.get('/me', authenticateCustomer, getProfile);
router.put('/profile', authenticateCustomer, updateProfile);
router.post('/address', authenticateCustomer, addAddress);
router.get('/addresses', authenticateCustomer, getAddresses);
router.put('/address/:id', authenticateCustomer, updateAddress);
router.delete('/address/:id', authenticateCustomer, deleteAddress);
router.post('/logout', authenticateCustomer, logout);

module.exports = router;
