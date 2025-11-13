import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const MapComponent = ({ 
  center = null, // No default center
  zoom = 13,
  onLocationSelect,
  selectedLocation,
  height = '300px',
  isSelectable = false,
  showRoutePlanning = false,
  onRouteUpdate
}) => {
  const [position, setPosition] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const [routePoints, setRoutePoints] = useState([]);
  const [routeLine, setRouteLine] = useState(null);

  // Get user's current location and set map center
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const coords = [latitude, longitude];
          setUserLocation(coords);
          setMapCenter(coords);
          setPosition(coords);
        },
        (error) => {
          console.warn('Could not get user location:', error);
          // Fallback to provided center or default location
          const fallbackCenter = center || [21.0285, 105.8542]; // Hanoi as fallback
          setMapCenter(fallbackCenter);
          setPosition(fallbackCenter);
        }
      );
    } else {
      // No geolocation support, use provided center or default
      const fallbackCenter = center || [21.0285, 105.8542];
      setMapCenter(fallbackCenter);
      setPosition(fallbackCenter);
    }
  }, [center]);

  // Map click handler for location selection and route planning
  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        if (isSelectable) {
          const { lat, lng } = e.latlng;
          setPosition([lat, lng]);
          if (onLocationSelect) {
            onLocationSelect({ lat, lng, address: `${lat.toFixed(6)}, ${lng.toFixed(6)}` });
          }
        }
        
        if (showRoutePlanning) {
          const { lat, lng } = e.latlng;
          const newPoint = { lat, lng, id: Date.now() };
          setRoutePoints(prev => [...prev, newPoint]);
          
          if (onRouteUpdate) {
            onRouteUpdate([...routePoints, newPoint]);
          }
        }
      },
    });
    return null;
  };

  // Don't render map until we have a center
  if (!mapCenter) {
    return (
      <div style={{ height, width: '100%', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>
        <div style={{ textAlign: 'center', color: '#6b7280' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🗺️</div>
          <div>Đang tải bản đồ...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height, width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
      <MapContainer
        center={selectedLocation || mapCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User's current location marker */}
        {userLocation && (
          <Marker position={userLocation}>
            <Popup>
              <div>
                <strong>📍 Vị trí của bạn</strong>
                <br />
                <small>Lat: {userLocation[0].toFixed(6)}, Lng: {userLocation[1].toFixed(6)}</small>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Selected location marker */}
        {selectedLocation && (
          <Marker position={selectedLocation}>
            <Popup>
              <div>
                <strong>🎯 Vị trí đã chọn</strong>
                <br />
                <small>Lat: {selectedLocation[0].toFixed(6)}, Lng: {selectedLocation[1].toFixed(6)}</small>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route points markers */}
        {showRoutePlanning && routePoints.map((point, index) => (
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
                    setRoutePoints(prev => prev.filter(p => p.id !== point.id));
                    if (onRouteUpdate) {
                      onRouteUpdate(routePoints.filter(p => p.id !== point.id));
                    }
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
        {showRoutePlanning && routePoints.length > 1 && (
          <Polyline
            positions={routePoints.map(point => [point.lat, point.lng])}
            color="#3b82f6"
            weight={4}
            opacity={0.8}
          />
        )}

        {/* Click handler for location selection and route planning */}
        {(isSelectable || showRoutePlanning) && <MapClickHandler />}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
