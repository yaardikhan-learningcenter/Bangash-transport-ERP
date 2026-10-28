import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

// base './' makes the build work under https://<user>.github.io/<repo>/ ; output goes to ../docs (GitHub Pages folder)
export default defineConfig(() => ({
  base: './',
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(__dirname, '.') } },
  build: { outDir: '../docs', emptyOutDir: true, assetsInlineLimit: 400000, chunkSizeWarningLimit: 1500 },
}));
