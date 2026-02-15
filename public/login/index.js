const form = document.getElementById('login-form');
const homeBtn = document.getElementById('home-btn');
const signUpBtn = document.getElementById('signup-btn');
const message = document.getElementById('message');

homeBtn.addEventListener('click', () => {
  window.location.href = '/';
});

signUpBtn.addEventListener('click', () => {
  window.location.href = '/signup';
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const username = form.username.value.trim();
  const password = form.password.value;

  const response = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await response.json();

  if (!response.ok) {
    message.textContent = data.error || 'Login failed';
    return;
  }

  localStorage.setItem('isLoggedIn', 'true');
  localStorage.setItem('username', data.user.username);
  localStorage.setItem('display_name', data.user.display_name);
  window.location.href = '/';
});
