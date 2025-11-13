import React, { useState } from 'react';
import MapComponent from './MapComponent';

const LocationMessage = ({ location, sender, timestamp, isOwn }) => {
  const [showFullMap, setShowFullMap] = useState(false);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`message ${isOwn ? 'own' : 'other'}`}>
      <div className="message-header">
        <span className="sender-name">{sender}</span>
        <span className="message-time">{formatTime(timestamp)}</span>
      </div>
      
      <div className="location-message">
        <div className="location-info">
          <span className="location-icon">📍</span>
          <span className="location-text">Đã chia sẻ vị trí</span>
        </div>
        
        <div className="location-coordinates">
          <small>
            Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
          </small>
        </div>

        {/* Mini map preview */}
        <div className="location-preview" onClick={() => setShowFullMap(true)}>
          <MapComponent
            center={[location.lat, location.lng]}
            zoom={15}
            height="150px"
            isSelectable={false}
          />
          <div className="location-overlay">
            <span className="view-full-text">👆 Nhấn để xem toàn màn hình</span>
          </div>
        </div>

        {/* Full screen map modal */}
        {showFullMap && (
          <div className="map-modal-overlay" onClick={() => setShowFullMap(false)}>
            <div className="map-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="map-modal-header">
                <h3>📍 Vị trí được chia sẻ</h3>
                <button 
                  className="close-button"
                  onClick={() => setShowFullMap(false)}
                >
                  ✕
                </button>
              </div>
              <div className="map-modal-body">
                <MapComponent
                  center={[location.lat, location.lng]}
                  zoom={15}
                  height="400px"
                  isSelectable={false}
                />
                <div className="location-details">
                  <p><strong>Tọa độ:</strong> {location.lat.toFixed(6)}, {location.lng.toFixed(6)}</p>
                  {location.address && (
                    <p><strong>Địa chỉ:</strong> {location.address}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationMessage;
