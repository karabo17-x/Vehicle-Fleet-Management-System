import { apiFetch } from './client.js';

// Endpoints from SDD section 2.3.
export const listVehicles = (status) =>
  apiFetch(`/vehicles/${status ? `?status=${encodeURIComponent(status)}` : ''}`);
export const getVehicle = (id) => apiFetch(`/vehicles/${id}`);
export const createVehicle = (data) =>
  apiFetch('/vehicles/', { method: 'POST', body: JSON.stringify(data) });
export const updateVehicle = (id, data) =>
  apiFetch(`/vehicles/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteVehicle = (id) => apiFetch(`/vehicles/${id}`, { method: 'DELETE' });
