import React, { useState, useEffect, useRef } from 'react';
import './Tour360Viewer.css';

const Tour360Viewer = () => {
  const [tourPath, setTourPath] = useState('');
  const [tourUrl, setTourUrl] = useState(null);
  const [tourHtml, setTourHtml] = useState(null);
  const iframeRef = useRef(null);
  const [availableTours, setAvailableTours] = useState([]);
  const externalEmbedId = 'tour-embeded';
  const externalEmbedSrc = 'https://tour.panoee.net/iframe/69115bacfd4abd37f02b6eaa';

  // Load available tours from public folder or config
  useEffect(() => {
    // Try to load list of available tours
    const loadTours = async () => {
      try {
        // Check if there's a tours config file
        const response = await fetch('/tours/index.json');
        if (response.ok) {
          const data = await response.json();
          setAvailableTours(data.tours || []);
          return;
        }
      } catch (e) {
        // Continue to default tours
      }

      // Default tours - check for common tour folders
      // In production, tours are served from nginx at /360/ path
      // In development, use separate static server on port 5503
      const isProduction = process.env.NODE_ENV === 'production';
      const tourPort = process.env.REACT_APP_TOUR_PORT || '5503';
      const tourBaseUrl = process.env.REACT_APP_TOUR_URL || 
        (isProduction ? window.location.origin : `http://localhost:${tourPort}`);
      
      const defaultTours = [
        { 
          name: 'Beginner Tour', 
          path: '/360/beginner', 
          url: isProduction 
            ? `${window.location.origin}/360/beginner/index.html`
            : `${tourBaseUrl}/beginner/index.html`, 
          fallbackUrl: '/360/beginner/index.html' 
        },
        { 
          name: 'Museum Tour', 
          path: '/360/museum', 
          url: isProduction 
            ? `${window.location.origin}/360/museum/index.html`
            : `${tourBaseUrl}/museum/index.html`, 
          fallbackUrl: '/360/museum/index.html' 
        }
      ];

      // Add all default tours without verification (to avoid CORS issues)
      // Tours will be accessible when clicked
      setAvailableTours(defaultTours);
    };
    loadTours();
  }, []);

  // No auto-load; we only show available tours list

  // Forward device motion events to external Panoee iframe (demo)
  useEffect(() => {
    const handler = (e) => {
      const iframe = document.getElementById(externalEmbedId);
      if (!iframe || !iframe.contentWindow) return;
      iframe.contentWindow.postMessage({
        type: 'devicemotion',
        deviceMotionEvent: {
          acceleration: {
            x: e.acceleration?.x,
            y: e.acceleration?.y,
            z: e.acceleration?.z
          },
          accelerationIncludingGravity: {
            x: e.accelerationIncludingGravity?.x,
            y: e.accelerationIncludingGravity?.y,
            z: e.accelerationIncludingGravity?.z
          },
          rotationRate: {
            alpha: e.rotationRate?.alpha,
            beta: e.rotationRate?.beta,
            gamma: e.rotationRate?.gamma
          },
          interval: e.interval,
          timeStamp: e.timeStamp
        }
      }, '*');
    };
    window.addEventListener('devicemotion', handler);
    return () => window.removeEventListener('devicemotion', handler);
  }, []);

  const handleSelectTour = (tour) => {
    setTourPath(tour.path);
    const url = tour.url || `${window.location.origin}${tour.path}`;
    smartLoadTour(url, (tour.path.endsWith('/') ? tour.path : `${tour.path}/`));
  };

  // Fetch HTML and rewrite asset paths to work under subfolder inside React app
  const smartLoadTour = async (fullUrl, basePath = '/') => {
    try {
      const res = await fetch(fullUrl, { method: 'GET' });
      if (!res.ok) {
        // fallback to direct src
        setTourHtml(null);
        setTourUrl(fullUrl);
        return;
      }
      let html = await res.text();
      // Ensure basePath starts and ends with '/'
      let base = basePath;
      if (!base.startsWith('/')) base = `/${base}`;
      if (!base.endsWith('/')) base = `${base}/`;
      // Inject <base> if not present
      if (html.indexOf('<base ') === -1) {
        html = html.replace('<head>', `<head><base href="${base}">`);
      }
      // Rewrite absolute asset URLs href="/..." or src="/..." to relative paths
      // Convert all absolute paths to relative
      html = html.replace(/href="\/([^\"]+)"/g, (match, path) => {
        if (path.startsWith('http')) return match;
        return `href="./${path}"`;
      });
      html = html.replace(/src="\/([^\"]+)"/g, (match, path) => {
        if (path.startsWith('http')) return match;
        return `src="./${path}"`;
      });
      
      // Inject script EARLY (right after head) to intercept all requests before other scripts load
      const mockScript = `
        <script>
          (function() {
            // Fix webpack public path IMMEDIATELY before any scripts load
            // Create __webpack_require__ object early
            if (!window.__webpack_require__) {
              window.__webpack_require__ = function() {};
            }
            // Set public path property
            try {
              Object.defineProperty(window.__webpack_require__, 'p', {
                get: function() { return './_next/static/'; },
                set: function(val) { 
                  // Ignore attempts to change it
                  console.log('Webpack public path set attempt blocked, keeping: ./_next/static/');
                },
                configurable: true,
                enumerable: true
              });
            } catch(e) {
              // Fallback if defineProperty fails
              window.__webpack_require__.p = './_next/static/';
            }
            
            // Safe overrides for history APIs to avoid errors in about:srcdoc
            try {
              history.pushState = new Proxy(history.pushState, { apply: (t, thisArg, args) => { try { return Reflect.apply(t, thisArg, args); } catch (e) { return false; } } });
              history.replaceState = new Proxy(history.replaceState, { apply: (t, thisArg, args) => { try { return Reflect.apply(t, thisArg, args); } catch (e) { return false; } } });
            } catch (_) {}

            // Mock fetch for Panoee API
            const originalFetch = window.fetch;
            window.fetch = function(url, options) {
              if (typeof url === 'string' && url.includes('studio-api.panoee.com')) {
                console.warn('Mocking Panoee API call:', url);
                return Promise.resolve(new Response(JSON.stringify({ 
                  success: false, 
                  message: 'Offline mode - API disabled' 
                }), {
                  status: 200,
                  headers: { 'Content-Type': 'application/json' }
                }));
              }
              // Fix relative paths for fetch
              if (typeof url === 'string' && url.startsWith('/') && !url.startsWith('//')) {
                url = '.' + url;
              }
              return originalFetch.apply(this, arguments);
            };
            
            // Mock XMLHttpRequest to rewrite absolute URLs and block Panoee API - MUST be first!
            (function() {
              const OriginalXHR = window.XMLHttpRequest;
              function WrappedXHR() {
                const xhr = new OriginalXHR();
                const originalOpen = xhr.open;
                const originalSend = xhr.send;
                let isPanoeeAPI = false;
                let savedUrl = '';
                xhr.open = function(method, url, async, user, password) {
                  savedUrl = url;
                  try {
                    if (typeof url === 'string' && url.includes('studio-api.panoee.com')) {
                      isPanoeeAPI = true;
                      // Don't actually open, we'll mock the response
                      return;
                    } else if (typeof url === 'string' && url.startsWith('/') && !url.startsWith('//') && !url.startsWith('http')) {
                      url = '.' + url;
                      savedUrl = url;
                    }
                  } catch(_) {}
                  if (!isPanoeeAPI) {
                    isPanoeeAPI = false;
                    return originalOpen.call(this, method, url, async !== false, user, password);
                  }
                };
                xhr.send = function(data) {
                  if (isPanoeeAPI) {
                    // Mock successful JSON response immediately
                    try {
                      Object.defineProperty(xhr, 'status', { value: 200, writable: true, configurable: true });
                      Object.defineProperty(xhr, 'statusText', { value: 'OK', writable: true, configurable: true });
                      Object.defineProperty(xhr, 'responseText', { value: JSON.stringify({ success: false, message: 'Offline mode', tenant: null }), writable: true, configurable: true });
                      Object.defineProperty(xhr, 'response', { value: JSON.stringify({ success: false, message: 'Offline mode', tenant: null }), writable: true, configurable: true });
                      Object.defineProperty(xhr, 'readyState', { value: 4, writable: true, configurable: true });
                      Object.defineProperty(xhr, 'responseType', { value: '', writable: true, configurable: true });
                      Object.defineProperty(xhr, 'responseURL', { value: savedUrl, writable: true, configurable: true });
                      // Trigger events
                      if (xhr.onreadystatechange) {
                        xhr.readyState = 1; if (xhr.onreadystatechange) xhr.onreadystatechange();
                        xhr.readyState = 2; if (xhr.onreadystatechange) xhr.onreadystatechange();
                        xhr.readyState = 3; if (xhr.onreadystatechange) xhr.onreadystatechange();
                        xhr.readyState = 4; if (xhr.onreadystatechange) xhr.onreadystatechange();
                      }
                      if (xhr.onload) xhr.onload();
                      if (xhr.onloadend) xhr.onloadend();
                    } catch(e) {
                      console.warn('XHR mock error:', e);
                    }
                    return;
                  }
                  return originalSend.call(this, data);
                };
                return xhr;
              }
              // Preserve original XHR properties
              WrappedXHR.prototype = OriginalXHR.prototype;
              WrappedXHR.UNSENT = OriginalXHR.UNSENT;
              WrappedXHR.OPENED = OriginalXHR.OPENED;
              WrappedXHR.HEADERS_RECEIVED = OriginalXHR.HEADERS_RECEIVED;
              WrappedXHR.LOADING = OriginalXHR.LOADING;
              WrappedXHR.DONE = OriginalXHR.DONE;
              window.XMLHttpRequest = WrappedXHR;
            })();

            // Intercept axios creation early (before it's used)
            const axiosProxy = new Proxy({}, {
              get: function(target, prop) {
                if (prop === 'get' || prop === 'post' || prop === 'request') {
                  return function(url, config) {
                    if (typeof url === 'string' && url.includes('studio-api.panoee.com')) {
                      return Promise.resolve({ status: 200, data: { success: false, message: 'Offline mode' } });
                    }
                    if (typeof url === 'string' && url.startsWith('/') && !url.startsWith('//')) {
                      url = '.' + url;
                    }
                    // Try to use real axios if available
                    if (window.axios && window.axios[prop]) {
                      return window.axios[prop].apply(window.axios, arguments);
                    }
                    return Promise.reject({ message: 'Axios not available' });
                  };
                }
                return target[prop];
              }
            });
            
            // Mock axios if exists (both get and request)
            Object.defineProperty(window, 'axios', {
              get: function() {
                return window._realAxios || axiosProxy;
              },
              set: function(val) {
                window._realAxios = val;
                // Wrap methods
                if (val && val.get) {
                  const origGet = val.get.bind(val);
                  val.get = function(url, config) {
                    if (typeof url === 'string' && url.includes('studio-api.panoee.com')) {
                      return Promise.resolve({ status: 200, data: { success: false, message: 'Offline mode' } });
                    }
                    if (typeof url === 'string' && url.startsWith('/') && !url.startsWith('//')) {
                      url = '.' + url;
                    }
                    return origGet(url, config);
                  };
                }
                if (val && val.request) {
                  const origReq = val.request.bind(val);
                  val.request = function(config) {
                    if (config && typeof config.url === 'string' && config.url.includes('studio-api.panoee.com')) {
                      return Promise.resolve({ status: 200, data: { success: false, message: 'Offline mode' } });
                    }
                    if (config && typeof config.url === 'string' && config.url.startsWith('/') && !config.url.startsWith('//')) {
                      config.url = '.' + config.url;
                    }
                    return origReq(config);
                  };
                }
              },
              configurable: true
            });
            
            // Monitor and fix webpack public path continuously
            setInterval(function() {
              try {
                if (window.__webpack_require__ && window.__webpack_require__.p !== './_next/static/') {
                  window.__webpack_require__.p = './_next/static/';
                }
              } catch(_) {}
            }, 50);
            
            // Also fix after DOM ready
            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', function() {
                try {
                  if (window.__webpack_require__) {
                    window.__webpack_require__.p = './_next/static/';
                  }
                } catch(_) {}
              });
            } else {
              try {
                if (window.__webpack_require__) {
                  window.__webpack_require__.p = './_next/static/';
                }
              } catch(_) {}
            }
          })();
        </script>
      `;
      
      // Inject mock script IMMEDIATELY after <head> tag (before any other scripts)
      if (html.indexOf('<head>') !== -1) {
        html = html.replace('<head>', '<head>' + mockScript);
      } else if (html.indexOf('</head>') !== -1) {
        html = html.replace('</head>', mockScript + '</head>');
      } else if (html.indexOf('<body') !== -1) {
        html = html.replace(/<body[^>]*>/, (match) => match + mockScript);
      }
      
      // Optionally prevent service worker registration inside iframe
      html = html.replace(/<script[^>]*sw\.js[^>]*><\/script>/g, '');
      html = html.replace(/navigator\.serviceWorker\./g, 'void(0)&&navigator.serviceWorker.');
      
      // Always use src (not srcDoc) to ensure chunk paths resolve relative to the folder
      setTourHtml(null);
      setTourUrl(fullUrl);
    } catch (e) {
      // fallback to direct src
      setTourHtml(null);
      setTourUrl(fullUrl);
    }
  };

  return (
    <div className="tour-360-viewer-container">
      <div className="tour-360-header">
        <h2>🌐 Tour 360</h2>
      </div>

      {/* External Panoee embed demo */}
      <div className="available-tours" style={{ marginBottom: '1rem' }}>
        <h3>External Panoee (demo)</h3>
        <div className="tour-iframe-container">
          <iframe
            id={externalEmbedId}
            title="Panoee Embedded Tour"
            src={externalEmbedSrc}
            frameBorder="0"
            width="100%"
            height="400px"
            scrolling="no"
            allow="vr; xr; accelerometer; gyroscope; autoplay;"
            allowFullScreen={true}
            webkitallowfullscreen="true"
            mozallowfullscreen="true"
            loading="lazy"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          />
        </div>
      </div>

      {availableTours.length > 0 && (
        <div className="available-tours">
          <h3>Available Tours:</h3>
          <div className="tours-list">
            {availableTours.map((tour, idx) => (
              <button
                key={idx}
                className="tour-item"
                onClick={() => {
                  // Use tour.url if available (static server), otherwise use fallbackUrl
                  let url = tour.url || (tour.fallbackUrl ? `${window.location.origin}${tour.fallbackUrl}` : null);
                  if (url) {
                    // Normalize URL: ensure it ends with /index.html
                    // Remove trailing slash first, then add /index.html
                    url = url.replace(/\/$/, '');
                    if (!url.endsWith('.html')) {
                      url = `${url}/index.html`;
                    }
                    console.log('Opening tour:', url);
                    window.open(url, '_blank', 'noopener');
                  }
                }}
              >
                <span className="tour-icon">🌐</span>
                <span className="tour-name">{tour.name || tour.path}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      
    </div>
  );
};

export default Tour360Viewer;

