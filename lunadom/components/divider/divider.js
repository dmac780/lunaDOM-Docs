// lunadom/components/divider/divider.js

/**
 * @customElement luna-divider
 *
 * @slot - Optional label text displayed at the midpoint of the divider.
 *
 * Attributes:
 * @attr {boolean} vertical
 *   Renders a vertical divider. Host must have an explicit height set.
 *
 * @attr {'subtle'|'default'|'strong'|'gradient'} variant
 *   Visual weight of the line.
 *   - subtle   : near-invisible, great for tight spacing (default)
 *   - default  : standard 1 px separator (alias: omit the attr)
 *   - strong   : 2 px, more visible
 *   - gradient : fades out toward both ends — elegant section break
 *
 * @attr {'solid'|'dashed'|'dotted'} style-line
 *   Line style. Defaults to 'solid'.
 *
 * @attr {'start'|'center'|'end'} label-position
 *   Where the label sits along the line. Defaults to 'center'.
 *
 * @attr {string} spacing
 *   Vertical margin above and below a horizontal divider (CSS length).
 *   e.g. spacing="1rem". Defaults to 0.
 *
 * CSS Custom Properties:
 * @cssprop --luna-divider-color       - Line colour (default: #2a2a2a)
 * @cssprop --luna-divider-thickness   - Line thickness (default: 1px)
 * @cssprop --luna-divider-radius      - Border radius of the line (default: 999px)
 * @cssprop --luna-divider-gap         - Gap between label and line ends (default: 0.75rem)
 * @cssprop --luna-divider-spacing     - Block margin (overrides `spacing` attr)
 * @cssprop --luna-divider-label-color - Label text colour (default: #555)
 * @cssprop --luna-divider-label-size  - Label font size (default: 0.7rem)
 * @cssprop --luna-divider-gradient    - Custom gradient for the 'gradient' variant
 */
class LunaDivider extends HTMLElement {

  static get observedAttributes() {
    return ['vertical', 'variant', 'style-line', 'label-position', 'spacing'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this._render();
    this._bindSlot();
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal !== newVal && this.isConnected) {
      this._render();
      this._bindSlot();
    }
  }

  _bindSlot() {
    const slot = this.shadowRoot.querySelector('slot');

    if (!slot) {
      return;
    }

    slot.addEventListener('slotchange', () => this._render());
  }

  _hasLabel() {
    return this.textContent.trim().length > 0;
  }

  _render() {
    const vertical      = this.hasAttribute('vertical');
    const variant       = this.getAttribute('variant')        || 'default';
    const styleLine     = this.getAttribute('style-line')     || 'solid';
    const labelPosition = this.getAttribute('label-position') || 'center';
    const spacing       = this.getAttribute('spacing')        || '0';
    const hasLabel      = this._hasLabel();

    const justifyMap = {
      start:  'flex-start',
      center: 'center',
      end:    'flex-end',
    };
    const justify = justifyMap[labelPosition] || 'center';
    const isGradient = variant === 'gradient';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          --luna-divider-color:       #2a2a2a;
          --luna-divider-thickness:   1px;
          --luna-divider-radius:      999px;
          --luna-divider-gap:         0.75rem;
          --luna-divider-spacing:     ${spacing};
          --luna-divider-label-color: #555;
          --luna-divider-label-size:  0.7rem;
          --luna-divider-gradient:
            linear-gradient(
              ${vertical ? 'to bottom' : 'to right'},
              transparent 0%,
              var(--luna-divider-color) 30%,
              var(--luna-divider-color) 70%,
              transparent 100%
            );

          display: ${vertical ? 'inline-flex' : 'flex'};
          align-items: center;
          justify-content: ${justify};
          ${vertical ? 'flex-direction: column; height: 100%;' : 'width: 100%;'}
          margin-block: var(--luna-divider-spacing);
        }

        :host([variant="subtle"]) {
          --luna-divider-color: #1c1c1c;
        }

        :host([variant="strong"]) {
          --luna-divider-color: #444;
          --luna-divider-thickness: 2px;
        }

        :host([variant="gradient"]) {
          --luna-divider-color: #3a3a3a;
        }

        .line {
          flex: 1;
          border-radius: var(--luna-divider-radius);
          min-${vertical ? 'height' : 'width'}: 0;
        }

        .line.horizontal {
          height: var(--luna-divider-thickness);
          background-color: ${isGradient ? 'transparent' : 'var(--luna-divider-color)'};
          background-image: ${isGradient ? 'var(--luna-divider-gradient)' : 'none'};
          border-top: ${styleLine !== 'solid' ? `var(--luna-divider-thickness) ${styleLine} var(--luna-divider-color)` : 'none'};
        }

        .line.horizontal.solid-line {
          background-color: ${isGradient ? 'transparent' : 'var(--luna-divider-color)'};
          background-image: ${isGradient ? 'var(--luna-divider-gradient)' : 'none'};
          border: none;
          height: var(--luna-divider-thickness);
        }

        .line.horizontal.styled-line {
          background: transparent;
          height: 0;
          border-top: var(--luna-divider-thickness) ${styleLine} var(--luna-divider-color);
        }

        .line.vertical {
          width: var(--luna-divider-thickness);
          height: 100%;
          min-height: 1rem;
          background-color: ${isGradient ? 'transparent' : 'var(--luna-divider-color)'};
          background-image: ${isGradient ? 'var(--luna-divider-gradient)' : 'none'};
        }

        .line.vertical.styled-line {
          background: transparent;
          width: 0;
          border-left: var(--luna-divider-thickness) ${styleLine} var(--luna-divider-color);
        }

        /* hide the second line when label is positioned at start or end */
        ${labelPosition === 'start' ? '.line:last-child { flex: 0; min-width: 0; min-height: 0; }' : ''}
        ${labelPosition === 'end'   ? '.line:first-child { flex: 0; min-width: 0; min-height: 0; }' : ''}

        .label {
          flex-shrink: 0;
          padding: ${vertical ? 'var(--luna-divider-gap) 0' : '0 var(--luna-divider-gap)'};
          font-size: var(--luna-divider-label-size);
          font-weight: 500;
          color: var(--luna-divider-label-color);
          white-space: nowrap;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
      </style>

      <div class="line ${vertical ? 'vertical' : 'horizontal'} ${styleLine !== 'solid' ? 'styled-line' : 'solid-line'}"></div>
      ${hasLabel ? `<span class="label"><slot></slot></span>` : ''}
      ${hasLabel ? `<div class="line ${vertical ? 'vertical' : 'horizontal'} ${styleLine !== 'solid' ? 'styled-line' : 'solid-line'}"></div>` : ''}
    `;
  }
}

customElements.define('luna-divider', LunaDivider);