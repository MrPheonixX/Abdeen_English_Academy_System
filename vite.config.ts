import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  // This line is critical for GitHub Pages project sites
  base: process.env.PAGES_BASE || '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Ensure the output directory matches the workflow above
    outDir: 'dist',
    rollupOptions: {
      output: {
        // Optional: Split chunks for faster loading
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],

          export default defineConfig({
  base: process.env.PAGES_BASE || '/',
  // ... rest of your config
});
        }
      }
    }
  }
});
