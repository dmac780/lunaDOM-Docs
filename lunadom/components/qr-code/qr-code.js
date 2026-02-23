// lunadom/components/qr-code/qr-code.js

/**
 * @customElement luna-qr-code
 * 
 * Attributes:
 * @attr {string} value - The text or URL to encode in the QR code.
 * @attr {number} size - The size of the QR code in pixels. Defaults to 200.
 * @attr {string} fill - The color of the QR code modules. Overrides --luna-qr-color.
 * @attr {string} background - The background color of the QR code. Overrides --luna-qr-bg.
 * @attr {'L' | 'M' | 'Q' | 'H'} ec-level - Error correction level. Defaults to 'M'.
 * @attr {number} radius - The corner radius of the QR code modules (0 to 1). Defaults to 0.
 * @attr {number} padding - Padding in QR modules.
 * 
 * CSS Custom Properties:
 * @cssprop --luna-qr-color - The default color of the QR code modules.
 * @cssprop --luna-qr-bg - The default background color of the QR code.
 * @cssprop --luna-qr-radius - The border radius of the rendered canvas.
 */
class LunaQrCode extends HTMLElement {

  static get observedAttributes() {
    return ['value', 'size', 'fill', 'background', 'ec-level', 'radius', 'padding'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._canvas = document.createElement('canvas');
    this._isRendered = false;
  }

  connectedCallback() {
    if (!this._isRendered) {
      this._setupBase();
      this._isRendered = true;
    }
    this._render();
  }

  attributeChangedCallback() {
    if (this._isRendered) {
      this._render();
    }
  }

  _setupBase() {
    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: inline-block;
        line-height: 0;
        --luna-qr-radius: 0;
        --luna-qr-bg: #fff;
        --luna-qr-color: #000;
      }
      canvas {
        display: block;
        max-width: 100%;
        height: auto;
        border-radius: var(--luna-qr-radius);
      }
    `;
    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(this._canvas);
  }

  async _ensureDependency() {
    if (typeof QrCreator !== 'undefined') return true;

    // Check if we're already loading the script
    if (!window.__lunaQrLoading) {
      window.__lunaQrLoading = new Promise((resolve) => {
        // Double-check in case another component loaded it between checks
        if (typeof QrCreator !== 'undefined') {
          return resolve(true);
        }

        // Check if script is already in the DOM
        const existingScript = document.querySelector('script[src*="qr-creator.min.js"]');
        if (existingScript) {
          existingScript.addEventListener('load', () => resolve(true));
          existingScript.addEventListener('error', () => resolve(false));
          return;
        }

        const script   = document.createElement('script');
        script.src     = '/lunadom/components/qr-code/qr-creator.min.js';
        script.onload  = () => resolve(true);
        script.onerror = () => resolve(false);

        document.head.appendChild(script);
      });
    }

    return window.__lunaQrLoading;
  }

  async _render() {
    const hasDep = await this._ensureDependency();
    if (!hasDep) {
      return;
    }
    
    const value      = this.getAttribute('value') || '';
    const size       = parseInt(this.getAttribute('size') || '200');
    const fill       = this.getAttribute('fill') || getComputedStyle(this).getPropertyValue('--luna-qr-color').trim() || '#000';
    const background = this.getAttribute('background') || getComputedStyle(this).getPropertyValue('--luna-qr-bg').trim() || '#fff';
    const ecLevel    = (this.getAttribute('ec-level') || 'M').toUpperCase();
    const radius     = parseFloat(this.getAttribute('radius') || '0');
    const padding    = parseInt(this.getAttribute('padding') || '0');

    if (!value) {
      // Clear canvas if no value
      this._canvas.width = size;
      this._canvas.height = size;
      return;
    }

    // Render QR
    QrCreator.render({
      text: value,
      ecLevel: ecLevel,
      fill: fill,
      background: background,
      size: size,
      radius: Math.min(0.5, Math.max(0, radius))
    }, this._canvas);

    if (padding > 0) {
      this._applyPadding(size, background, padding);
    }
  }

  _applyPadding(size, background, paddingModules) {
    const ctx = this._canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, size, size);
    
    // Module size estimation logic from example.html
    const rawData = imageData.data;
    let firstDark = -1;
    for (let x = 0; x < size; x++) {
      const i = x * 4;
      if (rawData[i] < 128 || rawData[i + 1] < 128 || rawData[i + 2] < 128) {
        firstDark = x;
        break;
      }
    }
    
    const moduleSize = firstDark >= 0 ? firstDark * 2 : Math.round(size / 25);
    const pad = paddingModules * (moduleSize || Math.round(size / 25));

    // Redraw with padding
    const tmpCanvas  = document.createElement('canvas');
    tmpCanvas.width  = size;
    tmpCanvas.height = size;

    tmpCanvas.getContext('2d').putImageData(imageData, 0, 0);

    const newSize       = size + pad * 2;
    this._canvas.width  = newSize;
    this._canvas.height = newSize;
    
    const newCtx = this._canvas.getContext('2d');
    newCtx.fillStyle = background;
    newCtx.fillRect(0, 0, newSize, newSize);
    newCtx.drawImage(tmpCanvas, pad, pad);
  }
}

customElements.define('luna-qr-code', LunaQrCode);