// lunadom/components/progress-circle/progress-circle.js

/**
 * @customElement luna-progress-circle
 * 
 * Attributes:
 * @attr {number} value - The current value of the progress indicator.
 * @attr {number} max - The maximum value of the progress indicator. Defaults to 100.
 * @attr {boolean} pending - If present, shows an indeterminate spinning state.
 * @attr {string} label - A label to display below the progress circle.
 * @attr {boolean} show-value - If present, displays the percentage text in the center of the circle.
 * 
 * CSS Custom Properties:
 * @cssprop --luna-progress-size - The diameter of the progress circle.
 * @cssprop --luna-progress-track - The color of the remaining/incomplete track.
 * @cssprop --luna-progress-fill - The color of the filled portion.
 * @cssprop --luna-progress-width - The thickness of the circle stroke.
 * @cssprop --luna-progress-text - The color of the value text in the center.
 */
class LunaProgressCircle extends HTMLElement {

  static get observedAttributes() {
    return ['value', 'max', 'pending', 'label', 'show-value'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const value     = Number(this.getAttribute('value') || 0);
    const max       = Number(this.getAttribute('max') || 100);
    const pending   = this.hasAttribute('pending');
    const showValue = this.hasAttribute('show-value');
    const label     = this.getAttribute('label');

    const percent       = Math.min(100, Math.max(0, (value / max) * 100));
    const radius        = 45;
    const circumference = 2 * Math.PI * radius;
    const offset        = circumference * (1 - percent / 100);

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          --luna-progress-size: 72px;
          --luna-progress-track: #f3f4f6;
          --luna-progress-fill: #111;
          --luna-progress-width: 6;
          --luna-progress-text: #111;

          display: inline-flex;
          flex-direction: column;
          align-items: center;
          font-family: inherit;
        }

        svg {
          width: var(--luna-progress-size);
          height: var(--luna-progress-size);
          transform: rotate(-90deg);
        }

        circle {
          fill: none;
          stroke-width: var(--luna-progress-width);
        }

        .track {
          stroke: var(--luna-progress-track);
        }

        .indicator {
          stroke: var(--luna-progress-fill);
          stroke-linecap: round;
          stroke-dasharray: ${circumference};
          stroke-dashoffset: ${pending ? circumference * 0.75 : offset};
          transition: stroke-dashoffset 0.25s ease;
        }

        .pending .indicator {
          animation: spin 1.2s linear infinite;
        }

        .center {
          position: absolute;
          top: 0;
          left: 0;
          width: var(--luna-progress-size);
          height: var(--luna-progress-size);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--luna-progress-text);
        }

        .label {
          margin-top: 0.25rem;
          font-size: 0.75rem;
          color: #6b7280;
        }

        @keyframes spin {
          0% { stroke-dashoffset: ${circumference}; }
          100% { stroke-dashoffset: 0; }
        }
      </style>

      <div class="${pending ? 'pending' : ''}" style="position: relative;">
        <svg viewBox="0 0 100 100">
          <circle class="track" cx="50" cy="50" r="${radius}" />
          <circle class="indicator" cx="50" cy="50" r="${radius}" />
        </svg>

        ${
          showValue && !pending
            ? `<div class="center">${Math.round(percent)}%</div>`
            : ''
        }
      </div>

      ${label ? `<div class="label">${label}</div>` : ''}
    `;
  }
}

customElements.define('luna-progress-circle', LunaProgressCircle);