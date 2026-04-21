const path = require('path');

const { all, openDatabase, run } = require('../../shared/sqlite');

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS meal_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    meal_name TEXT NOT NULL,
    eaten_on TEXT NOT NULL,
    calories INTEGER NOT NULL,
    protein INTEGER NOT NULL,
    carbs INTEGER NOT NULL,
    fat INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_meal_entries_username ON meal_entries(username);
`;

function createHealthStatsStore(databasePath) {
  const dbPromise = openDatabase(databasePath, SCHEMA);

  return {
    async createMeal(username, payload) {
      const meal = normalizeMealPayload(payload);
      const db = await dbPromise;
      const result = await run(
        db,
        `
          INSERT INTO meal_entries (username, meal_name, eaten_on, calories, protein, carbs, fat)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [username, meal.mealName, meal.eatenOn, meal.calories, meal.protein, meal.carbs, meal.fat]
      );

      return {
        id: result.lastID,
        ...meal
      };
    },

    async listMeals(username) {
      const db = await dbPromise;
      return all(
        db,
        `
          SELECT
            id,
            meal_name AS mealName,
            eaten_on AS eatenOn,
            calories,
            protein,
            carbs,
            fat
          FROM meal_entries
          WHERE username = ?
          ORDER BY eaten_on DESC, id DESC
        `,
        [username]
      );
    },

    async deleteMeal(username, mealId) {
      const db = await dbPromise;
      const result = await run(db, 'DELETE FROM meal_entries WHERE username = ? AND id = ?', [
        username,
        Number(mealId)
      ]);

      return result.changes > 0;
    },

    async buildWeeklySummary(username) {
      const meals = await this.listMeals(username);
      const days = createDayBuckets();

      meals.forEach((meal) => {
        const bucket = days.find((day) => day.date === meal.eatenOn);

        if (!bucket) {
          return;
        }

        bucket.mealCount += 1;
        bucket.calories += meal.calories;
        bucket.protein += meal.protein;
        bucket.carbs += meal.carbs;
        bucket.fat += meal.fat;
      });

      return {
        totals: days.reduce(
          (totals, day) => ({
            calories: totals.calories + day.calories,
            protein: totals.protein + day.protein,
            carbs: totals.carbs + day.carbs,
            fat: totals.fat + day.fat
          }),
          { calories: 0, protein: 0, carbs: 0, fat: 0 }
        ),
        days
      };
    }
  };
}

function normalizeMealPayload(payload) {
  const mealName = String(payload.mealName || '').trim();
  const eatenOn = String(payload.eatenOn || '').trim();

  if (!mealName || !eatenOn) {
    const error = new Error('Meal name and date are required.');
    error.statusCode = 400;
    throw error;
  }

  const meal = {
    mealName,
    eatenOn,
    calories: Number(payload.calories),
    protein: Number(payload.protein),
    carbs: Number(payload.carbs),
    fat: Number(payload.fat)
  };

  for (const field of ['calories', 'protein', 'carbs', 'fat']) {
    if (!Number.isFinite(meal[field]) || meal[field] < 0) {
      const error = new Error(`Invalid ${field}.`);
      error.statusCode = 400;
      throw error;
    }
  }

  if (meal.calories <= 0) {
    const error = new Error('Calories must be greater than zero.');
    error.statusCode = 400;
    throw error;
  }

  return meal;
}

function createDayBuckets() {
  return Array.from({ length: 7 }, (_value, offset) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - offset);

    return {
      date: date.toISOString().slice(0, 10),
      mealCount: 0,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    };
  }).reverse();
}

function defaultDatabasePath() {
  return process.env.SQLITE_PATH || path.join(__dirname, '..', '..', 'data', 'health-stats.sqlite');
}

module.exports = {
  createHealthStatsStore,
  defaultDatabasePath
};
