import { services } from './data.js';

export class SpatialBackdropEngine {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container || !Array.isArray(services)) return;

    this.images = services
      .map(service => {
        const url = service.imageUrl;
        if (url && /cover/i.test(url) && Array.isArray(service.views) && service.views.length > 0) {
          return service.views[0].url;
        }
        return url;
      })
      .filter(url => typeof url === 'string' && url.length > 0 && !/cover/i.test(url));

    this.layers = [];
    this.activeIdx = 0;
    this.intervalId = null;
    this.transitionTime = 8000;

    this.buildBackdropLayers();
    this.startLoop();
  }

  buildBackdropLayers() {
    this.container.innerHTML = '';
    const fragment = document.createDocumentFragment();
    const backdropsCount = Math.min(6, this.images.length);

    for (let i = 0; i < backdropsCount; i++) {
      const layer = document.createElement('div');
      layer.className = 'backdrop-layer';
      layer.style.backgroundImage = `url('${this.images[i]}')`;
      
      fragment.appendChild(layer);
      this.layers.push(layer);
    }

    this.container.appendChild(fragment);
  }

  startLoop() {
    if (this.layers.length === 0) return;

    const transition = () => {
      this.layers.forEach((layer, i) => {
        layer.classList.toggle('active', i === this.activeIdx);
      });
      this.activeIdx = (this.activeIdx + 1) % this.layers.length;
    };

    transition();
    this.intervalId = setInterval(transition, this.transitionTime);
  }

  destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}