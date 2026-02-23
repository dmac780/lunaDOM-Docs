// lunadom/components/divider/divider.js

/**
 * @customElement luna-divider
 * 
 * @slot - Optional label text to display within the divider.
 * 
 * Attributes:
 * @attr {boolean} vertical - If present, the divider will be vertical instead of horizontal.
 * @attr {'strong' | 'subtle'} variant - The visual style of the divider.
 * 
 * CSS Custom Properties:
 * @cssprop --luna-divider-color - The color of the divider line.
 * @cssprop --luna-divider-thickness - The thickness of the divider line.
 * @cssprop --luna-divider-radius - The border radius of the divider line.
 * @cssprop --luna-divider-gap - The gap between the label and the divider lines (if a label is provided).
 * @cssprop --luna-divider-label-color - The text color of the optional label.
 */
class LunaDivider extends HTMLElement {

  static get observedAttributes() {
    return ['vertical', 'variant'];
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
    const vertical = this.hasAttribute('vertical');

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          --luna-divider-color: var(--luna-border, #e5e7eb);
          --luna-divider-thickness: 1px;
          --luna-divider-radius: 999px;
          --luna-divider-gap: 0.75rem;
          --luna-divider-label-color: #6b7280;

          display: ${vertical ? 'inline-flex' : 'flex'};
          align-items: center;
          ${vertical ? 'height: 100%;' : 'width: 100%;'}
        }

        .line {
          flex: 1;
          background-color: var(--luna-divider-color);
          border-radius: var(--luna-divider-radius);
        }

        .horizontal {
          height: var(--luna-divider-thickness);
        }

        .vertical {
          width: var(--luna-divider-thickness);
          height: 100%;
          min-height: 1rem;
        }

        .label {
          padding: ${vertical ? '0.5rem 0' : '0 0.75rem'};
          font-size: 0.75rem;
          color: var(--luna-divider-label-color);
          white-space: nowrap;
        }

        :host([variant="strong"]) {
          --luna-divider-color: #9ca3af;
          --luna-divider-thickness: 2px;
        }

        :host([variant="subtle"]) {
          --luna-divider-color: #f3f4f6;
        }
      </style>

      <div class="line ${vertical ? 'vertical' : 'horizontal'}"></div>
      ${this.textContent.trim() ? `<span class="label"><slot></slot></span>` : ''}
      <div class="line ${vertical ? 'vertical' : 'horizontal'}"></div>
    `;
  }
}

customElements.define('luna-divider', LunaDivider);