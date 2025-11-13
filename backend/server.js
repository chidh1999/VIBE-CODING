const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const SocketHandler = require('./socket');
require('dotenv').config();

// Import database connection
const connectDB = require('./config/database');

// Import routes and middleware
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./middleware/logger');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:2222", "http://localhost:3000"],
    methods: ["GET", "POST"]
  }
});

// Make io globally available
global.io = io;
const PORT = process.env.PORT || 1111;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (images)
app.use('/uploads', express.static('uploads'));

// Request logging
app.use(logger);

// Routes
app.use('/api', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use(errorHandler);

// Initialize Socket.IO handler
const socketHandler = new SocketHandler(io);

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Initialize default data
    const initData = require('./scripts/initData');
    await initData();
    
    // Start the server
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`👥 Users API: http://localhost:${PORT}/api/users`);
      console.log(`💬 Chat API: http://localhost:${PORT}/api/chat`);
      console.log(`🔌 Socket.IO: ws://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
