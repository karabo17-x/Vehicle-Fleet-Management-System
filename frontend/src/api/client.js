// Shared fetch wrapper for the FastAPI backend (vehicles/drivers/maintenance).
// Every other API module (vehicles.js, drivers.js, etc., once they exist)
// should call `apiFetch` instead of `fetch` directly, so token attachment
// and expiry handling live in exactly one place.

import { getAccessToken, refreshAccessToken, logout } from '../auth/session.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

export class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

async function doFetch(path, options) {
  const token = getAccessToken();
  const headers = new Headers(options.headers ?? {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(`${API_BASE_URL}${path}`, { ...options, headers });
}

/**
 * Fetch wrapper that:
 *  1. Attaches the current access token.
 *  2. On a 401 (expired token), tries ONE silent refresh, then retries the
 *     request once. If that also fails, logs the user out and sends them
 *     back to the login screen.
 */
export async function apiFetch(path, options = {}) {
  let response = await doFetch(path, options);

  if (response.status === 401) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      logout();
      throw new ApiError('Session expired. Please sign in again.', 401);
    }
    response = await doFetch(path, options);
  }

  if (!response.ok) {
    let body = null;
    try {
      body = await response.json();
    } catch {
      /* response had no JSON body */
    }
    throw new ApiError(
      body?.detail ?? `Request failed (${response.status}).`,
      response.status,
      body,
    );
  }

  if (response.status === 204) return null;
  return response.json();
}
