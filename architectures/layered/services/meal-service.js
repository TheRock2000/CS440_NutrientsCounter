function createMealService(mealRepository) {
  return {
    async createMeal(username, payload) {
      validateMealPayload(payload);

      await mealRepository.createMeal({
        username,
        mealName: payload.mealName.trim(),
        eatenOn: payload.eatenOn,
        calories: Number(payload.calories),
        protein: Number(payload.protein),
        carbs: Number(payload.carbs),
        fat: Number(payload.fat)
      });
    },

    async listMeals(username) {
      return mealRepository.listRecentMeals(username);
    },

    async deleteMeal(username, mealId) {
      const deleted = await mealRepository.deleteMeal(username, Number(mealId));

      if (!deleted) {
        const error = new Error('Meal not found.');
        error.statusCode = 404;
        throw error;
      }
    },

    async buildWeeklySummary(username) {
      const meals = await mealRepository.listRecentMeals(username);
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

function createDayBuckets() {
  return Array.from({ length: 7 }, (_, offset) => {
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

function validateMealPayload(payload) {
  if (!payload.mealName || !payload.eatenOn) {
    const error = new Error('Meal name and date are required.');
    error.statusCode = 400;
    throw error;
  }

  const numericFields = ['calories', 'protein', 'carbs', 'fat'];

  for (const field of numericFields) {
    if (!Number.isFinite(Number(payload[field])) || Number(payload[field]) < 0) {
      const error = new Error(`Invalid ${field}.`);
      error.statusCode = 400;
      throw error;
    }
  }

  if (Number(payload.calories) <= 0) {
    const error = new Error('Calories must be greater than zero.');
    error.statusCode = 400;
    throw error;
  }
}

module.exports = createMealService;
