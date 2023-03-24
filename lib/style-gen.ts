import type {
  SourceSpecification,
  LayerSpecification,
  StyleSpecification,
} from 'maplibre-gl';

const circleLayer = (
  color: string,
  source: string | SourceSpecification,
  vectorLayer?: LayerSpecification,
) => {
  const layer = {
    id: [source, vectorLayer, 'circle'].join('_'),
    source,
    type: 'circle',
    paint: {
      'circle-color': color,
      'circle-radius': 2,
    },
    filter: ['==', '$type', 'Point'],
  };
  if (vectorLayer) {
    layer['source-layer'] = vectorLayer;
  }
  return layer;
};
const polygonLayer = (
  color: string,
  outlineColor: string,
  source: string | SourceSpecification,
  vectorLayer?: LayerSpecification,
) => {
  const layer = {
    id: [source, vectorLayer, 'polygon'].join('_'),
    source,
    type: 'fill',
    paint: {
      'fill-color': color,
      'fill-antialias': true,
      'fill-outline-color': color,
    },
    filter: ['==', '$type', 'Polygon'],
  };
  if (vectorLayer) {
    layer['source-layer'] = vectorLayer;
  }
  return layer;
};
const lineLayer = (
  color: string,
  source: string | SourceSpecification,
  vectorLayer?: LayerSpecification,
) => {
  const layer = {
    id: [source, vectorLayer, 'line'].join('_'),
    source,
    layout: {
      'line-join': 'round',
      'line-cap': 'round',
    },
    type: 'line',
    paint: {
      'line-color': color,
    },
    filter: ['==', '$type', 'LineString'],
  };
  if (vectorLayer) {
    layer['source-layer'] = vectorLayer;
  }
  return layer;
};

const generateColoredLayers = (
  sources: SourceSpecification[],
  assignLayerColor,
) => {
  const polyLayers = [];
  const circleLayers = [];
  const lineLayers = [];

  const alphaColors = (layerId: string | LayerSpecification) => {
    const color = assignLayerColor.bind(null, layerId);
    const obj = {
      circle: color(0.8),
      line: color(0.6),
      polygon: color(0.3),
      polygonOutline: color(0.6),
      default: color(1),
    };
    return obj;
  };

  Object.keys(sources).forEach((sourceId) => {
    const layers = sources[`${sourceId}`];

    if (!layers || layers.length === 0) {
      const colors = alphaColors(sourceId);
      circleLayers.push(circleLayer(colors.circle, sourceId));
      lineLayers.push(lineLayer(colors.line, sourceId));
      polyLayers.push(
        polygonLayer(colors.polygon, colors.polygonOutline, sourceId),
      );
    } else {
      layers.forEach((layer: LayerSpecification) => {
        const colors = alphaColors(layer);

        circleLayers.push(circleLayer(colors.circle, sourceId, layer));
        lineLayers.push(lineLayer(colors.line, sourceId, layer));
        polyLayers.push(
          polygonLayer(colors.polygon, colors.polygonOutline, sourceId, layer),
        );
      });
    }
  });

  return polyLayers.concat(lineLayers).concat(circleLayers);
};

const generateInspectStyle = (
  originalMapStyle: StyleSpecification,
  coloredLayers: LayerSpecification[],
  opts: any,
): StyleSpecification => {
  opts = Object.assign(
    {
      backgroundColor: '#fff',
    },
    opts,
  );

  const backgroundLayer = {
    id: 'background',
    type: 'background',
    paint: {
      'background-color': opts.backgroundColor,
    },
  };

  const sources = {};
  Object.keys(originalMapStyle.sources).forEach((sourceId) => {
    const source = originalMapStyle.sources[`${sourceId}`];
    if (source.type === 'vector' || source.type === 'geojson') {
      sources[`${sourceId}`] = source;
    }
  });

  return Object.assign(originalMapStyle, {
    layers: [backgroundLayer].concat(coloredLayers),
    sources,
  });
};

export { generateInspectStyle, generateColoredLayers };
