import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import pkg from './package.json';

const banner = `/*!
 * ${pkg.name} v${pkg.version}
 * ${pkg.description}
 * (c) ${new Date().getFullYear()} ${pkg.author.name}<${pkg.author.email}>
 * Released under the ${pkg.license} License
 */
`;

export default defineConfig({
  build: {
    target: 'esnext',
    sourcemap: true,
    reportCompressedSize: true,
    lib: {
      entry: resolve(__dirname, 'lib/index.ts'),
      name: 'MaplibreGlInspect',
      formats: ['es', 'cjs', 'umd'],
      fileName: pkg.name,
    },
    commonjsOptions: {
      extensions: ['.js', '.ts'],
      strictRequires: true,
      exclude: 'lib/**',
      include: 'node_modules/**',
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['maplibre-gl', 'randomcolor'],
      output: {
        banner,
        exports: 'named',
        strict: true,
        sourcemap: true,
        extend: true,
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          'maplibre-gl': 'maplibregl',
          randomcolor: 'randomColor',
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'maplibre-gl-inspect.css';
          return assetInfo.name;
        },
      },
    },
  },
  plugins: [
    dts({
      outputDir: ['dist'],
      insertTypesEntry: true,
    }),
  ],
});
