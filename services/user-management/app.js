const express = require('express');

const { createUserStore, defaultDatabasePath } = require('./store');

function createUserManagementApp(options = {}) {
  const store = createUserStore(options.databasePath || defaultDatabasePath());
  const app = express();

  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'user-management' });
  });

  app.post('/users', async (req, res) => {
    try {
      const payload = normalizeAccountPayload(req.body);
      const existing = await store.findAccount(payload.username);

      if (existing) {
        return res.status(409).json({ error: 'Username already exists.' });
      }

      const user = await store.createAccount(payload);
      return res.status(201).json({ user });
    } catch (error) {
      return handleError(res, error);
    }
  });

  app.get('/users/:username', async (req, res) => {
    const account = await store.findAccount(req.params.username);

    if (!account) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.json({
      user: {
        username: account.username,
        displayName: account.displayName
      }
    });
  });

  app.post('/auth/verify', async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
      }

      const user = await store.verifyCredentials({
        username: String(username).trim(),
        password
      });

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials.' });
      }

      return res.json({ user });
    } catch (error) {
      return handleError(res, error);
    }
  });

  return app;
}

function normalizeAccountPayload(payload) {
  const username = String(payload.username || '').trim();
  const displayName = String(payload.displayName || '').trim();
  const password = payload.password;

  if (!username || !displayName || !password) {
    const error = new Error('Display name, username, and password are required.');
    error.statusCode = 400;
    throw error;
  }

  if (String(password).length < 6) {
    const error = new Error('Password must be at least 6 characters.');
    error.statusCode = 400;
    throw error;
  }

  return {
    username,
    displayName,
    password
  };
}

function handleError(res, error) {
  if (error.code === 'SQLITE_CONSTRAINT') {
    return res.status(409).json({ error: 'Username already exists.' });
  }

  return res.status(error.statusCode || 500).json({
    error: error.message || 'Unexpected error.'
  });
}

module.exports = {
  createUserManagementApp
};
