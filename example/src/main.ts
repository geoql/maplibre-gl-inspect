import maplibregl from 'maplibre-gl';
import { MaplibreInspect } from 'maplibre-gl-inspect';
import type { Theme } from 'maplibre-gl-inspect';
import 'maplibre-gl-inspect/dist/style.css';
import './style.css';

const map = new maplibregl.Map({
  container: 'map',
  style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  center: [-74.006, 40.7128],
  zoom: 13,
});

map.addControl(new maplibregl.NavigationControl(), 'top-right');

const inspect = new MaplibreInspect({
  showInspectMapPopup: true,
  showInspectMapPopupOnHover: true,
  showInspectButton: true,
  theme: 'system',
});

map.addControl(inspect);

// Theme switcher
const switcher = document.getElementById('theme-switcher');
if (switcher) {
  switcher.addEventListener('change', (e) => {
    const theme = (e.target as HTMLSelectElement).value as Theme;
    inspect.setTheme(theme);
  });
}
