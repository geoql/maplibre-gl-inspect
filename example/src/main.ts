import maplibregl from 'maplibre-gl';
import { MaplibreInspect } from 'maplibre-gl-inspect';
import 'maplibre-gl-inspect/dist/style.css';
import './style.css';

const map = new maplibregl.Map({
  container: 'map',
  style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  center: [-74.006, 40.7128],
  zoom: 13,
});

map.addControl(new maplibregl.NavigationControl(), 'top-right');

map.addControl(
  new MaplibreInspect({
    showInspectMapPopup: true,
    showInspectMapPopupOnHover: true,
    showInspectButton: true,
  }),
);
