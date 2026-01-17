import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Importante para GitHub Pages: usa rutas relativas
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
});