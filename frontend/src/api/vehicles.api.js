
import { get, post, patch, del } from './client.js';

const BASE = '/api/vehicles';

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
 * GET /vehicles
 * options: { search, status, skip, limit }
 * Returns { items, total, skip, limit }
 */
export function listVehicles({ search, status, skip = 0, limit = 50 } = {}) {
  return get(`${BASE}${toQuery({ search, status, skip, limit })}`);
}

/** GET /vehicles/{vehicle_id} */
export function getVehicle(vehicleId) {
  return get(`${BASE}/${vehicleId}`);
}

/** POST /vehicles  (manager/admin only) */
export function createVehicle(payload) {
  return post(BASE, payload);
}

/** PATCH /vehicles/{vehicle_id}  (manager/admin only) */
export function updateVehicle(vehicleId, payload) {
  return patch(`${BASE}/${vehicleId}`, payload);
}

/** DELETE /vehicles/{vehicle_id}  (manager/admin only) */
export function deleteVehicle(vehicleId) {
  return del(`${BASE}/${vehicleId}`);
}

/** POST /vehicles/{vehicle_id}/assign  (manager/staff/admin) */
export function assignDriver(vehicleId, driverId) {
  return post(`${BASE}/${vehicleId}/assign`, { driver_id: driverId });
}

/** POST /vehicles/{vehicle_id}/unassign  (manager/staff/admin) */
export function unassignDriver(vehicleId) {
  return post(`${BASE}/${vehicleId}/unassign`);
}