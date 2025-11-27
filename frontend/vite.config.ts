import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Small dev plugin to force no-store cache header on dev server responses
function noStoreDevPlugin() {
  return {
    name: 'vite:no-store-dev-plugin',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        res.setHeader('Cache-Control', 'no-store');
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), noStoreDevPlugin()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  publicDir: 'public',
  server: {
    fs: {
      allow: ['..', 'public'],
    },
  },
});
