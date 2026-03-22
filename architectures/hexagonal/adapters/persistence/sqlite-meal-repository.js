const { all, run } = require('../../../common/sqlite');

function createSqliteMealRepository(db) {
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

    async deleteMeal(username, mealId) {
      const result = await run(
        db,
        'DELETE FROM meal_entries WHERE id = ? AND username = ?',
        [mealId, username]
      );

      return result.changes > 0;
    }
  };
}

module.exports = createSqliteMealRepository;
