const http = require('http');
const fs = require('fs');
const path = require('path');

const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || 8080);
const root = path.resolve(__dirname, '..');

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp'
};

function sendText(res, statusCode, body) {
  res.writeHead(statusCode, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  res.end(body);
}

function sendFile(res, filePath) {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      sendText(res, 500, 'Internal Server Error');
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[extension] || 'application/octet-stream',
      'Cache-Control': extension === '.html' ? 'no-cache' : 'public, max-age=3600',
      'X-Content-Type-Options': 'nosniff'
    });
    res.end(data);
  });
}

function resolveStaticTarget(urlPath, callback) {
  const relativePath = urlPath === '/' ? 'index.html' : urlPath.replace(/^\/+/, '');
  const filePath = path.resolve(root, relativePath);
  const rootPrefix = `${root}${path.sep}`;

  if (filePath !== root && !filePath.startsWith(rootPrefix)) {
    callback(403);
    return;
  }

  fs.stat(filePath, (error, stats) => {
    if (error) {
      callback(404);
      return;
    }

    if (stats.isFile()) {
      callback(null, filePath);
      return;
    }

    if (!stats.isDirectory()) {
      callback(404);
      return;
    }

    const indexPath = path.join(filePath, 'index.html');
    fs.stat(indexPath, (indexError, indexStats) => {
      if (indexError || !indexStats.isFile()) {
        callback(404);
        return;
      }

      callback(null, indexPath);
    });
  });
}

const server = http.createServer((req, res) => {
  let urlPath;

  try {
    urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  } catch (error) {
    sendText(res, 400, 'Bad Request');
    return;
  }

  resolveStaticTarget(urlPath, (statusCode, filePath) => {
    if (statusCode) {
      sendText(res, statusCode, statusCode === 403 ? 'Forbidden' : 'Not Found');
      return;
    }

    sendFile(res, filePath);
  });
});

server.on('error', error => {
  if (error && error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Set PORT to another value and retry.`);
    process.exitCode = 1;
    return;
  }

  console.error('Static preview server failed to start:', error);
  process.exitCode = 1;
});

server.listen(port, host, () => {
  console.log(`CV static preview is running at http://${host}:${port}`);
});