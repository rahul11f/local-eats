const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const { sendEmail } = require('../utils/email');

// @desc    Register a new customer
// @route   POST /api/auth/register
// @access  Public
exports.registerCustomer = asyncHandler(async (req, res, next) => {
  const { name, phone, email, password } = req.body;

  // Check if user already exists
  let user = await User.findOne({ $or: [{ email }, { phone }] });
  if (user) {
    throw new AppError('User already exists with this email or phone', 400);
  }

  // Create user
  user = await User.create({
    name,
    phone,
    email,
    password,
    role: 'customer'
  });

  // Generate token
  const token = generateToken(user._id, user.role);

  // Send welcome email
  await sendEmail({
    email: user.email,
    subject: 'Welcome to LocalEats Kahalgaon',
    html: `<h1>Welcome ${name}!</h1><p>Thank you for joining LocalEats. Order delicious food from local restaurants with zero commission.</p>`
  });

  res.status(201).json({
    success: true,
    message: 'Customer registered successfully',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone
    }
  });
});

// @desc    Login customer
// @route   POST /api/auth/login
// @access  Public
exports.loginCustomer = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    throw new AppError('Please provide email and password', 400);
  }

  // Check if user exists and password is correct
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  // Check if user is blocked
  if (user.isBlocked) {
    throw new AppError('Your account has been blocked. Please contact support.', 403);
  }

  // Generate token
  const token = generateToken(user._id, user.role);

  res.status(200).json({
    success: true,
    message: 'Logged in successfully',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      totalOrders: user.totalOrders
    }
  });
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.userId);

  res.status(200).json({
    success: true,
    user
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const { name, phone } = req.body;

  const user = await User.findByIdAndUpdate(
    req.userId,
    { name, phone },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user
  });
});

// @desc    Add delivery address
// @route   POST /api/auth/address
// @access  Private
exports.addAddress = asyncHandler(async (req, res, next) => {
  const { label, street, area, city, zipcode, latitude, longitude, isDefault } = req.body;

  const user = await User.findById(req.userId);

  // If isDefault is true, unset other defaults
  if (isDefault) {
    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
  }

  user.addresses.push({
    label,
    street,
    area,
    city: city || 'Kahalgaon',
    zipcode,
    latitude,
    longitude,
    isDefault
  });

  await user.save();

  res.status(201).json({
    success: true,
    message: 'Address added successfully',
    addresses: user.addresses
  });
});

// @desc    Get all addresses
// @route   GET /api/auth/addresses
// @access  Private
exports.getAddresses = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.userId);

  res.status(200).json({
    success: true,
    addresses: user.addresses
  });
});

// @desc    Update delivery address
// @route   PUT /api/auth/address/:id
// @access  Private
exports.updateAddress = asyncHandler(async (req, res, next) => {
  const { label, street, area, city, zipcode, latitude, longitude, isDefault } = req.body;

  const user = await User.findById(req.userId);
  const address = user.addresses.id(req.params.id);

  if (!address) {
    throw new AppError('Address not found', 404);
  }

  // If setting as default, unset others
  if (isDefault) {
    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
  }

  Object.assign(address, {
    label,
    street,
    area,
    city: city || 'Kahalgaon',
    zipcode,
    latitude,
    longitude,
    isDefault
  });

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Address updated successfully',
    addresses: user.addresses
  });
});

// @desc    Delete delivery address
// @route   DELETE /api/auth/address/:id
// @access  Private
exports.deleteAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.userId);

  user.addresses.id(req.params.id).deleteOne();
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Address deleted successfully',
    addresses: user.addresses
  });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});
