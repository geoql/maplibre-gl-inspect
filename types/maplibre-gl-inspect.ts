import type {
  LayerSpecification,
  Popup,
  SourceSpecification,
  StyleSpecification,
} from 'maplibre-gl';

export type RenderPopupProperty = {
  [x: string]: null | undefined | string | number | object | Date;
};

export type RenderPopupFeature = {
  source: string;
  sourceLayer?: string;
  layer: { [x: string]: string; source: string };
  geometry: { type: string };
  properties: RenderPopupProperty;
};

export type Options = {
  showInspectMap: boolean;
  showInspectButton: boolean;
  showInspectMapPopup: boolean;
  showMapPopup: boolean;
  showMapPopupOnHover: boolean;
  showInspectMapPopupOnHover: boolean;
  blockHoverPopupOnClick: boolean;
  backgroundColor: string;
  assignLayerColor(layerId: string, alpha?: string): string;
  buildInspectStyle(
    originalMapStyle: StyleSpecification,
    coloredLayers: LayerSpecification[],
    opts: any,
  ): StyleSpecification;
  renderPopup(features: RenderPopupFeature[]): string;
  popup: Popup;
  selectThreshold: number;
  useInspectStyle: boolean;
  queryParameters: Record<string, string>;
  sources: SourceSpecification[];
  toggleCallback(showInspectMap?: boolean): void;
};
