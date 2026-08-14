import { defineConfig } from 'vite-plus';

export default defineConfig({
  base: '/maplibre-gl-inspect/',
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
});
