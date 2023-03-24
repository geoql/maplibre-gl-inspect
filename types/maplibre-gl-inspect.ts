import type {
  Popup,
  SourceSpecification,
  StyleSpecification,
} from 'maplibre-gl';

export type Options = {
  showInspectMap: boolean;
  showInspectButton: boolean;
  showInspectMapPopup: boolean;
  showMapPopup: boolean;
  showMapPopupOnHover: boolean;
  showInspectMapPopupOnHover: boolean;
  blockHoverPopupOnClick: boolean;
  backgroundColor: string;
  assignLayerColor: string;
  buildInspectStyle: StyleSpecification;
  renderPopup: string;
  popup: Popup;
  selectThreshold: number;
  useInspectStyle: boolean;
  queryParameters: Record<string, string>;
  sources: SourceSpecification[];
  toggleCallback(): void;
};
