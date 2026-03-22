const { all, run } = require('../../common/sqlite');

function createMealModel(db) {
  return {
    async addMeal({ username, mealName, eatenOn, calories, protein, carbs, fat }) {
      await run(
        db,
        `
          INSERT INTO meal_entries (username, meal_name, eaten_on, calories, protein, carbs, fat)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [username, mealName, eatenOn, calories, protein, carbs, fat]
      );
    },

    async deleteMeal(username, mealId) {
      const result = await run(
        db,
        'DELETE FROM meal_entries WHERE id = ? AND username = ?',
        [Number(mealId), username]
      );

      return result.changes > 0;
    },

    async listMeals(username) {
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

    async getWeeklySummary(username) {
      const rows = await all(
        db,
        `
          SELECT
            eaten_on AS date,
            COUNT(*) AS mealCount,
            COALESCE(SUM(calories), 0) AS calories,
            COALESCE(SUM(protein), 0) AS protein,
            COALESCE(SUM(carbs), 0) AS carbs,
            COALESCE(SUM(fat), 0) AS fat
          FROM meal_entries
          WHERE username = ? AND eaten_on >= date('now', '-6 days')
          GROUP BY eaten_on
          ORDER BY eaten_on
        `,
        [username]
      );

      const days = Array.from({ length: 7 }, (_, offset) => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() - offset);
        const isoDate = date.toISOString().slice(0, 10);
        const row = rows.find((entry) => entry.date === isoDate);

        return {
          date: isoDate,
          mealCount: row ? row.mealCount : 0,
          calories: row ? row.calories : 0,
          protein: row ? row.protein : 0,
          carbs: row ? row.carbs : 0,
          fat: row ? row.fat : 0
        };
      }).reverse();

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

module.exports = createMealModel;
