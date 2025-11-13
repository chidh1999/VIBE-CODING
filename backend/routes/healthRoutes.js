const express = require('express');

const router = express.Router();

// GET /api/health - Health check endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Node.js Backend',
    version: '1.0.0',
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

module.exports = router;
