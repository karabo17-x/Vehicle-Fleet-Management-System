// Auth layer for VFMS.
//
// Matches the SDD (section 2.6 / 4.2): a separate Go service owns
// credentials and issues signed JWTs. This module is the ONLY place that
// talks to that service or touches token storage — nothing else in the
// frontend should read/write tokens directly.
//
// Token storage strategy:
//   - VFMS is a multi-page app (index.html, dashboard.html, ... are
//     separate documents, not client-side routes), so a plain in-memory
//     variable would be wiped on every navigation and log the user out
//     between pages. Both tokens are therefore kept in sessionStorage:
//     they survive navigation and reload, but are cleared when the tab
//     closes.
//   - This is weaker than the "access token in memory, refresh token in an
//     httpOnly cookie" pattern used in single-page apps — sessionStorage is
//     readable by any script on the page, so it's vulnerable to XSS. If the
//     team later moves to an SPA shell, or the Go auth service adds an
//     httpOnly cookie option, tighten this. For now, keep this the only
//     module that touches storage, so that upgrade only has to happen here.

const AUTH_BASE_URL = import.meta.env.VITE_AUTH_BASE_URL ?? '/auth';
const ACCESS_TOKEN_KEY = 'vfms.accessToken';
const REFRESH_TOKEN_KEY = 'vfms.refreshToken';

let accessToken = sessionStorage.getItem(ACCESS_TOKEN_KEY);
let accessTokenPayload = accessToken ? decodeJwtPayload(accessToken) : null; // decoded JWT claims, e.g. { sub, role, exp }

/** Decode a JWT payload without verifying the signature (verification is
 * the backend's job — this is only so the UI can read role/exp for display
 * and routing decisions). */
function decodeJwtPayload(token) {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function setSession({ accessToken: newAccessToken, refreshToken }) {
  accessToken = newAccessToken;
  accessTokenPayload = decodeJwtPayload(newAccessToken);
  sessionStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
  if (refreshToken) {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export function clearSession() {
  accessToken = null;
  accessTokenPayload = null;
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function getAccessToken() {
  return accessToken;
}

export function getCurrentUser() {
  if (!accessTokenPayload) return null;
  return {
    id: accessTokenPayload.sub,
    role: accessTokenPayload.role,
    expiresAt: accessTokenPayload.exp ? accessTokenPayload.exp * 1000 : null,
  };
}

export function isAuthenticated() {
  const user = getCurrentUser();
  if (!user) return false;
  if (user.expiresAt && Date.now() >= user.expiresAt) return false;
  return true;
}

/**
 * Custom error so callers can distinguish "wrong password" from
 * "network/server problem" and show the right message.
 */
export class AuthError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
  }
}

export async function login(username, password) {
  let response;
  try {
    response = await fetch(`${AUTH_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
  } catch {
    throw new AuthError(
      "Can't reach the sign-in service. Check your connection and try again.",
      0,
    );
  }

  if (response.status === 401) {
    throw new AuthError('Incorrect username or password.', 401);
  }
  if (!response.ok) {
    throw new AuthError('Sign-in failed. Please try again shortly.', response.status);
  }

  const data = await response.json();
  // Expected shape from the Go auth service: { access_token, refresh_token }
  setSession({
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
  });
  return getCurrentUser();
}

/** Exchange the stored refresh token for a new access token. Returns false
 * (and clears the session) if the refresh token is missing or rejected, so
 * the caller can redirect to the login screen. */
export async function refreshAccessToken() {
  const refreshToken = sessionStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) return false;

  let response;
  try {
    response = await fetch(`${AUTH_BASE_URL}/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  } catch {
    return false;
  }

  if (!response.ok) {
    clearSession();
    return false;
  }

  const data = await response.json();
  setSession({
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? refreshToken,
  });
  return true;
}

export function logout() {
  clearSession();
  window.location.href = '/index.html';
}
