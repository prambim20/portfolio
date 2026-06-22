/**
 * Holographic Dot-Matrix 2D Globe Engine
 * Optimized to remove high-frequency DOM read-recalculations (getComputedStyle)
 * from the paint/render loops. Accepts reactive theme injections via app.js
 */
export class GlobeEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.radius = 110;
    this.rotationY = 0;
    this.rotationSpeed = 0.005;

    this.tiltZ = -0.15;
    this.tiltX = 0.28;

    // Cache computed styles natively to prevent rendering bottlenecks (reflows)
    this.glowColor = '#00f0ff';
    this.accentColor = '#3b82f6';

    this.continentsData = [
      [[-168, 65], [-120, 70], [-80, 70], [-60, 50], [-80, 25], [-100, 15], [-110, 8], [-90, 15], [-125, 48]],
      [[-80, 12], [-40, -10], [-65, -45], [-76, -55], [-72, -30], [-80, -5]],
      [[-17, 32], [32, 31], [51, 11], [40, -20], [34, -34], [18, -34], [10, -5], [-14, 14]],
      [[-10, 65], [60, 75], [120, 75], [170, 68], [140, 50], [120, 22], [100, 2], [80, 12], [48, 12], [35, 30], [-10, 38]],
      [[113, -24], [142, -11], [153, -28], [135, -34], [115, -34]],
      [[0, -70], [90, -75], [180, -70], [-90, -75]]
    ];

    this.precomputeHolographicLand();
    this.initSizing();
    this.startLoop();
  }

  /**
   * Safe, reactive method to update theme variables directly from orchestrator
   */
  setThemeColors(glow, accent) {
    if (glow) this.glowColor = glow;
    if (accent) this.accentColor = accent;
  }

  isPointInPolygon(point, polygon) {
    const [x, y] = point;
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i];
      const [xj, yj] = polygon[j];
      
      const intersect = ((yi > y) !== (yj > y))
          && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  precomputeHolographicLand() {
    this.landPoints3D = [];
    const candidatesCount = 1800;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < candidatesCount; i++) {
      const y = 1 - (i / (candidatesCount - 1)) * 2; 
      const radiusAtY = Math.sqrt(1 - y * y); 
      const theta = i * goldenAngle;

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      const lat = Math.asin(y) * (180 / Math.PI);
      const lon = Math.atan2(x, z) * (180 / Math.PI);

      let onLand = false;
      for (let k = 0; k < this.continentsData.length; k++) {
        if (this.isPointInPolygon([lon, lat], this.continentsData[k])) {
          onLand = true;
          break;
        }
      }

      if (onLand) {
        this.landPoints3D.push({ x, y, z });
      }
    }
  }

  initSizing() {
    const size = 260;
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = size * dpr;
    this.canvas.height = size * dpr;
    this.canvas.style.width = `${size}px`;
    this.canvas.style.height = `${size}px`;
    this.ctx.scale(dpr, dpr);
    this.cx = size / 2;
    this.cy = size / 2;
  }

  project(x, y, z) {
    const cosY = Math.cos(this.rotationY);
    const sinY = Math.sin(this.rotationY);
    const x1 = x * cosY - z * sinY;
    const z1 = x * sinY + z * cosY;

    const cosZ = Math.cos(this.tiltZ);
    const sinZ = Math.sin(this.tiltZ);
    const x2 = x1 * cosZ - y * sinZ;
    const y2 = x1 * sinZ + y * cosZ;

    const cosX = Math.cos(this.tiltX);
    const sinX = Math.sin(this.tiltX);
    const y3 = y2 * cosX - z1 * sinX;
    const z3 = y2 * sinX + z1 * cosX;

    return {
      screenX: this.cx + x2 * this.radius,
      screenY: this.cy + y3 * this.radius,
      depthZ: z3 
    };
  }

  draw() {
    this.ctx.clearRect(0, 0, 260, 260);

    // 1. Ambient Background Sea Glow
    const oceanGlow = this.ctx.createRadialGradient(this.cx, this.cy, 0, this.cx, this.cy, this.radius);
    oceanGlow.addColorStop(0, `${this.glowColor}15`);
    oceanGlow.addColorStop(0.8, `${this.glowColor}02`);
    oceanGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    this.ctx.beginPath();
    this.ctx.arc(this.cx, this.cy, this.radius, 0, Math.PI * 2);
    this.ctx.fillStyle = oceanGlow;
    this.ctx.fill();

    // 2. Draw Longitudinal Grid Lines
    const lonBands = 10;
    for (let i = 0; i < lonBands; i++) {
      this.drawGridLine((i * Math.PI * 2) / lonBands, this.glowColor, true);
    }

    // 3. Draw Latitudinal Grid Lines
    const latBands = 7;
    for (let i = 1; i < latBands; i++) {
      this.drawGridLine(((i * Math.PI) / latBands) - Math.PI / 2, this.glowColor, false);
    }

    // 4. Draw Dotted Holographic Continents (Smoothly Alpha-faded at Horizon)
    this.ctx.fillStyle = this.glowColor;
    
    for (let i = 0; i < this.landPoints3D.length; i++) {
      const pt = this.landPoints3D[i];
      const p = this.project(pt.x, pt.y, pt.z);

      if (p.depthZ > -0.20) {
        const alpha = Math.min(0.85, ((p.depthZ + 0.20) / 0.40) * 0.85);
        if (alpha > 0.02) {
          this.ctx.globalAlpha = alpha;
          this.ctx.beginPath();
          this.ctx.arc(p.screenX, p.screenY, 1.2, 0, Math.PI * 2);
          this.ctx.fill();
        }
      }
    }

    this.ctx.globalAlpha = 1.0;

    // 5. Outer atmospheric edge boundary highlight
    this.ctx.beginPath();
    this.ctx.arc(this.cx, this.cy, this.radius, 0, Math.PI * 2);
    this.ctx.strokeStyle = `${this.glowColor}35`;
    this.ctx.lineWidth = 1.2;
    this.ctx.stroke();

    this.rotationY += this.rotationSpeed;
  }

  drawGridLine(angle, glowColor, isLongitude) {
    const segments = 40;
    this.ctx.lineWidth = 0.8;

    for (let i = 0; i < segments; i++) {
      const step1 = (i * Math.PI * 2) / segments;
      const step2 = ((i + 1) * Math.PI * 2) / segments;

      let pt1, pt2;

      if (isLongitude) {
        pt1 = { x: Math.sin(step1) * Math.sin(angle), y: Math.cos(step1), z: Math.sin(step1) * Math.cos(angle) };
        pt2 = { x: Math.sin(step2) * Math.sin(angle), y: Math.cos(step2), z: Math.sin(step2) * Math.cos(angle) };
      } else {
        const latRadius = Math.cos(angle);
        const latY = Math.sin(angle);
        pt1 = { x: latRadius * Math.sin(step1), y: latY, z: latRadius * Math.cos(step1) };
        pt2 = { x: latRadius * Math.sin(step2), y: latY, z: latRadius * Math.cos(step2) };
      }

      const p1 = this.project(pt1.x, pt1.y, pt1.z);
      const p2 = this.project(pt2.x, pt2.y, pt2.z);

      const averageDepth = (p1.depthZ + p2.depthZ) / 2;
      
      let gridAlpha = 0.02; 
      if (averageDepth > -0.2) {
        gridAlpha = Math.min(0.12, 0.02 + (averageDepth + 0.2) * 0.25);
      }

      this.ctx.globalAlpha = gridAlpha;
      this.ctx.strokeStyle = glowColor;

      this.ctx.beginPath();
      this.ctx.moveTo(p1.screenX, p1.screenY);
      this.ctx.lineTo(p2.screenX, p2.screenY);
      this.ctx.stroke();
    }
    
    this.ctx.globalAlpha = 1.0;
  }

  startLoop() {
    const tick = () => {
      this.draw();
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
}