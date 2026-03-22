const { buildWeeklySummary } = require('../domain/summary');
const { validateMealInput } = require('../domain/validators');

function createMealUseCases(mealRepository) {
  return {
    async addMeal(username, payload) {
      const meal = validateMealInput(payload);
      await mealRepository.addMeal({ username, ...meal });
    },

    async listMeals(username) {
      return mealRepository.listMeals(username);
    },

    async deleteMeal(username, mealId) {
      const deleted = await mealRepository.deleteMeal(username, Number(mealId));

      if (!deleted) {
        const error = new Error('Meal not found.');
        error.statusCode = 404;
        throw error;
      }
    },

    async weeklySummary(username) {
      const meals = await mealRepository.listMeals(username);
      return buildWeeklySummary(meals);
    }
  };
}

module.exports = createMealUseCases;
