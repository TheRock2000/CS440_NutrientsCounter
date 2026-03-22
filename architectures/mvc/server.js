const path = require('path');
const express = require('express');
const dotenv = require('dotenv');

const { openDatabase } = require('../common/sqlite');
const createAuthModel = require('./models/auth-model');
const createMealModel = require('./models/meal-model');
const createAuthController = require('./controllers/auth-controller');
const createMealController = require('./controllers/meal-controller');
const createPageController = require('./controllers/page-controller');

dotenv.config();

const ARCHITECTURE = 'MVC Architecture';
const PORT = process.env.PORT || 3102;
const DATABASE_PATH = process.env.SQLITE_PATH || path.join(__dirname, '..', '..', 'data', 'mvc.sqlite');
const PUBLIC_DIR = path.join(__dirname, '..', 'common', 'public');

async function start() {
  const db = await openDatabase(DATABASE_PATH);
  const authModel = createAuthModel(db);
  const mealModel = createMealModel(db);
  const authController = createAuthController(authModel, ARCHITECTURE);
  const mealController = createMealController(mealModel);
  const pageController = createPageController(PUBLIC_DIR);
  const app = express();

  app.use(express.json());
  app.use(express.static(PUBLIC_DIR));
  app.use(authController.loadCurrentUser);

  app.get('/', pageController.home);
  app.get('/login', pageController.login);
  app.get('/signup', pageController.signup);
  app.get('/tracker', pageController.tracker);

  app.get('/api/session', authController.session);
  app.post('/api/signup', authController.signup);
  app.post('/api/login', authController.login);
  app.post('/api/logout', authController.logout);

  app.get('/api/meals', requireUser, mealController.list);
  app.post('/api/meals', requireUser, mealController.create);
  app.delete('/api/meals/:id', requireUser, mealController.remove);
  app.get('/api/summary/weekly', requireUser, mealController.weeklySummary);

  app.listen(PORT, () => {
    console.log(`${ARCHITECTURE} running at http://localhost:${PORT}`);
  });
}

function requireUser(req, res, next) {
  if (!req.currentUser) {
    res.status(401).json({ error: 'Login required.' });
    return;
  }

  next();
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
