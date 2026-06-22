/**
 * Leaflet Spatial Map Engine
 * Manages layer allocation, dynamic raster swipe comparative analysis, 
 * GeoJSON fetch boundaries, and garbage collection mechanisms for custom event streams.
 */
export class MapEngine {
  constructor(elementId, initialCoords, initialZoom) {
    this.map = L.map(elementId, {
      zoomControl: true,
      scrollWheelZoom: false,
      minZoom: 2,
      maxZoom: 20
    }).setView(initialCoords, initialZoom);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(this.map);

    this.activeLayerGroup = L.layerGroup().addTo(this.map);

    const mapElement = document.getElementById(elementId);
    this.parentContainer = mapElement.parentNode;

    this.legendContainer = document.createElement('div');
    this.legendContainer.className = 'map-legend-wrapper';
    this.parentContainer.appendChild(this.legendContainer);

    if (!this.map.getPane('comparison-pane')) {
      const pane = this.map.createPane('comparison-pane');
      pane.style.zIndex = 405; 
    }

    this.swipeContainer = null;
    this.activeProject = null;
    this.swipeValue = 0.5;
    
    // Scoped listener storage for safe garbage collection
    this._onMouseMove = null;
    this._onMouseUp = null;
    this._onMapMoveOrZoom = this.updateSwipeClip.bind(this);
  }

  updateLegend(legendConfig) {
    this.legendContainer.innerHTML = '';
    
    if (!legendConfig) {
      this.legendContainer.style.display = 'none';
      return;
    }

    this.legendContainer.style.display = 'flex';

    const title = document.createElement('div');
    title.className = 'map-legend-title';
    title.innerText = legendConfig.title;

    const barWrapper = document.createElement('div'); 
    barWrapper.className = 'map-legend-bar-wrapper';

    const bar = document.createElement('div');
    bar.className = 'map-legend-bar';
    bar.style.background = legendConfig.gradient;

    const ticksContainer = document.createElement('div');
    ticksContainer.className = 'map-legend-ticks';

    const numTicks = legendConfig.ticks.length;
    legendConfig.ticks.forEach((tickVal, index) => {
      const span = document.createElement('span');
      span.innerText = tickVal;
      span.style.left = `${(index / (numTicks - 1)) * 100}%`;
      ticksContainer.appendChild(span);
    });

    barWrapper.appendChild(bar);
    barWrapper.appendChild(ticksContainer); 

    this.legendContainer.appendChild(title);
    this.legendContainer.appendChild(barWrapper); 
  }

  updateSwipeClip() {
    if (this.swipeValue === undefined || !this.activeProject) return;

    const size = this.map.getSize();
    const nw = this.map.containerPointToLayerPoint([0, 0]);
    const se = this.map.containerPointToLayerPoint(size);
    const clipX = nw.x + (se.x - nw.x) * this.swipeValue;

    const pane = this.map.getPane('comparison-pane');
    if (pane) {
      pane.style.clip = `rect(${nw.y}px, ${clipX}px, ${se.y}px, ${nw.x}px)`;
    }

    if (this.swipeContainer) {
      const divider = this.swipeContainer.querySelector('.map-swipe-line');
      const handle = this.swipeContainer.querySelector('.map-swipe-handle');
      const percentage = this.swipeValue * 100;
      if (divider) divider.style.left = `${percentage}%`;
      if (handle) handle.style.left = `${percentage}%`;
    }
  }

  teardownSwipeController() {
    this.map.off('move', this._onMapMoveOrZoom);
    this.map.off('zoom', this._onMapMoveOrZoom);

    // Eradicate memory leaks by scrubbing active window handlers
    if (this._onMouseMove) {
      window.removeEventListener('mousemove', this._onMouseMove);
      window.removeEventListener('touchmove', this._onMouseMove);
      this._onMouseMove = null;
    }
    if (this._onMouseUp) {
      window.removeEventListener('mouseup', this._onMouseUp);
      window.removeEventListener('touchend', this._onMouseUp);
      this._onMouseUp = null;
    }

    if (this.swipeContainer) {
      this.swipeContainer.remove();
      this.swipeContainer = null;
    }

    const pane = this.map.getPane('comparison-pane');
    if (pane) {
      pane.style.clip = ''; 
    }
  }

  mountSwipeUI() {
    this.swipeContainer = document.createElement('div');
    this.swipeContainer.className = 'map-swipe-container';
    this.swipeContainer.innerHTML = `
      <div class="map-swipe-line"></div>
      <div class="map-swipe-handle">VS</div>
    `;

    const mapContainer = this.map.getContainer();
    mapContainer.appendChild(this.swipeContainer);

    this.swipeValue = 0.5;

    const handle = this.swipeContainer.querySelector('.map-swipe-handle');
    const divider = this.swipeContainer.querySelector('.map-swipe-line');
    let isDragging = false;

    const startDrag = (e) => {
      e.preventDefault(); 
      isDragging = true;
      this.map.dragging.disable(); 
    };

    this._onMouseMove = (e) => {
      if (!isDragging) return;
      const rect = mapContainer.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const offset = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      
      this.swipeValue = offset;
      this.updateSwipeClip();
    };

    this._onMouseUp = () => {
      if (isDragging) {
        isDragging = false;
        this.map.dragging.enable(); 
      }
    };

    handle.addEventListener('mousedown', startDrag);
    handle.addEventListener('touchstart', startDrag, { passive: false });
    divider.addEventListener('mousedown', startDrag);
    divider.addEventListener('touchstart', startDrag, { passive: false });

    window.addEventListener('mousemove', this._onMouseMove);
    window.addEventListener('touchmove', this._onMouseMove, { passive: false });
    window.addEventListener('mouseup', this._onMouseUp);
    window.addEventListener('touchend', this._onMouseUp);

    this.map.on('move', this._onMapMoveOrZoom);
    this.map.on('zoom', this._onMapMoveOrZoom);

    this.updateSwipeClip();
  }

  async renderProjectLayer(project) {
    this.activeProject = project;
    this.activeLayerGroup.clearLayers();
    this.updateLegend(project.legend);
    this.teardownSwipeController(); 

    this.map.setMaxZoom(project.maxZoom || 20);

    this.map.flyTo(project.coords, project.zoom, {
      animate: true,
      duration: 1.6,
      easeLinearity: 0.25
    });

    let rasterLoaded = false;
    let vectorLoaded = false;

    if (project.imageOverlay) {
      try {
        L.imageOverlay(
          project.imageOverlay.url,
          project.imageOverlay.bounds,
          { opacity: project.imageOverlay.opacity || 0.85, interactive: true }
        ).addTo(this.activeLayerGroup);
        rasterLoaded = true;
      } catch (err) {
        console.warn("Could not load image overlay background:", err);
      }
    }

    if (project.comparisonImageOverlay) {
      try {
        L.imageOverlay(
          project.comparisonImageOverlay.url,
          project.comparisonImageOverlay.bounds,
          { 
            opacity: project.comparisonImageOverlay.opacity || 0.85, 
            interactive: true,
            pane: 'comparison-pane' 
          }
        ).addTo(this.activeLayerGroup);

        this.mountSwipeUI();
        rasterLoaded = true; 
      } catch (err) {
        console.warn("Comparison raster load failed:", err);
      }
    }

    if (project.geoJsonPath) {
      try {
        const response = await fetch(project.geoJsonPath);
        if (response.ok) {
          const geoJsonData = await response.json();
          
          L.geoJSON(geoJsonData, {
            style: (feature) => {
              if (project.geoJsonStyle) {
                const prop = project.geoJsonStyle.property;
                const value = feature.properties ? feature.properties[prop] : null;
                const matchStyle = project.geoJsonStyle.categories[value];
                return matchStyle || project.geoJsonStyle.default;
              }
              return { color: 'var(--glow-color)', weight: 1.5, fillOpacity: 0.25 };
            },
            onEachFeature: (feature, layer) => {
              if (project.geoJsonStyle && feature.properties) {
                const labelVal = feature.properties[project.geoJsonStyle.property];
                if (labelVal) {
                  layer.bindTooltip(`<strong>Class:</strong> ${labelVal}`, {
                    sticky: true,
                    className: 'map-vector-tooltip'
                  });
                }
              }
            }
          }).addTo(this.activeLayerGroup);
          vectorLoaded = true;
        }
      } catch (err) {
        console.info("Vector layer file not found. Proceeding to vector drawing fallbacks.");
      }
    }

    if (!rasterLoaded && !vectorLoaded && project.fallbackVectors) {
      project.fallbackVectors.forEach(vec => {
        if (vec.type === "circle") {
          L.circle(vec.coords, { radius: vec.radius, ...vec.style }).addTo(this.activeLayerGroup);
        } else if (vec.type === "polygon") {
          L.polygon(vec.coords, vec.style).addTo(this.activeLayerGroup);
        }
      });
    }

    const hudTitleEl = document.getElementById('hud-title');
    const hudCoordsEl = document.getElementById('hud-coords');
    if (hudTitleEl) hudTitleEl.innerText = project.hudTitle || project.title;
    if (hudCoordsEl) hudCoordsEl.innerText = project.hudCoords;
  }
}