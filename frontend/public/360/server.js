const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5503;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.xml': 'application/xml',
  '.map': 'application/json'
};

// Helper function to find file in tour folders
function findFileInTours(urlPath, referer) {
  // Try root first
  let testPath = path.join(ROOT_DIR, urlPath);
  if (fs.existsSync(testPath)) {
    return urlPath;
  }
  
  // Determine context from referer
  let contextTour = null;
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      const refererPath = refererUrl.pathname;
      if (refererPath.startsWith('/beginner')) {
        contextTour = 'beginner';
      } else if (refererPath.startsWith('/museum')) {
        contextTour = 'museum';
      }
    } catch (e) {
      // Invalid referer URL
    }
  }
  
  // If we have context, try that tour first
  if (contextTour) {
    // Try direct path in tour folder
    testPath = path.join(ROOT_DIR, contextTour, urlPath);
    if (fs.existsSync(testPath)) {
      return `/${contextTour}${urlPath}`;
    }
    
    // Try in static subfolders (common structure)
    const staticPaths = [
      `/${contextTour}/static${urlPath}`,
      `/${contextTour}/static/static${urlPath}`,
      `/${contextTour}/static/core${urlPath}`,
      `/${contextTour}/_next/static${urlPath}`
    ];
    
    for (const staticPath of staticPaths) {
      testPath = path.join(ROOT_DIR, staticPath);
      if (fs.existsSync(testPath)) {
        return staticPath;
      }
    }
  }
  
  // Fallback: try all tour folders
  const tourFolders = ['beginner', 'museum'];
  for (const tour of tourFolders) {
    if (contextTour && tour === contextTour) continue; // Already tried
    
    testPath = path.join(ROOT_DIR, tour, urlPath);
    if (fs.existsSync(testPath)) {
      return `/${tour}${urlPath}`;
    }
    
    // Try static subfolders
    const staticPaths = [
      `/${tour}/static${urlPath}`,
      `/${tour}/static/static${urlPath}`,
      `/${tour}/static/core${urlPath}`,
      `/${tour}/_next/static${urlPath}`
    ];
    
    for (const staticPath of staticPaths) {
      testPath = path.join(ROOT_DIR, staticPath);
      if (fs.existsSync(testPath)) {
        return staticPath;
      }
    }
  }
  
  return null;
}

const server = http.createServer((req, res) => {
  // Parse URL to remove query string and hash
  const url = new URL(req.url, `http://${req.headers.host}`);
  let urlPath = url.pathname;
  
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} -> ${urlPath}`);
  
  // Root URL -> serve beginner/index.html
  if (urlPath === '/') {
    urlPath = '/beginner/index.html';
  }
  // If URL ends with /, try to serve index.html in that folder
  else if (urlPath.endsWith('/')) {
    urlPath = urlPath + 'index.html';
  }
  // If URL is a directory without trailing slash and no extension, try to serve index.html
  else if (!path.extname(urlPath)) {
    let testPath = path.join(ROOT_DIR, urlPath);
    try {
      const stat = fs.statSync(testPath);
      if (stat.isDirectory()) {
        urlPath = urlPath + '/index.html';
      }
    } catch (e) {
      // File doesn't exist, will be handled below
    }
  }
  
  // If file doesn't exist at root, try to find in tour folders
  let filePath = path.join(ROOT_DIR, urlPath);
  if (!fs.existsSync(filePath)) {
    const referer = req.headers.referer || req.headers.referrer;
    const foundPath = findFileInTours(urlPath, referer);
    if (foundPath) {
      urlPath = foundPath;
      filePath = path.join(ROOT_DIR, urlPath);
      console.log(`  -> Found in tour folder: ${urlPath} (referer: ${referer || 'none'})`);
    }
  }
  
  console.log(`  -> Serving: ${filePath}`);

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      console.error(`  ❌ Error: ${err.code} - ${filePath}`);
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(`<h1>404 - File Not Found</h1><p>Requested: ${req.url}</p><p>Resolved to: ${filePath}</p>`, 'utf-8');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`, 'utf-8');
      }
    } else {
      console.log(`  ✅ Served: ${filePath} (${content.length} bytes)`);
      res.writeHead(200, { 
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Tour static server running at http://localhost:${PORT}/`);
  console.log(`Serving from: ${ROOT_DIR}`);
});

