const path = require('path');
const express = require('express');
const dotenv = require('dotenv');

const { openDatabase } = require('../common/sqlite');
const { parseCookies, SESSION_COOKIE } = require('../common/security');
const createAuthRepository = require('./repositories/auth-repository');
const createMealRepository = require('./repositories/meal-repository');
const createAuthService = require('./services/auth-service');
const createMealService = require('./services/meal-service');

dotenv.config();

const ARCHITECTURE = 'Layered Architecture';
const PORT = process.env.PORT || 3101;
const DATABASE_PATH = process.env.SQLITE_PATH || path.join(__dirname, '..', '..', 'data', 'layered.sqlite');
const PUBLIC_DIR = path.join(__dirname, '..', 'common', 'public');

async function start() {
  const db = await openDatabase(DATABASE_PATH);
  const authService = createAuthService(createAuthRepository(db));
  const mealService = createMealService(createMealRepository(db));
  const app = express();

  app.use(express.json());
  app.use(express.static(PUBLIC_DIR));
  app.use(loadSession(authService));

  app.get('/', sendPage('home/index.html'));
  app.get('/login', sendPage('login/index.html'));
  app.get('/signup', sendPage('signup/index.html'));
  app.get('/tracker', sendPage('tracker/index.html'));

  app.get('/api/session', (req, res) => {
    res.json({
      architecture: ARCHITECTURE,
      authenticated: Boolean(req.currentUser),
      user: req.currentUser || null
    });
  });

  app.post('/api/signup', async (req, res) => {
    try {
      const result = await authService.register(req.body);
      res.setHeader('Set-Cookie', result.cookie);
      res.status(201).json({ user: result.user });
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post('/api/login', async (req, res) => {
    try {
      const result = await authService.login(req.body);
      res.setHeader('Set-Cookie', result.cookie);
      res.json({ user: result.user });
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post('/api/logout', async (req, res) => {
    const cookies = parseCookies(req.headers.cookie);
    const clearedCookie = await authService.logout(cookies[SESSION_COOKIE]);
    res.setHeader('Set-Cookie', clearedCookie);
    res.json({ ok: true });
  });

  app.get('/api/meals', requireUser, async (req, res) => {
    const meals = await mealService.listMeals(req.currentUser.username);
    res.json({ meals });
  });

  app.post('/api/meals', requireUser, async (req, res) => {
    try {
      await mealService.createMeal(req.currentUser.username, req.body);
      res.status(201).json({ ok: true });
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete('/api/meals/:id', requireUser, async (req, res) => {
    try {
      await mealService.deleteMeal(req.currentUser.username, req.params.id);
      res.json({ ok: true });
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/summary/weekly', requireUser, async (req, res) => {
    const summary = await mealService.buildWeeklySummary(req.currentUser.username);
    res.json({ summary });
  });

  app.listen(PORT, () => {
    console.log(`${ARCHITECTURE} running at http://localhost:${PORT}`);
  });
}

function loadSession(authService) {
  return async (req, _res, next) => {
    const cookies = parseCookies(req.headers.cookie);
    req.currentUser = await authService.getSessionUser(cookies[SESSION_COOKIE]);
    next();
  };
}

function requireUser(req, res, next) {
  if (!req.currentUser) {
    res.status(401).json({ error: 'Login required.' });
    return;
  }

  next();
}

function sendPage(relativePath) {
  return (_req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, relativePath));
  };
}

function handleError(res, error) {
  res.status(error.statusCode || 500).json({
    error: error.message || 'Unexpected error.'
  });
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
