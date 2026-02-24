// lunadom/components/details/details.js

/**
 * @customElement luna-details
 *
 * @slot summary - The heading text or content shown in the trigger row.
 * @slot icon    - Optional icon rendered before the summary text.
 * @slot         - The body content shown when expanded.
 *
 * Attributes:
 * @attr {boolean} open     - Whether the content is currently expanded.
 * @attr {boolean} disabled - Prevents toggling.
 * @attr {string}  group    - Accordion key. Opening one member closes all others in the group.
 * @attr {'ghost'|'card'|'glass'} variant
 *   Visual style of the component.
 *   - card  : solid background + border, matching luna-card defaults (default)
 *   - ghost : no background, only a bottom border separator
 *   - glass : frosted-glass effect, good on colourful or image backgrounds
 *
 * CSS Custom Properties:
 * @cssprop --luna-details-bg             - Background colour (default: #1a1a1a)
 * @cssprop --luna-details-bg-open        - Background when expanded (default: #1a1a1a)
 * @cssprop --luna-details-border         - Border colour (default: #2a2a2a)
 * @cssprop --luna-details-border-open    - Border colour when expanded (default: var(--luna-accent))
 * @cssprop --luna-details-radius         - Border radius (default: 1rem)
 * @cssprop --luna-details-padding        - Header/summary padding (default: 1rem 1.25rem)
 * @cssprop --luna-details-body-padding   - Body content padding (default: 0 1.25rem 1.25rem)
 * @cssprop --luna-details-summary-color  - Summary text colour (default: #eee)
 * @cssprop --luna-details-summary-size   - Summary font size (default: 0.9375rem)
 * @cssprop --luna-details-content-color  - Body text colour (default: #888)
 * @cssprop --luna-details-content-size   - Body font size (default: 0.875rem)
 * @cssprop --luna-details-chevron-color  - Chevron icon colour (default: #555)
 * @cssprop --luna-details-icon-color     - Prefix icon colour (default: var(--luna-accent))
 * @cssprop --luna-details-divider-color  - Divider line colour (default: #2a2a2a)
 * @cssprop --luna-details-hover-bg       - Summary row hover background (default: rgba(255,255,255,.03))
 * @cssprop --luna-details-shadow-open    - Box shadow when expanded (default: 0 8px 32px rgba(0,0,0,.35))
 * @cssprop --luna-accent                 - Accent colour for chevron/focus/border (default: #2563eb)
 *
 * Events:
 * @event luna-show - Emitted when the panel opens.
 * @event luna-hide - Emitted when the panel closes.
 */
class LunaDetails extends HTMLElement {

  static get observedAttributes() {
    return ['open', 'disabled', 'group', 'variant'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._toggle = this._toggle.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
  }

  connectedCallback() {
    this._render();
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal === newVal || !this.isConnected) {
      return;
    }

    if (name === 'open') {
      this._updateOpenState();
      return;
    }

    this._render();
  }

  show() {
    if (this.hasAttribute('open') || this.hasAttribute('disabled')) {
      return;
    }

    this._closeGroup();
    this.setAttribute('open', '');
    this.dispatchEvent(new CustomEvent('luna-show', { bubbles: true, composed: true }));
  }

  hide() {
    if (!this.hasAttribute('open')) {
      return;
    }

    this.removeAttribute('open');
    this.dispatchEvent(new CustomEvent('luna-hide', { bubbles: true, composed: true }));
  }

  _closeGroup() {
    const group = this.getAttribute('group');

    if (!group) {
      return;
    }

    document
      .querySelectorAll(`luna-details[group="${group}"]`)
      .forEach(el => {
        if (el !== this) {
          el.removeAttribute('open');
        }
      });
  }

  _toggle() {
    if (this.hasAttribute('disabled')) {
      return;
    }

    if (this.hasAttribute('open')) {
      this.hide();
    } else {
      this.show();
    }
  }

  _onKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this._toggle();
    }
  }

  _updateOpenState() {
    const content = this.shadowRoot.querySelector('.content');
    const chevron = this.shadowRoot.querySelector('.chevron');
    const divider = this.shadowRoot.querySelector('.divider');
    const isOpen  = this.hasAttribute('open');

    if (content) { content.classList.toggle('open', isOpen); }
    if (chevron) { chevron.classList.toggle('open', isOpen); }
    if (divider) { divider.classList.toggle('open', isOpen); }
  }

  _render() {
    const variant = this.getAttribute('variant') || 'card';
    const isGlass = variant === 'glass';
    const isGhost = variant === 'ghost';
    const isOpen  = this.hasAttribute('open');

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: inherit;

          --luna-details-bg:            #1a1a1a;
          --luna-details-bg-open:       #1a1a1a;
          --luna-details-border:        #2a2a2a;
          --luna-details-border-open:   var(--luna-accent, #2563eb);
          --luna-details-radius:        1rem;
          --luna-details-padding:       1rem 1.25rem;
          --luna-details-body-padding:  0 1.25rem 1.25rem;
          --luna-details-summary-color: #eee;
          --luna-details-summary-size:  0.9375rem;
          --luna-details-content-color: #888;
          --luna-details-content-size:  0.875rem;
          --luna-details-chevron-color: #555;
          --luna-details-icon-color:    var(--luna-accent, #2563eb);
          --luna-details-divider-color: #2a2a2a;
          --luna-details-hover-bg:      rgba(255, 255, 255, 0.03);
          --luna-details-shadow-open:   0 8px 32px rgba(0, 0, 0, 0.35);
        }

        *, *::before, *::after { box-sizing: border-box; }

        .shell {
          border-radius: var(--luna-details-radius);
          overflow: hidden;
          transition:
            border-color  0.2s ease,
            box-shadow    0.2s ease,
            background    0.2s ease;
        }

        ${!isGhost ? `
        .shell {
          background: var(--luna-details-bg);
          border: 1px solid var(--luna-details-border);
        }
        ` : ''}

        ${isGhost ? `
        .shell {
          background: transparent;
          border: none;
          border-bottom: 1px solid var(--luna-details-border);
          border-radius: 0;
        }
        ` : ''}

        ${isGlass ? `
        .shell {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }
        ` : ''}

        .shell.open {
          background: var(--luna-details-bg-open);
          border-color: var(--luna-details-border-open);
          box-shadow: var(--luna-details-shadow-open);
        }

        ${isGhost ? `
        .shell.open {
          background: transparent;
          border-color: var(--luna-details-border-open);
          box-shadow: none;
        }
        ` : ''}

        ${isGlass ? `
        .shell.open {
          background: rgba(255, 255, 255, 0.08);
          border-color: var(--luna-details-border-open);
        }
        ` : ''}

        .summary {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          padding: var(--luna-details-padding);
          user-select: none;
          transition: background 0.15s ease;
          position: relative;
        }

        .summary:hover {
          background: var(--luna-details-hover-bg);
        }

        .summary:focus-visible {
          outline: 2px solid var(--luna-details-border-open);
          outline-offset: -2px;
          border-radius: calc(var(--luna-details-radius) - 2px);
        }

        :host([disabled]) .summary {
          opacity: 0.4;
          cursor: not-allowed;
          pointer-events: none;
        }

        .icon-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--luna-details-icon-color);
          flex-shrink: 0;
        }

        .label {
          flex: 1;
          font-size: var(--luna-details-summary-size);
          font-weight: 600;
          color: var(--luna-details-summary-color);
          line-height: 1.4;
        }

        .chevron {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
          color: var(--luna-details-chevron-color);
          transition:
            transform 0.22s cubic-bezier(0.4, 0, 0.2, 1),
            color     0.15s ease;
        }

        .chevron.open {
          transform: rotate(180deg);
          color: var(--luna-details-border-open);
        }

        .divider {
          height: 1px;
          background: var(--luna-details-divider-color);
          margin: 0;
          opacity: 0;
          transition: opacity 0.15s ease;
        }

        .divider.open {
          opacity: 1;
        }

        .content {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 0.22s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .content.open {
          grid-template-rows: 1fr;
        }

        .content-inner {
          overflow: hidden;
        }

        .body {
          padding: var(--luna-details-body-padding);
          color: var(--luna-details-content-color);
          font-size: var(--luna-details-content-size);
          line-height: 1.65;
        }
      </style>

      <div class="shell${isOpen ? ' open' : ''}" part="base">
        <div
          class="summary"
          id="trigger"
          part="summary"
          tabindex="${this.hasAttribute('disabled') ? '-1' : '0'}"
          role="button"
          aria-expanded="${isOpen ? 'true' : 'false'}"
        >
          <span class="icon-wrap" part="icon">
            <slot name="icon"></slot>
          </span>
          <span class="label" part="label">
            <slot name="summary"></slot>
          </span>
          <svg class="chevron${isOpen ? ' open' : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>

        <div class="divider${isOpen ? ' open' : ''}"></div>

        <div class="content${isOpen ? ' open' : ''}" part="content">
          <div class="content-inner">
            <div class="body" part="body">
              <slot></slot>
            </div>
          </div>
        </div>
      </div>
    `;

    const trigger = this.shadowRoot.getElementById('trigger');
    trigger.addEventListener('click',   this._toggle);
    trigger.addEventListener('keydown', this._onKeyDown);
  }
}

customElements.define('luna-details', LunaDetails);