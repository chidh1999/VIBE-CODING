import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import './Model3DViewer.css';

const Model3DViewer = ({ modelUrl, modelName, onClose }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 5);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Controls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.enableRotate = true;
    controls.enablePan = true;
    controlsRef.current = controls;

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(-10, -10, -5);
    scene.add(pointLight);

    // Load 3D model
    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      (gltf) => {
        const model = gltf.scene;
        
        // Center and scale model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        
        // Handle edge case where model has no dimensions
        if (maxDim === 0) {
          console.warn('Model has no dimensions, using default scale');
          scene.add(model);
          setLoading(false);
          return;
        }
        
        const scale = 2 / maxDim;
        model.scale.setScalar(scale);
        
        // Move model to origin
        const offset = center.multiplyScalar(-1).multiplyScalar(scale);
        model.position.copy(offset);
        
        // Enable shadows
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        
        scene.add(model);
        
        // Update camera position to view the centered model
        const distance = maxDim * 1.5;
        camera.position.set(distance, distance * 0.5, distance);
        camera.lookAt(0, 0, 0);
        
        // Update controls target to origin (where model is centered)
        controls.target.set(0, 0, 0);
        controls.update();
        
        // Force a render to ensure everything is visible
        renderer.render(scene, camera);
        
        setLoading(false);
      },
      (progress) => {
        if (progress.lengthComputable) {
          const percentComplete = (progress.loaded / progress.total * 100);
          console.log('Loading progress:', percentComplete.toFixed(0) + '%');
        } else {
          console.log('Loading progress:', progress.loaded, 'bytes');
        }
      },
      (error) => {
        console.error('Error loading 3D model:', error);
        setError(`Failed to load 3D model: ${error.message || 'Unknown error'}`);
        setLoading(false);
      }
    );

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [modelUrl]);

  return (
    <div className="model-3d-overlay" onClick={onClose}>
      <div className="model-3d-container" onClick={(e) => e.stopPropagation()}>
        <div className="model-3d-header">
          <h3>🎮 3D Model Viewer</h3>
          <div className="model-info">
            <span className="model-name">{modelName}</span>
            <div className="viewer-controls">
              <span className="control-hint">🖱️ Drag to rotate</span>
              <span className="control-hint">🔍 Scroll to zoom</span>
            </div>
          </div>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>
        
        <div className="model-3d-body">
          {loading && (
            <div className="loading-overlay">
              <div className="loading-spinner"></div>
              <p>Loading 3D model...</p>
            </div>
          )}
          
          {error && (
            <div className="error-overlay">
              <div className="error-icon">❌</div>
              <p>{error}</p>
            </div>
          )}
          
          <div 
            ref={mountRef} 
            className="model-3d-viewport"
            style={{ 
              width: '100%', 
              height: '500px',
              position: 'relative',
              backgroundColor: '#f0f0f0'
            }}
          />
        </div>
        
        <div className="model-3d-footer">
          <div className="viewer-tips">
            <span>💡 Tips: Use mouse to rotate, scroll to zoom, right-click to pan</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Model3DViewer;
