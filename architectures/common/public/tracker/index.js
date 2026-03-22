const architectureLabel = document.getElementById('architecture-label');
const trackerHeading = document.getElementById('tracker-heading');
const logoutButton = document.getElementById('logout-button');
const mealForm = document.getElementById('meal-form');
const mealMessage = document.getElementById('meal-message');
const mealList = document.getElementById('meal-list');
const summaryGrid = document.getElementById('summary-grid');
const dailySummary = document.getElementById('daily-summary');

mealForm.eatenOn.value = new Date().toISOString().slice(0, 10);

function renderSummary(summary) {
  summaryGrid.innerHTML = [
    ['Calories', summary.totals.calories],
    ['Protein', `${summary.totals.protein} g`],
    ['Carbs', `${summary.totals.carbs} g`],
    ['Fat', `${summary.totals.fat} g`]
  ]
    .map(
      ([label, value]) =>
        `<div class="summary-card"><strong>${label}</strong><span>${value}</span></div>`
    )
    .join('');

  dailySummary.innerHTML = summary.days
    .map(
      (day) =>
        `<li class="meal-item"><div><strong>${day.date}</strong><span>${day.mealCount} meals</span></div><div>${day.calories} cal | P ${day.protein} / C ${day.carbs} / F ${day.fat}</div></li>`
    )
    .join('');
}

function renderMeals(meals) {
  if (meals.length === 0) {
    mealList.innerHTML = '<li class="meal-item"><div>No meals logged yet.</div></li>';
    return;
  }

  mealList.innerHTML = meals
    .map(
      (meal) => `
        <li class="meal-item">
          <div>
            <strong>${meal.mealName}</strong>
            <span>${meal.eatenOn} | ${meal.calories} cal | P ${meal.protein} / C ${meal.carbs} / F ${meal.fat}</span>
          </div>
          <button type="button" class="danger" data-id="${meal.id}">Delete</button>
        </li>
      `
    )
    .join('');
}

async function loadTracker() {
  const sessionResponse = await fetch('/api/session');
  const sessionData = await sessionResponse.json();

  if (!sessionData.authenticated) {
    window.location.href = '/login';
    return;
  }

  architectureLabel.textContent = `Architecture: ${sessionData.architecture}`;
  trackerHeading.textContent = `${sessionData.user.displayName}'s Tracker`;

  const [mealsResponse, summaryResponse] = await Promise.all([
    fetch('/api/meals'),
    fetch('/api/summary/weekly')
  ]);

  const meals = await mealsResponse.json();
  const summary = await summaryResponse.json();
  renderMeals(meals.meals);
  renderSummary(summary.summary);
}

mealForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  mealMessage.textContent = '';

  const response = await fetch('/api/meals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mealName: mealForm.mealName.value.trim(),
      eatenOn: mealForm.eatenOn.value,
      calories: Number(mealForm.calories.value),
      protein: Number(mealForm.protein.value),
      carbs: Number(mealForm.carbs.value),
      fat: Number(mealForm.fat.value)
    })
  });

  const data = await response.json();

  if (!response.ok) {
    mealMessage.textContent = data.error || 'Unable to save meal.';
    return;
  }

  mealForm.reset();
  mealForm.eatenOn.value = new Date().toISOString().slice(0, 10);
  mealMessage.textContent = 'Meal saved.';
  mealMessage.classList.add('success');
  await loadTracker();
});

mealList.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-id]');

  if (!button) {
    return;
  }

  await fetch(`/api/meals/${button.dataset.id}`, {
    method: 'DELETE'
  });

  await loadTracker();
});

logoutButton.addEventListener('click', async () => {
  await fetch('/api/logout', { method: 'POST' });
  window.location.href = '/';
});

loadTracker().catch(() => {
  architectureLabel.textContent = 'Architecture unavailable';
});
