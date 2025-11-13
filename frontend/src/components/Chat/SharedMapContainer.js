import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';

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

const SharedMapContainer = ({
  mapCenter,
  currentUser,
  currentUserLocation,
  userLocations,
  isRoutePlanning,
  routePoints,
  onRouteUpdate,
  mapRef,
  onMapMove
}) => {
  // Map event handler for route planning
  const MapEventHandler = () => {
    const { useMapEvents } = require('react-leaflet');
    
    useMapEvents({
      click: (e) => {
        if (isRoutePlanning) {
          const { lat, lng } = e.latlng;
          const newPoint = { lat, lng, id: Date.now() };
          const updatedPoints = [...routePoints, newPoint];
          onRouteUpdate(updatedPoints);
        }
      },
      moveend: (e) => {
        if (onMapMove) {
          const center = e.target.getCenter();
          const zoom = e.target.getZoom();
          onMapMove(center.lat, center.lng, zoom);
        }
      }
    });
    return null;
  };

  return (
    <MapContainer
      center={mapCenter}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
      ref={mapRef}
      zoomControl={true}
      attributionControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Current user location marker */}
      {currentUserLocation && (
        <Marker position={currentUserLocation}>
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
                  onRouteUpdate(updatedPoints);
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

      <MapEventHandler />
    </MapContainer>
  );
};

export default SharedMapContainer;
