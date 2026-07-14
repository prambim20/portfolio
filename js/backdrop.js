import { services } from './data.js';

/**
 * Living Spatial Backdrop Engine
 * Collects product output maps from your static work catalogs and structures 
 * an ambient, low-contrast slides loop masked into the page background.
 */
export class SpatialBackdropEngine {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container || !Array.isArray(services)) return;

    // Collect all valid service output renders
    this.images = services
      .map(service => service.imageUrl)
      .filter(url => url && typeof url === 'string');

    this.layers = [];
    this.activeIdx = 0;
    this.intervalId = null;
    this.transitionTime = 8000; // Duration per slide display cycle (in ms)

    this.buildBackdropLayers();
    this.startLoop();
  }

  buildBackdropLayers() {
    this.container.innerHTML = '';
    const fragment = document.createDocumentFragment();

    // Max out at 6 backgrounds to minimize memory footprint
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
      // Remove class active states to reverse transitions smoothly
      this.layers.forEach((layer, i) => {
        if (i !== this.activeIdx) {
          layer.classList.remove('active');
        }
      });

      // Target next background slide
      const activeLayer = this.layers[this.activeIdx];
      activeLayer.classList.add('active');

      // Shift index forward
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