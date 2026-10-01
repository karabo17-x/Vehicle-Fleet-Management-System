/***
 * backend/app/routers/drivers.py
 * drivers object in list/get responses depends on the callers role(backend/app/routers/drivers.py)
 * 
 */


import { get, post } from './client.js';

const BASE = '/api/drivers';

/** Build "?a=1&b=2" and skip empty values. */
function toQuery(params) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, value);
    }
  });
  const text = query.toString();
  return text ? `?${text}` : '';
}

/**
 * GET /drivers
 * options: { search, status, skip, limit }
 * Returns { items, total, skip, limit }
 */
export function listDrivers({ search, status, skip = 0, limit = 50 } = {}) {
  return get(`${BASE}${toQuery({ search, status, skip, limit })}`);
}

/** POST /drivers  (manager/admin only) */
export function createDriver(payload) {
  return post(BASE, payload);
}