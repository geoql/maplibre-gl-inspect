import maplibregl, { MapMouseEvent, SourceSpecification } from 'maplibre-gl';
import type { Map, Popup, StyleSpecification } from 'maplibre-gl';
import type { Options } from '../types/maplibre-gl-inspect';
import './maplibre-gl-inspect.css';
import isEqual from 'lodash.isequal';
import { generateInspectStyle, generateColoredLayers } from './style-gen';
import { InspectButton } from './inspect-button';
import { renderPopup } from './render-popup';
import { brightColor } from './colors';

const isInspectStyle = (style: StyleSpecification): boolean => {
  return !!(
    style.metadata &&
    'maplibregl-inspect:inspect' in Object.keys(style.metadata)
  );
};

const markInspectStyle = (style: StyleSpecification): StyleSpecification => {
  return Object.assign(style, {
    metadata: Object.assign({}, style.metadata, {
      'maplibregl-inspect:inspect': true,
    }),
  });
};

class MaplibreInspect {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  private _map: Map;
  private _popup: Popup | null;
  private _popupBlocked = false;
  private _showInspectMap: boolean;
  private _originalStyle: StyleSpecification | null;
  private _toggle: InspectButton;
  public options: Options;
  public sources: SourceSpecification[];
  public assignLayerColor: (layerName: string, alpha?: string) => string;

  constructor(options: Options) {
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
    } else if (!options.popup) {
      console.error(
        'Maplibre GL JS can not be found. Make sure to include it or pass an initialized MaplibreGL Popup to MaplibreInspect if you are using moduleis.',
      );
    }

    this.options = Object.assign(
      {
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
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        toggleCallback() {},
      },
      options,
    );

    this.sources = this.options.sources;
    this.assignLayerColor = this.options.assignLayerColor;
    this.toggleInspector = this.toggleInspector.bind(this);
    this._popup = this.options.popup;
    this._popupBlocked = false;
    this._showInspectMap = this.options.showInspectMap;
    this._onSourceChange = this._onSourceChange.bind(this);
    this._onMousemove = this._onMousemove.bind(this);
    this._onRightClick = this._onRightClick.bind(this);
    this._onStyleChange = this._onStyleChange.bind(this);

    this._originalStyle = null;
    this._toggle = new InspectButton({
      show: this.options.showInspectButton,
      onToggle: this.toggleInspector.bind(this),
    });
  }

  public toggleInspector(): void {
    this._showInspectMap = !this._showInspectMap;
    this.options.toggleCallback(this._showInspectMap);
    this.render();
  }

  private _inspectStyle = (): StyleSpecification => {
    const coloredLayers = generateColoredLayers(
      this.sources,
      this.assignLayerColor,
    );
    return this.options.buildInspectStyle(this._map.getStyle(), coloredLayers, {
      backgroundColor: this.options.backgroundColor,
    });
  };

  public render(): void {
    if (this._showInspectMap) {
      if (this.options.useInspectStyle) {
        this._map.setStyle(markInspectStyle(this._inspectStyle()));
      }
      this._toggle.setMapIcon();
    } else if (this._originalStyle) {
      if (this._popup) this._popup.remove();
      if (this.options.useInspectStyle) {
        this._map.setStyle(this._originalStyle);
      }
      this._toggle.setInspectIcon();
    }
  }

  private _onSourceChange(e: {
    sourceDataType: string;
    isSourceLoaded: boolean;
  }) {
    const sources = this.sources;
    const map = this._map;
    const mapStyle = map.getStyle();
    const mapStyleSourcesNames = Object.keys(mapStyle.sources);
    const previousSources = Object.assign({}, sources);

    //NOTE: This heavily depends on the internal API of Maplibre GL
    //so this breaks between Maplibre GL JS releases
    if (e.sourceDataType !== 'visibility' && e.isSourceLoaded) {
      Object.keys(map.style.sourceCaches).forEach((sourceId) => {
        const sourceCache = map.style.sourceCaches[`${sourceId}`] || {
          _source: {},
        };
        const layerIds = sourceCache._source.vectorLayerIds;
        if (layerIds) {
          sources[sourceId] = layerIds;
        } else if (sourceCache._source.type === 'geojson') {
          sources[sourceId] = [];
        }
      });

      Object.keys(sources).forEach((sourceId) => {
        if (mapStyleSourcesNames.indexOf(sourceId) === -1) {
          delete sources[sourceId];
        }
      });

      if (
        !isEqual(previousSources, sources) &&
        Object.keys(sources).length > 0
      ) {
        this.render();
      }
    }
  }

  private _onStyleChange() {
    const style = this._map.getStyle();
    if (!isInspectStyle(style)) {
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

  private _onMousemove(e: MouseEvent | MapMouseEvent) {
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

    if (!this._popupBlocked) {
      console.log('popup blocked?: ', this._popupBlocked);
      console.log('event: ', e);
      const features = this._map.queryRenderedFeatures(
        (e as MapMouseEvent).point,
        {
          layers: this.options.showInspectMap
            ? Object.keys(this.sources)
            : undefined,
          ...this.options.queryParameters,
        },
      );

      if (features.length > 0) {
        const feature = features[0];
        const featureLayerId = feature.layer.id;
        const featureSourceId = feature.source;
        const featureSourceLayerId = feature.sourceLayer;
        const featureSourceLayer = this.sources[featureSourceId].find(
          (sourceLayer) => sourceLayer.id === featureSourceLayerId,
        );
        const featureLayer = featureSourceLayer?.layers.find(
          (layer) => layer.id === featureLayerId,
        );

        if (this._popup) {
          this._popup
            .setLngLat((e as MapMouseEvent).lngLat)
            .setDOMContent(
              'acb',
              // this.options.renderPopup(feature, featureLayer, featureSourceId),
            )
            .addTo(this._map);
        }
      } else if (this._popup) {
        this._popup.remove();
      }
    }
  }

  public onAdd(map: Map) {
    this._map = map;

    // if sources have already been passed as options
    // we do not need to figure out the sources ourselves
    if (Object.keys(this.sources).length === 0) {
      map.on('tiledata', this._onSourceChange);
      map.on('sourcedata', this._onSourceChange);
    }

    map.on('styledata', this._onStyleChange);
    map.on('load', this._onStyleChange);
    map.on('mousemove', this._onMousemove);
    map.on('click', this._onMousemove);
    map.on('contextmenu', this._onRightClick);
    return this._toggle.elem;
  }

  public onRemove() {
    this._map.off('styledata', this._onStyleChange);
    this._map.off('load', this._onStyleChange);
    this._map.off('tiledata', this._onSourceChange);
    this._map.off('sourcedata', this._onSourceChange);
    this._map.off('mousemove', this._onMousemove);
    this._map.off('click', this._onMousemove);
    this._map.off('contextmenu', this._onRightClick);

    const elem = this._toggle.elem;
    elem.parentNode?.removeChild(elem);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this._map = undefined;
  }
}

export { MaplibreInspect };
