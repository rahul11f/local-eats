const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const { errorHandler } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const orderRoutes = require('./routes/orderRoutes');
const menuRoutes = require('./routes/menuRoutes');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Allowed origins (supports comma-separated list for multi-domain)
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim());

// Socket.IO configuration
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST']
  }
});

// ============= MIDDLEWARE =============

// Security
app.use(helmet());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.'
});

app.use(limiter);

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Compression
app.use(compression());

// Attach io to request object
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ============= ROUTES =============

app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/restaurants/:id/menu', menuRoutes);
app.use('/api/orders', orderRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'LocalEats API is running',
    timestamp: new Date(),
    environment: process.env.NODE_ENV
  });
});

// Serve static files (for deployment)
app.use(express.static('public'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use(errorHandler);

// ============= SOCKET.IO EVENTS =============

io.on('connection', (socket) => {
  console.log('🔗 Client connected:', socket.id);

  // Customer joins order tracking room
  socket.on('join_order', (orderId) => {
    socket.join(`order_${orderId}`);
    console.log(`Customer joined order tracking for ${orderId}`);
  });

  // Restaurant joins dashboard room
  socket.on('join_restaurant', (restaurantId) => {
    socket.join(`restaurant_${restaurantId}`);
    console.log(`Restaurant ${restaurantId} joined dashboard`);
  });

  // Driver updates location (real-time tracking)
  socket.on('driver_location', (data) => {
    const { orderId, latitude, longitude } = data;
    io.to(`order_${orderId}`).emit('driver_location_updated', {
      latitude,
      longitude,
      timestamp: new Date()
    });
  });

  // Restaurant broadcasts order status updates to all connected customers
  socket.on('order_status_change', (data) => {
    const { orderId, status, message } = data;
    io.to(`order_${orderId}`).emit('order_status_updated', {
      orderId,
      status,
      message,
      timestamp: new Date()
    });
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// ============= MONGODB CONNECTION =============

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

// ============= SERVER STARTUP =============

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start server
    server.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════════════╗
║                   LocalEats API Server                         ║
║                   Kahalgaon Food Delivery                      ║
╠════════════════════════════════════════════════════════════════╣
║ 🚀 Server running on http://localhost:${PORT}
║ 🔗 WebSocket enabled for real-time tracking
║ 🌍 Environment: ${process.env.NODE_ENV}
║ 📊 Database: MongoDB Atlas
║ 💳 Payment: Razorpay Integration
╚════════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

// Start the server
if (require.main === module) {
  startServer();
}

module.exports = { app, server, io };
