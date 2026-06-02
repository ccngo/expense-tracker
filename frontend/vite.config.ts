import { defineConfig } from 'vite';
import angular from '@angular/build';

export default defineConfig({
  build: angular(),
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '/api'
        }
      }
    }
  }
});
