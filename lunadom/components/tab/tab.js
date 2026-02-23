// lunadom/components/tab/tab.js

/**
 * @customElement luna-tab
 * 
 * @slot - The label for the tab.
 * 
 * Attributes:
 * @attr {boolean} active - Whether the tab is currently active.
 * @attr {boolean} disabled - Whether the tab is disabled.
 * @attr {boolean} closable - If present, shows a close button next to the tab label.
 * @attr {string} panel - The ID of the luna-tab-panel associated with this tab.
 * 
 * CSS Custom Properties:
 * @cssprop --luna-tab-color - The default text color of the tab.
 * @cssprop --luna-tab-color-hover - The text color when the tab is hovered.
 * @cssprop --luna-tab-color-active - The text color when the tab is active.
 * @cssprop --luna-accent - Primary accent color used for active states.
 * @cssprop --luna-tab-border-active - The border color of the active tab indicator.
 * @cssprop --luna-tab-focus-bg - Background color when the tab is focused.
 * 
 * Events:
 * @event luna-close - Emitted when the close button is clicked.
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
    // No full re-render needed, just style/state updates
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
          padding: 0.75rem 1rem;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--luna-tab-color, #6b7280);
          border-bottom: 2px solid transparent;
          transition: all 0.2s ease;
          user-select: none;
          position: relative;
          white-space: nowrap;
          outline: none;
        }

        :host(:hover:not([disabled])) {
          color: var(--luna-tab-color-hover, #e5e7eb);
          background: rgba(255, 255, 255, 0.03);
        }

        :host([active]) {
          color: var(--luna-tab-color-active, #fff);
          border-bottom-color: var(--luna-accent, #3b82f6);
        }

        :host([disabled]) {
          opacity: 0.4;
          cursor: not-allowed;
          pointer-events: none;
        }

        :host(:focus-visible) {
          background: rgba(255, 255, 255, 0.05);
          outline: 2px solid var(--luna-accent, #3b82f6);
          outline-offset: -2px;
        }

        .close-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
          margin-left: 0.5rem;
          border-radius: 4px;
          font-size: 0.875rem;
          line-height: 1;
          color: #666;
          opacity: 0;
          transition: all 0.15s;
        }

        :host([closable]:hover) .close-button {
          opacity: 0.7;
        }

        .close-button:hover {
          opacity: 1 !important;
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }
      </style>
      <slot></slot>
      <span class="close-button" id="close" hidden>×</span>
    `;

    const closeBtn = this.shadowRoot.getElementById('close');
    if (this.hasAttribute('closable')) {
      closeBtn.hidden = false;
    }
    
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.dispatchEvent(new CustomEvent('luna-close', {
        bubbles: true,
        composed: true,
        detail: { tab: this }
      }));
    });

    this.setAttribute('tabindex', this.disabled ? '-1' : '0');
    this.setAttribute('role', 'tab');
    this.setAttribute('aria-selected', this.active ? 'true' : 'false');
  }
}

customElements.define('luna-tab', LunaTab);