const http = require('http');
const fs = require('fs');
const path = require('path');

const host = process.env.HOST || '0.0.0.0';
const port = Number(process.env.PORT || 8080);
const root = __dirname;
const adminConfigToken = process.env.ADMIN_CONFIG_TOKEN || '';
const adminRoute = '/admin/config/app';
const publicConfigPath = path.join(root, 'config', 'app.json');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
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

function sendFile(filePath, res) {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      sendText(res, 500, 'Internal Server Error');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const cacheValue = ext === '.html' ? 'no-cache' : 'public, max-age=3600';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': cacheValue,
      'X-Content-Type-Options': 'nosniff'
    });
    res.end(data);
  });
}

function isLoopbackAddress(address) {
  if (!address) {
    return false;
  }

  return address === '127.0.0.1'
    || address === '::1'
    || address === '::ffff:127.0.0.1';
}

function isLocalRequest(req) {
  const forwardedFor = (req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  const remoteAddress = forwardedFor || req.socket.remoteAddress || '';
  const hostHeader = (req.headers.host || '').toLowerCase();

  return isLoopbackAddress(remoteAddress)
    || hostHeader.startsWith('localhost')
    || hostHeader.startsWith('127.0.0.1');
}

function isHttpsRequest(req) {
  const forwardedProto = String(req.headers['x-forwarded-proto'] || '').toLowerCase();
  return Boolean(req.socket.encrypted) || forwardedProto === 'https';
}

function getAdminTokenFromRequest(req) {
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice('Bearer '.length).trim();
  }

  const headerToken = req.headers['x-admin-token'];
  return typeof headerToken === 'string' ? headerToken.trim() : '';
}

function handleAdminConfigRequest(req, res) {
  if (!adminConfigToken) {
    sendText(res, 404, 'Not Found');
    return;
  }

  if (!isHttpsRequest(req) && !isLocalRequest(req)) {
    sendText(res, 403, 'HTTPS is required for admin access');
    return;
  }

  const requestToken = getAdminTokenFromRequest(req);
  if (!requestToken || requestToken !== adminConfigToken) {
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
      const config = JSON.parse(fileContent);
      sendJson(res, 200, {
        route: adminRoute,
        mode: 'read-only',
        profile: isLocalRequest(req) ? 'local' : 'protected',
        config
      });
    } catch (parseError) {
      sendText(res, 500, 'Admin config is invalid');
    }
  });
}

function resolveStaticTarget(filePath, callback) {
  fs.stat(filePath, (statError, stats) => {
    if (statError) {
      callback(null);
      return;
    }

    if (stats.isFile()) {
      callback(filePath);
      return;
    }

    if (!stats.isDirectory()) {
      callback(null);
      return;
    }

    const indexPath = path.join(filePath, 'index.html');
    fs.stat(indexPath, (indexError, indexStats) => {
      if (!indexError && indexStats.isFile()) {
        callback(indexPath);
        return;
      }

      callback(null);
    });
  });
}

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);

  if (urlPath === adminRoute) {
    if (req.method !== 'GET') {
      sendText(res, 405, 'Method Not Allowed', { Allow: 'GET' });
      return;
    }

    handleAdminConfigRequest(req, res);
    return;
  }

  const safePath = path.normalize(urlPath).replace(/^([.][.][/\\])+/, '');
  const requested = safePath === '/' ? '/index.html' : safePath;
  const filePath = path.join(root, requested);

  if (!filePath.startsWith(root)) {
    sendText(res, 403, 'Forbidden');
    return;
  }

  resolveStaticTarget(filePath, resolvedPath => {
    if (resolvedPath) {
      sendFile(resolvedPath, res);
      return;
    }

    sendFile(path.join(root, 'index.html'), res);
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
