
import './styles/main.css';

import { isAuthenticated, getRole, logout } from './auth/session.js';
import { requireAuth } from './auth/authGuard.js';

import { render as renderLogin } from './pages/login.page.js';
import { render as renderDashboard } from './pages/dashboard.page.js';
import { render as renderVehicles } from './pages/vehicles.page.js';
import { render as renderDrivers } from './pages/drivers.page.js';
import { render as renderMaintenance } from './pages/maintenance.page.js';

/* ---------- Routes table ---------- */

const routes = {
  '#/login': { render: renderLogin },
  '#/dashboard': { render: renderDashboard, guard: () => requireAuth() },
  '#/vehicles': { render: renderVehicles, guard: () => requireAuth() },
  '#/drivers': { render: renderDrivers, guard: () => requireAuth() },
  '#/maintenance': { render: renderMaintenance, guard: () => requireAuth() },
};

const NAV_LINKS = [
  { hash: '#/dashboard', label: 'Dashboard' },
  { hash: '#/vehicles', label: 'Vehicles' },
  { hash: '#/drivers', label: 'Drivers' },
  { hash: '#/maintenance', label: 'Maintenance' },
];

/* ---------- Shell (top bar + content area) ---------- */

const app = document.querySelector('#app');
let topbar;
let nav;
let roleBadge;
let content;

function buildShell() {
  topbar = document.createElement('header');
  topbar.className = 'topbar';

  const brand = document.createElement('strong');
  brand.className = 'brand';
  brand.textContent = 'VFMS';

  nav = document.createElement('nav');
  NAV_LINKS.forEach((link) => {
    const a = document.createElement('a');
    a.href = link.hash;
    a.textContent = link.label;
    nav.append(a);
  });

  roleBadge = document.createElement('span');
  roleBadge.className = 'badge';

  const logoutButton = document.createElement('button');
  logoutButton.type = 'button';
  logoutButton.textContent = 'Log out';
  logoutButton.addEventListener('click', handleLogout);

  topbar.append(brand, nav, roleBadge, logoutButton);

  content = document.createElement('main');
  content.className = 'content';

  app.replaceChildren(topbar, content);
}

/** Show the top bar only when logged in, and mark the current link. */
function updateShell(currentHash) {
  const loggedIn = isAuthenticated();
  topbar.classList.toggle('hidden', !loggedIn);
  roleBadge.textContent = getRole() || '';

  nav.querySelectorAll('a').forEach((a) => {
    a.classList.toggle('active', a.getAttribute('href') === currentHash);
  });
}

function handleLogout() {
  logout();
  window.location.hash = '#/login';
}

/* ---------- Router ---------- */

function showMessage(text, isError) {
  const box = document.createElement('div');
  box.className = isError ? 'message error' : 'message';
  box.textContent = text;
  content.replaceChildren(box);
}

async function handleRoute() {
  const hash = window.location.hash.split('?')[0];

  // No hash yet: send people to the right start page
  if (!hash) {
    window.location.hash = isAuthenticated() ? '#/dashboard' : '#/login';
    return;
  }

  const route = routes[hash];
  if (!route) {
    updateShell(hash);
    showMessage('Page not found.', true);
    return;
  }

  // Run the guard. A guard redirects when access is not allowed.
  if (route.guard) {
    const before = window.location.hash;
    const allowed = route.guard();
    if (allowed === false || window.location.hash !== before) return;
  }

  updateShell(hash);
  content.replaceChildren();

  try {
    await route.render(content);
  } catch (error) {
    showMessage(error.message || 'Something went wrong.', true);
  }
}

/* ---------- Service worker  ---------- */

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch(() => {
      // Not a problem: the app works without it.
    });
  });
}

/* ---------- Start ---------- */

buildShell();
window.addEventListener('hashchange', handleRoute);
registerServiceWorker();
handleRoute();