const express = require('express');
const imageController = require('../controllers/imageController');
const upload = require('../middleware/upload');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Upload image
router.post('/upload', authenticateToken, upload.single('image'), imageController.uploadImage);

// Debug route
router.get('/test', (req, res) => {
  res.json({ message: 'Image routes working!' });
});

// Get image file
router.get('/:filename', imageController.getImage);

// Delete image
router.delete('/:filename', authenticateToken, imageController.deleteImage);

module.exports = router;
