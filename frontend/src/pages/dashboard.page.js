import { requireAuth } from '../auth/authGuard.js';
import { getCurrentUser, logout } from '../auth/session.js';

// Feature 6: dashboard shows expiring items directly, no separate service —
// per the team's README, that logic will live here once the real API calls
// are wired in (vehicles.api.js / drivers.api.js).

if (requireAuth()) {
  const user = getCurrentUser();
  document.getElementById('welcome').textContent = user?.role
    ? `Signed in as: ${user.role}`
    : 'Signed in.';

  document.getElementById('logout-btn').addEventListener('click', logout);
}
