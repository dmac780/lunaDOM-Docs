// lunadom/components/button/button.js

/**
 * @customElement luna-button
 *
 * @slot          - Button label / content.
 * @slot prefix   - Content placed before the label (icon, etc.).
 * @slot suffix   - Content placed after the label.
 *
 * Attributes:
 * @attr {'primary'|'success'|'warning'|'danger'|'neutral'} variant
 *   Visual colour variant. Default: no variant (neutral-ish dark fill).
 * @attr {'sm'|'md'|'lg'} size  - Size preset. Default: 'md'.
 * @attr {boolean} pill         - Full pill border-radius.
 * @attr {boolean} circle       - Equal width/height + 50% radius, ideal for icon-only use.
 * @attr {boolean} outline      - Transparent fill, coloured border and text.
 * @attr {boolean} disabled     - Disables the button.
 * @attr {boolean} loading      - Shows a spinner and disables interaction.
 * @attr {boolean} caret        - Appends a small downward caret after the label.
 *
 * CSS Custom Properties:
 * @cssprop --luna-button-bg         - Resting background colour
 * @cssprop --luna-button-color      - Label / icon colour
 * @cssprop --luna-button-border     - Border colour
 * @cssprop --luna-button-hover-bg   - Hover background colour
 * @cssprop --luna-button-active-bg  - Active / pressed background colour
 * @cssprop --luna-button-focus      - Focus ring colour
 * @cssprop --luna-button-radius     - Border radius override
 *
 * Events:
 * @event luna-click - Fired on click when not disabled or loading. detail: { originalEvent }
 */
class LunaButton extends HTMLElement {

  static get observedAttributes() {
    return ['variant', 'size', 'pill', 'circle', 'outline', 'disabled', 'loading', 'caret'];
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

  disconnectedCallback() {
    if (this._btn) {
      this._btn.removeEventListener('click', this._onClickBound);
    }
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

          --luna-button-bg:        #2a2a2a;
          --luna-button-color:     #eee;
          --luna-button-border:    #444;
          --luna-button-hover-bg:  #333;
          --luna-button-active-bg: #222;
          --luna-button-focus:     var(--luna-accent-alpha, rgba(59, 130, 246, 0.3));
          --luna-button-radius:    6px;
        }

        *, *::before, *::after { box-sizing: border-box; }

        button {
          all: unset;
          box-sizing: border-box;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-family: inherit;
          font-weight: 500;
          line-height: 1;
          cursor: pointer;
          user-select: none;
          white-space: nowrap;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid var(--luna-button-border);
          background: var(--luna-button-bg);
          color: var(--luna-button-color);
          border-radius: var(--luna-button-radius);
        }

        :host(:not([size])) button,
        :host([size="md"]) button {
          padding: 0.625rem 1.25rem;
          font-size: 0.875rem;
          --luna-button-radius: 6px;
        }

        :host([size="sm"]) button {
          padding: 0.4rem 0.75rem;
          font-size: 0.75rem;
          --luna-button-radius: 4px;
        }

        :host([size="lg"]) button {
          padding: 0.8rem 1.75rem;
          font-size: 1rem;
          --luna-button-radius: 8px;
        }

        :host([pill]) button {
          border-radius: 999px;
        }

        :host([circle]) button {
          border-radius: 50%;
          padding: 0;
        }

        :host([circle]:not([size])) button,
        :host([circle][size="md"]) button {
          width: 2.375rem;
          height: 2.375rem;
        }

        :host([circle][size="sm"]) button {
          width: 1.75rem;
          height: 1.75rem;
        }

        :host([circle][size="lg"]) button {
          width: 2.875rem;
          height: 2.875rem;
        }

        :host([variant="primary"]) {
          --luna-button-bg:        var(--luna-accent, #2563eb);
          --luna-button-hover-bg:  #1d4ed8;
          --luna-button-active-bg: #1e40af;
          --luna-button-color:     #fff;
          --luna-button-border:    transparent;
        }

        :host([variant="success"]) {
          --luna-button-bg:        #16a34a;
          --luna-button-hover-bg:  #15803d;
          --luna-button-active-bg: #166534;
          --luna-button-color:     #fff;
          --luna-button-border:    transparent;
        }

        :host([variant="warning"]) {
          --luna-button-bg:        #d97706;
          --luna-button-hover-bg:  #b45309;
          --luna-button-active-bg: #92400e;
          --luna-button-color:     #fff;
          --luna-button-border:    transparent;
        }

        :host([variant="danger"]) {
          --luna-button-bg:        #dc2626;
          --luna-button-hover-bg:  #b91c1c;
          --luna-button-active-bg: #991b1b;
          --luna-button-color:     #fff;
          --luna-button-border:    transparent;
        }

        :host([variant="neutral"]) {
          --luna-button-bg:        transparent;
          --luna-button-hover-bg:  rgba(255, 255, 255, 0.05);
          --luna-button-active-bg: rgba(255, 255, 255, 0.09);
          --luna-button-color:     #aaa;
          --luna-button-border:    #333;
        }

        :host([outline]) {
          --luna-button-bg:        transparent;
          --luna-button-hover-bg:  rgba(255, 255, 255, 0.05);
          --luna-button-active-bg: rgba(255, 255, 255, 0.09);
        }

        :host([outline][variant="primary"]) {
          --luna-button-color:  var(--luna-accent, #2563eb);
          --luna-button-border: var(--luna-accent, #2563eb);
        }

        :host([outline][variant="success"]) {
          --luna-button-color:  #22c55e;
          --luna-button-border: #22c55e;
        }

        :host([outline][variant="warning"]) {
          --luna-button-color:  #f59e0b;
          --luna-button-border: #f59e0b;
        }

        :host([outline][variant="danger"]) {
          --luna-button-color:  #ef4444;
          --luna-button-border: #ef4444;
        }

        :host([outline][variant="neutral"]) {
          --luna-button-color:  #aaa;
          --luna-button-border: #333;
        }

        button:hover:not(:disabled) {
          background: var(--luna-button-hover-bg);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
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
          display: none;
          border-left: 4px solid transparent;
          border-right: 4px solid transparent;
          border-top: 4px solid currentColor;
          margin-left: 0.125rem;
          flex-shrink: 0;
        }

        :host([caret]) .caret {
          display: inline-block;
        }

        .spinner {
          display: none;
          width: 1rem;
          height: 1rem;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: currentColor;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          flex-shrink: 0;
        }

        :host([loading]) .spinner {
          display: block;
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

    this._onClickBound = (e) => {
      if (this.hasAttribute('disabled') || this.hasAttribute('loading')) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      this.dispatchEvent(new CustomEvent('luna-click', {
        bubbles:  true,
        composed: true,
        detail:   { originalEvent: e },
      }));
    };

    this._btn.addEventListener('click', this._onClickBound);
  }

  _updateUI() {
    if (!this._isRendered) {
      return;
    }
    this._btn.disabled  = this.hasAttribute('disabled') || this.hasAttribute('loading');
    this._loader.hidden = !this.hasAttribute('loading');
    this._caret.hidden  = !this.hasAttribute('caret');
  }
}

customElements.define('luna-button', LunaButton);