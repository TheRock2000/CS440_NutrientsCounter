function validateCredentials({ username, password, displayName }, { requireDisplayName = false } = {}) {
  if (!username || !password || (requireDisplayName && !displayName)) {
    const error = new Error(
      requireDisplayName
        ? 'Display name, username, and password are required.'
        : 'Username and password are required.'
    );
    error.statusCode = 400;
    throw error;
  }

  if (password.length < 6) {
    const error = new Error('Password must be at least 6 characters.');
    error.statusCode = 400;
    throw error;
  }
}

function validateMealInput(payload) {
  if (!payload.mealName || !payload.eatenOn) {
    const error = new Error('Meal name and date are required.');
    error.statusCode = 400;
    throw error;
  }

  const numbers = ['calories', 'protein', 'carbs', 'fat'].map((field) => Number(payload[field]));

  if (!Number.isFinite(numbers[0]) || numbers[0] <= 0 || numbers.slice(1).some((value) => !Number.isFinite(value) || value < 0)) {
    const error = new Error('Invalid nutrition values.');
    error.statusCode = 400;
    throw error;
  }

  return {
    mealName: payload.mealName.trim(),
    eatenOn: payload.eatenOn,
    calories: numbers[0],
    protein: numbers[1],
    carbs: numbers[2],
    fat: numbers[3]
  };
}

module.exports = {
  validateCredentials,
  validateMealInput
};
