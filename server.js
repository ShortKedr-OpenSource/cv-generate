const http = require('http');
const fs = require('fs');
const path = require('path');

const host = process.env.HOST || '0.0.0.0';
const port = Number(process.env.PORT || 8080);
const root = __dirname;
const adminRoute = '/admin/config/app';
const adminConfigToken = process.env.ADMIN_CONFIG_TOKEN || '';
const publicConfigPath = path.join(root, 'config', 'app.json');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8'
};

function sendText(res, statusCode, body, headers = {}) {
  res.writeHead(statusCode, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...headers
  });
  res.end(body);
}

function sendJson(res, statusCode, payload, headers = {}) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...headers
  });
  res.end(JSON.stringify(payload, null, 2));
}

function sendFile(res, filePath) {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      sendText(res, 500, 'Internal Server Error');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600',
      'X-Content-Type-Options': 'nosniff'
    });
    res.end(data);
  });
}

function getAdminTokenFromRequest(req) {
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice('Bearer '.length).trim();
  }

  const headerToken = req.headers['x-admin-token'];
  return typeof headerToken === 'string' ? headerToken.trim() : '';
}

function isLocalRequest(req) {
  const forwardedFor = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  const remoteAddress = forwardedFor || req.socket.remoteAddress || '';
  const hostHeader = String(req.headers.host || '').toLowerCase();

  return remoteAddress === '127.0.0.1'
    || remoteAddress === '::1'
    || remoteAddress === '::ffff:127.0.0.1'
    || hostHeader.startsWith('localhost')
    || hostHeader.startsWith('127.0.0.1');
}

function isHttpsRequest(req) {
  return Boolean(req.socket.encrypted)
    || String(req.headers['x-forwarded-proto'] || '').toLowerCase() === 'https';
}

function handleAdminConfigRequest(req, res) {
  if (!adminConfigToken) {
    sendText(res, 404, 'Not Found');
    return;
  }

  if (!isLocalRequest(req) && !isHttpsRequest(req)) {
    sendText(res, 403, 'HTTPS is required for admin access');
    return;
  }

  if (getAdminTokenFromRequest(req) !== adminConfigToken) {
    sendText(res, 401, 'Unauthorized', {
      'WWW-Authenticate': 'Bearer realm="cv-admin-config"'
    });
    return;
  }

  fs.readFile(publicConfigPath, 'utf8', (error, fileContent) => {
    if (error) {
      sendText(res, 500, 'Admin config is unavailable');
      return;
    }

    try {
      sendJson(res, 200, {
        route: adminRoute,
        mode: 'read-only',
        profile: isLocalRequest(req) ? 'local' : 'protected',
        config: JSON.parse(fileContent)
      });
    } catch (parseError) {
      sendText(res, 500, 'Admin config is invalid');
    }
  });
}

function resolveStaticTarget(urlPath, callback) {
  const relativePath = urlPath === '/' ? 'index.html' : urlPath.replace(/^\/+/u, '');
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

  if (urlPath === adminRoute) {
    if (req.method !== 'GET') {
      sendText(res, 405, 'Method Not Allowed', { Allow: 'GET' });
      return;
    }

    handleAdminConfigRequest(req, res);
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

  console.error('Server failed to start:', error);
  process.exitCode = 1;
});

server.listen(port, host, () => {
  console.log(`CV server is running at http://${host}:${port}`);
  if (adminConfigToken) {
    console.log(`Protected admin config route is enabled at ${adminRoute}`);
  } else {
    console.log('Protected admin config route is disabled (set ADMIN_CONFIG_TOKEN to enable it)');
  }
});
