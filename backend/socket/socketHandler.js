const Chat = require('../models/Chat');

class SocketHandler {
  constructor(io) {
    this.io = io;
    this.setupSocketEvents();
  }

  setupSocketEvents() {
    this.io.on('connection', (socket) => {
      console.log(`🔌 User connected: ${socket.id}`);

      // Join user to chat room
      socket.on('join-chat', (userData) => {
        this.handleJoinChat(socket, userData);
      });

      // Handle new message
      socket.on('send-message', async (messageData) => {
        await this.handleSendMessage(socket, messageData);
      });

      // Handle location message
      socket.on('send-location', async (locationData) => {
        await this.handleSendLocation(socket, locationData);
      });

      // Handle shared map events
      socket.on('share-location', (locationData) => {
        this.handleShareLocation(socket, locationData);
      });

      socket.on('stop-sharing-location', (userData) => {
        this.handleStopSharingLocation(socket, userData);
      });

      socket.on('map-view-change', (viewData) => {
        this.handleMapViewChange(socket, viewData);
      });

          // Handle route updates
          socket.on('route-update', (routeData) => {
            this.handleRouteUpdate(socket, routeData);
          });

          // Handle voice chat events
          socket.on('voice-chat-join', (userData) => {
            this.handleVoiceChatJoin(socket, userData);
          });

          socket.on('voice-chat-leave', (userData) => {
            this.handleVoiceChatLeave(socket, userData);
          });

          socket.on('voice-message', (voiceData) => {
            this.handleVoiceMessage(socket, voiceData);
          });

          // Handle image message
          socket.on('send-image', (imageData) => {
            this.handleImageMessage(socket, imageData);
          });

          // Handle 3D model message
          socket.on('send-model3d', (modelData) => {
            this.handleModel3DMessage(socket, modelData);
          });

      // Handle typing indicator
      socket.on('typing', (userData) => {
        this.handleTyping(socket, userData, true);
      });

      socket.on('stop-typing', (userData) => {
        this.handleTyping(socket, userData, false);
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });
    });
  }

  handleJoinChat(socket, userData) {
    socket.userData = userData;
    socket.join('general-chat');
    console.log(`👤 ${userData.name} joined chat`);
    
    // Notify others that user joined
    socket.to('general-chat').emit('user-joined', {
      message: `${userData.name} joined the chat`,
      user: userData,
      timestamp: new Date()
    });
  }

  async handleSendMessage(socket, messageData) {
    try {
      // Save message to database
      const newMessage = new Chat({
        user: messageData.userId,
        message: messageData.message,
        type: 'text'
      });
      
      const savedMessage = await newMessage.save();
      const populatedMessage = await Chat.findById(savedMessage._id)
        .populate('user', 'name email role');

      // Broadcast message to all users in chat
      this.io.to('general-chat').emit('new-message', populatedMessage);
      
      console.log(`💬 Message from ${messageData.userName}: ${messageData.message}`);
    } catch (error) {
      console.error('Error saving message:', error);
      socket.emit('message-error', { error: 'Failed to send message' });
    }
  }

  async handleSendLocation(socket, locationData) {
    try {
      // Save location message to database
      const newMessage = new Chat({
        user: locationData.userId,
        message: `📍 Đã chia sẻ vị trí`,
        type: 'location',
        location: {
          lat: locationData.location.lat,
          lng: locationData.location.lng,
          address: locationData.location.address
        }
      });
      
      const savedMessage = await newMessage.save();
      const populatedMessage = await Chat.findById(savedMessage._id)
        .populate('user', 'name email role');

      // Broadcast location message to all users in chat
      this.io.to('general-chat').emit('new-message', populatedMessage);
      
      console.log(`📍 Location shared by ${locationData.userName}: ${locationData.location.lat}, ${locationData.location.lng}`);
    } catch (error) {
      console.error('Error saving location message:', error);
      socket.emit('message-error', { error: 'Failed to send location' });
    }
  }

  handleTyping(socket, userData, isTyping) {
    socket.to('general-chat').emit('user-typing', {
      user: userData,
      isTyping: isTyping
    });
  }

  handleDisconnect(socket) {
    if (socket.userData) {
      console.log(`👋 ${socket.userData.name} disconnected`);
      
      // Notify others that user left
      socket.to('general-chat').emit('user-left', {
        message: `${socket.userData.name} left the chat`,
        user: socket.userData,
        timestamp: new Date()
      });
    }
  }

  // Handle share location for shared map
  handleShareLocation(socket, locationData) {
    // Broadcast location to all users in chat
    socket.to('general-chat').emit('user-location-sharing', {
      userId: locationData.userId,
      name: locationData.name,
      lat: locationData.lat,
      lng: locationData.lng,
      isSharing: true
    });
    
    console.log(`📍 ${locationData.name} started sharing location: ${locationData.lat}, ${locationData.lng}`);
  }

  // Handle stop sharing location
  handleStopSharingLocation(socket, userData) {
    // Broadcast that user stopped sharing
    socket.to('general-chat').emit('user-location-sharing', {
      userId: userData.userId,
      isSharing: false
    });
    
    console.log(`🛑 ${userData.userId} stopped sharing location`);
  }

  // Handle map view changes
  handleMapViewChange(socket, viewData) {
    // Broadcast map view change to other users
    socket.to('general-chat').emit('map-view-update', {
      userId: viewData.userId,
      lat: viewData.lat,
      lng: viewData.lng,
      zoom: viewData.zoom
    });
  }

      // Handle route updates
      handleRouteUpdate(socket, routeData) {
        // Broadcast route update to all users in chat
        socket.to('general-chat').emit('route-update', {
          userId: routeData.userId,
          userName: routeData.userName,
          routePoints: routeData.routePoints,
          timestamp: routeData.timestamp
        });
      }

      // Handle voice chat join
      handleVoiceChatJoin(socket, userData) {
        console.log(`🎤 ${userData.userName} joined voice chat`);
        // Broadcast voice chat join to all users in chat
        socket.to('general-chat').emit('voice-chat-join', {
          userId: userData.userId,
          userName: userData.userName,
          timestamp: Date.now()
        });
      }

      // Handle voice chat leave
      handleVoiceChatLeave(socket, userData) {
        console.log(`🎤 ${userData.userName} left voice chat`);
        // Broadcast voice chat leave to all users in chat
        socket.to('general-chat').emit('voice-chat-leave', {
          userId: userData.userId,
          userName: userData.userName,
          timestamp: Date.now()
        });
      }

      // Handle voice message
      handleVoiceMessage(socket, voiceData) {
        console.log(`🎤 Voice message from ${voiceData.userName}, data length: ${voiceData.audioData.length}`);
        // Broadcast voice message to all users in chat
        socket.to('general-chat').emit('voice-message', {
          userId: voiceData.userId,
          userName: voiceData.userName,
          audioData: voiceData.audioData,
          timestamp: voiceData.timestamp
        });
      }

      // Handle image message
      async handleImageMessage(socket, imageData) {
        try {
          console.log(`📷 Image message from ${imageData.userName}, size: ${imageData.size} bytes`);
          
          // Save image message to database
          const newMessage = new Chat({
            user: imageData.userId,
            message: `📷 ${imageData.imageName}`,
            type: 'image',
            image: {
              data: imageData.imageData,
              name: imageData.imageName,
              size: imageData.imageSize
            }
          });
          
          const savedMessage = await newMessage.save();
          const populatedMessage = await Chat.findById(savedMessage._id)
            .populate('user', 'name email role');

          // Broadcast image message to all users in chat
          this.io.to('general-chat').emit('new-message', populatedMessage);
          
          console.log(`📷 Image saved and broadcasted: ${imageData.imageName}`);
        } catch (error) {
          console.error('Error saving image message:', error);
          socket.emit('message-error', { error: 'Failed to send image' });
        }
      }

      async handleModel3DMessage(socket, modelData) {
        try {
          console.log(`🎮 3D Model message from ${modelData.userName}, size: ${modelData.size} bytes`);
          
          // Save 3D model message to database
          const newMessage = new Chat({
            user: modelData.userId,
            message: `🎮 ${modelData.modelName}`,
            type: 'model3d',
            model3d: {
              url: modelData.modelUrl,
              name: modelData.modelName,
              size: modelData.modelSize
            }
          });
          
          const savedMessage = await newMessage.save();
          const populatedMessage = await Chat.findById(savedMessage._id)
            .populate('user', 'name email role');

          // Broadcast 3D model message to all users in chat
          this.io.to('general-chat').emit('new-message', populatedMessage);
          
          console.log(`🎮 3D Model saved and broadcasted: ${modelData.modelName}`);
        } catch (error) {
          console.error('Error saving 3D model message:', error);
          socket.emit('message-error', { error: 'Failed to send 3D model' });
        }
      }

  // Simple method to get online users count
  getOnlineUsersCount() {
    return this.io.engine.clientsCount;
  }
}

module.exports = SocketHandler;
