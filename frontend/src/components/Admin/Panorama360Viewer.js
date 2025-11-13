import React, { useEffect, useRef, useState, useCallback } from 'react';
import Marzipano from 'marzipano';
import './Panorama360Viewer.css';

const Panorama360Viewer = ({ imageUrl, imageName, imageId, allScenes = [], onNavigateScene, onClose }) => {
  const viewerRef = useRef(null);
  const viewerInstanceRef = useRef(null);
  const sceneRef = useRef(null);
  const viewRef = useRef(null);
  const hotspotRefs = useRef([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode] = useState(false);
  const [hotspots, setHotspots] = useState([]);

  const storageKey = useRef(`panorama360_hotspots_${imageId || imageName || 'unknown'}`);

  // Load hotspots from storage
  // View-only: do not load hotspots from storage
  useEffect(() => {
    setHotspots([]);
  }, [imageId, imageName]);

  useEffect(() => {
    if (!viewerRef.current || !imageUrl) return;

    const initializeViewer = async () => {
      try {
        // Ensure URL is absolute
        let fullImageUrl = imageUrl;
        if (!fullImageUrl.startsWith('http')) {
          fullImageUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:1111'}${fullImageUrl.startsWith('/') ? '' : '/'}${fullImageUrl}`;
        }

        // Initialize Marzipano viewer
        const viewer = new Marzipano.Viewer(viewerRef.current, {
          stageType: 'webgl',
          controls: {
            mouseViewMode: 'drag'
          }
        });
        viewerInstanceRef.current = viewer;

        // Create source (equirectangular panorama)
        const source = Marzipano.ImageUrlSource.fromString(fullImageUrl);

        // Create view
        const view = new Marzipano.RectilinearView({
          yaw: Math.PI / 2, // Start looking forward
          pitch: 0,
          fov: Math.PI / 3 // 60 degrees field of view
        });
        viewRef.current = view;

        // Create scene
        const scene = viewer.createScene({
          source: source,
          geometry: new Marzipano.EquirectGeometry([{ width: 4000 }]), // Default width, will be adjusted
          view: view,
          pinFirstLevel: true
        });
        sceneRef.current = scene;

        // Switch to scene - wrap in try-catch
        try {
          await new Promise(resolve => requestAnimationFrame(resolve));
          let switchResult = null;
          if (typeof scene.switchTo === 'function') {
            // call without transition/options to avoid default transition effects
            switchResult = scene.switchTo();
          }
          if (switchResult && typeof switchResult.then === 'function') {
            await switchResult;
          }
          setTimeout(() => setLoading(false), 300);
        } catch (switchError) {
          console.error('Error switching to scene:', switchError);
          // Still try to show the viewer after a delay
          setTimeout(() => {
            try { scene.switchTo && scene.switchTo(); } catch (_) {}
            setLoading(false);
          }, 300);
        }
      } catch (err) {
        console.error('Error initializing Marzipano:', err);
        setError(`Failed to initialize viewer: ${err.message || 'Unknown error'}`);
        setLoading(false);
      }
    };

    initializeViewer();

    // Cleanup
    return () => {
      // remove hotspots
      try {
        hotspotRefs.current.forEach(obj => obj?.hotspot?.destroy?.());
        hotspotRefs.current = [];
      } catch (_) {}
      if (sceneRef.current) {
        try {
          sceneRef.current.destroy();
          sceneRef.current = null;
        } catch (e) {
          console.error('Error destroying scene:', e);
        }
      }
      if (viewerInstanceRef.current) {
        try {
          viewerInstanceRef.current.destroy();
          viewerInstanceRef.current = null;
        } catch (e) {
          console.error('Error destroying viewer:', e);
        }
      }
    };
  }, [imageUrl]);

  // Render hotspots whenever list changes and scene is ready
  // View-only: do not render hotspots
  useEffect(() => {
    if (!sceneRef.current || loading) return;
    try {
      hotspotRefs.current.forEach(obj => obj?.hotspot?.destroy?.());
    } catch (_) {}
    hotspotRefs.current = [];
  }, [loading]);

  // View-only: no click-to-add
  const handleViewportClick = useCallback(() => {}, []);

  // View-only: no persist
  const persistHotspots = useCallback(() => {}, []);

  // Auto-persist hotspots on change to keep state consistent across openings
  useEffect(() => {
    try {
      localStorage.setItem(storageKey.current, JSON.stringify(hotspots));
    } catch (_) {}
  }, [hotspots]);

  return (
    <div className="panorama-360-overlay" onClick={onClose}>
      <div className="panorama-360-container" onClick={(e) => e.stopPropagation()}>
        <div className="panorama-360-header">
          <h3>🌐 360 Panorama Viewer</h3>
          <div className="panorama-info">
            <span className="panorama-name">{imageName}</span>
            <div className="viewer-controls">
              <span className="control-hint">🖱️ Drag to look around</span>
              <span className="control-hint">🔍 Scroll to zoom</span>
            </div>
          </div>
          {/* View-only: no tools */}
          <button className="close-button" onClick={onClose}>✕</button>
        </div>
        
        <div className="panorama-360-body">
          {loading && (
            <div className="loading-overlay">
              <div className="loading-spinner"></div>
              <p>Loading 360 panorama...</p>
            </div>
          )}
          
          {error && (
            <div className="error-overlay">
              <div className="error-icon">❌</div>
              <p>{error}</p>
            </div>
          )}
          
          <div 
            ref={viewerRef} 
            className="panorama-360-viewport"
            style={{ 
              width: '100%', 
              height: '600px',
              position: 'relative',
              backgroundColor: '#000'
            }}
            onClick={handleViewportClick}
          />
        </div>
        
        <div className="panorama-360-footer">
          <div className="viewer-tips">
            <span>💡 Tips: Drag to look around, scroll to zoom, double-click to reset view</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Panorama360Viewer;

