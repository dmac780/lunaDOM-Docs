// lunadom/components/progress/progress.js

/**
 * @customElement luna-progress
 * 
 * Attributes:
 * @attr {number} value - The current value of the progress bar.
 * @attr {number} max - The maximum value of the progress bar. Defaults to 100.
 * @attr {boolean} pending - If present, shows an indeterminate animated state.
 * @attr {string} label - A label to display above the progress bar.
 * @attr {boolean} show-value - If present, displays the percentage text inside the bar.
 * 
 * CSS Custom Properties:
 * @cssprop --luna-progress-height - The height of the progress bar track.
 * @cssprop --luna-progress-bg - The background color of the track.
 * @cssprop --luna-progress-fill - The color of the filled portion of the bar.
 * @cssprop --luna-progress-text - The color of the value text inside the bar.
 * @cssprop --luna-progress-radius - The border radius of the track and bar.
 */
class LunaProgress extends HTMLElement {

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
    const percent   = Math.min(100, Math.max(0, (value / max) * 100));

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          --luna-progress-height: 8px;
          --luna-progress-bg: #f3f4f6;
          --luna-progress-fill: #111;
          --luna-progress-text: #fff;
          --luna-progress-radius: 999px;

          display: block;
          font-family: inherit;
        }

        .label {
          margin-bottom: 0.25rem;
          font-size: 0.75rem;
          color: #6b7280;
        }

        .track {
          position: relative;
          height: var(--luna-progress-height);
          background: var(--luna-progress-bg);
          border-radius: var(--luna-progress-radius);
          overflow: hidden;
        }

        .bar {
          height: 100%;
          background: var(--luna-progress-fill);
          border-radius: inherit;
          width: ${pending ? '50%' : `${percent}%`};
          transition: width 0.2s ease;
        }

        .pending .bar {
          position: absolute;
          animation: slide 1.2s infinite linear;
        }

        .value {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          color: var(--luna-progress-text);
          pointer-events: none;
        }

        @keyframes slide {
          from { left: -50%; }
          to { left: 100%; }
        }
      </style>

      ${label ? `<div class="label">${label}</div>` : ''}

      <div class="track ${pending ? 'pending' : ''}">
        <div class="bar"></div>
        ${showValue && !pending ? `<div class="value">${Math.round(percent)}%</div>` : ''}
      </div>
    `;
  }
}

customElements.define('luna-progress', LunaProgress);