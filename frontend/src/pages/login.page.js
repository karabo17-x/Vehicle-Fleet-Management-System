

import { login, isAuthenticated } from '../auth/session.js';

export function render(container) {
  // Already logged in: go straight to the dashboard
  if (isAuthenticated()) {
    window.location.hash = '#/dashboard';
    return;
  }

  // Static markup only. No API data is placed in here.
  container.innerHTML = `
    <div class="card login-card">
      <h1>VFMS Login</h1>
      <p class="muted">Vehicle Fleet Management System</p>
      <div class="message error hidden" data-error></div>
      <form data-form novalidate>
        <div class="form-row">
          <label for="email">Email</label>
          <input id="email" name="email" type="email" autocomplete="username" required>
        </div>
        <div class="form-row">
          <label for="password">Password</label>
          <input id="password" name="password" type="password" autocomplete="current-password" required>
        </div>
        <button type="submit" data-submit>Log in</button>
      </form>
    </div>
  `;

  const form = container.querySelector('[data-form]');
  const errorBox = container.querySelector('[data-error]');
  const submitButton = container.querySelector('[data-submit]');

  function showError(text) {
    errorBox.textContent = text; // textContent, never innerHTML
    errorBox.classList.remove('hidden');
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorBox.classList.add('hidden');

    const email = form.email.value.trim();
    const password = form.password.value;

    if (!email || !password) {
      showError('Please enter your email and password.');
      return;
    }

    // In flight: disable the button and show progress
    submitButton.disabled = true;
    submitButton.textContent = 'Logging in...';

    try {
      await login(email, password);
      window.location.hash = '#/dashboard'; // success
    } catch (error) {
      showError(error.message || 'Login failed.'); // failure: form stays filled
      submitButton.disabled = false;
      submitButton.textContent = 'Log in';
    }
  });
}