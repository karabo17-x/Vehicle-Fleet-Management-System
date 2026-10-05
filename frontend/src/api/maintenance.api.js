
import { get, post, del } from './client.js';

const BASE = '/maintenance';

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
 * GET /maintenance
 * options: { vehicleId, skip, limit }
 * Returns { items, total, skip, limit }
 */
export function listMaintenance({ vehicleId, skip = 0, limit = 50 } = {}) {
  return get(`${BASE}${toQuery({ vehicle_id: vehicleId, skip, limit })}`);
}

/** GET /maintenance/{record_id} */
export function getMaintenance(recordId) {
  return get(`${BASE}/${recordId}`);
}

/** POST /maintenance */
export function logMaintenance(payload) {
  return post(BASE, payload);
}

/** DELETE /maintenance/{record_id} */
export function deleteMaintenance(recordId) {
  return del(`${BASE}/${recordId}`);
}