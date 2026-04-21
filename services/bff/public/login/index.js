const form = document.getElementById('login-form');
const message = document.getElementById('message');
const architectureLabel = document.getElementById('architecture-label');

async function loadArchitecture() {
  const response = await fetch('/api/session');
  const data = await response.json();
  architectureLabel.textContent = `Architecture: ${data.architecture}`;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  message.textContent = '';

  const response = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: form.username.value.trim(),
      password: form.password.value
    })
  });

  const data = await response.json();

  if (!response.ok) {
    message.textContent = data.error || 'Unable to login.';
    return;
  }

  window.location.href = '/tracker';
});

loadArchitecture().catch(() => {
  architectureLabel.textContent = 'Architecture unavailable';
});
