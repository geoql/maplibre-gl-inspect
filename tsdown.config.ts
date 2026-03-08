import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  deps: { neverBundle: ['maplibre-gl'] },
});
