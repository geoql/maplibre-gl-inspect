import {
  RenderPopupFeature,
  RenderPopupProperty,
} from '../types/maplibre-gl-inspect';

const displayValue = (
  value: RenderPopupProperty[keyof RenderPopupProperty],
) => {
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

const renderProperty = <
  T extends RenderPopupProperty[keyof RenderPopupProperty],
>(
  propertyName: string,
  property: T,
) => {
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

const renderLayer = (layerId: string) => {
  return `<div class="maplibregl-inspect-layer">${layerId}</div>`;
};

const renderProperties = (feature: RenderPopupFeature) => {
  const sourceProperty = renderLayer(
    feature.layer['source-layer'] || feature.layer.source,
  );
  const typeProperty = renderProperty<string>('$type', feature.geometry.type);
  const properties = Object.keys(feature.properties).map((propertyName) =>
    renderProperty(propertyName, feature.properties[`${propertyName}`]),
  );
  return [sourceProperty, typeProperty].concat(properties).join('');
};

const renderFeatures = (features: RenderPopupFeature[]) => {
  return features
    .map(
      (ft: RenderPopupFeature) =>
        `<div class="maplibregl-inspect-feature">${renderProperties(ft)}</div>`,
    )
    .join('');
};

const renderPopup = (features: RenderPopupFeature[]) => {
  return `<div class="maplibregl-inspect-popup">${renderFeatures(
    features,
  )}</div>`;
};

export { renderPopup };
