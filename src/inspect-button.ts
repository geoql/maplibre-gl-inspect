import type { InspectButtonOptions } from './types';

class InspectButton {
  private _btn: HTMLButtonElement;
  public elem: HTMLDivElement;

  constructor(options: InspectButtonOptions = {}) {
    const { show = true, onToggle = () => {} } = options;

    this._btn = this.button();
    this._btn.onclick = onToggle;
    this.elem = this.container(this._btn, show);
  }

  private container(child: Node, show: boolean): HTMLDivElement {
    const container = document.createElement('div');
    container.className = 'maplibregl-ctrl maplibregl-ctrl-group';
    container.appendChild(child);
    if (!show) {
      container.style.display = 'none';
    }
    return container;
  }

  private button(): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.className = 'maplibregl-ctrl-icon maplibregl-ctrl-inspect';
    btn.type = 'button';
    btn.ariaLabel = 'Inspect';
    return btn;
  }

  public setInspectIcon(): void {
    this._btn.className = 'maplibregl-ctrl-icon maplibregl-ctrl-inspect';
  }

  public setMapIcon(): void {
    this._btn.className = 'maplibregl-ctrl-icon maplibregl-ctrl-map';
  }
}

export { InspectButton };
