const welcomeHeading = document.getElementById('welcome-heading');
const welcomeCopy = document.getElementById('welcome-copy');
const actions = document.getElementById('home-actions');

function renderButtons(buttons) {
  actions.innerHTML = buttons
    .map(
      ({ href, label, secondary }) =>
        `<a class="button-link${secondary ? ' secondary' : ''}" href="${href}">${label}</a>`
    )
    .join('');
}

async function loadHome() {
  const response = await fetch('/api/session');
  const data = await response.json();

  if (data.authenticated) {
    welcomeHeading.textContent = `Welcome back, ${data.user.displayName}`;
    welcomeCopy.textContent = 'Open the tracker to add meals and review this week’s totals.';
    renderButtons([
      { href: '/tracker', label: 'Open Tracker' }
    ]);
    return;
  }

  welcomeHeading.textContent = 'Sign in to use the tracker';
  welcomeCopy.textContent = 'Track meals and review your weekly nutrition summary.';
  renderButtons([
    { href: '/login', label: 'Login' },
    { href: '/signup', label: 'Create Account', secondary: true }
  ]);
}

loadHome().catch(() => {
  welcomeHeading.textContent = 'Unable to load app state';
  welcomeCopy.textContent = 'Start the server and refresh the page.';
});
