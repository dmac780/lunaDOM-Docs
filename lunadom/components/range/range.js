// lunadom/components/range/range.js

/**
 * @customElement luna-range
 *
 * Attributes:
 * @attr {number}  min               - Minimum value. Defaults to 0.
 * @attr {number}  max               - Maximum value. Defaults to 100.
 * @attr {number}  step              - Increment step. Defaults to 1.
 * @attr {number}  value             - Current value. Defaults to 0.
 * @attr {boolean} disabled          - Disables the input.
 * @attr {string}  label             - Label displayed above the slider.
 * @attr {string}  help-text         - Help text displayed below the slider.
 * @attr {'top'|'bottom'} tooltip-placement - Tooltip position. Defaults to 'top'.
 * @attr {boolean} no-tooltip        - Hides the value tooltip entirely.
 * @attr {boolean} no-glow           - Disables the progress fill glow/shadow.
 *
 * CSS Custom Properties:
 * @cssprop --luna-range-track           - Track background colour (default: #1a1a1a)
 * @cssprop --luna-range-track-border    - Track border colour (default: #333)
 * @cssprop --luna-range-track-height    - Track height (default: 4px)
 * @cssprop --luna-range-track-active    - Filled progress colour (default: var(--luna-accent, #2563eb))
 * @cssprop --luna-range-glow-color      - Glow / shadow colour for the progress fill.
 *                                         Defaults to a 40%-alpha version of --luna-range-track-active.
 *                                         Set to "transparent" or use `no-glow` to remove entirely.
 * @cssprop --luna-range-thumb-bg        - Thumb background colour (default: #fff)
 * @cssprop --luna-range-thumb-size      - Thumb diameter (default: 18px)
 * @cssprop --luna-range-thumb-ring      - Colour of the thumb focus ring (default: rgba(0,0,0,.3))
 * @cssprop --luna-range-label-color     - Label text colour (default: #ccc)
 * @cssprop --luna-range-label-size      - Label font size (default: 0.875rem)
 * @cssprop --luna-range-helptext-color  - Help text colour (default: #666)
 * @cssprop --luna-range-helptext-size   - Help text font size (default: 0.75rem)
 *
 * Events:
 * @event luna-input  - Emitted continuously while dragging. detail: { value: string }
 * @event luna-change - Emitted when the value is committed. detail: { value: string }
 */
class LunaRange extends HTMLElement {

  static get observedAttributes() {
    return [
      'min', 'max', 'step', 'value',
      'disabled', 'label', 'help-text',
      'tooltip-placement', 'no-tooltip', 'no-glow'
    ];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._isRendered      = false;
    this._handleInput     = this._handleInput.bind(this);
    this.tooltipFormatter = (val) => val;
  }

  connectedCallback() {
    if (!this._isRendered) {
      this._render();
      this._isRendered = true;
    }
    this._updateProgress();
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (!this._isRendered) {
      return;
    }

    if (name === 'value' && oldVal !== newVal) {
      if (this._inputEl) {
        this._inputEl.value = newVal;
      }
      this._updateProgress();
    } else {
      this._render();
    }
  }

  get value() {
    return this._inputEl
      ? this._inputEl.value
      : (this.getAttribute('value') || '0');
  }

  set value(v) {
    this.setAttribute('value', v);

    if (this._inputEl) {
      this._inputEl.value = v;
      this._updateProgress();
    }
  }

  _updateProgress() {
    if (!this._inputEl) {
      return;
    }

    const min     = parseFloat(this.getAttribute('min')  || '0');
    const max     = parseFloat(this.getAttribute('max')  || '100');
    const val     = parseFloat(this._inputEl.value);
    const percent = ((val - min) / (max - min)) * 100;

    this.style.setProperty('--luna-range-progress', `${percent}%`);

    if (this._tooltip) {
      this._tooltip.setAttribute('content', this.tooltipFormatter(val));
      this._updateTooltipPosition(percent);
    }
  }

  _updateTooltipPosition(percent) {
    if (!this._tooltip) {
      return;
    }

    const thumbSize = parseFloat(
      getComputedStyle(this).getPropertyValue('--luna-range-thumb-size') || '18'
    );

    const offset = thumbSize / 2 - (percent / 100) * thumbSize;
    this._tooltip.style.left = `calc(${percent}% + ${offset}px)`;
  }

  _handleInput(e) {
    const val = e.target.value;
    this.setAttribute('value', val);
    this._updateProgress();

    this.dispatchEvent(new CustomEvent('luna-input', {
      bubbles:  true,
      composed: true,
      detail:   { value: val }
    }));

    this.dispatchEvent(new CustomEvent('luna-change', {
      bubbles:  true,
      composed: true,
      detail:   { value: val }
    }));
  }

  _render() {
    const min       = this.getAttribute('min')               || '0';
    const max       = this.getAttribute('max')               || '100';
    const step      = this.getAttribute('step')              || '1';
    const value     = this.getAttribute('value')             || '0';
    const disabled  = this.hasAttribute('disabled');
    const label     = this.getAttribute('label');
    const helpText  = this.getAttribute('help-text');
    const noTooltip = this.hasAttribute('no-tooltip');
    const noGlow    = this.hasAttribute('no-glow');
    const placement = this.getAttribute('tooltip-placement') || 'top';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: inherit;
          width: 100%;

          --luna-range-track:          #1a1a1a;
          --luna-range-track-border:   #333;
          --luna-range-track-height:   4px;
          --luna-range-track-active:   var(--luna-accent, #2563eb);
          --luna-range-glow-color:     color-mix(in srgb, var(--luna-range-track-active) 40%, transparent);
          --luna-range-thumb-bg:       #fff;
          --luna-range-thumb-size:     18px;
          --luna-range-thumb-ring:     rgba(0, 0, 0, 0.3);
          --luna-range-label-color:    #ccc;
          --luna-range-label-size:     0.875rem;
          --luna-range-helptext-color: #666;
          --luna-range-helptext-size:  0.75rem;
          --luna-range-progress:       0%;
        }

        .container {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .label {
          font-size: var(--luna-range-label-size);
          font-weight: 600;
          color: var(--luna-range-label-color);
        }

        .help-text {
          font-size: var(--luna-range-helptext-size);
          color: var(--luna-range-helptext-color);
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
          position: relative;
        }

        input[type="range"]:disabled {
          cursor: not-allowed;
          opacity: 0.4;
        }

        input[type="range"]:focus {
          outline: none;
        }

        input[type="range"]::-webkit-slider-runnable-track {
          width: 100%;
          height: var(--luna-range-track-height);
          background: var(--luna-range-track);
          border-radius: 999px;
          border: 1px solid var(--luna-range-track-border);
        }

        input[type="range"]::-moz-range-track {
          width: 100%;
          height: var(--luna-range-track-height);
          background: var(--luna-range-track);
          border-radius: 999px;
          border: 1px solid var(--luna-range-track-border);
        }

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
          z-index: 1;
          box-shadow: ${noGlow ? 'none' : '0 0 10px var(--luna-range-glow-color)'};
          transition: width 0.05s linear;
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: var(--luna-range-thumb-size);
          width: var(--luna-range-thumb-size);
          border-radius: 50%;
          background: var(--luna-range-thumb-bg);
          border: none;
          box-shadow:
            0 0 0 4px var(--luna-range-thumb-ring),
            0 2px 4px rgba(0, 0, 0, 0.5);
          margin-top: calc(
            (var(--luna-range-track-height) / 2) -
            (var(--luna-range-thumb-size) / 2) + 1px
          );
          transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: grab;
          position: relative;
          z-index: 3;
        }

        input[type="range"]::-moz-range-thumb {
          height: var(--luna-range-thumb-size);
          width: var(--luna-range-thumb-size);
          border-radius: 50%;
          background: var(--luna-range-thumb-bg);
          border: none;
          box-shadow:
            0 0 0 4px var(--luna-range-thumb-ring),
            0 2px 4px rgba(0, 0, 0, 0.5);
          cursor: grab;
        }

        input[type="range"]:active::-webkit-slider-thumb {
          transform: scale(1.25);
          cursor: grabbing;
        }

        input[type="range"]:active::-moz-range-thumb {
          transform: scale(1.25);
          cursor: grabbing;
        }

        luna-tooltip {
          position: absolute;
          top: -20px;
          pointer-events: none;
          transform: translateX(-50%);
          --luna-tooltip-bg: #222;
          --luna-tooltip-radius: 6px;
        }
      </style>

      <div class="container">
        ${label ? `<span class="label">${label}</span>` : ''}

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

        ${helpText ? `<span class="help-text">${helpText}</span>` : ''}
      </div>
    `;

    this._inputEl = this.shadowRoot.querySelector('input');
    this._tooltip = this.shadowRoot.getElementById('tooltip');

    this._inputEl.addEventListener('input', this._handleInput);

    if (this._tooltip) {
      this._inputEl.addEventListener('mouseenter', () => this._tooltip.show());
      this._inputEl.addEventListener('mouseleave', () => this._tooltip.hide());
      this._inputEl.addEventListener('mousedown',  () => this._tooltip.show());
      this._inputEl.addEventListener('mouseup',    () => this._tooltip.hide());
      this._inputEl.addEventListener('touchstart', () => this._tooltip.show(), { passive: true });
      this._inputEl.addEventListener('touchend',   () => this._tooltip.hide());
    }

    this._updateProgress();
  }
}

customElements.define('luna-range', LunaRange);