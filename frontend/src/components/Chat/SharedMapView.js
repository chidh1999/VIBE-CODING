import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline } from 'react-leaflet';
import L from 'leaflet';
import RoutePlanningControls from './RoutePlanningControls';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom icons for different users
const createUserIcon = (color, isCurrentUser = false) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="
      background-color: ${color};
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: bold;
      color: white;
      ${isCurrentUser ? 'animation: pulse 2s infinite;' : ''}
    ">${isCurrentUser ? '👤' : '📍'}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
};

const SharedMapView = ({ 
  isOpen, 
  onClose, 
  socket, 
  currentUser, 
  onlineUsers = [],
  onUserLocationUpdate 
}) => {
  const [mapCenter, setMapCenter] = useState(null);
  const [userLocations, setUserLocations] = useState({});
  const [isSharingLocation, setIsSharingLocation] = useState(false);
  const [currentUserLocation, setCurrentUserLocation] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const [isRoutePlanning, setIsRoutePlanning] = useState(false);
  const [routePoints, setRoutePoints] = useState([]);
  const [sharedRoutes, setSharedRoutes] = useState({});
  const [isVoiceChat, setIsVoiceChat] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioStream, setAudioStream] = useState(null);
  const mapRef = useRef(null);
  const moveTimeoutRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Get current user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const coords = [latitude, longitude];
          setCurrentUserLocation(coords);
          setMapCenter(coords);
        },
        (error) => {
          console.warn('Could not get user location:', error);
          // Fallback to a default location
          setMapCenter([21.0285, 105.8542]);
        }
      );
    }
  }, []);

  // Socket events for shared map
  useEffect(() => {
    if (socket && isOpen) {
      // Listen for location updates from other users
      socket.on('user-location-update', (data) => {
        setUserLocations(prev => ({
          ...prev,
          [data.userId]: {
            ...data,
            timestamp: Date.now()
          }
        }));
      });

      // Listen for map view updates
      socket.on('map-view-update', (data) => {
        if (data.userId !== currentUser.id && mapRef.current) {
          try {
            // Smoothly move to the new view
            const map = mapRef.current;
            if (map && map.setView) {
              map.setView([data.lat, data.lng], data.zoom, { animate: true });
            }
          } catch (error) {
            console.warn('Map view update error:', error);
          }
        }
      });

      // Listen for user location sharing status
      socket.on('user-location-sharing', (data) => {
        if (data.isSharing) {
          setUserLocations(prev => ({
            ...prev,
            [data.userId]: {
              userId: data.userId,
              name: data.name,
              lat: data.lat,
              lng: data.lng,
              timestamp: Date.now()
            }
          }));
        } else {
          setUserLocations(prev => {
            const newLocations = { ...prev };
            delete newLocations[data.userId];
            return newLocations;
          });
        }
      });

          // Listen for route updates from other users
          socket.on('route-update', (data) => {
            if (data.userId !== currentUser.id) {
              // If routePoints is empty, remove this user's route
              if (data.routePoints.length === 0) {
                setSharedRoutes(prev => {
                  const newRoutes = { ...prev };
                  delete newRoutes[data.userId];
                  return newRoutes;
                });
              } else {
                // Update or add route
                setSharedRoutes(prev => ({
                  ...prev,
                  [data.userId]: {
                    userName: data.userName,
                    routePoints: data.routePoints,
                    timestamp: data.timestamp
                  }
                }));
              }
            }
          });

          // Listen for voice chat events
          socket.on('voice-chat-join', (data) => {
            console.log('🎤 Received voice-chat-join:', data);
            if (data.userId !== currentUser.id) {
              console.log(`🎤 ${data.userName} joined voice chat`);
            }
          });

          socket.on('voice-chat-leave', (data) => {
            console.log('🎤 Received voice-chat-leave:', data);
            if (data.userId !== currentUser.id) {
              console.log(`🎤 ${data.userName} left voice chat`);
            }
          });

          socket.on('voice-message', (data) => {
            console.log('🎤 Received voice-message:', data);
            if (data.userId !== currentUser.id) {
              console.log(`🎤 Voice message from ${data.userName}, data length:`, data.audioData.length);
              playVoiceMessage(data.audioData);
            } else {
              console.log('🎤 Voice message from self - not playing to avoid feedback');
            }
          });

      return () => {
        socket.off('user-location-update');
        socket.off('map-view-update');
        socket.off('user-location-sharing');
        socket.off('route-update');
        socket.off('voice-chat-join');
        socket.off('voice-chat-leave');
        socket.off('voice-message');
        // Clear timeout on cleanup
        if (moveTimeoutRef.current) {
          clearTimeout(moveTimeoutRef.current);
        }
        // Cleanup voice chat
        if (audioStream) {
          audioStream.getTracks().forEach(track => track.stop());
        }
      };
    }
  }, [socket, isOpen, currentUser.id]);

  // Share current location
  const shareCurrentLocation = () => {
    if (currentUserLocation && socket) {
      const [lat, lng] = currentUserLocation;
      socket.emit('share-location', {
        userId: currentUser.id,
        name: currentUser.name,
        lat,
        lng
      });
      setIsSharingLocation(true);
    }
  };

  // Stop sharing location
  const stopSharingLocation = () => {
    if (socket) {
      socket.emit('stop-sharing-location', {
        userId: currentUser.id
      });
      setIsSharingLocation(false);
    }
  };

  // Handle map movement with debounce
  const handleMapMove = (lat, lng, zoom) => {
    // Clear existing timeout
    if (moveTimeoutRef.current) {
      clearTimeout(moveTimeoutRef.current);
    }
    
    // Set new timeout to debounce the movement
    moveTimeoutRef.current = setTimeout(() => {
      if (socket) {
        socket.emit('map-view-change', {
          userId: currentUser.id,
          lat,
          lng,
          zoom
        });
      }
    }, 500); // Wait 500ms before sending
  };

  // Route planning handlers
  const handleRouteUpdate = (newRoutePoints) => {
    setRoutePoints(newRoutePoints);
    
    // Share route update with other users
    if (socket) {
      socket.emit('route-update', {
        userId: currentUser.id,
        userName: currentUser.name,
        routePoints: newRoutePoints,
        timestamp: Date.now()
      });
    }
  };

  const handleClearRoute = () => {
    setRoutePoints([]);
    setSharedRoutes({}); // Clear shared routes too
    
    // Share route clear with other users
    if (socket) {
      socket.emit('route-update', {
        userId: currentUser.id,
        userName: currentUser.name,
        routePoints: [],
        timestamp: Date.now()
      });
    }
  };

  const handleSaveRoute = () => {
    if (routePoints.length >= 2) {
      // Here you can save the route to backend or localStorage
      console.log('Saving route:', routePoints);
      alert(`Đã lưu đường đi với ${routePoints.length} điểm!`);
    }
  };

  const handleToggleRoutePlanning = () => {
    const newRoutePlanningState = !isRoutePlanning;
    setIsRoutePlanning(newRoutePlanningState);
    
    // If stopping route planning, clear all routes and notify others
    if (isRoutePlanning) {
      setRoutePoints([]);
      setSharedRoutes({}); // Clear shared routes too
      
      // Notify other users that we're clearing our route
      if (socket) {
        socket.emit('route-update', {
          userId: currentUser.id,
          userName: currentUser.name,
          routePoints: [], // Empty array to clear route
          timestamp: Date.now()
        });
      }
    }
  };

  // Voice chat functions
  const startVoiceChat = async () => {
    try {
      console.log('🎤 Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true,
        video: false 
      });
      console.log('🎤 Microphone access granted:', stream);
      setAudioStream(stream);
      setIsVoiceChat(true);
      
      // Notify other users that we're in voice chat
      if (socket) {
        console.log('🎤 Emitting voice-chat-join');
        socket.emit('voice-chat-join', {
          userId: currentUser.id,
          userName: currentUser.name
        });
      }
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Không thể truy cập microphone. Vui lòng kiểm tra quyền truy cập.');
    }
  };

  const stopVoiceChat = () => {
    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop());
      setAudioStream(null);
    }
    setIsVoiceChat(false);
    setIsRecording(false);
    
    // Notify other users that we're leaving voice chat
    if (socket) {
      socket.emit('voice-chat-leave', {
        userId: currentUser.id,
        userName: currentUser.name
      });
    }
  };

  const startRecording = () => {
    if (!audioStream) {
      console.log('🎤 No audio stream available');
      return;
    }
    
    try {
      console.log('🎤 Starting recording...');
      const mediaRecorder = new MediaRecorder(audioStream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        console.log('🎤 Data available:', event.data.size, 'bytes');
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        console.log('🎤 Recording stopped, chunks:', audioChunksRef.current.length);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        console.log('🎤 Audio blob size:', audioBlob.size, 'bytes');
        
        // Send voice message without local playback
        console.log('🎤 Sending voice message...');
        sendVoiceMessage(audioBlob);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      console.log('🎤 Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendVoiceMessage = (audioBlob) => {
    console.log('🎤 Sending voice message, blob size:', audioBlob.size);
    const reader = new FileReader();
    reader.onload = () => {
      const audioData = reader.result;
      console.log('🎤 Audio data length:', audioData.length);
      
      // Send voice message via socket
      if (socket) {
        console.log('🎤 Emitting voice-message');
        socket.emit('voice-message', {
          userId: currentUser.id,
          userName: currentUser.name,
          audioData: audioData,
          timestamp: Date.now()
        });
      }
    };
    reader.readAsDataURL(audioBlob);
  };

  const playVoiceMessage = (audioData) => {
    console.log('🎤 Playing voice message, data length:', audioData.length);
    
    try {
      // Create blob from data URL
      const byteCharacters = atob(audioData.split(',')[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'audio/webm' });
      
      // Create object URL
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      
      // Set volume to max
      audio.volume = 1.0;
      
      audio.onloadstart = () => console.log('🎤 Audio loading started');
      audio.oncanplay = () => console.log('🎤 Audio can play');
      audio.onplay = () => console.log('🎤 Audio playing');
      audio.onended = () => {
        console.log('🎤 Audio ended');
        URL.revokeObjectURL(audioUrl); // Clean up
      };
      audio.onerror = (e) => console.error('🎤 Audio error:', e);
      
      audio.play().then(() => {
        console.log('🎤 Audio play started successfully');
      }).catch(error => {
        console.error('Error playing voice message:', error);
      });
      
    } catch (error) {
      console.error('🎤 Error processing audio data:', error);
    }
  };

  // Map event handler
  const MapEventHandler = () => {
    useMapEvents({
      click: (e) => {
        try {
          if (isRoutePlanning) {
            const { lat, lng } = e.latlng;
            const newPoint = { lat, lng, id: Date.now() };
            const updatedPoints = [...routePoints, newPoint];
            setRoutePoints(updatedPoints);
            
            // Immediately call handleRouteUpdate
            handleRouteUpdate(updatedPoints);
          }
        } catch (error) {
          console.warn('Map click error:', error);
        }
      },
      moveend: (e) => {
        try {
          const center = e.target.getCenter();
          const zoom = e.target.getZoom();
          handleMapMove(center.lat, center.lng, zoom);
        } catch (error) {
          console.warn('Map move error:', error);
        }
      }
    });
    return null;
  };

  // Add a delay to ensure DOM is ready and prevent classList errors
  useEffect(() => {
    if (isOpen && mapCenter) {
      // Reset mapReady first
      setMapReady(false);
      
      // Wait longer for DOM to be fully ready
      const timer = setTimeout(() => {
        setMapReady(true);
      }, 500); // Increased delay
      
      return () => clearTimeout(timer);
    } else {
      setMapReady(false);
    }
  }, [isOpen, mapCenter]);

  // Reset route planning when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsRoutePlanning(false);
      setRoutePoints([]);
    }
  }, [isOpen]);

  if (!isOpen || !mapCenter) {
    return null;
  }

  return (
    <div className="shared-map-overlay" onClick={onClose}>
      <div className="shared-map-container" onClick={(e) => e.stopPropagation()}>
            <div className="shared-map-header">
              <h3>🗺️ Bản đồ chung</h3>
              <div className="shared-map-controls">
                <button 
                  onClick={isSharingLocation ? stopSharingLocation : shareCurrentLocation}
                  className={`location-share-button ${isSharingLocation ? 'sharing' : ''}`}
                >
                  {isSharingLocation ? '🛑 Dừng chia sẻ' : '📍 Chia sẻ vị trí'}
                </button>
                
                {/* Voice Chat Controls */}
                {!isVoiceChat ? (
                  <button 
                    onClick={startVoiceChat}
                    className="voice-button"
                    style={{
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      marginRight: '8px'
                    }}
                  >
                    🎤 Bật Voice Chat
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: '8px', marginRight: '8px' }}>
                    <button 
                      onMouseDown={startRecording}
                      onMouseUp={stopRecording}
                      onMouseLeave={stopRecording}
                      className={`voice-record-button ${isRecording ? 'recording' : ''}`}
                      style={{
                        background: isRecording ? '#ef4444' : '#3b82f6',
                        color: 'white',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        animation: isRecording ? 'pulse 1s infinite' : 'none'
                      }}
                    >
                      {isRecording ? '🔴 Đang ghi âm...' : '🎤 Nhấn giữ để nói'}
                    </button>
                    <button 
                      onClick={stopVoiceChat}
                      className="voice-stop-button"
                      style={{
                        background: '#6b7280',
                        color: 'white',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      🛑 Tắt Voice
                    </button>
                  </div>
                )}
                
                <button className="close-button" onClick={onClose}>✕</button>
              </div>
            </div>

        <div className="shared-map-body">
          {mapReady ? (
            <div 
              style={{ 
                height: '500px', 
                width: '100%', 
                position: 'relative',
                cursor: 'crosshair' // Show crosshair for route planning
              }}
            >
              <MapContainer
                key={`map-${mapCenter[0]}-${mapCenter[1]}-${Date.now()}`}
                center={mapCenter}
                zoom={13}
                style={{ 
                  height: '100%', 
                  width: '100%',
                  cursor: isRoutePlanning ? 'crosshair' : 'grab'
                }}
                scrollWheelZoom={true}
                ref={mapRef}
                whenReady={() => {
                  console.log('🗺️ Map is ready');
                  // Ensure map is fully initialized
                  setTimeout(() => {
                    if (mapRef.current) {
                      mapRef.current.invalidateSize();
                    }
                  }, 100);
                }}
                zoomControl={true}
                attributionControl={true}
                dragging={true}
                touchZoom={true}
                doubleClickZoom={true}
                zoomAnimation={true}
                fadeAnimation={true}
                markerZoomAnimation={true}
              >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Current user location */}
            {currentUserLocation && (
              <Marker 
                position={currentUserLocation}
                icon={createUserIcon('#3b82f6', true)}
              >
                <Popup>
                  <div>
                    <strong>👤 {currentUser.name} (Bạn)</strong>
                    <br />
                    <small>Lat: {currentUserLocation[0].toFixed(6)}, Lng: {currentUserLocation[1].toFixed(6)}</small>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Other users locations */}
            {Object.values(userLocations).map((userData) => (
              <Marker 
                key={userData.userId}
                position={[userData.lat, userData.lng]}
                icon={createUserIcon('#10b981', false)}
              >
                <Popup>
                  <div>
                    <strong>👥 {userData.name}</strong>
                    <br />
                    <small>Lat: {userData.lat.toFixed(6)}, Lng: {userData.lng.toFixed(6)}</small>
                    <br />
                    <small style={{ color: '#6b7280' }}>
                      Cập nhật: {new Date(userData.timestamp).toLocaleTimeString()}
                    </small>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Route points markers */}
            {isRoutePlanning && routePoints.map((point, index) => (
              <Marker 
                key={point.id} 
                position={[point.lat, point.lng]}
                icon={L.divIcon({
                  className: 'custom-div-icon',
                  html: `<div style="
                    background-color: #ef4444;
                    width: 25px;
                    height: 25px;
                    border-radius: 50%;
                    border: 3px solid white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: bold;
                    color: white;
                  ">${index + 1}</div>`,
                  iconSize: [25, 25],
                  iconAnchor: [12, 12]
                })}
              >
                <Popup>
                  <div>
                    <strong>📍 Điểm {index + 1}</strong>
                    <br />
                    <small>Lat: {point.lat.toFixed(6)}, Lng: {point.lng.toFixed(6)}</small>
                    <br />
                    <button 
                      onClick={() => {
                        const updatedPoints = routePoints.filter(p => p.id !== point.id);
                        setRoutePoints(updatedPoints);
                      }}
                      style={{
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        marginTop: '4px'
                      }}
                    >
                      Xóa điểm
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Route line */}
            {isRoutePlanning && routePoints.length > 1 && (
              <Polyline
                positions={routePoints.map(point => [point.lat, point.lng])}
                color="#3b82f6"
                weight={4}
                opacity={0.8}
              />
            )}

            {/* Shared routes from other users */}
            {Object.values(sharedRoutes).map((sharedRoute, index) => (
              <React.Fragment key={`shared-route-${index}`}>
                {/* Shared route markers */}
                {sharedRoute.routePoints.map((point, pointIndex) => (
                  <Marker 
                    key={`shared-${point.id}`} 
                    position={[point.lat, point.lng]}
                    icon={L.divIcon({
                      className: 'custom-div-icon',
                      html: `<div style="
                        background-color: #10b981;
                        width: 20px;
                        height: 20px;
                        border-radius: 50%;
                        border: 2px solid white;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 10px;
                        font-weight: bold;
                        color: white;
                      ">${pointIndex + 1}</div>`,
                      iconSize: [20, 20],
                      iconAnchor: [10, 10]
                    })}
                  >
                    <Popup>
                      <div>
                        <strong>🛣️ Đường đi của {sharedRoute.userName}</strong>
                        <br />
                        <small>Điểm {pointIndex + 1}</small>
                        <br />
                        <small>Lat: {point.lat.toFixed(6)}, Lng: {point.lng.toFixed(6)}</small>
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {/* Shared route line */}
                {sharedRoute.routePoints.length > 1 && (
                  <Polyline
                    positions={sharedRoute.routePoints.map(point => [point.lat, point.lng])}
                    color="#10b981"
                    weight={3}
                    opacity={0.6}
                    dashArray="5, 5"
                  />
                )}
              </React.Fragment>
            ))}

            <MapEventHandler />
              </MapContainer>
            </div>
          ) : (
            <div style={{ height: '500px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>
              <div style={{ textAlign: 'center', color: '#6b7280' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🗺️</div>
                <div>Đang khởi tạo bản đồ...</div>
              </div>
            </div>
          )}

          {/* Route Planning Controls */}
          <RoutePlanningControls
            routePoints={routePoints}
            onClearRoute={handleClearRoute}
            onSaveRoute={handleSaveRoute}
            onToggleRoutePlanning={handleToggleRoutePlanning}
            isRoutePlanning={isRoutePlanning}
          />


          {/* Online users list */}
          <div className="online-users-panel">
            <h4>👥 Người dùng trực tuyến ({onlineUsers.length})</h4>
            <div className="users-list">
              {onlineUsers.map((user) => (
                <div key={user.userId} className="user-item">
                  <div className="user-info">
                    <span className="user-name">{user.name}</span>
                    <span className="user-role">{user.role}</span>
                  </div>
                  <div className="user-status">
                    {userLocations[user.userId] ? (
                      <span className="status-sharing">📍 Đang chia sẻ vị trí</span>
                    ) : (
                      <span className="status-online">🟢 Trực tuyến</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedMapView;
