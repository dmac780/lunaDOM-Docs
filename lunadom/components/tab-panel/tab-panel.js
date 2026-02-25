// lunadom/components/tab-panel/tab-panel.js

/**
 * @customElement luna-tab-panel
 *
 * Content panel associated with a luna-tab. Hidden unless `active` is set by
 * the parent luna-tab-group.
 *
 * @slot - The panel body content.
 *
 * Attributes:
 * @attr {string}  name   - Unique identifier matched by the `panel` attr on luna-tab.
 * @attr {boolean} active - Whether this panel is currently visible.
 *
 * CSS Custom Properties:
 * @cssprop --luna-panel-padding - Inner padding of the panel (default: 1.5rem 0)
 * @cssprop --luna-panel-color   - Text colour of the panel (default: inherit)
 */
class LunaTabPanel extends HTMLElement {

  static get observedAttributes() {
    return ['name', 'active'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this._render();
  }

  attributeChangedCallback() {
    if (this.isConnected) {
      this._render();
    }
  }

  get name() {
    return this.getAttribute('name');
  }

  get active() {
    return this.hasAttribute('active');
  }

  _render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          padding: var(--luna-panel-padding, 1.5rem 0);
          color: var(--luna-panel-color, inherit);
          font-family: inherit;
        }

        :host(:not([active])) {
          display: none;
        }
      </style>
      <slot></slot>
    `;

    this.setAttribute('role', 'tabpanel');
  }
}

customElements.define('luna-tab-panel', LunaTabPanel);