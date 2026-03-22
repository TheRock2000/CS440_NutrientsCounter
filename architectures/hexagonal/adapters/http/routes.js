const path = require('path');
const { parseCookies, SESSION_COOKIE } = require('../../../common/security');

function registerRoutes({
  app,
  architectureName,
  authUseCases,
  mealUseCases,
  publicDir
}) {
  app.get('/', sendPage(publicDir, 'home/index.html'));
  app.get('/login', sendPage(publicDir, 'login/index.html'));
  app.get('/signup', sendPage(publicDir, 'signup/index.html'));
  app.get('/tracker', sendPage(publicDir, 'tracker/index.html'));

  app.get('/api/session', (req, res) => {
    res.json({
      architecture: architectureName,
      authenticated: Boolean(req.currentUser),
      user: req.currentUser || null
    });
  });

  app.post('/api/signup', async (req, res) => {
    try {
      const result = await authUseCases.register(req.body);
      res.setHeader('Set-Cookie', result.cookie);
      res.status(201).json({ user: result.user });
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post('/api/login', async (req, res) => {
    try {
      const result = await authUseCases.login(req.body);
      res.setHeader('Set-Cookie', result.cookie);
      res.json({ user: result.user });
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post('/api/logout', async (req, res) => {
    const cookies = parseCookies(req.headers.cookie);
    const clearedCookie = await authUseCases.logout(cookies[SESSION_COOKIE]);
    res.setHeader('Set-Cookie', clearedCookie);
    res.json({ ok: true });
  });

  app.get('/api/meals', requireUser, async (req, res) => {
    const meals = await mealUseCases.listMeals(req.currentUser.username);
    res.json({ meals });
  });

  app.post('/api/meals', requireUser, async (req, res) => {
    try {
      await mealUseCases.addMeal(req.currentUser.username, req.body);
      res.status(201).json({ ok: true });
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete('/api/meals/:id', requireUser, async (req, res) => {
    try {
      await mealUseCases.deleteMeal(req.currentUser.username, req.params.id);
      res.json({ ok: true });
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/summary/weekly', requireUser, async (req, res) => {
    const summary = await mealUseCases.weeklySummary(req.currentUser.username);
    res.json({ summary });
  });
}

function sendPage(publicDir, relativePath) {
  return (_req, res) => {
    res.sendFile(path.join(publicDir, relativePath));
  };
}

function requireUser(req, res, next) {
  if (!req.currentUser) {
    res.status(401).json({ error: 'Login required.' });
    return;
  }

  next();
}

function handleError(res, error) {
  res.status(error.statusCode || 500).json({
    error: error.message || 'Unexpected error.'
  });
}

module.exports = registerRoutes;
