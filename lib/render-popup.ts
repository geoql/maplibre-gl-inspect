import type { MapGeoJSONFeature } from 'maplibre-gl';

const displayValue = (value: string | null) => {
  if (typeof value === 'undefined' || value === null) return value;
  if (value instanceof Date) return value.toLocaleString();
  if (
    typeof value === 'object' ||
    typeof value === 'number' ||
    typeof value === 'string'
  )
    return value.toString();
  return value;
};

const renderProperty = (propertyName: string, property: any) => {
  return (
    `${
      '<div class="maplibregl-inspect-property">' +
      '<div class="maplibregl-inspect-property-name">'
    }${propertyName}</div>` +
    `<div class="maplibregl-inspect-property-value">${displayValue(
      property,
    )}</div>` +
    '</div>'
  );
};

const renderLayer = (layerId: any) => {
  return `<div class="maplibregl-inspect-layer">${layerId}</div>`;
};

const renderProperties = (feature: {
  layer: { [x: string]: any; source: any };
  geometry: { type: any };
  properties: { [x: string]: any };
}) => {
  const sourceProperty = renderLayer(
    feature.layer['source-layer'] || feature.layer.source,
  );
  const typeProperty = renderProperty('$type', feature.geometry.type);
  const properties = Object.keys(feature.properties).map((propertyName) =>
    renderProperty(propertyName, feature.properties[`${propertyName}`]),
  );
  return [sourceProperty, typeProperty].concat(properties).join('');
};

const renderFeatures = (features: any[]) => {
  return features
    .map(
      (ft: any) =>
        `<div class="maplibregl-inspect-feature">${renderProperties(ft)}</div>`,
    )
    .join('');
};

const renderPopup = (features: MapGeoJSONFeature[]) => {
  return `<div class="maplibregl-inspect-popup">${renderFeatures(
    features,
  )}</div>`;
};

export { renderPopup };
