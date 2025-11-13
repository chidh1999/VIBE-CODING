const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { uploadModel3D } = require('../controllers/model3dController');

// Upload 3D model
router.post('/upload', authenticateToken, uploadModel3D);

module.exports = router;

