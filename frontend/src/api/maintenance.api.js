import { apiFetch } from './client.js';

// Endpoints from SDD section 2.5.
export const listMaintenance = (vehicleId) =>
  apiFetch(`/maintenance/${vehicleId ? `?vehicle_id=${encodeURIComponent(vehicleId)}` : ''}`);
export const getMaintenance = (id) => apiFetch(`/maintenance/${id}`);
export const createMaintenance = (data) =>
  apiFetch('/maintenance/', { method: 'POST', body: JSON.stringify(data) });
export const updateMaintenance = (id, data) =>
  apiFetch(`/maintenance/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteMaintenance = (id) => apiFetch(`/maintenance/${id}`, { method: 'DELETE' });
