const form = document.getElementById('signup-form');
const loginBtn = document.getElementById('login-btn');
const message = document.getElementById('message');

loginBtn.addEventListener('click', () => {
  window.location.href = '/login';
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const payload = {
    username: form.username.value.trim(),
    password: form.password.value,
    display_name: form.display_name.value.trim()
  };

  const response = await fetch('/api/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    message.textContent = data.error || 'Sign up failed';
    return;
  }

  message.textContent = 'Account created. Redirecting to login...';
  setTimeout(() => {
    window.location.href = '/login';
  }, 700);
});
