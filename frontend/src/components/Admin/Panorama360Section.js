import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Panorama360Viewer from './Panorama360Viewer';
import './Panorama360Section.css';

const Panorama360Section = () => {
  const { user } = useAuth();
  const [panoramas, setPanoramas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [viewingPanorama, setViewingPanorama] = useState(null);

  // Load panoramas from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('panorama360_list');
    if (saved) {
      try {
        setPanoramas(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading panoramas:', error);
      }
    }
  }, []);

  // Save panoramas to localStorage whenever it changes
  useEffect(() => {
    if (panoramas.length > 0) {
      localStorage.setItem('panorama360_list', JSON.stringify(panoramas));
    }
  }, [panoramas]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check if it's an image
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file hình ảnh (JPG, PNG, etc.)');
        return;
      }

      // Check file size (max 20MB for 360 images)
      if (file.size > 20 * 1024 * 1024) {
        alert('Kích thước file quá lớn (tối đa 20MB)');
        return;
      }

      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('userId', user.id);
      formData.append('userName', user.name);

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:1111'}/api/images/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        
        // Extract image URL from response
        // Response format: { success: true, data: { image: { url, name, size } } }
        let imageUrl = data.data?.image?.url;
        if (!imageUrl && data.data?.url) {
          imageUrl = data.data.url;
        } else if (!imageUrl && data.image?.url) {
          imageUrl = data.image.url;
        } else if (!imageUrl && data.url) {
          imageUrl = data.url;
        }
        
        // Fallback: construct URL from filename if needed
        if (!imageUrl) {
          // Try to extract filename from response or use selected file name
          const filename = data.data?.image?.name || selectedFile.name;
          imageUrl = `/uploads/images/${filename}`;
        }
        
        // Ensure URL starts with /
        if (imageUrl && !imageUrl.startsWith('/') && !imageUrl.startsWith('http')) {
          imageUrl = `/${imageUrl}`;
        }
        
        // Add to panoramas list
        const newPanorama = {
          id: Date.now().toString(),
          url: imageUrl || `/uploads/images/unknown`,
          name: data.data?.image?.name || selectedFile.name,
          size: data.data?.image?.size || selectedFile.size,
          uploadedAt: new Date().toISOString(),
          uploadedBy: user.name
        };

        setPanoramas(prev => [newPanorama, ...prev]);
        setSelectedFile(null);
        setPreviewUrl(null);
        setShowUpload(false);
        alert('✅ Upload 360 panorama thành công!');
      } else {
        const error = await response.json();
        alert(`Upload failed: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error uploading panorama:', error);
      alert('Failed to upload panorama');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa panorama này?')) {
      setPanoramas(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleView = (panorama) => {
    // Ensure URL is absolute
    let imageUrl = panorama.url;
    if (!imageUrl.startsWith('http')) {
      imageUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:1111'}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
    }
    setViewingPanorama({
      ...panorama,
      url: imageUrl
    });
  };

  return (
    <div className="panorama-360-section">
      <div className="section-header">
        <h2>🌐 360 Panorama Gallery</h2>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowUpload(true)}
        >
          + Upload 360 Image
        </button>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="upload-overlay" onClick={() => !loading && setShowUpload(false)}>
          <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
            <div className="upload-header">
              <h3>Upload 360 Panorama</h3>
              <button 
                className="close-btn" 
                onClick={() => setShowUpload(false)}
                disabled={loading}
              >
                ✕
              </button>
            </div>
            
            <div className="upload-body">
              {!selectedFile ? (
                <div className="upload-area">
                  <label className="upload-label">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                    />
                    <div className="upload-placeholder">
                      <div className="upload-icon">📸</div>
                      <div className="upload-text">Click để chọn ảnh 360</div>
                      <div className="upload-hint">JPG, PNG (tối đa 20MB)</div>
                    </div>
                  </label>
                </div>
              ) : (
                <div className="upload-preview">
                  <img src={previewUrl} alt="Preview" className="preview-image" />
                  <div className="preview-info">
                    <div className="preview-name">{selectedFile.name}</div>
                    <div className="preview-size">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</div>
                  </div>
                  <div className="upload-actions">
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                      disabled={loading}
                    >
                      Chọn lại
                    </button>
                    <button 
                      className="btn btn-primary" 
                      onClick={handleUpload}
                      disabled={loading}
                    >
                      {loading ? 'Đang upload...' : 'Upload'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Panorama Grid */}
      {panoramas.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🌐</div>
          <p>Chưa có panorama nào. Hãy upload ảnh 360 đầu tiên!</p>
        </div>
      ) : (
        <div className="panorama-grid">
          {panoramas.map((panorama) => {
            // Create thumbnail URL
            let thumbnailUrl = panorama.url;
            if (!thumbnailUrl.startsWith('http')) {
              thumbnailUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:1111'}${thumbnailUrl.startsWith('/') ? '' : '/'}${thumbnailUrl}`;
            }

            return (
              <div key={panorama.id} className="panorama-card">
                <div className="panorama-thumbnail" onClick={() => handleView(panorama)}>
                  <img src={thumbnailUrl} alt={panorama.name} />
                  <div className="panorama-overlay">
                    <div className="view-icon">👁️</div>
                    <div className="view-text">Click để xem</div>
                  </div>
                </div>
                <div className="panorama-info">
                  <div className="panorama-name">{panorama.name}</div>
                  <div className="panorama-meta">
                    <span>📏 {(panorama.size / 1024 / 1024).toFixed(2)} MB</span>
                    {panorama.uploadedBy && <span>👤 {panorama.uploadedBy}</span>}
                  </div>
                  <button 
                    className="btn-delete"
                    onClick={() => handleDelete(panorama.id)}
                    title="Xóa"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Viewer Modal */}
      {viewingPanorama && (
        <Panorama360Viewer
          imageUrl={viewingPanorama.url}
          imageName={viewingPanorama.name}
          imageId={viewingPanorama.id}
          allScenes={panoramas.map(p => ({ id: p.id, name: p.name }))}
          onNavigateScene={(targetId) => {
            const target = panoramas.find(p => p.id === targetId);
            if (!target) return;
            let imageUrl = target.url;
            if (!imageUrl.startsWith('http')) {
              imageUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:1111'}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
            }
            setViewingPanorama({ ...target, url: imageUrl });
          }}
          onClose={() => setViewingPanorama(null)}
        />
      )}
    </div>
  );
};

export default Panorama360Section;

