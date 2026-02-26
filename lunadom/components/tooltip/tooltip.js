// lunadom/components/tooltip/tooltip.js

/**
 * @customElement luna-tooltip
 *
 * @slot         - The trigger element (when not using the `for` attribute).
 * @slot content - Rich HTML content for the tooltip body.
 *
 * Attributes:
 * @attr {string}  content   - Plain-text tooltip content (alternative to slot).
 * @attr {string}  for       - ID of an external element to attach the tooltip to.
 * @attr {'top'|'bottom'|'left'|'right'} placement - Where to show the tooltip. Default: 'top'.
 * @attr {'hover'|'click'}  trigger   - How the tooltip is triggered. Default: 'hover'.
 * @attr {number}  delay     - Delay in ms before showing. Default: 0.
 * @attr {number}  offset    - Distance in px from the target. Default: 10.
 * @attr {boolean} open      - Present when the tooltip is visible.
 *
 * CSS Custom Properties:
 * @cssprop --luna-tooltip-bg      - Background colour. Default: rgba(20,20,20,0.95).
 * @cssprop --luna-tooltip-color   - Text colour. Default: #eee.
 * @cssprop --luna-tooltip-radius  - Border radius. Default: 7px.
 * @cssprop --luna-tooltip-size    - Font size. Default: 0.75rem.
 * @cssprop --luna-tooltip-padding - Inner padding. Default: 0.4rem 0.8rem.
 */
class LunaTooltip extends HTMLElement {

  static get observedAttributes() {
    return ['open', 'placement', 'trigger', 'for', 'content', 'delay', 'offset'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._timer = null;
    this.show   = this.show.bind(this);
    this.hide   = this.hide.bind(this);
    this.toggle = this.toggle.bind(this);
  }

  connectedCallback() {
    this._render();
    this._bindTrigger();
    if (this.hasAttribute('open')) {
      this._position();
    }
  }

  disconnectedCallback() {
    this._removeTrigger();
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal === newVal) {
      return;
    }
    if (name === 'open') {
      this._updateVisibility();
      if (newVal !== null) {
        this._position();
      }
      return;
    }
    if (name === 'for' || name === 'trigger') {
      this._removeTrigger();
      this._bindTrigger();
    }
    this._render();
  }

  show() {
    const delay = parseInt(this.getAttribute('delay') || '0', 10);
    clearTimeout(this._timer);
    this._timer = setTimeout(() => {
      this.setAttribute('open', '');
      requestAnimationFrame(() => {
        this._positionSideTooltip();
      });
    }, delay);
  }

  hide() {
    clearTimeout(this._timer);
    this.removeAttribute('open');
  }

  toggle(e) {
    if (e) {
      e.stopPropagation();
    }
    if (this.hasAttribute('open')) {
      this.hide();
    } else {
      this.show();
    }
  }

  _getTarget() {
    const id = this.getAttribute('for');
    if (id) {
      return document.getElementById(id);
    }
    return this.querySelector('*');
  }

  _removeTrigger() {
    const target = this._triggerTarget;
    if (target) {
      target.removeEventListener('mouseenter', this.show);
      target.removeEventListener('mouseleave', this.hide);
      target.removeEventListener('focus',      this.show);
      target.removeEventListener('blur',       this.hide);
      target.removeEventListener('click',      this.toggle);
    }
    this._triggerTarget = null;
  }

  _bindTrigger() {
    const target  = this._getTarget();
    const trigger = this.getAttribute('trigger') || 'hover';

    if (!target) {
      return;
    }

    this._triggerTarget = target;

    if (trigger === 'hover') {
      target.addEventListener('mouseenter', this.show);
      target.addEventListener('mouseleave', this.hide);
      target.addEventListener('focus',      this.show);
      target.addEventListener('blur',       this.hide);
    } else if (trigger === 'click') {
      target.addEventListener('click', this.toggle);
    }
  }

  _updateVisibility() {
    const tip = this.shadowRoot.querySelector('.tooltip');
    if (!tip) {
      return;
    }
    if (this.hasAttribute('open')) {
      tip.classList.add('visible');
      this._positionSideTooltip();
    } else {
      tip.classList.remove('visible');
    }
  }

  _positionSideTooltip() {
    const placement = this.getAttribute('placement') || 'top';
    if (placement !== 'left' && placement !== 'right') {
      return;
    }

    const target = this._getTarget();
    const tip    = this.shadowRoot.querySelector('.tooltip');
    if (!target || !tip) {
      return;
    }

    const targetRect = target.getBoundingClientRect();
    const hostRect   = this.getBoundingClientRect();
    const tipH       = tip.offsetHeight;
    const targetMidY = targetRect.top + targetRect.height / 2;
    const hostTop    = hostRect.top;
    const offset     = targetMidY - hostTop - tipH / 2;

    tip.style.top = `${offset}px`;
  }

  _position() {
    if (!this.hasAttribute('for') || !this.hasAttribute('open')) {
      return;
    }

    const target = this._getTarget();
    const tip    = this.shadowRoot.querySelector('.tooltip');

    if (!target || !tip) {
      return;
    }

    const rect      = target.getBoundingClientRect();
    const placement = this.getAttribute('placement') || 'top';
    const offset    = parseInt(this.getAttribute('offset') || '10', 10);

    this.style.position      = 'fixed';
    this.style.zIndex        = '99999';
    this.style.pointerEvents = 'none';

    let top, left;

    if (placement === 'bottom') {
      top  = rect.bottom + offset;
      left = rect.left + rect.width / 2;
    } else if (placement === 'left') {
      top  = rect.top + rect.height / 2;
      left = rect.left - offset;
    } else if (placement === 'right') {
      top  = rect.top + rect.height / 2;
      left = rect.right + offset;
    } else {
      top  = rect.top - offset;
      left = rect.left + rect.width / 2;
    }

    this.style.top  = `${top}px`;
    this.style.left = `${left}px`;
  }

  _render() {
    const content   = this.getAttribute('content') || '';
    const placement = this.getAttribute('placement') || 'top';
    const isForMode = this.hasAttribute('for');
    const isOpen    = this.hasAttribute('open');

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: ${isForMode ? 'none' : 'inline-block'};
          vertical-align: middle;
          position: relative;
          font-family: inherit;
        }

        :host([for][open]) {
          display: block;
        }

        .tooltip {
          position: absolute;
          z-index: 9999;
          display: inline-block;
          background: var(--luna-tooltip-bg, rgba(20, 20, 20, 0.95));
          color: var(--luna-tooltip-color, #eee);
          padding: var(--luna-tooltip-padding, 0.4rem 0.8rem);
          border-radius: var(--luna-tooltip-radius, 7px);
          font-size: var(--luna-tooltip-size, 0.75rem);
          font-weight: 500;
          line-height: 1.4;
          white-space: nowrap;
          pointer-events: none;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.15s ease, transform 0.15s ease, visibility 0.15s;
        }

        .tooltip::before {
          content: '';
          position: absolute;
          width: 8px;
          height: 8px;
          background: var(--luna-tooltip-bg, rgba(20, 20, 20, 0.95));
          border: 1px solid rgba(255, 255, 255, 0.08);
          transform: rotate(45deg);
          z-index: -1;
        }

        :host(:not([placement])) .tooltip::before,
        :host([placement="top"]) .tooltip::before {
          bottom: -5px;
          left: 50%;
          margin-left: -4px;
          border-top: none;
          border-left: none;
        }

        :host([placement="bottom"]) .tooltip::before {
          top: -5px;
          left: 50%;
          margin-left: -4px;
          border-bottom: none;
          border-right: none;
        }

        :host([placement="left"]) .tooltip::before {
          right: -5px;
          top: 50%;
          margin-top: -4px;
          border-left: none;
          border-bottom: none;
        }

        :host([placement="right"]) .tooltip::before {
          left: -5px;
          top: 50%;
          margin-top: -4px;
          border-right: none;
          border-top: none;
        }

        .tooltip.visible {
          opacity: 1;
          visibility: visible;
        }

        :host(:not([for]):not([placement])) .tooltip,
        :host(:not([for])[placement="top"]) .tooltip {
          bottom: calc(100% + 10px);
          left: 50%;
          transform: translateX(-50%) translateY(4px);
        }
        :host(:not([for]):not([placement])) .tooltip.visible,
        :host(:not([for])[placement="top"]) .tooltip.visible {
          transform: translateX(-50%) translateY(0);
        }

        :host(:not([for])[placement="bottom"]) .tooltip {
          top: calc(100% + 10px);
          left: 50%;
          transform: translateX(-50%) translateY(-4px);
        }
        :host(:not([for])[placement="bottom"]) .tooltip.visible {
          transform: translateX(-50%) translateY(0);
        }

        :host(:not([for])[placement="left"]) .tooltip {
          right: calc(100% + 10px);
          top: 0;
          transform: translateX(4px);
        }
        :host(:not([for])[placement="left"]) .tooltip.visible {
          transform: translateX(0);
        }

        :host(:not([for])[placement="right"]) .tooltip {
          left: calc(100% + 10px);
          top: 0;
          transform: translateX(-4px);
        }
        :host(:not([for])[placement="right"]) .tooltip.visible {
          transform: translateX(0);
        }

        :host([for]) .tooltip {
          position: absolute;
          top: 0;
          left: 0;
        }
        :host([for][placement="top"]) .tooltip,
        :host([for]:not([placement])) .tooltip {
          transform: translate(-50%, calc(-100% - 2px)) scale(0.95);
        }
        :host([for][placement="top"]) .tooltip.visible,
        :host([for]:not([placement])) .tooltip.visible {
          transform: translate(-50%, -100%) scale(1);
        }
        :host([for][placement="bottom"]) .tooltip {
          transform: translate(-50%, 2px) scale(0.95);
        }
        :host([for][placement="bottom"]) .tooltip.visible {
          transform: translate(-50%, 0) scale(1);
        }
        :host([for][placement="left"]) .tooltip {
          transform: translate(calc(-100% + 4px), -50%) scale(0.95);
        }
        :host([for][placement="left"]) .tooltip.visible {
          transform: translate(-100%, -50%) scale(1);
        }
        :host([for][placement="right"]) .tooltip {
          transform: translate(-4px, -50%) scale(0.95);
        }
        :host([for][placement="right"]) .tooltip.visible {
          transform: translate(0, -50%) scale(1);
        }
      </style>

      <slot></slot>
      <div class="tooltip ${isOpen ? 'visible' : ''}" part="tooltip">
        ${content || '<slot name="content"></slot>'}
      </div>
    `;
  }
}

customElements.define('luna-tooltip', LunaTooltip);