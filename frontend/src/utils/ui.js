// Small shared UI helpers used by every list page (Vehicles, Drivers,
// Maintenance), so the "confirmation message after save/delete" and
// "delete asks for confirmation" rules in SDD section 7.1 are implemented
// once instead of copy-pasted three times.

let toastTimer;

/** Shows a brief message in the top-right corner. type is 'success' | 'error'. */
export function showToast(message, type = 'success') {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.className = 'toast';
    document.body.append(el);
  }
  el.textContent = message;
  el.dataset.type = type;
  el.dataset.visible = 'true';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.dataset.visible = 'false';
  }, 3000);
}

/** Native confirm for delete actions — simple and reliable across pages. */
export function confirmDelete(what) {
  return window.confirm(`Delete ${what}? This can't be undone.`);
}

/** Disables a button and shows '…' while an async action runs. */
export async function withLoading(button, fn) {
  const original = button.textContent;
  button.disabled = true;
  button.dataset.loading = 'true';
  try {
    return await fn();
  } finally {
    button.disabled = false;
    button.dataset.loading = 'false';
    button.textContent = original;
  }
}

export function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}
