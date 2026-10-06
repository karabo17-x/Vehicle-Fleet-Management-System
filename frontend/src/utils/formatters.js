// Small helpers for showing dates and expiry text.

/** Whole days from today until a date (negative = already passed). */
export function daysUntil(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.round((target - today) / 86400000);
}

export function describeExpiry(days) {
  if (days < 0) return `expired ${-days} day${days === -1 ? '' : 's'} ago`;
  if (days === 0) return 'expires today';
  return `expires in ${days} day${days === 1 ? '' : 's'}`;
}
