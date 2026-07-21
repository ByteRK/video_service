import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(({ mode }) => {
  const workspaceRoot = fileURLToPath(new URL('../..', import.meta.url));
  const env = loadEnv(mode, workspaceRoot, '');
  const apiPort = Number(env.PORT || 3000);

  return {
    envDir: workspaceRoot,
    plugins: [vue()],
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
    server: {
      port: 5173,
      proxy: {
        '/api': { target: `http://localhost:${apiPort}`, changeOrigin: true }
      }
    }
  };
});
