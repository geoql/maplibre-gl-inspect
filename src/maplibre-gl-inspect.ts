import maplibregl from 'maplibre-gl';
import type {
  Map,
  Popup,
  PointLike,
  MapMouseEvent,
  MapSourceDataEvent,
  StyleSpecification,
} from 'maplibre-gl';
import type { Options, RenderPopupFeature, Theme, ThemeColors } from './types';
import './maplibre-gl-inspect.css';

import { generateInspectStyle, generateColoredLayers } from './style-gen';
import { InspectButton } from './inspect-button';
import { renderPopup } from './render-popup';
import { brightColor } from './colors';
import { DEFAULT_LIGHT_COLORS, DEFAULT_DARK_COLORS } from './theme-colors';

/** Internal MapLibre GL types for accessing private style APIs */
interface SourceInternal {
  vectorLayerIds?: string[];
  type?: string;
}

interface TileManagerInternal {
  getSource(): SourceInternal;
}

interface StyleInternal {
  tileManagers: Record<string, TileManagerInternal>;
}

const isInspectStyle = (style: StyleSpecification): boolean => {
  return !!(
    style.metadata &&
    'maplibregl-inspect:inspect' in (style.metadata as Record<string, unknown>)
  );
};

const markInspectStyle = (style: StyleSpecification): StyleSpecification => {
  const updatedStyle = {
    ...style,
    metadata: Object.assign({}, style.metadata, {
      'maplibregl-inspect:inspect': true,
    }),
  };
  return updatedStyle;
};

class MaplibreInspect {
  private _map: Map | undefined;
  private _popup: Popup | null;
  private _popupBlocked = false;
  private _showInspectMap: boolean;
  private _originalStyle: StyleSpecification | null;
  private _toggle: InspectButton;
  public options: Options;
  public sources: Options['sources'];
  public assignLayerColor: Options['assignLayerColor'];
  private _currentTheme: Theme;
  private readonly _mediaQuery: MediaQueryList | null;
  private readonly _lightColors: ThemeColors;
  private readonly _darkColors: ThemeColors;

  constructor(options?: Partial<Options>) {
    if (!(this instanceof MaplibreInspect)) {
      throw new Error(
        'MaplibreInspect needs to be called with the new keyword',
      );
    }

    let popup: Popup | null = null;
    if (maplibregl) {
      popup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
      });
    } else if (!options?.popup) {
      console.error(
        'Maplibre GL JS can not be found. Make sure to include it or pass an initialized MaplibreGL Popup to MaplibreInspect if you are using moduleis.',
      );
    }

    const defaults: Options = {
      showInspectMap: false,
      showInspectButton: true,
      showInspectMapPopup: true,
      showMapPopup: false,
      showMapPopupOnHover: true,
      showInspectMapPopupOnHover: true,
      blockHoverPopupOnClick: false,
      backgroundColor: '#fff',
      assignLayerColor: brightColor,
      buildInspectStyle: generateInspectStyle,
      renderPopup,
      popup,
      selectThreshold: 5,
      useInspectStyle: true,
      queryParameters: {},
      sources: {},
      toggleCallback(showInspect: boolean) {
        console.log('Inspector status?: ', showInspect);
      },
    };
    this.options = Object.assign(defaults, options);

    this.sources = this.options.sources;
    this.assignLayerColor = this.options.assignLayerColor;
    this.toggleInspector = this.toggleInspector.bind(this);
    this._popup = this.options.popup;
    this._popupBlocked = false;
    this._showInspectMap = this.options.showInspectMap;
    this._onSourceChange = this._onSourceChange.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onRightClick = this._onRightClick.bind(this);
    this._onStyleChange = this._onStyleChange.bind(this);

    this._currentTheme = this.options.theme ?? 'system';
    this._lightColors = {
      ...DEFAULT_LIGHT_COLORS,
      ...this.options.lightColors,
    };
    this._darkColors = { ...DEFAULT_DARK_COLORS, ...this.options.darkColors };

    if (
      this._currentTheme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia
    ) {
      this._mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this._mediaQuery.addEventListener('change', this._onSystemThemeChange);
    } else {
      this._mediaQuery = null;
    }

    this._applyTheme();

    this._originalStyle = null;
    this._toggle = new InspectButton({
      show: this.options.showInspectButton,
      onToggle: this.toggleInspector.bind(this),
    });
  }

  private _inspectStyle(): StyleSpecification {
    let style = this._map?.getStyle();
    if (this._map) {
      const coloredLayers = generateColoredLayers(
        this.sources,
        this.assignLayerColor,
      );
      style = this.options.buildInspectStyle(
        this._map.getStyle(),
        coloredLayers,
        {
          backgroundColor: this.options.backgroundColor,
        },
      );
    }
    return style as StyleSpecification;
  }

  private _onSourceChange(e: MapSourceDataEvent) {
    const sources = this.sources;
    if (this._map) {
      const map = this._map;
      const mapStyle = map.getStyle();
      const mapStyleSourcesNames = Object.keys(mapStyle.sources);
      const previousSources = Object.assign({}, sources);

      //NOTE: This heavily depends on the internal API of Maplibre GL
      //so this breaks between Maplibre GL JS releases
      if (e.isSourceLoaded) {
        const { tileManagers } = map.style as unknown as StyleInternal;
        for (const sourceId of Object.keys(tileManagers)) {
          const source = tileManagers[sourceId]?.getSource();
          if (source?.vectorLayerIds) {
            sources[sourceId] = source.vectorLayerIds;
          } else if (source?.type === 'geojson') {
            sources[sourceId] = [];
          }
        }

        Object.keys(sources).forEach((sourceId) => {
          if (mapStyleSourcesNames.indexOf(sourceId) === -1) {
            delete sources[`${sourceId}`];
          }
        });

        if (
          JSON.stringify(previousSources) !== JSON.stringify(sources) &&
          Object.keys(sources).length > 0
        ) {
          this.render();
        }
      }
    }
  }

  private _onStyleChange() {
    const style = this._map?.getStyle();
    if (style && !isInspectStyle(style)) {
      this._originalStyle = style;
    }
  }

  private _onRightClick() {
    if (
      !this.options.showMapPopupOnHover &&
      !this.options.showInspectMapPopupOnHover &&
      !this.options.blockHoverPopupOnClick
    ) {
      if (this._popup) this._popup.remove();
    }
  }

  private _onMouseMove(e: MouseEvent | MapMouseEvent) {
    if (this._showInspectMap) {
      if (!this.options.showInspectMapPopup) return;
      if (e.type === 'mousemove' && !this.options.showInspectMapPopupOnHover)
        return;
      if (
        e.type === 'click' &&
        this.options.showInspectMapPopupOnHover &&
        this.options.blockHoverPopupOnClick
      ) {
        this._popupBlocked = !this._popupBlocked;
      }
    } else {
      if (!this.options.showMapPopup) return;
      if (e.type === 'mousemove' && !this.options.showMapPopupOnHover) return;
      if (
        e.type === 'click' &&
        this.options.showMapPopupOnHover &&
        this.options.blockHoverPopupOnClick
      ) {
        this._popupBlocked = !this._popupBlocked;
      }
    }

    if (!this._popupBlocked && this._map) {
      let queryBox: PointLike | [PointLike, PointLike];
      if (this.options.selectThreshold === 0) {
        queryBox = (e as MapMouseEvent).point;
      } else {
        // set a bbox around the pointer
        queryBox = [
          [
            (e as MapMouseEvent).point.x - this.options.selectThreshold,
            (e as MapMouseEvent).point.y + this.options.selectThreshold,
          ], // bottom left (SW)
          [
            (e as MapMouseEvent).point.x + this.options.selectThreshold,
            (e as MapMouseEvent).point.y - this.options.selectThreshold,
          ], // top right (NE)
        ];
      }
      const features =
        this._map.queryRenderedFeatures(
          queryBox,
          this.options.queryParameters,
        ) || [];

      this._map.getCanvas().style.cursor = features.length ? 'pointer' : '';

      if (features.length > 0 && this._popup instanceof maplibregl.Popup) {
        this._popup.setLngLat((e as MapMouseEvent).lngLat);
        const renderedPopup = this.options.renderPopup(
          features as unknown as RenderPopupFeature[],
        );
        if (typeof renderedPopup === 'string') {
          this._popup.setHTML(renderedPopup);
        } else {
          this._popup.setDOMContent(renderedPopup);
        }
        this._popup.addTo(this._map);
      } else {
        this._popup?.remove();
      }
    }
  }

  public toggleInspector(): void {
    this._showInspectMap = !this._showInspectMap;
    this.options.toggleCallback(this._showInspectMap);
    this.render();
  }

  get theme(): Theme {
    return this._currentTheme;
  }

  public setTheme(theme: Theme): void {
    const previousTheme = this._currentTheme;
    this._currentTheme = theme;

    if (previousTheme === 'system' && theme !== 'system' && this._mediaQuery) {
      this._mediaQuery.removeEventListener('change', this._onSystemThemeChange);
    } else if (
      previousTheme !== 'system' &&
      theme === 'system' &&
      this._mediaQuery
    ) {
      this._mediaQuery.addEventListener('change', this._onSystemThemeChange);
    }

    this._applyTheme();
  }

  private _onSystemThemeChange = (): void => {
    if (this._currentTheme === 'system') {
      this._applyTheme();
    }
  };

  private _getResolvedTheme(): 'light' | 'dark' {
    if (this._currentTheme === 'system') {
      if (this._mediaQuery) {
        return this._mediaQuery.matches ? 'dark' : 'light';
      }
      return 'light';
    }
    return this._currentTheme;
  }

  private _applyTheme(): void {
    const resolved = this._getResolvedTheme();
    const colors = resolved === 'dark' ? this._darkColors : this._lightColors;

    document.documentElement.style.setProperty(
      '--inspect-popup-text',
      colors.popupText,
    );
    document.documentElement.style.setProperty(
      '--inspect-popup-border',
      colors.popupBorder,
    );
    document.documentElement.style.setProperty(
      '--inspect-button-icon',
      colors.buttonIcon,
    );
    document.documentElement.style.setProperty(
      '--inspect-background',
      colors.inspectBackground,
    );

    if (this._currentTheme === 'system') {
      document.documentElement.removeAttribute('data-inspect-theme');
    } else {
      document.documentElement.setAttribute('data-inspect-theme', resolved);
    }
  }

  public render(): void {
    if (this._showInspectMap) {
      if (this.options.useInspectStyle) {
        const inspectedStyle = this._inspectStyle();
        this._map?.setStyle(
          markInspectStyle(inspectedStyle as StyleSpecification),
        );
      }
      this._toggle.setMapIcon();
    }
    if (!this._showInspectMap && this._originalStyle) {
      if (this.options.useInspectStyle) {
        this._map?.setStyle(this._originalStyle);
      }
      if (this._popup) this._popup.remove();
      this._toggle.setInspectIcon();
    }
  }

  public onAdd(map: Map) {
    this._map = map;

    // if sources have already been passed as options
    // we do not need to figure out the sources ourselves
    if (Object.keys(this.sources).length === 0) {
      // map.on('tiledata', this._onSourceChange);
      map.on('sourcedata', this._onSourceChange);
    }

    map.on('styledata', this._onStyleChange);
    map.on('load', this._onStyleChange);
    map.on('mousemove', this._onMouseMove);
    map.on('click', this._onMouseMove);
    map.on('contextmenu', this._onRightClick);
    return this._toggle.elem;
  }

  public onRemove() {
    this._map?.off('styledata', this._onStyleChange);
    this._map?.off('load', this._onStyleChange);
    // this._map?.off('tiledata', this._onSourceChange);
    this._map?.off('sourcedata', this._onSourceChange);
    this._map?.off('mousemove', this._onMouseMove);
    this._map?.off('click', this._onMouseMove);
    this._map?.off('contextmenu', this._onRightClick);

    if (this._mediaQuery) {
      this._mediaQuery.removeEventListener('change', this._onSystemThemeChange);
    }

    document.documentElement.removeAttribute('data-inspect-theme');

    const elem = this._toggle.elem;
    elem.parentNode?.removeChild(elem);
    this._map = undefined;
  }
}

export { MaplibreInspect };
