// src/main.js
// Composition root and router.
// To add a screen: add one entry to `routes` and one file under pages/.

import './styles/main.css';

import { isAuthenticated, getRole, logout } from './auth/session.js';
import { requireAuth } from './auth/authGuard.js';

import { render as renderHome } from './pages/home.page.js';
import { render as renderLogin } from './pages/login.page.js';
import { render as renderDashboard } from './pages/dashboard.page.js';
import { render as renderVehicles } from './pages/vehicles.page.js';
import { render as renderDrivers } from './pages/drivers.page.js';
import { render as renderMaintenance } from './pages/maintenance.page.js';

/* ---------- Routes table ---------- */

const routes = {
  '#/home': { render: renderHome },
  '#/login': { render: renderLogin },
  '#/dashboard': { render: renderDashboard, guard: () => requireAuth() },
  '#/vehicles': { render: renderVehicles, guard: () => requireAuth() },
  '#/drivers': { render: renderDrivers, guard: () => requireAuth() },
  '#/maintenance': { render: renderMaintenance, guard: () => requireAuth() },
};

const NAV_LINKS = [
  { hash: '#/dashboard', label: 'Overview', abbr: 'OV' },
  { hash: '#/vehicles', label: 'Vehicles', abbr: 'VH' },
  { hash: '#/drivers', label: 'Drivers', abbr: 'DR' },
  { hash: '#/maintenance', label: 'Maintenance', abbr: 'SV' },
];

/* ---------- Shell (top bar + content area) ---------- */

const app = document.querySelector('#app');
let shell;
let topbar;
let nav;
let roleBadge;
let content;

function buildShell() {
  shell = document.createElement('div');
  shell.className = 'app-shell';

  // Sidebar (kept in the variable `topbar` so the rest of the file stays the same)
  topbar = document.createElement('aside');
  topbar.className = 'sidebar';

  const brand = document.createElement('div');
  brand.className = 'lf-brand';
  const logo = document.createElement('img');
  logo.className = 'lf-logo lf-brand-image';
  logo.src = '/images/vehicle-mark.png';
  logo.alt = '';
  const name = document.createElement('strong');
  name.textContent = 'Vehicle Fleet';
  brand.append(logo, name);

  const label = document.createElement('p');
  label.className = 'side-label';
  label.textContent = 'WORKSPACE';

  nav = document.createElement('nav');
  nav.className = 'side-nav';
  NAV_LINKS.forEach((link) => {
    const a = document.createElement('a');
    a.href = link.hash;
    const abbr = document.createElement('b');
    abbr.textContent = link.abbr;
    a.append(abbr, link.label);
    nav.append(a);
  });

  roleBadge = document.createElement('span');
  roleBadge.className = 'badge';

  const logoutButton = document.createElement('button');
  logoutButton.type = 'button';
  logoutButton.className = 'secondary';
  logoutButton.textContent = 'Log out';
  logoutButton.addEventListener('click', handleLogout);

  const footer = document.createElement('div');
  footer.className = 'side-footer';
  footer.append(roleBadge, logoutButton);

  topbar.append(brand, label, nav, footer);

  content = document.createElement('main');
  content.className = 'content';

  shell.append(topbar, content);
  app.replaceChildren(shell);
}

/** Show the top bar only when logged in, and mark the current link. */
function updateShell(currentHash) {
  const loggedIn = isAuthenticated();
  const landing = currentHash === '#/home';
  topbar.classList.toggle('hidden', !loggedIn || landing);
  shell.classList.toggle('no-sidebar', !loggedIn || landing);
  content.classList.toggle('content-landing', landing);
  content.classList.toggle('content-login', currentHash === '#/login');
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
    window.location.hash = isAuthenticated() ? '#/dashboard' : '#/home';
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

/* ---------- Service worker (no-op for now) ---------- */

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

// If we have an access token, refresh (authoritative) role from server
import { refreshRoleFromServer } from './auth/session.js';

(async function init(){
  if(isAuthenticated()){
    await refreshRoleFromServer();
  }
  handleRoute();
})();
