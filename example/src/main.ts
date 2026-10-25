import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import * as maplibregl from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { MaplibreInspect } from 'maplibre-gl-inspect';
import type { Theme } from 'maplibre-gl-inspect';
import 'maplibre-gl-inspect/dist/style.css';
import './style.css';
import { initGa4, track } from './analytics';

type ResolvedMode = 'light' | 'dark';

const STYLES: Record<ResolvedMode, string> = {
  light: 'https://tiles.openfreemap.org/styles/liberty',
  dark: 'https://tiles.openfreemap.org/styles/dark',
};

/** Canvas colour behind the recoloured layers in inspect mode. */
const INSPECT_BACKGROUND: Record<ResolvedMode, string> = {
  light: '#f6f7f9',
  dark: '#16181d',
};

const STORAGE_KEY = 'color-mode';
const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

const isTheme = (value: string | null | undefined): value is Theme =>
  value === 'system' || value === 'light' || value === 'dark';

const readPreference = (): Theme => {
  const fromDom = document.documentElement.dataset['colorMode'];
  return isTheme(fromDom) ? fromDom : 'system';
};

const resolve = (pref: Theme): ResolvedMode =>
  pref === 'system' ? (darkQuery.matches ? 'dark' : 'light') : pref;

const byId = <T extends HTMLElement>(id: string): T => {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing #${id}`);
  return el as T;
};

initGa4();

// MapLibre 6 + a bundler: point the map at the bundled, self-contained worker
// (https://maplibre.org/maplibre-gl-js/docs/#installation, "Vite").
maplibregl.setWorkerUrl(workerUrl);

let preference = readPreference();
let resolved = resolve(preference);
let inspecting = false;

const map = new maplibregl.Map({
  container: 'map',
  style: STYLES[resolved],
  center: [-74.006, 40.7128],
  zoom: 13,
  attributionControl: { compact: true },
});

map.addControl(new maplibregl.NavigationControl(), 'top-right');

const cta = byId<HTMLButtonElement>('inspect-cta');
const ctaLabel = byId<HTMLSpanElement>('inspect-cta-label');
const statSources = byId<HTMLElement>('stat-sources');
const statLayers = byId<HTMLElement>('stat-layers');
const statMode = byId<HTMLElement>('stat-mode');

const syncInspectUi = (): void => {
  cta.setAttribute('aria-pressed', String(inspecting));
  ctaLabel.textContent = inspecting
    ? 'Back to the original style'
    : 'Inspect this map';
  statMode.textContent = inspecting ? 'Inspect' : 'Original';
};

const inspect = new MaplibreInspect({
  showInspectMapPopup: true,
  showInspectButton: true,
  theme: preference,
  backgroundColor: INSPECT_BACKGROUND[resolved],
  lightColors: {
    popupText: 'oklch(0.22 0.015 260)',
    popupBg: 'oklch(0.99 0.003 250)',
    popupBorder: 'oklch(0.89 0.006 260)',
    buttonIcon: 'oklch(0.22 0.015 260)',
  },
  darkColors: {
    popupText: 'oklch(0.95 0.004 250)',
    popupBg: 'oklch(0.2 0.01 260)',
    popupBorder: 'oklch(0.32 0.012 260)',
    buttonIcon: 'oklch(0.95 0.004 250)',
    ctrlBg: 'oklch(0.24 0.01 260)',
    inspectBackground: INSPECT_BACKGROUND.dark,
  },
  toggleCallback(show) {
    inspecting = Boolean(show);
    syncInspectUi();
    track('Inspect Toggle', { state: inspecting ? 'on' : 'off' });
  },
});

map.addControl(inspect);

const updateStats = (): void => {
  const entries = Object.values(inspect.sources);
  statSources.textContent = String(entries.length);
  statLayers.textContent = String(
    entries.reduce(
      (total, layers) =>
        total + (Array.isArray(layers) ? Math.max(layers.length, 1) : 1),
      0,
    ),
  );
};

map.on('sourcedata', (e) => {
  if (e.isSourceLoaded) updateStats();
});

cta.addEventListener('click', () => {
  inspect.toggleInspector();
});

/* Colour mode ------------------------------------------------------------ */

const modeButtons = Array.from(
  document.querySelectorAll<HTMLButtonElement>('.modes button[data-mode]'),
);

const syncModeButtons = (): void => {
  for (const button of modeButtons) {
    button.setAttribute(
      'aria-checked',
      String(button.dataset['mode'] === preference),
    );
  }
};

const applyMode = (next: Theme): void => {
  const previous = resolved;
  preference = next;
  resolved = resolve(next);

  document.documentElement.dataset['colorMode'] = next;
  document.documentElement.classList.toggle('dark', resolved === 'dark');
  try {
    if (next === 'system') localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Storage can be unavailable (private mode); the choice still applies.
  }

  inspect.setTheme(next);
  inspect.options.backgroundColor = INSPECT_BACKGROUND[resolved];
  syncModeButtons();

  if (previous === resolved) return;

  // Swap the basemap. In inspect mode, leave it first so the new style is
  // captured as the original, then return to inspect once it has loaded.
  const wasInspecting = inspecting;
  if (wasInspecting) inspect.toggleInspector();
  map.setStyle(STYLES[resolved]);
  if (wasInspecting) {
    map.once('idle', () => {
      if (!inspecting) inspect.toggleInspector();
    });
  }
};

for (const button of modeButtons) {
  button.addEventListener('click', () => {
    const mode = button.dataset['mode'];
    if (!isTheme(mode) || mode === preference) return;
    applyMode(mode);
    track('Theme Change', { mode });
  });
}

darkQuery.addEventListener('change', () => {
  if (preference === 'system') applyMode('system');
});

syncModeButtons();
syncInspectUi();

/* Install copy, outbound links, panel ----------------------------------- */

const copyButton = byId<HTMLButtonElement>('copy-install');
const installCmd = byId<HTMLElement>('install-cmd');

copyButton.addEventListener('click', () => {
  const text = installCmd.textContent ?? '';
  navigator.clipboard.writeText(text).then(
    () => {
      copyButton.textContent = 'Copied';
      track('Install Copy', { command: text });
      window.setTimeout(() => {
        copyButton.textContent = 'Copy';
      }, 1600);
    },
    () => {
      copyButton.textContent = 'Press ⌘C';
    },
  );
});

for (const link of document.querySelectorAll<HTMLAnchorElement>(
  'a[data-outbound]',
)) {
  link.addEventListener('click', () => {
    track('Outbound Link', { target: link.dataset['outbound'] ?? link.href });
  });
}

const panelToggle = byId<HTMLButtonElement>('panel-toggle');
const panel = panelToggle.closest('.panel');

panelToggle.addEventListener('click', () => {
  const open = panelToggle.getAttribute('aria-expanded') !== 'true';
  panelToggle.setAttribute('aria-expanded', String(open));
  panel?.classList.toggle('is-collapsed', !open);
  const label = panelToggle.querySelector('.sr-only');
  if (label) label.textContent = open ? 'Hide details' : 'Show details';
});

if (window.matchMedia('(max-width: 640px)').matches) {
  panelToggle.click();
}
