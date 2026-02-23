/**
 * @customElement luna-button-group
 * @slot - The default slot for luna-button components.
 * 
 * Attributes:
 * @attr spacing - Spacing between buttons (e.g., '0', '0.5rem'). Defaults to '0' for a connected group.
 * @attr vertical - Makes the button group vertical.
 * @attr fullwidth - Makes the button group take up the full width of its container.
 * @attr pill - Applies a pill-shaped radius to the outer corners of the group.
 * 
 * CSS Custom Properties:
 * @cssprop --luna-button-group-gap - Gap between buttons (overrides spacing attribute).
 * @cssprop --luna-button-group-radius - Border radius for the outer corners.
 */
class LunaButtonGroup extends HTMLElement {
  static get observedAttributes() {
    return ['spacing', 'vertical', 'fullwidth', 'pill'];
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
    const spacing   = this.getAttribute('spacing') || '0';
    const isConnected = spacing === '0';
    const vertical  = this.hasAttribute('vertical');
    const fullwidth = this.hasAttribute('fullwidth');
    const pill      = this.hasAttribute('pill');

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: ${vertical ? 'flex' : 'inline-flex'};
          flex-direction: ${vertical ? 'column' : 'row'};
          gap: var(--luna-button-group-gap, ${spacing});
          width: ${fullwidth ? '100%' : 'auto'};
          --luna-button-group-radius: ${pill ? '9999px' : '10px'};
          isolation: isolate;
        }

        ::slotted(luna-button) {
          margin: 0 !important;
          flex: ${fullwidth ? '1' : 'none'};
          --luna-button-radius: 0;
          position: relative;
          z-index: 1;
        }

        ::slotted(luna-button:hover) {
          z-index: 2;
        }

        ::slotted(luna-button:active) {
          z-index: 3;
        }

        /* Border merging for connected groups */
        ${isConnected ? `
          ::slotted(luna-button:not(:first-of-type)) {
            ${vertical ? 'margin-top: -1px !important;' : 'margin-left: -1px !important;'}
          }
        ` : ''}

        /* Outer corner rounding */
        ${vertical ? `
          ::slotted(luna-button:first-of-type) {
            --luna-button-radius: var(--luna-button-group-radius) var(--luna-button-group-radius) 0 0;
          }
          ::slotted(luna-button:last-of-type) {
            --luna-button-radius: 0 0 var(--luna-button-group-radius) var(--luna-button-group-radius);
          }
          /* Handle single button case */
          ::slotted(luna-button:first-of-type:last-of-type) {
            --luna-button-radius: var(--luna-button-group-radius);
          }
        ` : `
          ::slotted(luna-button:first-of-type) {
            --luna-button-radius: var(--luna-button-group-radius) 0 0 var(--luna-button-group-radius);
          }
          ::slotted(luna-button:last-of-type) {
            --luna-button-radius: 0 var(--luna-button-group-radius) var(--luna-button-group-radius) 0;
          }
          /* Handle single button case */
          ::slotted(luna-button:first-of-type:last-of-type) {
            --luna-button-radius: var(--luna-button-group-radius);
          }
        `}

        /* Spaced mode reset */
        ${!isConnected ? `
          ::slotted(luna-button) {
            --luna-button-radius: var(--luna-button-group-radius) !important;
          }
        ` : ''}
      </style>

      <slot></slot>
    `;
  }
}

customElements.define('luna-button-group', LunaButtonGroup);
