import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  build: { outDir: 'dist' },
  define: {
    global: 'globalThis',
    'process.env': {},
    'process.version': '"v18.0.0"',
    'process.platform': '"browser"',
  },
  resolve: {
    alias: {
      buffer: 'buffer',
    }
  },
  optimizeDeps: {
    include: ['buffer'],
  }
});
