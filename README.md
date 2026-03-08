# maplibre-gl-inspect

[![CI](https://img.shields.io/github/actions/workflow/status/geoql/maplibre-gl-inspect/ci.yml?logo=github-actions)](https://github.com/geoql/maplibre-gl-inspect/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/maplibre-gl-inspect?logo=npm)](https://www.npmjs.com/package/maplibre-gl-inspect)
[![JSR](https://jsr.io/badges/@geoql/maplibre-gl-inspect)](https://jsr.io/@geoql/maplibre-gl-inspect)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/maplibre-gl-inspect)](https://bundlephobia.com/package/maplibre-gl-inspect@latest)
[![npm type definitions](https://img.shields.io/npm/types/maplibre-gl-inspect?logo=typescript)](https://github.com/geoql/maplibre-gl-inspect/blob/main/package.json)
[![GitHub release](https://img.shields.io/github/v/release/geoql/maplibre-gl-inspect?sort=semver&logo=github)](https://github.com/geoql/maplibre-gl-inspect/releases)

Add an inspect control to [maplibre-gl-js](https://github.com/maplibre/maplibre-gl-js) to view all features of the vector sources and allows hovering over features to see their properties.

**Requires [maplibre-gl-js](https://github.com/maplibre/maplibre-gl-js) >= 5.0.0**

![Maplibre GL Inspect Preview](https://cloud.githubusercontent.com/assets/1288339/21744637/11759412-d51a-11e6-9581-f26741fcd182.gif)

## Install

```bash
# npm
npm install maplibre-gl-inspect maplibre-gl

# bun
bun add maplibre-gl-inspect maplibre-gl
```

## Usage

```ts
import maplibregl from 'maplibre-gl';
import { MaplibreInspect } from 'maplibre-gl-inspect';
import 'maplibre-gl-inspect/dist/style.css';

const map = new maplibregl.Map({
  container: 'map',
  style: 'https://demotiles.maplibre.org/style.json',
});

map.addControl(new MaplibreInspect());
```

### Show Inspection Map by Default

```ts
map.addControl(
  new MaplibreInspect({
    showInspectMap: true,
  }),
);
```

### Inspect Only Mode

```ts
map.addControl(
  new MaplibreInspect({
    showInspectMap: true,
    showInspectButton: false,
  }),
);
```

### Disable Popup

```ts
map.addControl(
  new MaplibreInspect({
    showInspectMapPopup: false,
    showMapPopup: false,
  }),
);
```

### Custom Popup

```ts
map.addControl(
  new MaplibreInspect({
    renderPopup(features) {
      return `<h1>${features.length}</h1>`;
    },
  }),
);
```

### Custom Colors

```ts
const colors = ['#FC49A3', '#CC66FF', '#66CCFF', '#66FFCC'];
map.addControl(
  new MaplibreInspect({
    backgroundColor: '#000',
    assignLayerColor(_layerId, _alpha) {
      return colors[Math.floor(Math.random() * colors.length)];
    },
  }),
);
```

### Popup on Click Only

```ts
map.addControl(
  new MaplibreInspect({
    showMapPopup: true,
    showMapPopupOnHover: false,
    showInspectMapPopupOnHover: false,
  }),
);
```

### Query Parameters

Filter which layers show in the popup using [`queryRenderedFeatures` parameters](https://maplibre.org/maplibre-gl-js/docs/API/classes/Map/#queryrenderedfeatures).

```ts
map.addControl(
  new MaplibreInspect({
    queryParameters: {
      layers: ['road_line'],
    },
  }),
);
```

### Toggle Callback

```ts
map.addControl(
  new MaplibreInspect({
    toggleCallback(showInspectMap) {
      console.log(`Inspect mode: ${showInspectMap}`);
    },
  }),
);
```

## Develop

```bash
bun install
bun run build
```

Run the example locally:

```bash
cd example
bun install
bun run dev
```

## Credits

Fork of [@acalcutt's maplibre-gl-inspect](https://github.com/acalcutt/maplibre-gl-inspect), which is a fork of [@lukasmartinelli's mapbox-gl-inspect](https://github.com/lukasmartinelli/mapbox-gl-inspect).

## License

[MIT](LICENSE)
