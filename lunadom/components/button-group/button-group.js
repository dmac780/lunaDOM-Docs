// lunadom/components/button-group/button-group.js

/**
 * @customElement luna-button-group
 *
 * @slot - luna-button and/or luna-dropdown children.
 *
 * Attributes:
 * @attr {string}  spacing   - Gap between items, e.g. '0.5rem'. Default '0' (connected).
 * @attr {boolean} vertical  - Stack items vertically.
 * @attr {boolean} fullwidth - Stretch to fill parent width.
 * @attr {boolean} pill      - Pill-shaped outer corners.
 *
 * CSS Custom Properties:
 * @cssprop --luna-button-group-gap    - Gap between items (overrides spacing attribute).
 * @cssprop --luna-button-group-radius - Outer corner radius (overrides pill default).
 */
class LunaButtonGroup extends HTMLElement {

  static get observedAttributes() {
    return ['spacing', 'vertical', 'fullwidth', 'pill'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._isRendered = false;
  }

  connectedCallback() {
    if (!this._isRendered) {
      this._render();
      this._isRendered = true;
    }
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (this._isRendered && oldVal !== newVal) {
      this._render();
    }
  }

  _render() {
    const spacing   = this.getAttribute('spacing') || '0';
    const connected = spacing === '0';
    const vertical  = this.hasAttribute('vertical');
    const fullwidth = this.hasAttribute('fullwidth');
    const pill      = this.hasAttribute('pill');
    const outerR    = pill ? '9999px' : '8px';
    const flex      = fullwidth ? '1' : 'none';
    const negMargin = vertical ? 'margin-top: -1px !important;' : 'margin-left: -1px !important;';
    const firstR    = vertical
      ? `${outerR} ${outerR} 0 0`
      : `${outerR} 0 0 ${outerR}`;
    const lastR     = vertical
      ? `0 0 ${outerR} ${outerR}`
      : `0 ${outerR} ${outerR} 0`;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: ${vertical ? 'flex' : 'inline-flex'};
          flex-direction: ${vertical ? 'column' : 'row'};
          align-items: stretch;
          gap: var(--luna-button-group-gap, ${spacing});
          width: ${fullwidth ? '100%' : 'auto'};
          --luna-button-group-radius: ${outerR};
          position: relative;
        }

        ::slotted(luna-button),
        ::slotted(luna-dropdown) {
          margin: 0 !important;
          flex: ${flex};
          --luna-button-radius: 0;
          position: relative;
        }

        ::slotted(luna-button:hover) {
          z-index: 2;
        }

        ::slotted(luna-button:active) {
          z-index: 3;
        }

        ${connected ? `
          ::slotted(luna-button:not(:first-child)),
          ::slotted(luna-dropdown:not(:first-child)) {
            ${negMargin}
          }
        ` : ''}

        ::slotted(luna-button:first-child),
        ::slotted(luna-dropdown:first-child) {
          --luna-button-radius: ${firstR};
        }

        ::slotted(luna-button:last-child),
        ::slotted(luna-dropdown:last-child) {
          --luna-button-radius: ${lastR};
        }

        ::slotted(luna-button:first-child:last-child),
        ::slotted(luna-dropdown:first-child:last-child) {
          --luna-button-radius: ${outerR};
        }

        ${!connected ? `
          ::slotted(luna-button),
          ::slotted(luna-dropdown) {
            --luna-button-radius: ${outerR} !important;
          }
        ` : ''}
      </style>

      <slot></slot>
    `;
  }
}

customElements.define('luna-button-group', LunaButtonGroup);