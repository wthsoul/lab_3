const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

function sendFile(res, filePath, contentType, code = 200) {
  fs.readFile(filePath, function(err, data) {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 — Internal Server Error');
      return;
    }
    res.writeHead(code, { 'Content-Type': contentType });
    res.end(data);
  });
}

function serveStatic(req, res) {
  const parsed = url.parse(req.url);
  const pathname = parsed.pathname;

  if (pathname === '/') {
    sendFile(res, path.join(PUBLIC_DIR, 'index.html'), 'text/html');
    return true;
  }

  const safePath = path.normalize(path.join(PUBLIC_DIR, pathname));
  if (!safePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 — Forbidden');
    return true;
  }

  if (fs.existsSync(safePath) && fs.statSync(safePath).isFile()) {
    const ext = path.extname(safePath).toLowerCase();
    const mime = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon'
    }[ext] || 'application/octet-stream';
    sendFile(res, safePath, mime);
    return true;
  }

  return false;
}

function handleApi(req, res) {
  const parsed = url.parse(req.url, true);
  if (req.method === 'GET' && parsed.pathname === '/api/products') {
    // Список автомобилей
    const products = [
      { id: 1, name: 'Camry', brand: 'Toyota', price: 80000 },
      { id: 2, name: '911', brand: 'Porshe', price: 60000 },
      { id: 3, name: 'M6', brand: 'Haval', price: 35000 },
      { id: 4, name: 'Matiz', brand: 'Chevrolet', price: 5500 },
    ];

    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify(products));
    return true;
  }
  return false;
}

const server = http.createServer((req, res) => {
  if (handleApi(req, res)) return;
  if (serveStatic(req, res)) return;

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('404 — Not Found');
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
