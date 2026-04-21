const express = require('express');

function createGatewayApp(options = {}) {
  const config = {
    bffUrl: options.bffUrl || process.env.BFF_URL || 'http://localhost:3100',
    userServiceUrl: options.userServiceUrl || process.env.USER_SERVICE_URL || 'http://localhost:3101',
    healthStatsServiceUrl: options.healthStatsServiceUrl || process.env.HEALTH_STATS_SERVICE_URL || 'http://localhost:3102'
  };
  const app = express();

  app.use(express.raw({ type: '*/*', limit: '1mb' }));

  app.all('*', async (req, res) => {
    try {
      const target = resolveTarget(req.originalUrl, config);
      const response = await fetch(target, {
        method: req.method,
        headers: forwardedHeaders(req.headers),
        body: hasRequestBody(req.method) ? req.body : undefined,
        redirect: 'manual'
      });
      const body = Buffer.from(await response.arrayBuffer());

      copyResponseHeaders(response, res);
      res.status(response.status).send(body);
    } catch (error) {
      res.status(502).json({
        error: 'Unable to reach downstream service.',
        detail: error.message
      });
    }
  });

  return app;
}

function resolveTarget(originalUrl, config) {
  const requestUrl = new URL(originalUrl, 'http://gateway.local');
  const path = requestUrl.pathname;

  if (path === '/api/users' || path.startsWith('/api/users/')) {
    return buildTarget(config.userServiceUrl, `/users${path.slice('/api/users'.length)}`, requestUrl.search);
  }

  if (path === '/api/health-stats' || path.startsWith('/api/health-stats/')) {
    return buildTarget(config.healthStatsServiceUrl, path.slice('/api/health-stats'.length) || '/', requestUrl.search);
  }

  return buildTarget(config.bffUrl, path, requestUrl.search);
}

function buildTarget(baseUrl, pathname, search) {
  const target = new URL(removeTrailingSlash(baseUrl));
  target.pathname = `${target.pathname.replace(/\/$/, '')}${pathname}`;
  target.search = search;
  return target;
}

function forwardedHeaders(headers) {
  const forwarded = { ...headers };
  delete forwarded.host;
  delete forwarded.connection;
  delete forwarded['content-length'];
  return forwarded;
}

function copyResponseHeaders(response, res) {
  response.headers.forEach((value, key) => {
    if (!['connection', 'content-encoding', 'content-length', 'transfer-encoding'].includes(key)) {
      res.setHeader(key, value);
    }
  });
}

function hasRequestBody(method) {
  return !['GET', 'HEAD'].includes(method);
}

function removeTrailingSlash(value) {
  return value.replace(/\/$/, '');
}

module.exports = {
  createGatewayApp,
  resolveTarget
};
