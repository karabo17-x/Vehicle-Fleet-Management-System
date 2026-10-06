import { login, AuthError, isAuthenticated } from '../auth/session.js';

if (isAuthenticated()) {
  window.location.href = '/dashboard.html';
}

const form = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const submitBtn = document.getElementById('submit-btn');
const errorBox = document.getElementById('form-error');
const errorText = document.getElementById('form-error-text');

function showError(message) {
  errorText.textContent = message;
  errorBox.dataset.visible = 'true';
}

function clearError() {
  errorBox.dataset.visible = 'false';
  usernameInput.removeAttribute('aria-invalid');
  passwordInput.removeAttribute('aria-invalid');
}

function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  submitBtn.dataset.loading = String(isLoading);
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearError();

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if (!username || !password) {
    showError('Enter both your username and password.');
    if (!username) usernameInput.setAttribute('aria-invalid', 'true');
    if (!password) passwordInput.setAttribute('aria-invalid', 'true');
    return;
  }

  setLoading(true);
  try {
    await login(username, password);
    window.location.href = '/dashboard.html';
  } catch (err) {
    if (err instanceof AuthError) {
      showError(err.message);
      if (err.status === 401) {
        usernameInput.setAttribute('aria-invalid', 'true');
        passwordInput.setAttribute('aria-invalid', 'true');
        passwordInput.value = '';
        passwordInput.focus();
      }
    } else {
      showError('Something went wrong. Please try again.');
    }
  } finally {
    setLoading(false);
  }
});
