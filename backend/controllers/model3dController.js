const path = require('path');
const fs = require('fs');
const Chat = require('../models/Chat');
const upload = require('../middleware/upload3D');

class Model3DController {
  // Upload 3D model and save to database
  async uploadModel3D(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No 3D model file provided'
        });
      }

      const { userId, userName } = req.body;
      
      // Create 3D model URL (relative to server)
      const modelUrl = `/uploads/models/${req.file.filename}`;
      
      // Save 3D model message to database
      const newMessage = new Chat({
        user: userId,
        message: `🎮 ${req.file.originalname}`,
        type: 'model3d',
        model3d: {
          url: modelUrl,
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
        console.log(`🎮 3D Model broadcasted: ${req.file.originalname}`);
      }

      res.json({
        success: true,
        message: '3D model uploaded successfully',
        data: populatedMessage
      });
    } catch (error) {
      console.error('Error uploading 3D model:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload 3D model',
        error: error.message
      });
    }
  }
}

const model3dController = new Model3DController();

module.exports = {
  uploadModel3D: [upload.single('model3d'), (req, res) => model3dController.uploadModel3D(req, res)],
  model3dController
};

