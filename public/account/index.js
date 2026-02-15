const LOGIN_KEY = 'isLoggedIn';
const usernameEl = document.getElementById('username-value');
const displayNameEl = document.getElementById('display-name-value');
const homeBtn = document.getElementById('home-btn');
const changePasswordBtn = document.getElementById('change-password-btn');

function isLoggedIn() {
  return localStorage.getItem(LOGIN_KEY) === 'true';
}

if (!isLoggedIn()) {
  window.location.href = '/';
} else {
  usernameEl.textContent = localStorage.getItem('username') || '';
  displayNameEl.textContent = localStorage.getItem('display_name') || '';
}

homeBtn.addEventListener('click', () => {
  window.location.href = '/';
});

changePasswordBtn.addEventListener('click', () => {
  window.alert('Change password flow not implemented yet.');
});
