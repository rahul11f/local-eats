const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

// @desc    Add menu item
// @route   POST /api/restaurants/:id/menu
// @access  Private (Owner)
exports.addMenuItem = asyncHandler(async (req, res, next) => {
  const { name, description, category, price, discountPrice, isVegetarian, isVegan, preparationTime, customizations } = req.body;
  const restaurantId = req.params.id;

  // Check if restaurant exists and owner is authorized
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    throw new AppError('Restaurant not found', 404);
  }

  if (restaurant.owner.toString() !== req.ownerId && req.ownerRole !== 'admin') {
    throw new AppError('Not authorized to add items to this restaurant', 403);
  }

  const menuItem = await MenuItem.create({
    restaurant: restaurantId,
    name,
    description,
    category,
    price,
    discountPrice,
    isVegetarian: isVegetarian || false,
    isVegan: isVegan || false,
    preparationTime: preparationTime || 15,
    isAvailable: true,
    customizations: customizations || []
  });

  res.status(201).json({
    success: true,
    message: 'Menu item added successfully',
    menuItem
  });
});

// @desc    Get all menu items for a restaurant
// @route   GET /api/restaurants/:id/menu
// @access  Public
exports.getMenuItems = asyncHandler(async (req, res, next) => {
  const { category } = req.query;
  const restaurantId = req.params.id;

  let query = { restaurant: restaurantId, isAvailable: true };

  if (category) {
    query.category = category;
  }

  const menuItems = await MenuItem.find(query).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    total: menuItems.length,
    menuItems
  });
});

// @desc    Get single menu item
// @route   GET /api/restaurants/:restaurantId/menu/:itemId
// @access  Public
exports.getMenuItem = asyncHandler(async (req, res, next) => {
  const menuItem = await MenuItem.findById(req.params.itemId);

  if (!menuItem) {
    throw new AppError('Menu item not found', 404);
  }

  res.status(200).json({
    success: true,
    menuItem
  });
});

// @desc    Update menu item
// @route   PUT /api/restaurants/:id/menu/:itemId
// @access  Private (Owner)
exports.updateMenuItem = asyncHandler(async (req, res, next) => {
  const { name, description, category, price, discountPrice, isVegetarian, isVegan, isAvailable, preparationTime } = req.body;
  const { id: restaurantId, itemId } = req.params;

  // Check authorization
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    throw new AppError('Restaurant not found', 404);
  }

  if (restaurant.owner.toString() !== req.ownerId && req.ownerRole !== 'admin') {
    throw new AppError('Not authorized', 403);
  }

  const menuItem = await MenuItem.findByIdAndUpdate(
    itemId,
    {
      name,
      description,
      category,
      price,
      discountPrice,
      isVegetarian,
      isVegan,
      isAvailable,
      preparationTime
    },
    { new: true, runValidators: true }
  );

  if (!menuItem) {
    throw new AppError('Menu item not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Menu item updated successfully',
    menuItem
  });
});

// @desc    Toggle item availability
// @route   PUT /api/restaurants/:id/menu/:itemId/toggle
// @access  Private (Owner)
exports.toggleItemAvailability = asyncHandler(async (req, res, next) => {
  const { id: restaurantId, itemId } = req.params;

  // Check authorization
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    throw new AppError('Restaurant not found', 404);
  }

  if (restaurant.owner.toString() !== req.ownerId) {
    throw new AppError('Not authorized', 403);
  }

  const menuItem = await MenuItem.findById(itemId);
  if (!menuItem) {
    throw new AppError('Menu item not found', 404);
  }

  menuItem.isAvailable = !menuItem.isAvailable;
  await menuItem.save();

  res.status(200).json({
    success: true,
    message: `Item ${menuItem.isAvailable ? 'enabled' : 'disabled'}`,
    menuItem
  });
});

// @desc    Delete menu item
// @route   DELETE /api/restaurants/:id/menu/:itemId
// @access  Private (Owner)
exports.deleteMenuItem = asyncHandler(async (req, res, next) => {
  const { id: restaurantId, itemId } = req.params;

  // Check authorization
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    throw new AppError('Restaurant not found', 404);
  }

  if (restaurant.owner.toString() !== req.ownerId && req.ownerRole !== 'admin') {
    throw new AppError('Not authorized', 403);
  }

  const menuItem = await MenuItem.findByIdAndDelete(itemId);

  if (!menuItem) {
    throw new AppError('Menu item not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Menu item deleted successfully'
  });
});

// @desc    Bulk update menu items (change price, availability, etc)
// @route   PUT /api/restaurants/:id/menu/bulk
// @access  Private (Owner)
exports.bulkUpdateMenuItems = asyncHandler(async (req, res, next) => {
  const { items } = req.body; // Array of {id, field, value}
  const restaurantId = req.params.id;

  // Check authorization
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    throw new AppError('Restaurant not found', 404);
  }

  if (restaurant.owner.toString() !== req.ownerId) {
    throw new AppError('Not authorized', 403);
  }

  const updates = [];

  for (const item of items) {
    const updateObj = { [item.field]: item.value };
    const updated = await MenuItem.findByIdAndUpdate(item.id, updateObj, { new: true });
    updates.push(updated);
  }

  res.status(200).json({
    success: true,
    message: `${updates.length} items updated`,
    updatedItems: updates
  });
});

// @desc    Search menu items
// @route   GET /api/restaurants/:id/menu/search
// @access  Public
exports.searchMenuItems = asyncHandler(async (req, res, next) => {
  const { q } = req.query;
  const restaurantId = req.params.id;

  if (!q) {
    throw new AppError('Search query required', 400);
  }

  const menuItems = await MenuItem.find({
    restaurant: restaurantId,
    $text: { $search: q }
  });

  res.status(200).json({
    success: true,
    total: menuItems.length,
    menuItems
  });
});
