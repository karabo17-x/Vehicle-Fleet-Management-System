import { defineConfig } from 'vite';
import { resolve } from 'path';

// Two entry points for now: the login screen (site root) and a dashboard
// placeholder that the rest of the team will build out. Add more pages
// here (e.g. vehicles.html, drivers.html) the same way as the project grows.
export default defineConfig({
  root: '.',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      // FastAPI backend (vehicles/drivers/maintenance)
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      // Go auth service (login/refresh/authorize)
      '/auth': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/auth/, ''),
      },
    },
  },
});
