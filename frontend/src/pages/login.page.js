

import { login, isAuthenticated } from '../auth/session.js';

export function render(container) {
  // Already logged in: go straight to the dashboard
  if (isAuthenticated()) {
    window.location.hash = '#/dashboard';
    return;
  }

  // Static markup only. No API data is placed in here.
  container.innerHTML = `
    <div class="login-page">
      <div class="login-intro">
        <a class="login-brand" href="#/home">
          <img src="/images/vehicle-mark.png" alt="" />
          <span><strong>Vehicle Fleet</strong><small>MANAGEMENT SYSTEM</small></span>
        </a>
        <div class="login-message">
          <p class="login-eyebrow">FLEET OPERATIONS</p>
          <h1>A clear view of the vehicles your team depends on.</h1>
          <p>Manage vehicle records, driver assignments, and maintenance details in one workspace.</p>
          <ul class="login-features" aria-label="Fleet workspace features">
            <li><span>01</span><div><strong>Vehicle records</strong><small>Cars, vans, and trucks</small></div></li>
            <li><span>02</span><div><strong>Driver assignments</strong><small>Profiles and licence details</small></div></li>
            <li><span>03</span><div><strong>Maintenance history</strong><small>Service dates and costs</small></div></li>
          </ul>
        </div>
        <a class="login-home-link" href="#/home">Back to home</a>
      </div>

      <section class="card login-card" aria-labelledby="login-title">
        <p class="login-card-kicker">YOUR WORKSPACE</p>
        <h2 id="login-title">Welcome back</h2>
        <p class="muted">Log in to manage your fleet.</p>
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
      </section>
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
