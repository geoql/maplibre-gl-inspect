import randomColor from 'randomcolor';

/**
 * Assign a color to a unique layer ID and also considering
 * common layer names such as water or wood.
 *
 * @param {string} layerId - Unique layer ID
 * @param {string} alpha - Alpha value for the color
 * @returns {string} Unique random for the layer ID
 */
const brightColor = (layerId: string, alpha: string): string => {
  let luminosity: 'bright' | 'dark' = 'bright';
  let hue = null;

  if (/water|ocean|lake|sea|river/.test(layerId)) {
    hue = 'blue';
  }

  if (/state|country|place/.test(layerId)) {
    hue = 'pink';
  }

  if (/road|highway|transport|streets/.test(layerId)) {
    hue = 'orange';
  }

  if (/contour|building/.test(layerId)) {
    hue = 'monochrome';
  }

  if (/building/.test(layerId)) {
    luminosity = 'dark';
  }

  if (/contour|landuse/.test(layerId)) {
    hue = 'yellow';
  }

  if (/wood|forest|park|landcover|land/.test(layerId)) {
    hue = 'green';
  }

  const rgb = randomColor({
    luminosity,
    hue,
    seed: layerId,
    format: 'rgbArray',
  });

  const rgba = `${rgb},${alpha || 1}`;
  return `rgba(${rgba})`;
};

export { brightColor };
