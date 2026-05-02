const express = require('express');
const router = express.Router({ mergeParams: true });
const { authenticateRestaurantOwner } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const {
  addMenuItem,
  getMenuItems,
  getMenuItem,
  updateMenuItem,
  toggleItemAvailability,
  deleteMenuItem,
  bulkUpdateMenuItems,
  searchMenuItems
} = require('../controllers/menuController');

// Public routes
router.get('/', getMenuItems);
router.get('/search', searchMenuItems);
router.get('/:itemId', getMenuItem);

// Protected routes (owner)
router.post('/', authenticateRestaurantOwner, validate(schemas.addMenuItem), addMenuItem);
router.put('/:itemId', authenticateRestaurantOwner, validate(schemas.updateMenuItem), updateMenuItem);
router.put('/:itemId/toggle', authenticateRestaurantOwner, toggleItemAvailability);
router.delete('/:itemId', authenticateRestaurantOwner, deleteMenuItem);
router.put('/bulk/update', authenticateRestaurantOwner, bulkUpdateMenuItems);

module.exports = router;
