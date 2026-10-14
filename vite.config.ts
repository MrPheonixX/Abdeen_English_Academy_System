import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// This is the corrected, clean configuration.
export default defineConfig({
  base: process.env.PAGES_BASE || '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
