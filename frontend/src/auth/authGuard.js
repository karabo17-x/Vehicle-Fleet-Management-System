// Route guard for pages that require a signed-in user.
//
// Call requireAuth() at the top of any protected page's <name>.page.js.
// If there's no valid session, it redirects to the login screen and
// returns false so the calling page can stop running its own setup code.

import { isAuthenticated } from './session.js';

export function requireAuth(redirectTo = '/index.html') {
  if (!isAuthenticated()) {
    window.location.href = redirectTo;
    return false;
  }
  return true;
}
