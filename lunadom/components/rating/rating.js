// lunadom/components/rating/rating.js

/**
 * @customElement luna-rating
 * 
 * Attributes:
 * @attr {number} value - The current rating value. Defaults to 0.
 * @attr {number} max - The total number of stars. Defaults to 5.
 * @attr {number} precision - The step precision (e.g., 0.5 for half-stars). Defaults to 1.
 * @attr {boolean} readonly - Whether the rating is read-only.
 * @attr {boolean} disabled - Whether the rating is disabled.
 * @attr {'sm' | 'md' | 'lg'} size - The size of the stars. Defaults to 'md'.
 * @attr {string} label - A label to display above the stars.
 * 
 * CSS Custom Properties:
 * @cssprop --star-active - Color of the filled stars.
 * @cssprop --star-empty - Color of the empty stars.
 * @cssprop --size - Overrides the star size.
 * @cssprop --luna-color - Color of the optional label.
 * 
 * Events:
 * @event luna-change - Emitted when the rating value changes.
 */
class LunaRating extends HTMLElement {

  static formAssociated = true;

  static get observedAttributes() {
    return ['value', 'max', 'precision', 'readonly', 'disabled', 'size', 'label'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._internals  = this.attachInternals();
    this._hoverValue = null;
    this._isRendered = false;
    this._uid        = Math.random().toString(36).substring(2, 9);
  }

  connectedCallback() {
    if (!this._isRendered) {
      this._setup();
      this._isRendered = true;
    }
    this._render();
  }

  attributeChangedCallback(oldVal, newVal) {
    if (this._isRendered && oldVal !== newVal) {
      this._render();
    }
  }

  get value() {
    return parseFloat(this.getAttribute('value')) || 0;
  }

  set value(val) {
    this.setAttribute('value', val);
    this._internals.setFormValue(val);
    this._render();
  }

  _setup() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          font-family: inherit;
          --star-active: #facc15;
          --star-empty: #d1d5db;
          --size: 1.75rem;
          user-select: none;
        }
        
        label {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--luna-color, #111);
        }

        .stars-container {
          display: flex;
          gap: 0.25rem;
          cursor: pointer;
        }

        :host([readonly]) .stars-container,
        :host([disabled]) .stars-container {
          cursor: default;
        }

        .star-box {
          position: relative;
          width: var(--size);
          height: var(--size);
          flex-shrink: 0;
        }

        :host([size="sm"]) { --size: 1.25rem; }
        :host([size="md"]) { --size: 1.75rem; }
        :host([size="lg"]) { --size: 2.25rem; }

        svg {
          width: 100%;
          height: 100%;
          display: block;
          position: absolute;
          top: 0;
          left: 0;
        }

        .star-bg { fill: var(--star-empty); }
        .star-fill { fill: var(--star-active); }

        .fill-layer {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          overflow: hidden;
          width: 0%;
          pointer-events: none;
        }

        .fill-layer svg {
          width: var(--size);
          height: var(--size);
        }

        :host([disabled]) { opacity: 0.5; }
      </style>
      <div id="label-container"></div>
      <div class="stars-container" id="container"></div>
    `;

    this._container      = this.shadowRoot.getElementById('container');
    this._labelContainer = this.shadowRoot.getElementById('label-container');

    this._container.addEventListener('click', (e) => this._handleClick(e));
    this._container.addEventListener('mousemove', (e) => this._handleMouseMove(e));
    this._container.addEventListener('mouseleave', () => this._handleMouseLeave());
  }

  _render() {
    if (!this._isRendered) {
      return;
    }

    const max   = Number(this.getAttribute('max')) || 5;
    const label = this.getAttribute('label');
    const value = this._hoverValue !== null ? this._hoverValue : this.value;

    // Update Label
    this._labelContainer.innerHTML = label ? `<label>${label}</label>` : '';

    // Update Stars (only if max changed, otherwise just update widths)
    if (this._container.children.length !== max) {
      this._container.innerHTML = Array.from({ length: max }, (_, i) => `
        <div class="star-box" data-index="${i + 1}">
          <svg viewBox="0 0 24 24"><path class="star-bg" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          <div class="fill-layer" id="fill-${i}">
            <svg viewBox="0 0 24 24"><path class="star-fill" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          </div>
        </div>
      `).join('');
    }

    // Update widths
    const starBoxes = this._container.querySelectorAll('.star-box');
    starBoxes.forEach((box, i) => {
      const fillLayer = box.querySelector('.fill-layer');
      const starIndex = i + 1;
      let percent = 0;
      
      if (value >= starIndex) {
        percent = 100;
      } else if (value > starIndex - 1) {
        percent = (value - (starIndex - 1)) * 100;
      }
      
      fillLayer.style.width = `${percent}%`;
    });
  }

  _handleClick(e) {
    if (this.hasAttribute('disabled') || this.hasAttribute('readonly')) {
      return;
    }

    const val = this._getValueFromEvent(e);
    if (val !== null) {
      this.value = val;
      this.dispatchEvent(new CustomEvent('luna-change', {
        bubbles: true,
        composed: true,
        detail: { value: val }
      }));
    }
  }

  _handleMouseMove(e) {
    if (this.hasAttribute('disabled') || this.hasAttribute('readonly')) {
      return;
    }
    
    const val = this._getValueFromEvent(e);
    if (val !== this._hoverValue) {
      this._hoverValue = val;
      this._render();
    }
  }

  _handleMouseLeave() {
    this._hoverValue = null;
    this._render();
  }

  _getValueFromEvent(e) {
    const starBox = e.target.closest('.star-box');
    if (!starBox) {
      return null;
    }
    
    const index     = parseInt(starBox.dataset.index);
    const rect      = starBox.getBoundingClientRect();
    const x         = e.clientX - rect.left;
    const width     = rect.width;
    const precision = parseFloat(this.getAttribute('precision')) || 1;

    let fraction = x / width;
    let val      = (index - 1) + fraction;
    
    // Snap to precision
    // TODO snapping functionality isn't working at all.
    val = Math.ceil(val / (precision || 1)) * (precision || 1);
    
    const max = Number(this.getAttribute('max')) || 5;
    return Math.min(max, Math.max(0, val));
  }
}

customElements.define('luna-rating', LunaRating);