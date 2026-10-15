import { defineConfig } from 'vite';

export default defineConfig({
  // Use relative base path so the build works on https://<username>.github.io/<repo>/
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    chunkSizeWarningLimit: 1500
  },
  server: {
    port: 3000,
    open: true
  }
});
