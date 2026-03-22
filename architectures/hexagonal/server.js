const path = require('path');
const express = require('express');
const dotenv = require('dotenv');

const { openDatabase } = require('../common/sqlite');
const createAuthUseCases = require('./application/auth-use-cases');
const createMealUseCases = require('./application/meal-use-cases');
const createSqliteAuthRepository = require('./adapters/persistence/sqlite-auth-repository');
const createSqliteMealRepository = require('./adapters/persistence/sqlite-meal-repository');
const createSessionMiddleware = require('./adapters/http/session-middleware');
const registerRoutes = require('./adapters/http/routes');

dotenv.config();

const ARCHITECTURE = 'Hexagonal Architecture';
const PORT = process.env.PORT || 3103;
const DATABASE_PATH = process.env.SQLITE_PATH || path.join(__dirname, '..', '..', 'data', 'hexagonal.sqlite');
const PUBLIC_DIR = path.join(__dirname, '..', 'common', 'public');

async function start() {
  const db = await openDatabase(DATABASE_PATH);
  const authRepository = createSqliteAuthRepository(db);
  const mealRepository = createSqliteMealRepository(db);
  const authUseCases = createAuthUseCases(authRepository);
  const mealUseCases = createMealUseCases(mealRepository);
  const app = express();

  app.use(express.json());
  app.use(express.static(PUBLIC_DIR));
  app.use(createSessionMiddleware(authUseCases));

  registerRoutes({
    app,
    architectureName: ARCHITECTURE,
    authUseCases,
    mealUseCases,
    publicDir: PUBLIC_DIR
  });

  app.listen(PORT, () => {
    console.log(`${ARCHITECTURE} running at http://localhost:${PORT}`);
  });
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
