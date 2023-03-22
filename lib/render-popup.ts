const displayValue = (value): string => {
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

const renderProperty = (propertyName, property) => {
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

const renderLayer = (layerId) => {
  return `<div class="maplibregl-inspect-layer">${layerId}</div>`;
};

const renderProperties = (feature) => {
  const sourceProperty = renderLayer(
    feature.layer['source-layer'] || feature.layer.source,
  );
  const typeProperty = renderProperty('$type', feature.geometry.type);
  const properties = Object.keys(feature.properties).map((propertyName) =>
    renderProperty(propertyName, feature.properties[`${propertyName}`]),
  );
  return [sourceProperty, typeProperty].concat(properties).join('');
};

const renderFeatures = (features) => {
  return features
    .map(
      (ft) =>
        `<div class="maplibregl-inspect-feature">${renderProperties(ft)}</div>`,
    )
    .join('');
};

const renderPopup = (features) => {
  return `<div class="maplibregl-inspect-popup">${renderFeatures(
    features,
  )}</div>`;
};

export { renderPopup as RenderPopup };
