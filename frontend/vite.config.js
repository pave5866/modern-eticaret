import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    // Yarı boş modüllere izin ver
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    // Bağımlılık hatalarını görmezden gel
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: [
            'react',
            'react-dom',
            'react-router-dom',
            'redux',
            'react-redux',
            '@reduxjs/toolkit',
            'axios',
          ],
          ui: ['antd', '@ant-design/icons'],
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://modern-ecommerce-fullstack.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  // Hata ayıklama bilgilerini ekle
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
    keepNames: true,
  },
});