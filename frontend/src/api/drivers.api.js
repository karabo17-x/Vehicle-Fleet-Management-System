import { apiFetch } from './client.js';

// Endpoints from SDD section 2.4.
export const listDrivers = (status) =>
  apiFetch(`/drivers/${status ? `?status=${encodeURIComponent(status)}` : ''}`);
export const getDriver = (id) => apiFetch(`/drivers/${id}`);
export const createDriver = (data) =>
  apiFetch('/drivers/', { method: 'POST', body: JSON.stringify(data) });
export const updateDriver = (id, data) =>
  apiFetch(`/drivers/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteDriver = (id) => apiFetch(`/drivers/${id}`, { method: 'DELETE' });
