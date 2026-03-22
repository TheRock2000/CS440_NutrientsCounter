function createMealController(mealModel) {
  return {
    list: async (req, res) => {
      const meals = await mealModel.listMeals(req.currentUser.username);
      res.json({ meals });
    },

    create: async (req, res) => {
      const { mealName, eatenOn, calories, protein, carbs, fat } = req.body;

      if (!mealName || !eatenOn) {
        res.status(400).json({ error: 'Meal name and date are required.' });
        return;
      }

      const numbers = {
        calories: Number(calories),
        protein: Number(protein),
        carbs: Number(carbs),
        fat: Number(fat)
      };

      if (numbers.calories <= 0 || Object.values(numbers).some((value) => !Number.isFinite(value) || value < 0)) {
        res.status(400).json({ error: 'Invalid nutrition values.' });
        return;
      }

      await mealModel.addMeal({
        username: req.currentUser.username,
        mealName: mealName.trim(),
        eatenOn,
        ...numbers
      });

      res.status(201).json({ ok: true });
    },

    remove: async (req, res) => {
      const deleted = await mealModel.deleteMeal(req.currentUser.username, req.params.id);

      if (!deleted) {
        res.status(404).json({ error: 'Meal not found.' });
        return;
      }

      res.json({ ok: true });
    },

    weeklySummary: async (req, res) => {
      const summary = await mealModel.getWeeklySummary(req.currentUser.username);
      res.json({ summary });
    }
  };
}

module.exports = createMealController;
