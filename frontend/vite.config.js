import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
        vehicles: resolve(__dirname, 'vehicles.html'),
        drivers: resolve(__dirname, 'drivers.html'),
        maintenance: resolve(__dirname, 'maintenance.html'),
        assignments: resolve(__dirname, 'assignments.html'),
        reports: resolve(__dirname, 'reports.html'),
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:8000', changeOrigin: true, rewrite: (p) => p.replace(/^\/api/, '') },
      '/auth': { target: 'http://localhost:8080', changeOrigin: true, rewrite: (p) => p.replace(/^\/auth/, '') },
    },
  },
});
