// lunadom/components/badge/badge.js

/**
 * @customElement
 * @slot - Badge content
 * 
 * Attributes:
 * @attr pill - Badge is pill shaped
 * @attr dot - Badge is a dot
 * @attr pulse - Badge has a pulse animation
 * 
 * CSS Custom Properties:
 * @cssprop --luna-radius - Border radius for the badge
 * @cssprop --luna-accent - Accent color for the badge
 * @cssprop --luna-badge-bg - Background color for the badge
 * @cssprop --luna-badge-color - Text color for the badge
 */
class LunaBadge extends HTMLElement {

  static get observedAttributes() {
    return ['variant', 'pill', 'dot', 'pulse'];
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
    const pill  = this.hasAttribute('pill');
    const dot   = this.hasAttribute('dot');
    const pulse = this.hasAttribute('pulse');

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-flex;
          vertical-align: middle;
          --luna-badge-bg: rgba(255, 255, 255, 0.1);
          --luna-badge-color: #eee;
        }

        :host([variant="primary"]) { --luna-badge-bg: var(--luna-accent-alpha, rgba(37, 99, 235, 0.2)); --luna-badge-color: var(--luna-accent, #60a5fa); }
        :host([variant="success"]) { --luna-badge-bg: rgba(34, 197, 94, 0.2); --luna-badge-color: #4ade80; }
        :host([variant="warning"]) { --luna-badge-bg: rgba(234, 179, 8, 0.2); --luna-badge-color: #facc15; }
        :host([variant="danger"]) { --luna-badge-bg: rgba(239, 68, 68, 0.2); --luna-badge-color: #f87171; }

        .badge {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.15rem 0.45rem;
          font-size: 0.7rem;
          font-weight: 600;
          line-height: 1;
          border-radius: ${pill ? '999px' : '4px'};
          background: var(--luna-badge-bg);
          color: var(--luna-badge-color);
          white-space: nowrap;
          border: 1px solid rgba(255, 255, 255, 0.05);
          isolation: isolate;
        }

        .badge.dot {
          width: 8px;
          height: 8px;
          padding: 0;
          min-width: 8px;
          border-radius: 50%;
          background: var(--luna-badge-color);
          border: none;
        }

        .pulse::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: inherit;
          background: var(--luna-badge-color);
          opacity: 0.6;
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          z-index: -1;
          pointer-events: none;
        }

        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2.5); opacity: 0; }
        }
      </style>

      <span class="badge ${dot ? 'dot' : ''} ${pulse ? 'pulse' : ''}" part="base">
        <slot></slot>
      </span>
    `;
  }
}

customElements.define('luna-badge', LunaBadge);
