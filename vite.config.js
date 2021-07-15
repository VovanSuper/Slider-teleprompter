import { join } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: join(__dirname, 'src'),
  build: {
    emptyOutDir: true,
    outDir: join(__dirname, 'dist'),
    assetsDir: 'public',
    manifest: true,
    minify: 'esbuild',
    polyfillDynamicImport: true,
    sourcemap: 'inline',
    target: ['es2015', 'es2020'],
    write: true,
    watch: {
      chokidar: {
        cwd: join(__dirname, 'src'),
      },
    },
  },
});
