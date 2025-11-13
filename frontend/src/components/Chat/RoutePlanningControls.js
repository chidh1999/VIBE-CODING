import React from 'react';

const RoutePlanningControls = ({ 
  routePoints, 
  onClearRoute, 
  onSaveRoute, 
  onToggleRoutePlanning,
  isRoutePlanning 
}) => {
  const calculateDistance = () => {
    if (routePoints.length < 2) return 0;
    
    let totalDistance = 0;
    for (let i = 0; i < routePoints.length - 1; i++) {
      const point1 = routePoints[i];
      const point2 = routePoints[i + 1];
      
      // Haversine formula for distance calculation
      const R = 6371; // Earth's radius in kilometers
      const dLat = (point2.lat - point1.lat) * Math.PI / 180;
      const dLng = (point2.lng - point1.lng) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      
      totalDistance += distance;
    }
    
    return totalDistance;
  };

  const formatDistance = (km) => {
    if (km < 1) {
      return `${(km * 1000).toFixed(0)}m`;
    }
    return `${km.toFixed(2)}km`;
  };

  return (
    <div className="route-planning-controls">
      <div className="route-controls-header">
        <h4>🛣️ Lập kế hoạch đường đi</h4>
        <div className="route-stats">
          <span className="route-points">📍 {routePoints.length} điểm</span>
          {routePoints.length > 1 && (
            <span className="route-distance">
              📏 {formatDistance(calculateDistance())}
            </span>
          )}
        </div>
      </div>

      <div className="route-controls-buttons">
        <button 
          onClick={onToggleRoutePlanning}
          className={`route-button ${isRoutePlanning ? 'active' : ''}`}
        >
          {isRoutePlanning ? '🛑 Dừng vẽ' : '✏️ Vẽ đường đi'}
        </button>
        
        {routePoints.length > 0 && (
          <>
            <button 
              onClick={onClearRoute}
              className="route-button clear"
            >
              🗑️ Xóa tất cả
            </button>
            
            <button 
              onClick={onSaveRoute}
              className="route-button save"
              disabled={routePoints.length < 2}
            >
              💾 Lưu đường đi
            </button>
          </>
        )}
      </div>

      {routePoints.length > 0 && (
        <div className="route-points-list">
          <h5>📍 Danh sách điểm:</h5>
          <div className="points-list">
            {routePoints.map((point, index) => (
              <div key={point.id} className="route-point-item">
                <span className="point-number">{index + 1}</span>
                <span className="point-coords">
                  {point.lat.toFixed(6)}, {point.lng.toFixed(6)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {isRoutePlanning && (
        <div className="route-instructions">
          <p>💡 <strong>Hướng dẫn:</strong></p>
          <ul>
            <li>Click trên bản đồ để thêm điểm</li>
            <li>Click vào marker để xóa điểm</li>
            <li>Đường đi sẽ được vẽ tự động</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default RoutePlanningControls;
