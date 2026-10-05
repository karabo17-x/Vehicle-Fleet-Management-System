// vite.config.js
// Dev-server proxy, so the app can call relative paths and no origin is hardcoded in app code.
//   /api/...  -> FastAPI backend on :8000 (the "/api" prefix is removed)
//   /auth/... -> Go auth service on :8081 (path kept as is)

import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: process.env.VFMS_API_URL || 'http://localhost:8001',
        changeOrigin: true,
      },
      '/auth': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/auth/, ''),
      },
    },
  },
});
