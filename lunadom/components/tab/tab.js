// lunadom/components/tab/tab.js

/**
 * @customElement luna-tab
 *
 * @slot - The label content for the tab.
 *
 * Attributes:
 * @attr {boolean} active    - Whether the tab is currently active.
 * @attr {boolean} disabled  - Whether the tab is disabled and cannot be selected.
 * @attr {boolean} closable  - If present, shows a close button next to the tab label.
 * @attr {string}  panel     - The `name` of the luna-tab-panel this tab activates.
 *
 * CSS Custom Properties:
 * @cssprop --luna-tab-color         - Default tab text colour (default: #555)
 * @cssprop --luna-tab-color-hover   - Tab text colour on hover (default: #ccc)
 * @cssprop --luna-tab-color-active  - Active tab text colour (default: #fff)
 * @cssprop --luna-tab-font-size     - Tab label font size (default: 0.8125rem)
 * @cssprop --luna-tab-font-weight   - Tab label font weight (default: 500)
 * @cssprop --luna-tab-padding       - Tab padding (default: 0.75rem 1.25rem)
 * @cssprop --luna-tab-indicator     - Active indicator colour (default: var(--luna-accent, #2563eb))
 * @cssprop --luna-tab-hover-bg      - Hover background tint (default: rgba(255,255,255,.03))
 *
 * Events:
 * @event luna-close - Emitted when the close button is clicked. detail: { tab }
 */
class LunaTab extends HTMLElement {

  static get observedAttributes() {
    return ['active', 'disabled', 'closable', 'panel'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._isRendered = false;
  }

  connectedCallback() {
    if (!this._isRendered) {
      this._setup();
      this._isRendered = true;
    }
  }

  attributeChangedCallback() {
    // active/disabled are reflected via host attribute selectors
  }

  get active() {
    return this.hasAttribute('active');
  }

  set active(val) {
    if (val) {
      this.setAttribute('active', '');
    } else {
      this.removeAttribute('active');
    }
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(val) {
    if (val) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
  }

  get panel() {
    return this.getAttribute('panel');
  }

  _setup() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.375rem;
          padding: var(--luna-tab-padding, 0.75rem 1.25rem);
          cursor: pointer;
          font-family: inherit;
          font-size: var(--luna-tab-font-size, 0.8125rem);
          font-weight: var(--luna-tab-font-weight, 500);
          color: var(--luna-tab-color, #555);
          border-bottom: 2px solid transparent;
          transition: color 0.15s ease, background 0.15s ease, border-color 0.15s ease;
          user-select: none;
          position: relative;
          white-space: nowrap;
          outline: none;
          letter-spacing: 0.01em;
        }

        :host(:hover:not([disabled])) {
          color: var(--luna-tab-color-hover, #ccc);
          background: var(--luna-tab-hover-bg, rgba(255, 255, 255, 0.03));
        }

        :host([active]) {
          color: var(--luna-tab-color-active, #fff);
          border-bottom-color: var(--luna-tab-indicator, var(--luna-accent, #2563eb));
        }

        :host([disabled]) {
          opacity: 0.35;
          cursor: not-allowed;
          pointer-events: none;
        }

        :host(:focus-visible) {
          background: rgba(255, 255, 255, 0.05);
          outline: 2px solid var(--luna-tab-indicator, var(--luna-accent, #2563eb));
          outline-offset: -2px;
          border-radius: 3px;
        }

        .close-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 15px;
          height: 15px;
          margin-left: 0.125rem;
          border-radius: 3px;
          font-size: 0.9rem;
          line-height: 1;
          color: #555;
          opacity: 0;
          transition: opacity 0.15s ease, background 0.15s ease, color 0.15s ease;
          flex-shrink: 0;
        }

        :host(:hover) .close-btn {
          opacity: 0.6;
        }

        .close-btn:hover {
          opacity: 1 !important;
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }
      </style>

      <slot></slot>
      <span class="close-btn" id="close" hidden>×</span>
    `;

    const closeBtn = this.shadowRoot.getElementById('close');

    if (this.hasAttribute('closable')) {
      closeBtn.hidden = false;
    }

    closeBtn.addEventListener('click', e => {
      e.stopPropagation();
      this.dispatchEvent(new CustomEvent('luna-close', {
        bubbles:  true,
        composed: true,
        detail:   { tab: this },
      }));
    });

    this.setAttribute('tabindex',      this.disabled ? '-1' : '0');
    this.setAttribute('role',          'tab');
    this.setAttribute('aria-selected', this.active ? 'true' : 'false');
  }
}

customElements.define('luna-tab', LunaTab);