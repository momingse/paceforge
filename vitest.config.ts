import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { alias } from './path-alias.config.js';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    css: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/__tests__/', '**/*.d.ts', '**/*.config.*', 'dist/'],
    },
  },
  resolve: {
    alias,
  },
});
