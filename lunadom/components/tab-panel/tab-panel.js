// lunadom/components/tab-panel/tab-panel.js

/**
 * @customElement luna-tab-panel
 * 
 * @slot - The content of the tab panel.
 * 
 * Attributes:
 * @attr {string} name - The unique identifier for this panel, matched by the 'panel' attribute of a luna-tab.
 * @attr {boolean} active - Whether the panel is currently visible.
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
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  get name() {
    return this.getAttribute('name');
  }

  get active() {
    return this.hasAttribute('active');
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          padding: 1.5rem 0;
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