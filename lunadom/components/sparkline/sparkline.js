// lunadom/components/sparkline/sparkline.js

/**
 * @customElement luna-sparkline
 * 
 * Attributes:
 * @attr {string} data - Space-separated numeric values to visualize. Minimum 2 values required.
 * @attr {string} label - Descriptive label for accessibility (not visible, announced by screen readers).
 * @attr {'solid' | 'gradient' | 'line'} appearance - How the sparkline fills. Defaults to 'solid'.
 * @attr {'positive' | 'neutral' | 'negative'} trend - Color theme based on data trend. Defaults to 'neutral'.
 * @attr {'linear' | 'natural' | 'step'} curve - How data points connect. Defaults to 'linear'.
 * @attr {'sm' | 'md' | 'lg'} size - The size of the sparkline. Defaults to 'md'.
 * @attr {string} color - Custom color for the sparkline (overrides trend colors).
 * @attr {boolean} show-dots - If present, shows dots at each data point.
 * @attr {boolean} show-area - If present, fills the area under the line.
 * @attr {number} min - Minimum value for the Y-axis scale. If not set, uses data minimum.
 * @attr {number} max - Maximum value for the Y-axis scale. If not set, uses data maximum.
 * 
 * CSS Custom Properties:
 * @cssprop --luna-sparkline-width - The width of the sparkline. Defaults to 100px.
 * @cssprop --luna-sparkline-height - The height of the sparkline. Defaults to 32px.
 * @cssprop --luna-sparkline-color - The color of the sparkline stroke and fill.
 * @cssprop --luna-sparkline-stroke-width - The width of the sparkline stroke.
 * @cssprop --luna-sparkline-opacity - The opacity of the filled area.
 * 
 * Events:
 * @event luna-sparkline-render - Emitted when the sparkline is rendered. Detail contains { data: number[], min: number, max: number }.
 */
class LunaSparkline extends HTMLElement {
  static get observedAttributes() {
    return [
      'data',
      'label',
      'appearance',
      'trend',
      'curve',
      'size',
      'color',
      'show-dots',
      'show-area',
      'min',
      'max'
    ];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._data = [];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  _parseData() {
    const dataAttr = this.getAttribute('data') || '';
    const values = dataAttr.trim().split(/\s+/).map(v => parseFloat(v)).filter(v => !isNaN(v));
    
    if (values.length < 2) {
      console.warn('luna-sparkline: At least 2 data values are required');
      return [];
    }
    
    return values;
  }

  _getMinMax(data) {
    const minAttr = this.getAttribute('min');
    const maxAttr = this.getAttribute('max');
    
    const dataMin = Math.min(...data);
    const dataMax = Math.max(...data);
    
    const min = minAttr !== null ? parseFloat(minAttr) : dataMin;
    const max = maxAttr !== null ? parseFloat(maxAttr) : dataMax;
    
    return { min, max };
  }

  _createPath(data, width, height, curve) {
    if (data.length === 0) {
      return '';
    }

    const { min, max } = this._getMinMax(data);
    const range = max - min || 1;
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return { x, y };
    });

    if (curve === 'step') {
      return this._createStepPath(points);
    } else if (curve === 'natural') {
      return this._createNaturalPath(points);
    } else {
      return this._createLinearPath(points);
    }
  }

  _createLinearPath(points) {
    if (points.length === 0) {
      return '';
    }
    
    let path = `M ${points[0].x},${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x},${points[i].y}`;
    }
    
    return path;
  }

  _createStepPath(points) {
    if (points.length === 0) {
      return '';
    }
    
    let path = `M ${points[0].x},${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      const prevPoint = points[i - 1];
      const currPoint = points[i];
      path += ` L ${currPoint.x},${prevPoint.y}`;
      path += ` L ${currPoint.x},${currPoint.y}`;
    }
    
    return path;
  }

  _createNaturalPath(points) {
    if (points.length === 0) {
      return '';
    }
    
    if (points.length === 2) {
      return this._createLinearPath(points);
    }

    let path = `M ${points[0].x},${points[0].y}`;
    
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const controlX = (current.x + next.x) / 2;
      
      path += ` Q ${controlX},${current.y} ${controlX},${(current.y + next.y) / 2}`;
      path += ` Q ${controlX},${next.y} ${next.x},${next.y}`;
    }
    
    return path;
  }

  _createAreaPath(linePath, width, height) {
    if (!linePath) {
      return '';
    }
    
    return `${linePath} L ${width},${height} L 0,${height} Z`;
  }

  _getTrendColor(trend) {
    const colors = {
      positive: '#10b981',
      negative: '#ef4444',
      neutral: '#6b7280'
    };
    
    return colors[trend] || colors.neutral;
  }

  render() {
    const data = this._parseData();
    
    if (data.length < 2) {
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: inline-block;
            font-family: inherit;
          }
          .empty {
            display: inline-block;
            padding: 0.25rem 0.5rem;
            font-size: 0.75rem;
            color: #999;
            font-style: italic;
          }
        </style>
        <span class="empty">No data</span>
      `;
      return;
    }

    this._data = data;
    const { min, max } = this._getMinMax(data);
    
    const label = this.getAttribute('label') || 'Sparkline chart';
    const appearance = this.getAttribute('appearance') || 'solid';
    const trend = this.getAttribute('trend') || 'neutral';
    const curve = this.getAttribute('curve') || 'linear';
    const size = this.getAttribute('size') || 'md';
    const customColor = this.getAttribute('color');
    const showDots = this.hasAttribute('show-dots');
    const showArea = this.hasAttribute('show-area');

    const width = 100;
    const height = 32;
    const padding = 2;
    const actualWidth = width - padding * 2;
    const actualHeight = height - padding * 2;

    const linePath = this._createPath(data, actualWidth, actualHeight, curve);
    const areaPath = (showArea || appearance !== 'line') ? this._createAreaPath(linePath, actualWidth, actualHeight) : '';

    const color = customColor || this._getTrendColor(trend);

    const points = data.map((value, index) => {
      const range = max - min || 1;
      const x = (index / (data.length - 1)) * actualWidth + padding;
      const y = actualHeight - ((value - min) / range) * actualHeight + padding;
      return { x, y };
    });

    const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          font-family: inherit;
          --luna-sparkline-width: 100px;
          --luna-sparkline-height: 32px;
          --luna-sparkline-color: ${color};
          --luna-sparkline-stroke-width: 1.5;
          --luna-sparkline-opacity: 0.2;
        }

        :host([size="sm"]) {
          --luna-sparkline-width: 60px;
          --luna-sparkline-height: 20px;
          --luna-sparkline-stroke-width: 1;
        }

        :host([size="lg"]) {
          --luna-sparkline-width: 140px;
          --luna-sparkline-height: 48px;
          --luna-sparkline-stroke-width: 2;
        }

        .sparkline {
          display: inline-block;
          width: var(--luna-sparkline-width);
          height: var(--luna-sparkline-height);
          vertical-align: middle;
        }

        svg {
          display: block;
          width: 100%;
          height: 100%;
        }

        .area {
          fill: var(--luna-sparkline-color);
          opacity: var(--luna-sparkline-opacity);
        }

        .area.gradient {
          fill: url(#${gradientId});
          opacity: 1;
        }

        .line {
          fill: none;
          stroke: var(--luna-sparkline-color);
          stroke-width: var(--luna-sparkline-stroke-width);
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .dot {
          fill: var(--luna-sparkline-color);
          stroke: #000;
          stroke-width: 0.5;
        }

        :host([trend="positive"]) {
          --luna-sparkline-color: #10b981;
        }

        :host([trend="negative"]) {
          --luna-sparkline-color: #ef4444;
        }

        :host([trend="neutral"]) {
          --luna-sparkline-color: #6b7280;
        }

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }
      </style>

      <div class="sparkline" role="img" aria-label="${label}">
        <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
          <defs>
            <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color: ${color}; stop-opacity: 0.4" />
              <stop offset="100%" style="stop-color: ${color}; stop-opacity: 0.05" />
            </linearGradient>
          </defs>
          
          ${areaPath && appearance !== 'line' ? `
            <path 
              class="area ${appearance === 'gradient' ? 'gradient' : ''}" 
              d="${areaPath}"
            />
          ` : ''}
          
          <path 
            class="line" 
            d="${linePath}"
          />
          
          ${showDots ? points.map(p => `
            <circle 
              class="dot" 
              cx="${p.x}" 
              cy="${p.y}" 
              r="${size === 'sm' ? '1.5' : size === 'lg' ? '2.5' : '2'}"
            />
          `).join('') : ''}
        </svg>
        <span class="sr-only">${label}: ${data.join(', ')}</span>
      </div>
    `;

    this.dispatchEvent(new CustomEvent('luna-sparkline-render', {
      bubbles: true,
      composed: true,
      detail: { data, min, max }
    }));
  }
}

customElements.define('luna-sparkline', LunaSparkline);
