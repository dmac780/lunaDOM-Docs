// lunadom/components/radar-chart/radar-chart.js

/**
 * @customElement luna-radar-chart
 *
 * A lightweight, dependency-free radar / spider chart. Data axes are passed as
 * a JSON array via the 'data' attribute or 'data' property. An optional 'series'
 * attribute enables multi-series overlays each with its own color.
 *
 * NOTE: Single-series mode uses 'data' - each item has a 'label' and 'value'.
 * Multi-series mode uses 'series' (the 'data' attribute still supplies the axis
 * labels and their optional individual max, but 'value' is ignored when 'series'
 * is present).
 *
 * Attributes:
 * @attr {string} data
 *   JSON array of axis descriptors.
 *   Single-series shape:  { label: string, value: number }
 *   Multi-series shape:   { label: string }
 *   An optional per-axis 'max' field is supported to normalise axes independently.
 *
 * @attr {string} series
 *   JSON array of series objects for multi-series mode.
 *   Shape: { label: string, color: string, data: number[] }
 *   The 'data' array must match the length of the 'data' attribute array.
 *
 * @attr {string} title
 *   Optional heading displayed above the chart.
 *
 * @attr {number} max
 *   Global maximum used for normalisation. Defaults to the largest value found
 *   across all data/series. Individual axis 'max' overrides this per-axis.
 *
 * @attr {number} rings
 *   Number of concentric grid rings to draw. Defaults to 4.
 *
 * @attr {boolean} no-bg
 *   Removes the card background, border and padding.
 *
 * @attr {boolean} no-legend
 *   Hides the legend. Legend is only rendered in multi-series mode by default.
 *
 * @attr {boolean} no-labels
 *   Hides the axis labels around the perimeter.
 *
 * @attr {boolean} no-title
 *   Hides the title even when the `title` attribute is present.
 *
 * @attr {boolean} no-dots
 *   Hides the data-point dots on each shape vertex.
 *
 * @attr {boolean} filled
 *   Force-fills the single-series shape even if a stroke-only look is wanted.
 *   Multi-series shapes are always filled at reduced opacity.
 *
 * @attr {'horizontal'|'vertical'} legend-layout
 *   Legend flex direction. Defaults to 'horizontal'.
 *
 * CSS Custom Properties:
 * @cssprop --luna-radar-size         - Width and height of the SVG canvas (default: 220px)
 * @cssprop --luna-radar-bg           - Card background colour (default: #1a1a1a)
 * @cssprop --luna-radar-border       - Card border colour (default: #222)
 * @cssprop --luna-radar-radius       - Card border radius (default: 1rem)
 * @cssprop --luna-radar-padding      - Card inner padding (default: 1.25rem)
 * @cssprop --luna-radar-gap          - Gap between chart sections (default: 1rem)
 * @cssprop --luna-radar-fg           - Primary text / title colour (default: #eee)
 * @cssprop --luna-radar-muted        - Axis label and secondary text colour (default: #555)
 * @cssprop --luna-radar-grid         - Grid ring and spoke colour (default: #2a2a2a)
 * @cssprop --luna-radar-fill         - Single-series shape fill (default: rgba(37,99,235,0.15))
 * @cssprop --luna-radar-stroke       - Single-series shape stroke and dot colour (default: #2563eb)
 * @cssprop --luna-radar-stroke-width - Shape stroke width (default: 1.5)
 * @cssprop --luna-radar-dot-r        - Resting dot radius in SVG units (default: 3)
 * @cssprop --luna-radar-tooltip-bg   - Tooltip background (default: #1e1e1e)
 * @cssprop --luna-radar-tooltip-fg   - Tooltip text colour (default: #eee)
 * @cssprop --luna-radar-palette      - Comma-separated colour list for multi-series fallback.
 *
 * Events:
 * @event luna-point-enter - Fired when a data-point is hovered.
 *   detail: { seriesIndex, seriesLabel, axisIndex, axisLabel, value, percent }
 * @event luna-point-leave - Fired when hover leaves a data-point.
 */
class LunaRadarChart extends HTMLElement {

  static get observedAttributes() {
    return [
      'data', 'series', 'title', 'max', 'rings',
      'no-bg', 'no-legend', 'no-labels', 'no-title', 'no-dots', 'filled',
      'legend-layout',
    ];
  }

  static get _defaultPalette() {
    return [
      '#2563eb', '#ff5500', '#22c55e', '#a855f7',
      '#f59e0b', '#06b6d4', '#e63946', '#a8dadc',
    ];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this._render();
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal !== newVal && this.isConnected) {
      this._render();
    }
  }

  get data() {
    try {
      return JSON.parse(this.getAttribute('data') || '[]');
    } catch (_) {
      return [];
    }
  }

  set data(v) {
    this.setAttribute('data', typeof v === 'string' ? v : JSON.stringify(v));
  }

  get series() {
    try {
      return JSON.parse(this.getAttribute('series') || '[]');
    } catch (_) {
      return [];
    }
  }

  set series(v) {
    this.setAttribute('series', typeof v === 'string' ? v : JSON.stringify(v));
  }

  _resolvePalette() {
    const raw = getComputedStyle(this).getPropertyValue('--luna-radar-palette').trim();

    if (raw) {
      return raw.split(',').map(s => s.trim()).filter(Boolean);
    }

    return LunaRadarChart._defaultPalette;
  }

  _angle(i, n) {
    return (Math.PI * 2 * i / n) - Math.PI / 2;
  }

  _polarToCart(cx, cy, r, angle) {
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  }

  _pointForValue(value, perAxisMax, globalMax, i, n, cx, cy, R) {
    const axisMax = perAxisMax !== null ? perAxisMax : globalMax;
    const ratio   = axisMax > 0 ? Math.min(value / axisMax, 1) : 0;

    return this._polarToCart(cx, cy, R * ratio, this._angle(i, n));
  }

  _buildGridRings(n, rings, cx, cy, R) {
    const result = [];

    for (let r = 1; r <= rings; r++) {
      const frac   = r / rings;
      const points = [];

      for (let i = 0; i < n; i++) {
        const [x, y] = this._polarToCart(cx, cy, R * frac, this._angle(i, n));
        points.push(`${x},${y}`);
      }

      result.push(`<polygon points="${points.join(' ')}" class="ring" />`);
    }

    return result.join('');
  }

  _buildSpokes(n, cx, cy, R) {
    const result = [];

    for (let i = 0; i < n; i++) {
      const [x, y] = this._polarToCart(cx, cy, R, this._angle(i, n));
      result.push(`<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" class="spoke" />`);
    }

    return result.join('');
  }

  _buildLabels(axes, n, cx, cy, labelR) {
    return axes.map((axis, i) => {
      const a      = this._angle(i, n);
      const [lx, ly] = this._polarToCart(cx, cy, labelR, a);
      const anchor = lx < cx - 2 ? 'end' : lx > cx + 2 ? 'start' : 'middle';
      const dy     = ly < cy - 2 ? '-0.4em' : ly > cy + 2 ? '1.1em' : '0.35em';

      return `<text x="${lx}" y="${ly}" text-anchor="${anchor}" dy="${dy}" class="axis-label">${axis.label}</text>`;
    }).join('');
  }

  _buildShape(values, perAxisMaxes, globalMax, n, cx, cy, R, color, fillColor, seriesIdx, showDots) {
    const pts = values.map((v, i) =>
      this._pointForValue(v, perAxisMaxes[i], globalMax, i, n, cx, cy, R).join(',')
    );

    const dots = showDots
      ? values.map((v, i) => {
          const [dx, dy] = this._pointForValue(v, perAxisMaxes[i], globalMax, i, n, cx, cy, R);
          return `<circle cx="${dx}" cy="${dy}" r="3" class="dot" data-series="${seriesIdx}" data-idx="${i}" style="fill:${color}" />`;
        }).join('')
      : '';

    const hitTargets = values.map((v, i) => {
      const [dx, dy] = this._pointForValue(v, perAxisMaxes[i], globalMax, i, n, cx, cy, R);
      return `<circle cx="${dx}" cy="${dy}" r="10" class="hit" data-series="${seriesIdx}" data-idx="${i}" style="fill:transparent;cursor:pointer" />`;
    }).join('');

    return `
      <polygon
        points="${pts.join(' ')}"
        class="shape"
        data-series="${seriesIdx}"
        style="fill:${fillColor};stroke:${color}"
      />
      ${dots}
      ${hitTargets}
    `;
  }

  _render() {
    const axes = this.data;

    if (!axes.length) {
      this.shadowRoot.innerHTML = '';
      return;
    }

    const seriesList   = this.series;
    const isMulti      = seriesList.length > 0;
    const noBg         = this.hasAttribute('no-bg');
    const noLegend     = this.hasAttribute('no-legend');
    const noLabels     = this.hasAttribute('no-labels');
    const noTitle      = this.hasAttribute('no-title');
    const noDots       = this.hasAttribute('no-dots');
    const forcesFilled = this.hasAttribute('filled');
    const legendLayout = this.getAttribute('legend-layout') || 'horizontal';
    const title        = noTitle ? '' : (this.getAttribute('title') || '');
    const ringCount    = Math.max(2, parseInt(this.getAttribute('rings') || '4', 10));
    const userMax      = parseFloat(this.getAttribute('max')) || null;
    const n            = axes.length;

    const palette     = this._resolvePalette();
    const showDots    = !noDots;

    const cx = 100, cy = 100, R = 70, labelR = 86;

    const perAxisMaxes = axes.map(a => (typeof a.max === 'number' ? a.max : null));

    let globalMax;

    if (userMax) {
      globalMax = userMax;
    } else if (isMulti) {
      const allVals = seriesList.flatMap(s => s.data);
      globalMax = Math.max(...allVals, 1);
    } else {
      globalMax = Math.max(...axes.map(a => a.value || 0), 1);
    }

    const rings  = this._buildGridRings(n, ringCount, cx, cy, R);
    const spokes = this._buildSpokes(n, cx, cy, R);
    const labels = noLabels ? '' : this._buildLabels(axes, n, cx, cy, labelR);

    let shapes;

    if (isMulti) {
      shapes = seriesList.map((s, si) => {
        const color     = s.color || palette[si % palette.length];
        const fillColor = color + '28';
        return this._buildShape(s.data, perAxisMaxes, globalMax, n, cx, cy, R, color, fillColor, si, showDots);
      }).join('');
    } else {
      const singleColor = 'var(--luna-radar-stroke, #2563eb)';
      const singleFill  = forcesFilled
        ? 'var(--luna-radar-fill, rgba(37,99,235,0.15))'
        : 'var(--luna-radar-fill, rgba(37,99,235,0.15))';

      shapes = this._buildShape(
        axes.map(a => a.value || 0),
        perAxisMaxes,
        globalMax,
        n, cx, cy, R,
        singleColor,
        singleFill,
        0,
        showDots
      );
    }

    const showLegend = !noLegend && isMulti;

    const legendRows = showLegend
      ? seriesList.map((s, si) => {
          const color = s.color || palette[si % palette.length];
          return `
            <div class="legend-row" data-series="${si}">
              <span class="swatch" style="background:${color}"></span>
              <span class="lbl">${s.label}</span>
            </div>`;
        }).join('')
      : '';

    const legendHTML = showLegend
      ? `<div class="legend legend--${legendLayout}" part="legend">${legendRows}</div>`
      : '';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          font-family: inherit;
          --luna-radar-size:         220px;
          --luna-radar-bg:           #1a1a1a;
          --luna-radar-border:       #222;
          --luna-radar-radius:       1rem;
          --luna-radar-padding:      1.25rem;
          --luna-radar-gap:          1rem;
          --luna-radar-fg:           #eee;
          --luna-radar-muted:        #555;
          --luna-radar-grid:         #2a2a2a;
          --luna-radar-fill:         rgba(37, 99, 235, 0.15);
          --luna-radar-stroke:       #2563eb;
          --luna-radar-stroke-width: 1.5;
          --luna-radar-dot-r:        3;
          --luna-radar-tooltip-bg:   #1e1e1e;
          --luna-radar-tooltip-fg:   #eee;
        }

        *, *::before, *::after { 
          box-sizing: border-box; margin: 0; padding: 0; 
        }

        .card {
          display: flex;
          flex-direction: column;
          gap: var(--luna-radar-gap);
          background: ${noBg ? 'transparent' : 'var(--luna-radar-bg)'};
          border:        ${noBg ? 'none' : '1px solid var(--luna-radar-border)'};
          border-radius: ${noBg ? '0' : 'var(--luna-radar-radius)'};
          padding:       ${noBg ? '0' : 'var(--luna-radar-padding)'};
        }

        .title {
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--luna-radar-fg);
          letter-spacing: -0.01em;
        }

        .wrap {
          width: var(--luna-radar-size);
          height: var(--luna-radar-size);
          position: relative;
          align-self: center;
        }

        svg {
          width: 100%;
          height: 100%;
          overflow: visible;
          display: block;
        }

        .ring {
          fill: none;
          stroke: var(--luna-radar-grid);
          stroke-width: 0.75;
        }

        .spoke {
          stroke: var(--luna-radar-grid);
          stroke-width: 0.75;
        }

        .axis-label {
          fill: var(--luna-radar-muted);
          font-family: inherit;
          font-size: 6.5px;
          letter-spacing: 0.03em;
        }

        .shape {
          stroke-width: var(--luna-radar-stroke-width);
          transition: opacity 0.18s ease;
        }

        .dot {
          transition: r 0.15s ease, opacity 0.15s ease;
          pointer-events: none;
        }

        .hit { cursor: pointer; }

        svg:has(.hit:hover) .shape { opacity: 0.3; }
        svg:has(.hit:hover) .dot   { opacity: 0.3; }

        .shape.hovered,
        .dot.hovered {
          opacity: 1 !important;
        }

        .tooltip {
          position: fixed;
          background: var(--luna-radar-tooltip-bg);
          color: var(--luna-radar-tooltip-fg);
          font-family: inherit;
          font-size: 0.6875rem;
          padding: 6px 11px;
          border-radius: 6px;
          pointer-events: none;
          opacity: 0;
          transform: translateY(4px);
          transition: opacity 0.13s ease, transform 0.13s ease;
          white-space: nowrap;
          z-index: 9999;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.45);
        }

        .tooltip.on {
          opacity: 1;
          transform: translateY(0);
        }

        .tt-dot { 
          width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; 
        }

        .tt-pct { 
          opacity: 0.45; margin-left: 2px; 
        }

        .legend--horizontal {
          display: flex;
          flex-wrap: wrap;
          gap: 6px 14px;
        }

        .legend--vertical {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .legend-row {
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: default;
          transition: opacity 0.13s ease;
        }

        .legend-row:hover { opacity: 0.65; }

        .swatch {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .lbl {
          font-size: 0.625rem;
          color: var(--luna-radar-fg);
        }
      </style>

      <div class="card" part="base">
        ${title ? `<div class="title" part="title">${title}</div>` : ''}

        <div class="wrap" part="chart">
          <svg viewBox="0 0 200 200" aria-label="${title || 'Radar chart'}" role="img">
            <g class="grid-rings">${rings}</g>
            <g class="grid-spokes">${spokes}</g>
            <g class="shapes">${shapes}</g>
            <g class="labels">${labels}</g>
          </svg>
        </div>

        ${legendHTML}
      </div>

      <div class="tooltip" id="tooltip" part="tooltip">
        <span class="tt-dot" id="tt-dot"></span>
        <span id="tt-label"></span>
        <span id="tt-value"></span>
        <span class="tt-pct" id="tt-pct"></span>
      </div>
    `;

    this._bindEvents(axes, seriesList, isMulti, globalMax, perAxisMaxes, palette);
  }

  _bindEvents(axes, seriesList, isMulti, globalMax, perAxisMaxes, palette) {
    const sr      = this.shadowRoot;
    const tooltip = sr.getElementById('tooltip');
    const ttDot   = sr.getElementById('tt-dot');
    const ttLabel = sr.getElementById('tt-label');
    const ttValue = sr.getElementById('tt-value');
    const ttPct   = sr.getElementById('tt-pct');

    const posTooltip = (e) => {
      let x = e.clientX + 14;
      let y = e.clientY + 14;

      if (x + 200 > window.innerWidth)  { x = e.clientX - 14 - 200; }
      if (y + 44  > window.innerHeight) { y = e.clientY - 14 - 44; }

      tooltip.style.left = `${x}px`;
      tooltip.style.top  = `${y}px`;
    };

    const defaultStroke = getComputedStyle(this)
      .getPropertyValue('--luna-radar-stroke').trim() || '#2563eb';

    sr.querySelectorAll('.hit').forEach(el => {

      el.addEventListener('mouseenter', e => {
        const si   = parseInt(el.dataset.series, 10);
        const idx  = parseInt(el.dataset.idx, 10);
        const axis = axes[idx];

        let value, color, seriesLabel;

        if (isMulti) {
          const s     = seriesList[si];
          value       = s.data[idx];
          color       = s.color || palette[si % palette.length];
          seriesLabel = `${s.label} · ${axis.label}`;
        } else {
          value       = axis.value || 0;
          color       = defaultStroke;
          seriesLabel = axis.label;
        }

        const axisMax = perAxisMaxes[idx] !== null ? perAxisMaxes[idx] : globalMax;
        const pct     = axisMax > 0 ? Math.round((value / axisMax) * 100) : 0;

        ttDot.style.background = color;
        ttLabel.textContent    = seriesLabel;
        ttValue.textContent    = value.toLocaleString();
        ttPct.textContent      = `${pct}%`;

        tooltip.classList.add('on');
        posTooltip(e);

        sr.querySelectorAll(`.shape[data-series="${si}"]`).forEach(n => n.classList.add('hovered'));
        sr.querySelectorAll(`.dot[data-series="${si}"][data-idx="${idx}"]`).forEach(n => {
          n.classList.add('hovered');
          n.setAttribute('r', '5');
        });

        this.dispatchEvent(new CustomEvent('luna-point-enter', {
          bubbles:  true,
          composed: true,
          detail: {
            seriesIndex: si,
            seriesLabel: isMulti ? seriesList[si].label : '',
            axisIndex:   idx,
            axisLabel:   axis.label,
            value,
            percent: pct,
          }
        }));
      });

      el.addEventListener('mousemove', posTooltip);

      el.addEventListener('mouseleave', () => {
        const si  = parseInt(el.dataset.series, 10);
        const idx = parseInt(el.dataset.idx, 10);

        tooltip.classList.remove('on');

        sr.querySelectorAll(`.shape[data-series="${si}"]`).forEach(n => n.classList.remove('hovered'));
        sr.querySelectorAll(`.dot[data-series="${si}"][data-idx="${idx}"]`).forEach(n => {
          n.classList.remove('hovered');
          n.setAttribute('r', '3');
        });

        this.dispatchEvent(new CustomEvent('luna-point-leave', {
          bubbles: true, composed: true
        }));
      });
    });
  }
}

customElements.define('luna-radar-chart', LunaRadarChart);