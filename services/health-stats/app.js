const express = require('express');

const { createHealthStatsStore, defaultDatabasePath } = require('./store');

function createHealthStatsApp(options = {}) {
  const store = createHealthStatsStore(options.databasePath || defaultDatabasePath());
  const app = express();

  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'health-stats' });
  });

  app.get('/users/:username/meals', async (req, res) => {
    const meals = await store.listMeals(req.params.username);
    res.json({ meals });
  });

  app.post('/users/:username/meals', async (req, res) => {
    try {
      const meal = await store.createMeal(req.params.username, req.body);
      res.status(201).json({ meal });
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete('/users/:username/meals/:id', async (req, res) => {
    const deleted = await store.deleteMeal(req.params.username, req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: 'Meal not found.' });
    }

    return res.json({ ok: true });
  });

  app.get('/users/:username/summary/weekly', async (req, res) => {
    const summary = await store.buildWeeklySummary(req.params.username);
    res.json({ summary });
  });

  return app;
}

function handleError(res, error) {
  res.status(error.statusCode || 500).json({
    error: error.message || 'Unexpected error.'
  });
}

module.exports = {
  createHealthStatsApp
};
