// lunadom/components/range/range.js

/**
 * @customElement luna-range
 * 
 * Attributes:
 * @attr {number} min - The minimum value. Defaults to 0.
 * @attr {number} max - The maximum value. Defaults to 100.
 * @attr {number} step - The increment step value. Defaults to 1.
 * @attr {number} value - The current value. Defaults to 0.
 * @attr {boolean} disabled - Whether the range input is disabled.
 * @attr {string} label - Label text to display above the range.
 * @attr {string} help-text - Help text to display below the range.
 * @attr {'top' | 'bottom'} tooltip-placement - Where to place the value tooltip. Defaults to 'top'.
 * @attr {boolean} no-tooltip - If present, disables the value tooltip.
 * 
 * CSS Custom Properties:
 * @cssprop --luna-range-track - Background color of the slider track.
 * @cssprop --luna-range-track-active - Background color of the filled progress portion.
 * @cssprop --luna-range-track-active-alpha - Shadow color of the active progress (alpha).
 * @cssprop --luna-range-thumb-bg - Background color of the slider thumb.
 * @cssprop --luna-range-thumb-size - Size (width/height) of the slider thumb.
 * @cssprop --luna-range-track-height - Height of the slider track.
 * 
 * Events:
 * @event luna-input - Emitted when the value changes during interaction.
 * @event luna-change - Emitted when the value changes.
 */
class LunaRange extends HTMLElement {

  static get observedAttributes() {
    return [
      'min',
      'max',
      'step',
      'value',
      'disabled',
      'label',
      'help-text',
      'tooltip-placement',
      'no-tooltip'
    ];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._isRendered = false;
    this._handleInput = this._handleInput.bind(this);
    this.tooltipFormatter = (val) => val;
  }

  connectedCallback() {
    if (!this._isRendered) {
      this.render();
      this._isRendered = true;
    }
    this._updateProgress();
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (!this._isRendered) {
      return;
    }

    if (name === 'value' && oldVal !== newVal) {
      if (this.inputEl) {
        this.inputEl.value = newVal;
      }
      this._updateProgress();
    } else {
      this.render();
    }
  }

  get value() {
    return this.inputEl ? this.inputEl.value : (this.getAttribute('value') || '0');
  }

  set value(v) {
    this.setAttribute('value', v);
    if (this.inputEl) {
      this.inputEl.value = v;
      this._updateProgress();
    }
  }

  _handleInput(e) {
    const val = e.target.value;
    this.setAttribute('value', val);
    this._updateProgress();
    
    this.dispatchEvent(new CustomEvent('luna-input', {
      bubbles: true,
      composed: true,
      detail: { value: val }
    }));

    this.dispatchEvent(new CustomEvent('luna-change', {
      bubbles: true,
      composed: true,
      detail: { value: val }
    }));
  }

  _updateProgress() {
    if (!this.inputEl) {
      return;
    }

    const min     = parseFloat(this.getAttribute('min') || '0');
    const max     = parseFloat(this.getAttribute('max') || '100');
    const val     = parseFloat(this.inputEl.value);
    const percent = ((val - min) / (max - min)) * 100;
    
    this.style.setProperty('--luna-range-progress', `${percent}%`);
    
    if (this.tooltip) {
      this.tooltip.setAttribute('content', this.tooltipFormatter(val));
      this._updateTooltipPosition(percent);
    }
  }

  _updateTooltipPosition(percent) {
    if (!this.tooltip) {
      return;
    }

    // The tooltip's left position should match the thumb center
    // This is janky as fuck fix this shit haha wtf is 16 and 0.32??
    this.tooltip.style.left = `calc(${percent}% + (${16 - percent * 0.32}px))`;
  }

  render() {
    const min       = this.getAttribute('min') || '0';
    const max       = this.getAttribute('max') || '100';
    const step      = this.getAttribute('step') || '1';
    const value     = this.getAttribute('value') || '0';
    const disabled  = this.hasAttribute('disabled');
    const label     = this.getAttribute('label');
    const helpText  = this.getAttribute('help-text');
    const noTooltip = this.hasAttribute('no-tooltip');
    const placement = this.getAttribute('tooltip-placement') || 'top';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          --luna-range-track: #1a1a1a;
          --luna-range-track-active: var(--luna-accent, #2563eb);
          --luna-range-thumb-bg: #fff;
          --luna-range-thumb-size: 18px;
          --luna-range-track-height: 4px;
          --luna-range-progress: 0%;

          display: block;
          font-family: inherit;
          width: 100%;
        }

        .container {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #fff;
        }

        .help-text {
          font-size: 0.75rem;
          color: #888;
        }

        .slider-wrapper {
          position: relative;
          width: 100%;
          display: flex;
          align-items: center;
          height: 32px;
        }

        input[type="range"] {
          -webkit-appearance: none;
          width: 100%;
          background: transparent;
          margin: 0;
          cursor: pointer;
          z-index: 2;
        }

        input[type="range"]:disabled {
          cursor: not-allowed;
          opacity: 0.4;
        }

        /* Webkit Track */
        input[type="range"]::-webkit-slider-runnable-track {
          width: 100%;
          height: var(--luna-range-track-height);
          background: var(--luna-range-track);
          border-radius: 999px;
          border: 1px solid #333;
        }

        /* Progress Fill Mask (Simulated) */
        .progress-fill {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          height: var(--luna-range-track-height);
          background: var(--luna-range-track-active);
          width: var(--luna-range-progress);
          border-radius: 999px;
          pointer-events: none;
          box-shadow: 0 0 10px var(--luna-range-track-active-alpha, rgba(37, 99, 235, 0.4));
          z-index: 1;
        }

        /* Webkit Thumb */
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: var(--luna-range-thumb-size);
          width: var(--luna-range-thumb-size);
          border-radius: 50%;
          background: var(--luna-range-thumb-bg);
          border: none;
          box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.3), 
                      0 2px 4px rgba(0, 0, 0, 0.5);
          margin-top: calc((var(--luna-range-track-height) / 2) - (var(--luna-range-thumb-size) / 2) + 1px);
          transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: grab;
        }

        input[type="range"]:active::-webkit-slider-thumb {
          transform: scale(1.25);
          cursor: grabbing;
        }

        input[type="range"]:focus { outline: none; }

        luna-tooltip {
          position: absolute;
          top: -20px;
          pointer-events: none;
          --luna-tooltip-bg: #222;
          --luna-tooltip-radius: 6px;
        }
      </style>

      <div class="container">
        ${label ? `<label class="label">${label}</label>` : ''}
        
        <div class="slider-wrapper">
          <div class="progress-fill"></div>
          ${!noTooltip ? `
            <luna-tooltip id="tooltip" placement="${placement}" trigger="manual">
              <div slot="content"></div>
            </luna-tooltip>
          ` : ''}
          
          <input 
            type="range" 
            min="${min}" 
            max="${max}" 
            step="${step}" 
            value="${value}"
            ${disabled ? 'disabled' : ''}
          />
        </div>

        ${helpText ? `<div class="help-text">${helpText}</div>` : ''}
      </div>
    `;

    this.inputEl = this.shadowRoot.querySelector('input');
    this.tooltip = this.shadowRoot.getElementById('tooltip');

    this.inputEl.addEventListener('input', this._handleInput);
    
    if (this.tooltip) {
      this.inputEl.addEventListener('mousedown', () => this.tooltip.show());
      this.inputEl.addEventListener('touchstart', () => this.tooltip.show());
      this.inputEl.addEventListener('mouseup', () => this.tooltip.hide());
      this.inputEl.addEventListener('touchend', () => this.tooltip.hide());
      this.inputEl.addEventListener('mouseenter', () => this.tooltip.show());
      this.inputEl.addEventListener('mouseleave', () => this.tooltip.hide());
    }

    this._updateProgress();
  }
}

customElements.define('luna-range', LunaRange);