const path = require('path');
const express = require('express');

const { fetchJson } = require('../../shared/http');
const {
  SESSION_COOKIE,
  buildSessionCookie,
  clearSessionCookie,
  parseCookies
} = require('../../shared/security');
const { createSessionStore, defaultDatabasePath } = require('./session-store');

function createBffApp(options = {}) {
  const app = express();
  const publicDir = options.publicDir || path.join(__dirname, 'public');
  const sessionStore = createSessionStore(options.databasePath || defaultDatabasePath());
  const userServiceUrl = removeTrailingSlash(options.userServiceUrl || process.env.USER_SERVICE_URL || 'http://localhost:3101');
  const healthStatsServiceUrl = removeTrailingSlash(
    options.healthStatsServiceUrl || process.env.HEALTH_STATS_SERVICE_URL || 'http://localhost:3102'
  );

  app.use(express.json());
  app.use(express.static(publicDir));
  app.use(loadSession(sessionStore));

  app.get('/', sendPage(publicDir, 'home/index.html'));
  app.get('/login', sendPage(publicDir, 'login/index.html'));
  app.get('/signup', sendPage(publicDir, 'signup/index.html'));
  app.get('/tracker', sendPage(publicDir, 'tracker/index.html'));

  app.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'bff' });
  });

  app.get('/api/session', (req, res) => {
    res.json({
      architecture: 'Microservices + BFF',
      authenticated: Boolean(req.currentUser),
      user: req.currentUser || null
    });
  });

  app.post('/api/signup', async (req, res) => {
    const created = await fetchJson(`${userServiceUrl}/users`, {
      method: 'POST',
      body: req.body
    });

    if (!created.ok) {
      return res.status(created.status).json(created.body);
    }

    const session = await sessionStore.createSession(created.body.user);
    res.setHeader('Set-Cookie', buildSessionCookie(session.token));
    return res.status(201).json({ user: session.user });
  });

  app.post('/api/login', async (req, res) => {
    const verified = await fetchJson(`${userServiceUrl}/auth/verify`, {
      method: 'POST',
      body: req.body
    });

    if (!verified.ok) {
      return res.status(verified.status).json(verified.body);
    }

    const session = await sessionStore.createSession(verified.body.user);
    res.setHeader('Set-Cookie', buildSessionCookie(session.token));
    return res.json({ user: session.user });
  });

  app.post('/api/logout', async (req, res) => {
    const cookies = parseCookies(req.headers.cookie);
    await sessionStore.deleteSession(cookies[SESSION_COOKIE]);
    res.setHeader('Set-Cookie', clearSessionCookie());
    res.json({ ok: true });
  });

  app.get('/api/meals', requireUser, async (req, res) => {
    const response = await fetchJson(`${healthStatsServiceUrl}/users/${encodeURIComponent(req.currentUser.username)}/meals`);
    res.status(response.status).json(response.body);
  });

  app.post('/api/meals', requireUser, async (req, res) => {
    const response = await fetchJson(`${healthStatsServiceUrl}/users/${encodeURIComponent(req.currentUser.username)}/meals`, {
      method: 'POST',
      body: req.body
    });
    res.status(response.status).json(response.body);
  });

  app.delete('/api/meals/:id', requireUser, async (req, res) => {
    const response = await fetchJson(
      `${healthStatsServiceUrl}/users/${encodeURIComponent(req.currentUser.username)}/meals/${encodeURIComponent(req.params.id)}`,
      { method: 'DELETE' }
    );
    res.status(response.status).json(response.body);
  });

  app.get('/api/summary/weekly', requireUser, async (req, res) => {
    const response = await fetchJson(
      `${healthStatsServiceUrl}/users/${encodeURIComponent(req.currentUser.username)}/summary/weekly`
    );
    res.status(response.status).json(response.body);
  });

  app.use((error, _req, res, _next) => {
    void _next;

    res.status(error.statusCode || 502).json({
      error: error.message || 'Unable to reach downstream service.'
    });
  });

  return app;
}

function loadSession(sessionStore) {
  return async (req, _res, next) => {
    try {
      const cookies = parseCookies(req.headers.cookie);
      const session = await sessionStore.findSession(cookies[SESSION_COOKIE]);
      req.currentUser = session ? session.user : null;
      next();
    } catch (error) {
      next(error);
    }
  };
}

function requireUser(req, res, next) {
  if (!req.currentUser) {
    res.status(401).json({ error: 'Login required.' });
    return;
  }

  next();
}

function sendPage(publicDir, relativePath) {
  return (_req, res) => {
    res.sendFile(path.join(publicDir, relativePath));
  };
}

function removeTrailingSlash(value) {
  return value.replace(/\/$/, '');
}

module.exports = {
  createBffApp
};
