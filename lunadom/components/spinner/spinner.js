// lunadom/components/spinner/spinner.js

/**
 * @customElement luna-spinner
 * 
 * Attributes:
 * @attr {number} size - The diameter of the spinner in pixels. Defaults to 24.
 * @attr {number} track-width - The thickness of the spinner stroke in pixels. Defaults to 2.
 * @attr {string} color - The color of the spinning arc. Overrides --luna-spinner-color.
 * @attr {string} track-color - The color of the stationary track. Overrides --luna-spinner-track-color.
 * @attr {number} speed - The duration of one rotation in seconds. Defaults to 1.
 * 
 * CSS Custom Properties:
 * @cssprop --luna-spinner-track-width - The thickness of the spinner stroke.
 * @cssprop --luna-spinner-color - The color of the spinning arc.
 * @cssprop --luna-spinner-track-color - The color of the stationary track.
 * @cssprop --luna-spinner-speed - The rotation speed.
 */
class LunaSpinner extends HTMLElement {
  
  static get observedAttributes() {
    return ['size', 'track-width', 'color', 'track-color', 'speed'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (this.shadowRoot.innerHTML && oldVal !== newVal) {
      this.render();
    }
  }

  render() {
    const size       = this.getAttribute('size') || '24';
    const trackWidth = this.getAttribute('track-width') || '2';
    const color      = this.getAttribute('color') || 'var(--luna-accent, currentColor)';
    const trackColor = this.getAttribute('track-color') || 'rgba(255, 255, 255, 0.1)';
    const speed      = this.getAttribute('speed') || '1';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          width: ${size}px;
          height: ${size}px;
          vertical-align: middle;
          --luna-spinner-track-width: ${trackWidth}px;
          --luna-spinner-color: ${color};
          --luna-spinner-track-color: ${trackColor};
          --luna-spinner-speed: ${speed}s;
        }

        svg {
          width: 100%;
          height: 100%;
          display: block;
          animation: spin var(--luna-spinner-speed) linear infinite;
        }

        circle {
          fill: none;
          stroke-linecap: round;
        }

        .track {
          stroke: var(--luna-spinner-track-color);
          stroke-width: var(--luna-spinner-track-width);
        }

        .arc {
          stroke: var(--luna-spinner-color);
          stroke-width: var(--luna-spinner-track-width);
          stroke-dasharray: 150, 300;
          stroke-dashoffset: 0;
          animation: arc 1.5s ease-in-out infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes arc {
          0% { stroke-dasharray: 1, 300; stroke-dashoffset: 0; }
          50% { stroke-dasharray: 150, 300; stroke-dashoffset: -50; }
          100% { stroke-dasharray: 1, 300; stroke-dashoffset: -280; }
        }
      </style>

      <svg viewBox="0 0 100 100">
        <circle class="track" cx="50" cy="50" r="45"/>
        <circle class="arc" cx="50" cy="50" r="45"/>
      </svg>
    `;
  }
}

customElements.define('luna-spinner', LunaSpinner);