const container = (child: Node, show: boolean): HTMLDivElement => {
  const container = document.createElement('div');
  container.className = 'maplibregl-ctrl maplibregl-ctrl-group';
  container.appendChild(child);
  if (!show) {
    container.style.display = 'none';
  }
  return container;
};

const button = () => {
  const btn = document.createElement('button');
  btn.className = 'maplibregl-ctrl-icon maplibregl-ctrl-inspect';
  btn.type = 'button';
  btn['aria-label'] = 'Inspect';
  return btn;
};

const InspectButton = (options) => {
  options = Object.assign(
    {
      show: true,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onToggle() {},
    },
    options,
  );

  this._btn = button();
  this._btn.onclick = options.onToggle;
  this.elem = container(this._btn, options.show);
};

InspectButton.prototype.setInspectIcon = () => {
  this._btn.className = 'maplibregl-ctrl-icon maplibregl-ctrl-inspect';
};

InspectButton.prototype.setMapIcon = () => {
  this._btn.className = 'maplibregl-ctrl-icon maplibregl-ctrl-map';
};

export { InspectButton };
