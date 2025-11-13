import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { io } from 'socket.io-client';
import { chatService } from '../../services';
import MapComponent from './MapComponent';
import LocationMessage from './LocationMessage';
import SharedMapView from './SharedMapView';
import Model3DViewer from './Model3DViewer';
import './Chat.css';

const Chat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showSharedMap, setShowSharedMap] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showModel3D, setShowModel3D] = useState(false);
  const [selectedModel3D, setSelectedModel3D] = useState(null);
  const [showModel3DUpload, setShowModel3DUpload] = useState(false);
  const [selectedModel3DFile, setSelectedModel3DFile] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Load messages from API
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:1111'}/api/chat`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setMessages(data.data || []);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    if (user) {
      loadMessages();
    }
  }, [user]);

  // Initialize socket connection
  useEffect(() => {
    if (user) {
      const newSocket = io('http://localhost:1111');
      setSocket(newSocket);

      // Join chat room
      newSocket.emit('join-chat', {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role?.name
      });

      // Connection events
      newSocket.on('connect', () => {
        console.log('🔌 Connected to chat server');
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('🔌 Disconnected from chat server');
        setIsConnected(false);
      });

      // Message events
      newSocket.on('new-message', (message) => {
        console.log('📨 Received new message:', message.type, message.message);
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      });

      // Image messages are now handled by 'new-message' event

      newSocket.on('user-joined', (data) => {
        setMessages(prev => [...prev, {
          _id: Date.now(),
          message: data.message,
          type: 'system',
          createdAt: data.timestamp,
          user: { name: 'System' }
        }]);
        scrollToBottom();
      });

      newSocket.on('user-left', (data) => {
        setMessages(prev => [...prev, {
          _id: Date.now(),
          message: data.message,
          type: 'system',
          createdAt: data.timestamp,
          user: { name: 'System' }
        }]);
        scrollToBottom();
      });

      // Typing events
      newSocket.on('user-typing', (data) => {
        if (data.user.userId !== user.id) {
          if (data.isTyping) {
            setTypingUsers(prev => {
              if (!prev.find(u => u.userId === data.user.userId)) {
                return [...prev, data.user];
              }
              return prev;
            });
          } else {
            setTypingUsers(prev => prev.filter(u => u.userId !== data.user.userId));
          }
        }
      });

      // Load recent messages
      fetchRecentMessages();

      // Listen for online users updates
      newSocket.on('online-users-update', (users) => {
        setOnlineUsers(users);
      });

      return () => {
        newSocket.close();
      };
    }
  }, [user]);

  // Fetch recent messages
  const fetchRecentMessages = async () => {
    try {
      const data = await chatService.getAllMessages(50);
      if (data.success) {
        setMessages(data.data);
        scrollToBottom();
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Send message
  const sendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && socket) {
      socket.emit('send-message', {
        userId: user.id,
        userName: user.name,
        message: newMessage.trim()
      });
      setNewMessage('');
      stopTyping();
    }
  };

  // Send location message
  const sendLocationMessage = () => {
    if (selectedLocation && socket) {
      socket.emit('send-location', {
        userId: user.id,
        userName: user.name,
        location: selectedLocation
      });
      setSelectedLocation(null);
      setShowLocationPicker(false);
    }
  };

  // Handle location selection
  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
  };

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setSelectedLocation({
            lat: latitude,
            lng: longitude,
            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          });
          setShowLocationPicker(true);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Không thể lấy vị trí hiện tại. Vui lòng thử lại.');
        }
      );
    } else {
      alert('Trình duyệt không hỗ trợ định vị.');
    }
  };

  // Image upload functions
  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file hình ảnh');
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước file quá lớn (tối đa 5MB)');
        return;
      }
      
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const sendImageMessage = async () => {
    if (!selectedImage) return;
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('userId', user.id);
      formData.append('userName', user.name);
      
      // Upload image to server
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:1111'}/api/images/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Don't add message locally - it will come via Socket.IO
        console.log('📷 Image uploaded successfully');
        
        // Clear selection
        setSelectedImage(null);
        setImagePreview(null);
        setShowImageUpload(false);
      } else {
        const error = await response.json();
        alert(`Upload failed: ${error.message}`);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    }
  };

  const cancelImageUpload = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setShowImageUpload(false);
  };

  const handleModel3DSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file extension (.gltf or .glb)
      const ext = file.name.toLowerCase().split('.').pop();
      if (ext !== 'gltf' && ext !== 'glb') {
        alert('Vui lòng chọn file 3D model (.gltf hoặc .glb)');
        return;
      }
      
      // Check file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        alert('Kích thước file quá lớn (tối đa 50MB)');
        return;
      }
      
      setSelectedModel3DFile(file);
    }
  };

  const sendModel3DMessage = async () => {
    if (!selectedModel3DFile) return;
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('model3d', selectedModel3DFile);
      formData.append('userId', user.id);
      formData.append('userName', user.name);
      
      // Upload 3D model to server
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:1111'}/api/model3d/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      if (response.ok) {
        console.log('🎮 3D Model uploaded successfully');
        
        // Clear selection
        setSelectedModel3DFile(null);
        setShowModel3DUpload(false);
      } else {
        const error = await response.json();
        alert(`Upload failed: ${error.message}`);
      }
    } catch (error) {
      console.error('Error uploading 3D model:', error);
      alert('Failed to upload 3D model');
    }
  };

  const cancelModel3DUpload = () => {
    setSelectedModel3DFile(null);
    setShowModel3DUpload(false);
  };

  // Handle typing
  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (socket) {
      socket.emit('typing', {
        userId: user.id,
        name: user.name
      });

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout to stop typing
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping();
      }, 1000);
    }
  };

  const stopTyping = () => {
    if (socket) {
      socket.emit('stop-typing', {
        userId: user.id,
        name: user.name
      });
    }
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Format time
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>💬 General Chat</h3>
        <div className="connection-status">
          <span className={`status-dot ${isConnected ? 'online' : 'offline'}`}></span>
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((message) => {
          if (message.type === 'location') {
            return (
              <LocationMessage
                key={message._id}
                location={message.location}
                sender={message.user.name}
                timestamp={message.createdAt}
                isOwn={message.user._id === user.id}
              />
            );
          }
          
          if (message.type === 'image') {
            return (
              <div 
                key={message._id} 
                className={`message ${message.user._id === user.id ? 'own-message' : ''}`}
              >
                <div className="message-header">
                  <span className="sender-name">{message.user.name}</span>
                  <span className="message-time">{formatTime(message.createdAt)}</span>
                </div>
                <div className="message-content image-message">
                  <div className="image-container">
                    <img 
                      src={`${process.env.REACT_APP_API_URL || 'http://localhost:1111'}${message.image.url}`} 
                      alt={message.image.name}
                      className="chat-image"
                    />
                    <div className="image-info">
                      <div className="image-name">{message.image.name}</div>
                      <div className="image-size">{(message.image.size / 1024 / 1024).toFixed(2)} MB</div>
                    </div>
                  </div>
                </div>
                {message.user.role && (
                  <div className="message-role">
                    {message.user.role.name}
                  </div>
                )}
              </div>
            );
          }
          
          if (message.type === 'model3d') {
            return (
              <div 
                key={message._id} 
                className={`message ${message.user._id === user.id ? 'own-message' : ''}`}
              >
                <div className="message-header">
                  <span className="sender-name">{message.user.name}</span>
                  <span className="message-time">{formatTime(message.createdAt)}</span>
                </div>
                <div className="message-content model3d-message">
                  <div className="model3d-container">
                    <div className="model3d-preview">
                      <div className="model3d-icon">🎮</div>
                      <div className="model3d-info">
                        <div className="model3d-name">{message.model3d.name}</div>
                        <div className="model3d-size">{(message.model3d.size / 1024 / 1024).toFixed(2)} MB</div>
                      </div>
                    </div>
                    <button 
                      className="view-3d-button"
                      onClick={() => {
                        setSelectedModel3D({
                          url: `${process.env.REACT_APP_API_URL || 'http://localhost:1111'}${message.model3d.url}`,
                          name: message.model3d.name
                        });
                        setShowModel3D(true);
                      }}
                    >
                      🎮 View 3D Model
                    </button>
                  </div>
                </div>
                {message.user.role && (
                  <div className="message-role">
                    {message.user.role.name}
                  </div>
                )}
              </div>
            );
          }
          
          return (
            <div 
              key={message._id} 
              className={`message ${message.user._id === user.id ? 'own-message' : ''} ${message.type === 'system' ? 'system-message' : ''}`}
            >
              {message.type !== 'system' && (
                <div className="message-header">
                  <span className="sender-name">{message.user.name}</span>
                  <span className="message-time">{formatTime(message.createdAt)}</span>
                </div>
              )}
              <div className="message-content">
                {message.message}
              </div>
              {message.type !== 'system' && message.user.role && (
                <div className="message-role">
                  {message.user.role.name}
                </div>
              )}
            </div>
          );
        })}
        
        {typingUsers.length > 0 && (
          <div className="typing-indicator">
            {typingUsers.map(user => user.name).join(', ')} 
            {typingUsers.length === 1 ? ' is' : ' are'} typing...
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="chat-input">
        <input
          type="text"
          value={newMessage}
          onChange={handleTyping}
          placeholder="Type a message..."
          disabled={!isConnected}
        />
        <button 
          type="button"
          onClick={getCurrentLocation}
          disabled={!isConnected}
          className="location-button"
          title="Chia sẻ vị trí hiện tại"
        >
          📍
        </button>
        <button 
          type="button"
          onClick={() => setShowSharedMap(true)}
          disabled={!isConnected}
          className="location-button"
          title="Xem bản đồ chung"
          style={{ background: '#8b5cf6' }}
        >
          🗺️
        </button>
        <button 
          type="button"
          onClick={() => setShowImageUpload(true)}
          disabled={!isConnected}
          className="location-button"
          title="Gửi hình ảnh"
          style={{ background: '#10b981' }}
        >
          📷
        </button>
        <button 
          type="button"
          onClick={() => setShowModel3DUpload(true)}
          disabled={!isConnected}
          className="location-button"
          title="Gửi 3D model"
          style={{ background: '#8b5cf6' }}
        >
          🎮
        </button>
        <button 
          type="submit" 
          disabled={!isConnected || !newMessage.trim()}
          className="send-button"
        >
          Send
        </button>
      </form>

      {/* Location Picker Modal */}
      {showLocationPicker && (
        <div className="map-modal-overlay" onClick={() => setShowLocationPicker(false)}>
          <div className="map-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="map-modal-header">
              <h3>📍 Chọn vị trí để chia sẻ</h3>
              <button 
                className="close-button"
                onClick={() => setShowLocationPicker(false)}
              >
                ✕
              </button>
            </div>
            <div className="map-modal-body">
              <MapComponent
                center={selectedLocation ? [selectedLocation.lat, selectedLocation.lng] : [21.0285, 105.8542]}
                zoom={15}
                height="400px"
                isSelectable={true}
                onLocationSelect={handleLocationSelect}
                selectedLocation={selectedLocation ? [selectedLocation.lat, selectedLocation.lng] : null}
              />
              {selectedLocation && (
                <div className="location-details">
                  <p><strong>Tọa độ:</strong> {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}</p>
                  <p><strong>Địa chỉ:</strong> {selectedLocation.address}</p>
                  <button 
                    onClick={sendLocationMessage}
                    className="send-button"
                    style={{ marginTop: '1rem' }}
                  >
                    Gửi vị trí này
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Shared Map View */}
      {showSharedMap && (
        <SharedMapView
          isOpen={showSharedMap}
          onClose={() => setShowSharedMap(false)}
          socket={socket}
          currentUser={user}
          onlineUsers={onlineUsers}
        />
      )}

      {/* 3D Model Viewer */}
      {showModel3D && selectedModel3D && (
        <Model3DViewer
          modelUrl={selectedModel3D.url}
          modelName={selectedModel3D.name}
          onClose={() => {
            setShowModel3D(false);
            setSelectedModel3D(null);
          }}
        />
      )}

      {/* Image Upload Modal */}
      {showImageUpload && (
        <div className="image-upload-overlay" onClick={cancelImageUpload}>
          <div className="image-upload-content" onClick={(e) => e.stopPropagation()}>
            <div className="image-upload-header">
              <h3>📷 Gửi hình ảnh</h3>
              <button className="close-button" onClick={cancelImageUpload}>✕</button>
            </div>
            
            <div className="image-upload-body">
              {!selectedImage ? (
                <div className="image-upload-area">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    style={{ display: 'none' }}
                    id="image-upload-input"
                  />
                  <label htmlFor="image-upload-input" className="image-upload-button">
                    <div className="upload-icon">📷</div>
                    <div className="upload-text">Chọn hình ảnh</div>
                    <div className="upload-hint">Tối đa 5MB</div>
                  </label>
                </div>
              ) : (
                <div className="image-preview-container">
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" />
                  </div>
                  <div className="image-info">
                    <div className="image-name">{selectedImage.name}</div>
                    <div className="image-size">{(selectedImage.size / 1024 / 1024).toFixed(2)} MB</div>
                  </div>
                  <div className="image-actions">
                    <button onClick={cancelImageUpload} className="cancel-button">
                      Hủy
                    </button>
                    <button onClick={sendImageMessage} className="send-button">
                      Gửi hình ảnh
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3D Model Upload Modal */}
      {showModel3DUpload && (
        <div className="image-upload-overlay" onClick={cancelModel3DUpload}>
          <div className="image-upload-content" onClick={(e) => e.stopPropagation()}>
            <div className="image-upload-header">
              <h3>🎮 Gửi 3D model</h3>
              <button className="close-button" onClick={cancelModel3DUpload}>✕</button>
            </div>
            
            <div className="image-upload-body">
              {!selectedModel3DFile ? (
                <div className="image-upload-area">
                  <input
                    type="file"
                    accept=".gltf,.glb"
                    onChange={handleModel3DSelect}
                    style={{ display: 'none' }}
                    id="model3d-upload-input"
                  />
                  <label htmlFor="model3d-upload-input" className="image-upload-button">
                    <div className="upload-icon">🎮</div>
                    <div className="upload-text">Chọn file 3D model</div>
                    <div className="upload-hint">(.gltf hoặc .glb, tối đa 50MB)</div>
                  </label>
                </div>
              ) : (
                <div className="image-preview-container">
                  <div className="image-preview">
                    <div className="model3d-preview-icon">🎮</div>
                    <div className="preview-info">
                      <div className="preview-name">{selectedModel3DFile.name}</div>
                      <div className="preview-size">{(selectedModel3DFile.size / 1024 / 1024).toFixed(2)} MB</div>
                    </div>
                  </div>
                  
                  <div className="image-upload-actions">
                    <button className="btn btn-secondary" onClick={cancelModel3DUpload}>
                      Cancel
                    </button>
                    <button className="btn btn-primary" onClick={sendModel3DMessage}>
                      Gửi
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
