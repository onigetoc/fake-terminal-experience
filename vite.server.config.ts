import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/server/index.ts'),
      formats: ['es'],
      fileName: 'server'
    },
    rollupOptions: {
      external: ['express', 'cors', 'child_process', 'path', 'os', 'iconv-lite']
    }
  }
});
