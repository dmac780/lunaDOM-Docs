// lunadom/components/image-comparer/image-comparer.js

/**
 * @customElement luna-image-comparer
 * 
 * @slot before - The image to display on the 'before' side (left or top).
 * @slot after - The image to display on the 'after' side (right or bottom).
 * 
 * Attributes:
 * @attr {boolean} vertical - If present, compares images vertically instead of horizontally.
 * @attr {number} position - The initial percentage position of the slider (0 to 100). Defaults to 50.
 * 
 * CSS Custom Properties:
 * @cssprop --luna-compare-handle-bg - Background color of the slider knob.
 * @cssprop --luna-compare-handle-color - Icon color inside the slider knob.
 * @cssprop --luna-compare-line-color - Color of the divider line.
 * @cssprop --luna-compare-size - Diameter of the slider knob.
 * @cssprop --luna-radius - Border radius applied to the entire component.
 */
class LunaImageComparer extends HTMLElement {

  static get observedAttributes() {
    return ['vertical', 'position'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.onDrag = this.onDrag.bind(this);
    this._isRendered = false;
  }

  connectedCallback() {
    if (!this._isRendered) {
      this.render();
      this._isRendered = true;
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (this._isRendered) {
      if (name === 'vertical') {
        this.render(); // Re-render logic to swap orientations
      }
      if (name === 'position' && newValue !== null) {
        this._updatePosition(newValue);
      }
    }
  }

  _updatePosition(percent) {
    const p = Math.min(100, Math.max(0, parseFloat(percent)));
    this.style.setProperty('--luna-compare-position', `${p}%`);
  }

  onDrag(e) {
    const rect     = this.shadowRoot.querySelector('.container').getBoundingClientRect();
    const vertical = this.hasAttribute('vertical');

    let percent = vertical
      ? ((e.clientY - rect.top) / rect.height) * 100
      : ((e.clientX - rect.left) / rect.width) * 100;

    this._updatePosition(percent);
  }

  render() {
    const vertical   = this.hasAttribute('vertical');
    const initialPos = this.getAttribute('position') || '50';
    
    this._updatePosition(initialPos);

    const icon = vertical ? `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="7 15 12 20 17 15"></polyline>
        <polyline points="7 9 12 4 17 9"></polyline>
      </svg>
    ` : `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 7 20 12 15 17"></polyline>
        <polyline points="9 7 4 12 9 17"></polyline>
      </svg>
    `;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          --luna-compare-handle-bg: #fff;
          --luna-compare-handle-color: #111;
          --luna-compare-line-color: #fff;
          --luna-compare-size: 38px;
          --luna-compare-position: 50%;

          display: block;
          position: relative;
          overflow: hidden;
          user-select: none;
          border-radius: var(--luna-radius, 0.75rem);
          touch-action: none;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }

        .container {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          cursor: ${vertical ? 'row-resize' : 'col-resize'};
          aspect-ratio: 16/9; /* Premium default aspect ratio */
        }

        ::slotted(img) {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          pointer-events: none;
        }

        .after {
          position: absolute;
          inset: 0;
          clip-path: ${
            vertical
              ? 'inset(var(--luna-compare-position) 0 0 0)'
              : 'inset(0 0 0 var(--luna-compare-position))'
          };
        }

        .handle {
          position: absolute;
          z-index: 10;
          pointer-events: none;
          ${vertical ? 'top' : 'left'}: var(--luna-compare-position);
          ${vertical ? 'left:0; right:0;' : 'top:0; bottom:0;'}
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .line {
          background: var(--luna-compare-line-color);
          box-shadow: 0 0 10px rgba(0,0,0,0.3);
          ${vertical ? 'height: 2px; width: 100%;' : 'width: 2px; height: 100%;'}
        }

        .knob {
          position: absolute;
          width: var(--luna-compare-size);
          height: var(--luna-compare-size);
          border-radius: 50%;
          background: var(--luna-compare-handle-bg);
          color: var(--luna-compare-handle-color);
          box-shadow: 0 0 0 4px rgba(255,255,255,0.2), 0 4px 12px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: auto;
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .knob:hover {
          transform: scale(1.1);
          background: #eee;
        }

        .knob:active {
          transform: scale(0.95);
        }

        .label {
          position: absolute;
          padding: 0.5rem 0.75rem;
          background: rgba(0,0,0,0.5);
          color: #fff;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          backdrop-filter: blur(4px);
          border-radius: 0.25rem;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s;
        }

        :host(:hover) .label {
          opacity: 1;
        }

        .label-before { left: 1rem; top: 1rem; }
        .label-after { right: 1rem; top: 1rem; }
      </style>

      <div class="container" id="container">
        <slot name="before"></slot>
        <div class="label label-before">Before</div>
        
        <div class="after">
          <slot name="after"></slot>
          <div class="label label-after">After</div>
        </div>

        <div class="handle">
          <div class="line"></div>
          <div class="knob">
            ${icon}
          </div>
        </div>
      </div>
    `;

    const container = this.shadowRoot.getElementById('container');
    container.addEventListener('pointerdown', e => {
      this.onDrag(e);
      container.setPointerCapture(e.pointerId);
      container.onpointermove = this.onDrag;
      container.onpointerup = () => {
        container.onpointermove = null;
        container.releasePointerCapture(e.pointerId);
      };
    });
  }
}

customElements.define('luna-image-comparer', LunaImageComparer);