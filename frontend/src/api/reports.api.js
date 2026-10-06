import { apiFetch } from './client.js';

// SDD FR33: GET /reports/summary. Not confirmed built on the backend yet —
// the Reports page falls back to computing totals client-side from
// vehicles/drivers/maintenance if this 404s or isn't implemented.
export const getReportsSummary = () => apiFetch('/reports/summary');
