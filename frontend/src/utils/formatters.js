// src/utils/formatters.js
// Small display helpers only.
// No network calls, no DOM access, no auth logic.

const LOCALE = 'en-ZA';
const CURRENCY = 'ZAR';

/** Turn a value into a valid Date, or null if it is empty or invalid. */
function toDate(value) {
  if (value === null || value === undefined || value === '') return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** "2026-09-29" -> "29 Sep 2026". Returns "-" if empty or invalid. */
export function formatDate(value) {
  const date = toDate(value);
  if (!date) return '-';
  return date.toLocaleDateString(LOCALE, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/** "2026-09-29T14:30:00Z" -> "29 Sep 2026, 16:30". Returns "-" if empty or invalid. */
export function formatDateTime(value) {
  const date = toDate(value);
  if (!date) return '-';
  return date.toLocaleString(LOCALE, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** 1500 -> "R 1 500,00". Returns "-" if empty or not a number. */
export function formatCurrency(value) {
  if (value === null || value === undefined || value === '') return '-';
  const amount = Number(value);
  if (Number.isNaN(amount)) return '-';
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: CURRENCY,
  }).format(amount);
}

/** "in_service" -> "In service". Returns "-" if empty. */
export function formatStatus(value) {
  if (value === null || value === undefined || value === '') return '-';
  const text = String(value).replace(/[_-]+/g, ' ').trim().toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Turn a date input value ("2026-09-29") into an ISO string for the API.
 * Returns null if empty or invalid, so the backend gets null, not "".
 */
export function toIsoOrNull(value) {
  const date = toDate(value);
  return date ? date.toISOString() : null;
}