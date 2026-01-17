
import { defineConfig } from 'vite';

export default defineConfig({
  // Base se deja vacía o se ajusta si el repo tiene un nombre específico
  // GitHub Pages suele requerir base relativa para funcionar en subcarpetas
  base: './',
  build: {
    outDir: 'dist',
  }
});
