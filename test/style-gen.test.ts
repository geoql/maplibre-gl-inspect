import { describe, expect, it } from 'vite-plus/test';
import type { StyleSpecification } from 'maplibre-gl';
import { generateColoredLayers, generateInspectStyle } from '../src/style-gen';
import { renderPopup } from '../src/render-popup';
import type { RenderPopupFeature } from '../src/types';

const fixedColor = (layerId: string, alpha = 1) => `${layerId}:${alpha}`;

describe('generateColoredLayers', () => {
  it('builds polygon, line and circle layers per vector layer, in that order', () => {
    const layers = generateColoredLayers(
      { openmaptiles: ['water', 'road'] },
      fixedColor,
    );

    expect(layers.map((layer) => layer.id)).toEqual([
      'openmaptiles_water_polygon',
      'openmaptiles_road_polygon',
      'openmaptiles_water_line',
      'openmaptiles_road_line',
      'openmaptiles_water_circle',
      'openmaptiles_road_circle',
    ]);
    expect(layers[0]).toMatchObject({
      'source-layer': 'water',
      paint: { 'fill-color': 'water:0.3', 'fill-outline-color': 'water:0.6' },
    });
  });

  it('colours a GeoJSON source (no vector layers) by its source id', () => {
    const layers = generateColoredLayers({ points: [] }, fixedColor);

    expect(layers.map((layer) => layer.id)).toEqual([
      'points__polygon',
      'points__line',
      'points__circle',
    ]);
    expect(layers.every((layer) => !('source-layer' in layer))).toBe(true);
  });
});

describe('generateInspectStyle', () => {
  const original: StyleSpecification = {
    version: 8,
    sources: {
      openmaptiles: { type: 'vector', url: 'https://example.test/tiles.json' },
      hillshade: { type: 'raster-dem', url: 'https://example.test/dem.json' },
      points: {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      },
    },
    layers: [
      {
        id: 'water',
        type: 'fill',
        source: 'openmaptiles',
        'source-layer': 'water',
      },
    ],
  };

  it('keeps only vector and GeoJSON sources and puts a background first', () => {
    const style = generateInspectStyle(original, [], {
      backgroundColor: '#16181d',
    });

    expect(Object.keys(style.sources)).toEqual(['openmaptiles', 'points']);
    expect(style.layers).toEqual([
      {
        id: 'background',
        type: 'background',
        paint: { 'background-color': '#16181d' },
      },
    ]);
  });

  it('defaults the background to white', () => {
    const style = generateInspectStyle(original, []);

    expect(style.layers[0]).toMatchObject({
      paint: { 'background-color': '#fff' },
    });
  });
});

describe('renderPopup', () => {
  it('lists the layer, geometry type and every property of each feature', () => {
    const feature: RenderPopupFeature = {
      source: 'openmaptiles',
      layer: {
        id: 'water',
        type: 'fill',
        source: 'openmaptiles',
        'source-layer': 'water',
      },
      geometry: { type: 'Polygon' },
      properties: { class: 'lake', tags: { name: 'Pond' } },
    };

    const html = renderPopup([feature]);

    expect(html).toContain('<div class="maplibregl-inspect-layer">water</div>');
    expect(html).toContain(
      '$type</div><div class="maplibregl-inspect-property-value">Polygon',
    );
    expect(html).toContain(
      'class</div><div class="maplibregl-inspect-property-value">lake',
    );
    expect(html).toContain('{"name":"Pond"}');
  });
});
