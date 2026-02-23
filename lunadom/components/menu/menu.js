// lunadom/components/menu/menu.js

/**
 * @customElement luna-menu
 * 
 * @slot - List of luna-menu-item or luna-divider components.
 * 
 * Attributes:
 * @attr {string} max-width - The maximum width of the menu. Defaults to '250px'.
 * 
 * CSS Custom Properties:
 * @cssprop --luna-menu-bg - Background color of the menu.
 * @cssprop --luna-menu-border - Border color of the menu.
 * @cssprop --luna-menu-radius - Border radius for the menu corners.
 * @cssprop --luna-menu-shadow - Box shadow for the menu.
 */
class LunaMenu extends HTMLElement {

  static get observedAttributes() {
    return ['max-width'];
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
    const maxWidth = this.getAttribute('max-width') || '250px';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: inherit;
          --luna-menu-bg: rgba(22, 22, 22, 0.95);
          --luna-menu-border: rgba(255, 255, 255, 0.08);
          --luna-menu-radius: 12px;
          --luna-menu-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.7), 
                             0 0 1px 1px rgba(255, 255, 255, 0.05);
        }

        .menu {
          display: flex;
          flex-direction: column;
          background: var(--luna-menu-bg);
          border: 1px solid var(--luna-menu-border);
          border-radius: var(--luna-menu-radius);
          max-width: ${maxWidth};
          padding: 0.5rem;
          box-sizing: border-box;
          box-shadow: var(--luna-menu-shadow);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }

        ::slotted(luna-menu-item) {
          margin-bottom: 2px;
        }

        ::slotted(luna-menu-item:last-child) {
          margin-bottom: 0;
        }

        ::slotted(luna-divider) {
          margin: 0.5rem -0.5rem;
          --luna-divider-color: rgba(255, 255, 255, 0.06);
        }
      </style>

      <div class="menu" part="base">
        <slot></slot>
      </div>
    `;
  }
}

customElements.define('luna-menu', LunaMenu);