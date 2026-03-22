function buildWeeklySummary(meals) {
  const days = Array.from({ length: 7 }, (_, offset) => {
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

module.exports = {
  buildWeeklySummary
};
