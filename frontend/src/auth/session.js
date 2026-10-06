// Auth layer for VFMS. Matches SDD 2.6/4.2: a separate Go service owns
// credentials and issues signed JWTs. This module is the only place that
// talks to that service or touches token storage.
//
// Tokens live in sessionStorage (not pure memory) because VFMS is a
// multi-page app — separate HTML documents, not client-side routes — so
// in-memory state would be wiped on every navigation.

const AUTH_BASE_URL = import.meta.env.VITE_AUTH_BASE_URL ?? '/auth';
const ACCESS_TOKEN_KEY = 'vfms.accessToken';
const REFRESH_TOKEN_KEY = 'vfms.refreshToken';

function decodeJwtPayload(token) {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

let accessToken = sessionStorage.getItem(ACCESS_TOKEN_KEY);
let accessTokenPayload = accessToken ? decodeJwtPayload(accessToken) : null;

function setSession({ accessToken: newAccessToken, refreshToken }) {
  accessToken = newAccessToken;
  accessTokenPayload = decodeJwtPayload(newAccessToken);
  sessionStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
  if (refreshToken) sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
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

/** True if the signed-in user's role is Staff — used to hide driver licence
 * numbers and other restricted fields client-side (NFR13/POPIA). The real
 * enforcement is server-side (DriverPublicOut vs DriverOut); this is just
 * so the UI doesn't show an empty field oddly or offer actions staff can't
 * actually perform. */
export function isStaff() {
  const user = getCurrentUser();
  return (user?.role ?? '').toLowerCase() === 'staff';
}

export function isAuthenticated() {
  const user = getCurrentUser();
  if (!user) return false;
  if (user.expiresAt && Date.now() >= user.expiresAt) return false;
  return true;
}

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
    throw new AuthError("Can't reach the sign-in service. Check your connection and try again.", 0);
  }
  if (response.status === 401) throw new AuthError('Incorrect username or password.', 401);
  if (!response.ok) throw new AuthError('Sign-in failed. Please try again shortly.', response.status);

  const data = await response.json();
  setSession({ accessToken: data.access_token, refreshToken: data.refresh_token });
  return getCurrentUser();
}

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
  setSession({ accessToken: data.access_token, refreshToken: data.refresh_token ?? refreshToken });
  return true;
}

export function logout() {
  clearSession();
  window.location.href = '/index.html';
}
