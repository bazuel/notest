import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  base: "./",
  optimizeDeps: {
    exclude: ['/src/app.scss'],
  },
  build: {
    commonjsOptions : {
      exclude: ['src/app.scss'],
    },
    sourcemap: true,
    outDir: "../notest-extension/dist/page",
    rollupOptions: {
      external: '/src/app.scss',
      output: {
        entryFileNames: `widget.js`,
        assetFileNames: `widget.css`,
      },
    },
  },
});
