# Maplibre GL Inspect

<!-- Badges -->
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/geoql/maplibre-gl-inspect/pipeline.yml?logo=github-actions)](https://github.com/geoql/maplibre-gl-inspect/actions/workflows/pipeline.yml)
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/geoql/maplibre-gl-inspect/codeql.yml?logo=lgtm&logoWidth=18)](https://github.com/geoql/maplibre-gl-inspect/actions/workflows/codeql.yml)
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/geoql/maplibre-gl-inspect/shipjs-trigger.yml?label=⛴%20Ship.js%20trigger)](https://github.com/geoql/maplibre-gl-inspect/actions/workflows/shipjs-trigger.yml)
[![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/geoql/maplibre-gl-inspect?sort=semver&logo=github)](https://github.com/geoql/maplibre-gl-inspect/releases)
[![npm](https://img.shields.io/npm/v/maplibre-gl-inspect?logo=npm)](https://www.npmjs.com/package/maplibre-gl-inspect)
[![DeepScan grade](https://deepscan.io/api/teams/15032/projects/24288/branches/745727/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=15032&pid=24288&bid=745727)
[![GitHub contributors](https://img.shields.io/github/contributors/geoql/maplibre-gl-inspect)](https://github.com/geoql/maplibre-gl-inspect/graphs/contributors)
[![npm type definitions](https://img.shields.io/npm/types/maplibre-gl-inspect?logo=typescript)](https://github.com/vinayakkulkarni/maplibre-gl-inspect/blob/main/package.json)
[![npm](https://img.shields.io/npm/dt/maplibre-gl-inspect?logo=npm)](http://npm-stat.com/charts.html?package=maplibre-gl-inspect)
[![npm](https://img.shields.io/npm/dw/maplibre-gl-inspect?logo=npm)](http://npm-stat.com/charts.html?package=maplibre-gl-inspect)
[![npm bundle size (version)](https://img.shields.io/bundlephobia/minzip/maplibre-gl-inspect)](https://bundlephobia.com/package/maplibre-gl-inspect@latest)

[![vite](https://img.shields.io/github/package-json/dependency-version/geoql/maplibre-gl-inspect/dev/vite?logo=vite)](https://vitejs.dev)
[![maplibre-gl](https://img.shields.io/github/package-json/dependency-version/geoql/maplibre-gl-inspect/dev/maplibre-gl)](https://maplibre.org/maplibre-gl-js-docs/api/)
[![husky](https://img.shields.io/github/package-json/dependency-version/geoql/maplibre-gl-inspect/dev/vite?label=🐶%20dependency)](https://typicode.github.io/husky/#/)
[![eslint](https://img.shields.io/github/package-json/dependency-version/geoql/maplibre-gl-inspect/dev/eslint?logo=eslint)](https://eslint.org/)
[![prettier](https://img.shields.io/github/package-json/dependency-version/geoql/maplibre-gl-inspect/dev/prettier?logo=prettier)](https://prettier.io/)
[![typescript](https://img.shields.io/github/package-json/dependency-version/geoql/maplibre-gl-inspect/dev/typescript?logo=TypeScript)](https://www.typescriptlang.org/)

Maplibre GL Inspect is a fork of [@acalcutt's Maplibre GL Inspect](https://github.com/acalcutt/maplibre-gl-inspect) which is a fork of [@lukasmartinelli Mapbox GL Inspect](https://github.com/lukasmartinelli/mapbox-gl-inspect). This fork is typescriptified along with strict ESLint & Prettier rule(s) in place for code standardisation 🕺

Add an inspect control to [maplibre-gl-js](https://github.com/maplibre/maplibre-gl-js) to view all features
of the vector sources and allows hovering over features to see their properties.

**Requires [maplibre-gl-js](https://github.com/maplibre/maplibre-gl-js) (min version 1.15).**

![Maplibre GL Inspect Preview](https://cloud.githubusercontent.com/assets/1288339/21744637/11759412-d51a-11e6-9581-f26741fcd182.gif)

## Usage

**maplibre-gl-inspect** is a Maplibre GL JS plugin that you can easily add on top of your map. Check `index.html` for a complete example.

Make sure to include the CSS and JS files.

**When using a CDN**

```html
<script src='https://unpkg.com/maplibre-gl-inspect@latest/dist/maplibre-gl-inspect.js'></script>
<link href='https://unpkg.com/maplibre-gl-inspect@latest/dist/maplibre-gl-inspect.css' rel='stylesheet' />
```

**When using modules**

```js
require('maplibre-gl-inspect/dist/maplibre-gl-inspect.css');
var maplibregl = require('maplibre-gl');
var MaplibreInspect = require('maplibre-gl-inspect');

// Pass an initialized popup to Maplibre GL
map.addControl(new MaplibreInspect({
  popup: new maplibregl.Popup({
    closeButton: false,
    closeOnClick: false
  })
}));
```


### Add Inspect Control

Add the inspect control to your map.

```javascript
map.addControl(new MaplibreInspect());
```


### Show Inspection Map

Switch to the inspection map by default.

```javascript
map.addControl(new MaplibreInspect({
  showInspectMap: true
}));
```

### Show only Inspection Mode

Switch to the inspection map by default and hide the inspect button to switch back to the normal map. Check `examples/inspect-only.html`


```javascript
map.addControl(new MaplibreInspect({
  showInspectMap: true,
  showInspectButton: false
}));
```

### Disable Popup

Disable the feature Popup in inspection mode and in map mode. Check `examples/no-popup.html`

```javascript
map.addControl(new MaplibreInspect({
  showInspectMapPopup: false,
  showMapPopup: false
}));
```

### Custom Popup Function

You can also control the Popup output. Check `examples/custom-popup.html`

```javascript
map.addControl(new MaplibreInspect({
  renderPopup: function(features) {
    return '<h1>' + features.length + '</h1>';
  }
}));
```

### Custom Color Function

You are able to control the generated colors and background of the inspection style.
Check `examples/custom-color-1.html` and `examples/custom-color-2.html`.

```javascript
var colors = ['#FC49A3', '#CC66FF', '#66CCFF', '#66FFCC'];
map.addControl(new MaplibreInspect({
  backgroundColor: '#000',
  assignLayerColor: function(layerId, alpha) {
    var randomNumber = parseInt(Math.random() * colors.length);
    return colors[randomNumber];
   }
}));
```

### Show just Popup but no Inspect Style

You can also hide the inspect button and enable the popup on the map if just want the popup hovering feature in your normal map but no inspect style.
Check `examples/no-inspect-style.html`.


```js
map.addControl(new MaplibreInspect({
  showInspectButton: false,
  showMapPopup: true
}));
```

### Show Popup only for certain Features

You can pass a `queryParameters` object structured like the parameters object documented for `map.queryRenderedFeatures`](https://maplibre.org/maplibre-gl-js-docs/api/map/#map#queryrenderedfeatures).
This let's you show the inspect popup for only certain layers.
Check `examples/query-params.html`.


```js
map.addControl(new MaplibreInspect({
  queryParameters: {
    layers: ['composite_road_line']
  }
}));
```

You can also use this feature to do custom layer [filtering](https://maplibre.org/maplibre-gl-js-docs/style-spec/types/).

```js
map.addControl(new MaplibreInspect({
  queryParameters: {
    filter: ['>', 'height', 10]
  }
}));
```

### Less Fidly Popup

If inspecting features is too fiddly for thin lines you can optionally set a custom pixel buffer around the pointer when querying for features to make inspection a bit more forgiving.
Check `examples/less-fidly.html`.


```js
map.addControl(new MaplibreInspect({
  selectThreshold: 50
}));
```

### Show Popup only on Click not on Hovering

Do not show the inspect popup when hovering over the map but only when clicking on the map.
Check `examples/popup-on-click.html`.


```js
map.addControl(new MaplibreInspect({
  showMapPopup: true,
  showMapPopupOnHover: false,
  showInspectMapPopupOnHover: false
}));
```

### Add a Callback for Inspect Toggle Events

Call a function whenever the user toggles the inpect map on or off. Useful for adding inspect state to URL hash.
Check `examples/url-hash-toggle-callback.html`.

```js
map.addControl(new MaplibreInspect({
  toggleCallback: function(showInspectMap) { 
    console.log(`showInspectMap is ${showInspectMap}`);
  }
}));
```

## Develop

Create a minified standalone build.

```
npm install
npm run build
```