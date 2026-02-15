const loginBtn = document.getElementById('login-btn');
const accountBtn = document.getElementById('account-btn');
const LOGIN_KEY = 'isLoggedIn';

function isLoggedIn() {
  return localStorage.getItem(LOGIN_KEY) === 'true';
}

function renderAuthState() {
  const loggedIn = isLoggedIn();
  loginBtn.textContent = loggedIn ? 'Log out' : 'Login';
  accountBtn.hidden = !loggedIn;
}

loginBtn.addEventListener('click', () => {
  if (!isLoggedIn()) {
    window.location.href = '/login';
    return;
  }

  localStorage.removeItem(LOGIN_KEY);
  localStorage.removeItem('username');
  localStorage.removeItem('display_name');
  renderAuthState();
});

accountBtn.addEventListener('click', () => {
  window.location.href = '/account';
});

renderAuthState();
