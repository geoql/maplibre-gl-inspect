/**
 * GA4 measurement ID. Empty until the property exists; while it is empty,
 * gtag is never loaded and GA4 events are skipped.
 */
const GA4_MEASUREMENT_ID: string = '';

type EventProps = Record<string, string | number | boolean>;

type PlausibleFn = (event: string, options?: { props?: EventProps }) => void;
type OpenPanelFn = (method: 'track', event: string, props?: EventProps) => void;
type GtagFn = (...args: unknown[]) => void;

interface AnalyticsWindow {
  plausible?: PlausibleFn;
  op?: OpenPanelFn;
  gtag?: GtagFn;
  dataLayer?: unknown[];
}

const w = window as unknown as AnalyticsWindow;

export const initGa4 = (): void => {
  if (!GA4_MEASUREMENT_ID) return;
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
  document.head.append(script);
  w.dataLayer = w.dataLayer ?? [];
  const dataLayer = w.dataLayer;
  w.gtag = function gtag() {
    // gtag.js reads the `arguments` object itself, not an array copy.
    dataLayer.push(arguments);
  };
  w.gtag('js', new Date());
  w.gtag('config', GA4_MEASUREMENT_ID);
};

/** Send one product event to every configured tracker. */
export const track = (event: string, props: EventProps = {}): void => {
  w.plausible?.(event, { props });
  w.op?.('track', event, props);
  if (GA4_MEASUREMENT_ID) w.gtag?.('event', event, props);
};
