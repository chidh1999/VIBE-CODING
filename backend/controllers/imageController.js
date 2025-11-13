const path = require('path');
const fs = require('fs');
const Chat = require('../models/Chat');

class ImageController {
  // Upload image and save to database
  async uploadImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image file provided'
        });
      }

      const { userId, userName } = req.body;
      
      // Create image URL (relative to server)
      const imageUrl = `/uploads/images/${req.file.filename}`;
      
      // Save image message to database
      const newMessage = new Chat({
        user: userId,
        message: `📷 ${req.file.originalname}`,
        type: 'image',
        image: {
          url: imageUrl,
          name: req.file.originalname,
          size: req.file.size
        }
      });
      
      const savedMessage = await newMessage.save();
      const populatedMessage = await Chat.findById(savedMessage._id)
        .populate('user', 'name email role');

      // Broadcast to all connected clients via Socket.IO
      if (global.io) {
        global.io.to('general-chat').emit('new-message', populatedMessage);
        console.log(`📷 Image broadcasted: ${req.file.originalname}`);
      }

      res.json({
        success: true,
        message: 'Image uploaded successfully',
        data: populatedMessage
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload image',
        error: error.message
      });
    }
  }

  // Get image file
  async getImage(req, res) {
    try {
      const { filename } = req.params;
      const imagePath = path.join(__dirname, '../uploads/images', filename);
      
      // Check if file exists
      if (!fs.existsSync(imagePath)) {
        return res.status(404).json({
          success: false,
          message: 'Image not found'
        });
      }
      
      // Send image file
      res.sendFile(imagePath);
    } catch (error) {
      console.error('Error getting image:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get image',
        error: error.message
      });
    }
  }

  // Delete image
  async deleteImage(req, res) {
    try {
      const { filename } = req.params;
      const imagePath = path.join(__dirname, '../uploads/images', filename);
      
      // Check if file exists
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
      
      res.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting image:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete image',
        error: error.message
      });
    }
  }
}

module.exports = new ImageController();
