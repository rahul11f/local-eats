const User = require('../models/User');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Configure email service (Brevo free tier)
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

// @desc   Register customer
// @route  POST /api/auth/register
// @access Public
exports.registerCustomer = async (req, res) => {
  try {
    const { name, phone, email, password, confirmPassword } = req.body;

    // Validation
    if (!name || !phone || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    // Check if user already exists
    let user = await User.findOne({ $or: [{ phone }, { email }] });
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'Phone or email already registered'
      });
    }

    // Create user
    user = await User.create({
      name,
      phone,
      email,
      password
    });

    // Generate token
    const token = generateToken(user._id);

    // Send welcome email
    try {
      await emailTransporter.sendMail({
        from: process.env.SENDER_EMAIL,
        to: email,
        subject: 'Welcome to LocalEats - Zero Commission Food Delivery in Kahalgaon',
        html: `
          <h1>Welcome ${name}! 🎉</h1>
          <p>You're now part of LocalEats Kahalgaon community.</p>
          <p>We offer:</p>
          <ul>
            <li>✅ Zero commission model - supporting local restaurants</li>
            <li>✅ Low delivery fees (₹10-30)</li>
            <li>✅ No hidden charges</li>
          </ul>
          <p>Start ordering now and get <strong>₹50 off</strong> on your first order!</p>
          <p>Best regards,<br/>LocalEats Team</p>
        `
      });
    } catch (err) {
      console.log('Email sending failed (non-critical)', err);
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
};

// @desc   Login customer
// @route  POST /api/auth/login
// @access Public
exports.loginCustomer = async (req, res) => {
  try {
    const { phone, password } = req.body;

    // Validation
    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide phone and password'
      });
    }

    // Find user and include password
    const user = await User.findOne({ phone }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatchPassword = await user.matchPassword(password);
    if (!isMatchPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been blocked. Contact support.'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        addresses: user.addresses
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
};

// @desc   Get current user profile
// @route  GET /api/auth/me
// @access Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
};

// @desc   Update user profile
// @route  PUT /api/auth/update-profile
// @access Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, preferences } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        name,
        email,
        preferences
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// @desc   Add or update user address
// @route  POST /api/auth/add-address
// @access Private
exports.addAddress = async (req, res) => {
  try {
    const { label, street, area, zipcode, latitude, longitude, isDefault } = req.body;

    const user = await User.findById(req.user.id);

    const newAddress = {
      label,
      street,
      area,
      zipcode,
      latitude,
      longitude,
      isDefault
    };

    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    user.addresses.push(newAddress);
    await user.save();

    res.status(201).json({
      success: true,
      data: user.addresses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding address',
      error: error.message
    });
  }
};

// @desc   Logout user
// @route  POST /api/auth/logout
// @access Private
exports.logout = async (req, res) => {
  // Frontend should remove the token
  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
};
