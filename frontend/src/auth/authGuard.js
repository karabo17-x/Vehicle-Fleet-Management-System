// Route guard for pages that require a signed-in user.
// Call requireAuth() at the top of any protected page's <name>.page.js.

import { isAuthenticated } from './session.js';

export function requireAuth(redirectTo = '/index.html') {
  // Dev-only preview: visit a page with ?demo while running `npm run dev`
  // to see it without a backend running.
  if (import.meta.env.DEV && new URLSearchParams(location.search).has('demo')) {
    return true;
  }
  if (!isAuthenticated()) {
    window.location.href = redirectTo;
    return false;
  }
  return true;
}
