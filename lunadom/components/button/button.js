// lunadom/components/button/button.js

/**
 * @customElement
 * @slot - Button content
 * @slot prefix - Prefix content
 * @slot suffix - Suffix content
 * 
 * Attributes:
 * @attr variant - Button variant (primary, success, warning, danger, neutral)
 * @attr size - Button size (sm, md, lg)
 * @attr pill - Makes the button pill-shaped
 * @attr outline - Makes the button outline
 * @attr disabled - Disables the button
 * @attr loading - Shows loading spinner
 * @attr caret - Shows a caret icon
 * 
 * CSS Custom Properties:
 * @cssprop --luna-button-bg - Background color
 * @cssprop --luna-button-color - Text color
 * @cssprop --luna-button-border - Border color
 * @cssprop --luna-button-hover-bg - Hover background color
 * @cssprop --luna-button-active-bg - Active background color
 * @cssprop --luna-button-focus - Focus ring color
 * @cssprop --luna-button-radius - Border radius override
 */
class LunaButton extends HTMLElement {

  static get observedAttributes() {
    return ['variant', 'size', 'pill', 'outline', 'disabled', 'loading', 'caret'];
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
    this._updateUI();
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (this._isRendered && oldVal !== newVal) {
      this._updateUI();
    }
  }

  _setup() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          vertical-align: middle;
          --luna-button-bg: #2a2a2a;
          --luna-button-color: #eee;
          --luna-button-border: #444;
          --luna-button-hover-bg: #333;
          --luna-button-active-bg: #222;
          --luna-button-focus: var(--luna-accent-alpha, rgba(59, 130, 246, 0.3));
        }

        button {
          all: unset;
          box-sizing: border-box;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-family: inherit;
          font-weight: 500;
          cursor: pointer;
          user-select: none;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid var(--luna-button-border);
          background: var(--luna-button-bg);
          color: var(--luna-button-color);
          width: 100%;
          line-height: 1;
        }

        /* Sizes */
        :host([size="sm"]) button { padding: 0.4rem 0.75rem; font-size: 0.75rem; border-radius: var(--luna-button-radius, 4px); }
        :host(:not([size])) button, :host([size="md"]) button { padding: 0.625rem 1.25rem; font-size: 0.875rem; border-radius: var(--luna-button-radius, 6px); }
        :host([size="lg"]) button { padding: 0.8rem 1.75rem; font-size: 1rem; border-radius: var(--luna-button-radius, 8px); }

        :host([pill]) button { border-radius: var(--luna-button-radius, 999px); }

        /* Variants */
        :host([variant="primary"]) {
          --luna-button-bg: var(--luna-accent, #2563eb);
          --luna-button-hover-bg: #1d4ed8;
          --luna-button-active-bg: #1e40af;
          --luna-button-color: #fff;
          --luna-button-border: transparent;
        }

        :host([variant="success"]) {
          --luna-button-bg: #16a34a;
          --luna-button-hover-bg: #15803d;
          --luna-button-active-bg: #166534;
          --luna-button-color: #fff;
          --luna-button-border: transparent;
        }

        :host([variant="warning"]) {
          --luna-button-bg: #d97706;
          --luna-button-hover-bg: #b45309;
          --luna-button-active-bg: #92400e;
          --luna-button-color: #fff;
          --luna-button-border: transparent;
        }

        :host([variant="danger"]) {
          --luna-button-bg: #dc2626;
          --luna-button-hover-bg: #b91c1c;
          --luna-button-active-bg: #991b1b;
          --luna-button-color: #fff;
          --luna-button-border: transparent;
        }

        :host([variant="neutral"]) {
          --luna-button-bg: transparent;
          --luna-button-color: #aaa;
          --luna-button-border: #333;
          --luna-button-hover-bg: rgba(255, 255, 255, 0.05);
        }

        /* Outline */
        :host([outline]) {
          --luna-button-bg: transparent;
        }
        :host([outline][variant="primary"]) { --luna-button-color: var(--luna-accent); --luna-button-border: var(--luna-accent); }
        :host([outline][variant="success"]) { --luna-button-color: #22c55e; --luna-button-border: #22c55e; }
        :host([outline][variant="danger"]) { --luna-button-color: #ef4444; --luna-button-border: #ef4444; }

        button:hover:not(:disabled) {
          background: var(--luna-button-hover-bg);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        button:active:not(:disabled) {
          background: var(--luna-button-active-bg);
          transform: translateY(1px);
        }

        button:focus-visible {
          box-shadow: 0 0 0 3px var(--luna-button-focus);
        }

        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          filter: grayscale(0.5);
        }

        .caret {
          border-left: 4px solid transparent;
          border-right: 4px solid transparent;
          border-top: 4px solid currentColor;
          margin-left: 0.25rem;
        }

        /* Spin animation for loading */
        .spinner {
          width: 1rem;
          height: 1rem;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: currentColor;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      </style>

      <button id="btn" part="base">
        <div class="spinner" id="loader" hidden></div>
        <slot name="prefix"></slot>
        <slot></slot>
        <slot name="suffix"></slot>
        <span class="caret" id="caret-ui" hidden></span>
      </button>
    `;

    this._btn    = this.shadowRoot.getElementById('btn');
    this._loader = this.shadowRoot.getElementById('loader');
    this._caret  = this.shadowRoot.getElementById('caret-ui');

    this._btn.addEventListener('click', (e) => {
      if (this.hasAttribute('disabled') || this.hasAttribute('loading')) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      this.dispatchEvent(new CustomEvent('luna-click', {
        bubbles: true,
        composed: true,
        detail: { originalEvent: e }
      }));
    });
  }

  _updateUI() {
    if (!this._isRendered){
      return;
    } 
    this._btn.disabled  = this.hasAttribute('disabled') || this.hasAttribute('loading');
    this._loader.hidden = !this.hasAttribute('loading');
    this._caret.hidden  = !this.hasAttribute('caret');
  }
}

customElements.define('luna-button', LunaButton);
