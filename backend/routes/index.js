const express = require('express');
const userRoutes = require('./userRoutes');
const roleRoutes = require('./roleRoutes');
const authRoutes = require('./authRoutes');
const chatRoutes = require('./chatRoutes');
const supportRoutes = require('./supportRoutes');
const model3dRoutes = require('./model3dRoutes');
const imageRoutes = require('./imageRoutes');
const healthRoutes = require('./healthRoutes');

const router = express.Router();

// Health check routes
router.use('/health', healthRoutes);

// Auth routes
router.use('/auth', authRoutes);

// User routes
router.use('/users', userRoutes);

// Role routes
router.use('/roles', roleRoutes);

// Chat routes
router.use('/chat', chatRoutes);

// Support routes
router.use('/support', supportRoutes);

// 3D Model routes
router.use('/model3d', model3dRoutes);

// Image routes
router.use('/images', imageRoutes);

// Root route
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Node.js Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
      roles: '/api/roles',
      chat: '/api/chat',
      support: '/api/support'
    }
  });
});

module.exports = router;
