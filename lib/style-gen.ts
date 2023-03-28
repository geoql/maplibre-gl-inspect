import type {
  SourceSpecification,
  LayerSpecification,
  StyleSpecification,
  CircleLayerSpecification,
  FillLayerSpecification,
  LineLayerSpecification,
  BackgroundLayerSpecification,
} from 'maplibre-gl';
import type { Options } from '../types/maplibre-gl-inspect';

const circleLayer = (
  color: string,
  source: string,
  vectorLayer?: string | undefined,
) => {
  const layer: CircleLayerSpecification = {
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
  source: string,
  vectorLayer?: string | undefined,
) => {
  const layer: FillLayerSpecification = {
    id: [source, vectorLayer, 'polygon'].join('_'),
    source,
    type: 'fill',
    paint: {
      'fill-antialias': true,
      'fill-color': color,
      'fill-outline-color': outlineColor,
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
  source: string,
  vectorLayer?: string | undefined,
) => {
  const layer: LineLayerSpecification = {
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
  sources: Options['sources'],
  assignLayerColor: Options['assignLayerColor'],
): (
  | FillLayerSpecification
  | LineLayerSpecification
  | CircleLayerSpecification
)[] => {
  const polyLayers: FillLayerSpecification[] = [];
  const circleLayers: CircleLayerSpecification[] = [];
  const lineLayers: LineLayerSpecification[] = [];

  const alphaColors = (layerId: string) => {
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
    const layers = sources[`${sourceId}`] as string[];

    if (!layers || layers.length === 0) {
      const colors = alphaColors(sourceId);
      circleLayers.push(circleLayer(colors.circle, sourceId));
      lineLayers.push(lineLayer(colors.line, sourceId));
      polyLayers.push(
        polygonLayer(colors.polygon, colors.polygonOutline, sourceId),
      );
    } else {
      layers.forEach((layer: string) => {
        const colors = alphaColors(layer);

        circleLayers.push(circleLayer(colors.circle, sourceId, layer));
        lineLayers.push(lineLayer(colors.line, sourceId, layer));
        polyLayers.push(
          polygonLayer(colors.polygon, colors.polygonOutline, sourceId, layer),
        );
      });
    }
  });

  return [...polyLayers, ...lineLayers, ...circleLayers];
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

  const backgroundLayer: BackgroundLayerSpecification = {
    id: 'background',
    type: 'background',
    paint: {
      'background-color': opts.backgroundColor,
    },
  };

  const sources = {} as {
    [_: string]: SourceSpecification;
  };
  Object.keys(originalMapStyle.sources).forEach((sourceId) => {
    const source = originalMapStyle.sources[`${sourceId}`];
    if (source.type === 'vector' || source.type === 'geojson') {
      sources[`${sourceId}`] = source;
    }
  });

  return {
    ...originalMapStyle,
    layers: [backgroundLayer, ...coloredLayers],
    sources,
  };
};

export { generateInspectStyle, generateColoredLayers };
