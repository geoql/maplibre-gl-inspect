import { defineConfig } from 'vite-plus';

export default defineConfig({
  base: '/',
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            // MapLibre GL is one ~1 MB module; keep it in its own long-lived
            // chunk so demo changes do not bust its cache.
            { name: 'maplibre-gl', test: /node_modules[\\/]maplibre-gl[\\/]/ },
          ],
        },
      },
    },
    // The maplibre-gl chunk is a single, indivisible module (~1.05 MB
    // minified). The limit sits just above it so any other oversized chunk
    // still warns.
    chunkSizeWarningLimit: 1100,
  },
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
});
