// lunadom/components/tooltip/tooltip.js

/**
 * @customElement luna-tooltip
 * @slot - The default slot for the tooltip content.
 * 
 * Attributes:
 * @attr open - If present, the tooltip is visible.
 * @attr placement - Position of the tooltip relative to the target ('top', 'bottom', 'left', 'right'). Defaults to 'top'.
 * @attr trigger - How the tooltip is triggered ('hover', 'click'). Defaults to 'hover'.
 * @attr for - The ID of the element the tooltip is for.
 * @attr content - Content for the tooltip (alternative to slot).
 * @attr delay - Delay in milliseconds before the tooltip appears.
 * @attr offset - Offset in pixels from the target.
 * 
 * CSS Custom Properties:
 * @cssprop --luna-tooltip-bg - Background color of the tooltip.
 * @cssprop --luna-tooltip-color - Text color of the tooltip.
 */
class LunaTooltip extends HTMLElement {

  static get observedAttributes() {
    return ['open', 'placement', 'trigger', 'for', 'content', 'delay', 'offset'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this.show      = this.show.bind(this);
    this.hide      = this.hide.bind(this);
    this.toggle    = this.toggle.bind(this);
    this._position = this._position.bind(this);
    this._timer    = null;
  }

  connectedCallback() {
    this.render();
    this.bindTrigger();
    if (this.hasAttribute('open')) {
      this._position();
    }
  }

  disconnectedCallback() {
    const target = this.getTarget();
    if (target) {
      target.removeEventListener('mouseenter', this.show);
      target.removeEventListener('mouseleave', this.hide);
      target.removeEventListener('focus', this.show);
      target.removeEventListener('blur', this.hide);
      target.removeEventListener('click', this.toggle);
    }
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (name === 'open') {
      if (newVal !== null) {
        this._position();
      }
    } else {
      if (name === 'for' || name === 'trigger') {
        this.bindTrigger();
      }
      this.render();
    }
  }

  bindTrigger() {
    const trigger = this.getAttribute('trigger') || 'hover';
    const target  = this.getTarget();

    if (!target) {
      return;
    }

    target.removeEventListener('mouseenter', this.show);
    target.removeEventListener('mouseleave', this.hide);
    target.removeEventListener('focus', this.show);
    target.removeEventListener('blur', this.hide);
    target.removeEventListener('click', this.toggle);

    if (trigger === 'hover') {
      target.addEventListener('mouseenter', this.show);
      target.addEventListener('mouseleave', this.hide);
      target.addEventListener('focus', this.show);
      target.addEventListener('blur', this.hide);
    } else if (trigger === 'click') {
      target.addEventListener('click', this.toggle);
    }
  }

  getTarget() {
    const id = this.getAttribute('for');
    if (id) {
      return document.getElementById(id);
    }
    return this.querySelector('*');
  }

  show() {
    const delay = parseInt(this.getAttribute('delay') || '0');
    clearTimeout(this._timer);
    
    this._timer = setTimeout(() => {
      this.setAttribute('open', '');
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
    this.hasAttribute('open') ? this.hide() : this.show();
  }

  _position() {
    if (!this.hasAttribute('for') || !this.hasAttribute('open')) {
      return;
    }
    
    const target  = this.getTarget();
    const tooltip = this.shadowRoot.querySelector('.tooltip');

    if (!target || !tooltip) {
      return;
    }

    const rect      = target.getBoundingClientRect();
    const placement = this.getAttribute('placement') || 'top';
    const offset    = parseInt(this.getAttribute('offset') || '10');
    
    this.style.position      = 'fixed';
    this.style.zIndex        = '99999';
    this.style.pointerEvents = 'none';

    let top, left;
    switch (placement) {
      case 'top':
        top  = rect.top - offset;
        left = rect.left + rect.width / 2;
        break;
      case 'bottom':
        top  = rect.bottom + offset;
        left = rect.left + rect.width / 2;
        break;
      case 'left':
        top  = rect.top + rect.height / 2;
        left = rect.left - offset;
        break;
      case 'right':
        top  = rect.top + rect.height / 2;
        left = rect.right + offset;
        break;
    }
    this.style.top  = `${top || 0}px`;
    this.style.left = `${left || 0}px`;
  }

  render() {
    const content   = this.getAttribute('content') || '';
    const isForMode = this.hasAttribute('for');

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: ${isForMode ? 'none' : 'inline-flex'};
          vertical-align: middle;
          position: relative;
          font-family: inherit;
        }

        :host([for][open]) {
          display: block;
        }

        .tooltip {
          position: absolute;
          z-index: 1000;
          opacity: 0;
          visibility: hidden;
          background: var(--luna-tooltip-bg, rgba(20, 20, 20, 0.95));
          color: var(--luna-tooltip-color, #eee);
          padding: 0.5rem 0.85rem;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 500;
          line-height: 1.4;
          white-space: nowrap;
          width: max-content;
          pointer-events: none;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        :host([open]) .tooltip {
          opacity: 1;
          visibility: visible;
        }

        /* Default Placement: Top */
        :host(:not([for])) .tooltip {
          bottom: calc(100% + 12px);
          left: 50%;
          transform: translate(-50%, 8px) scale(0.95);
        }
        :host([open]:not([for])) .tooltip {
          transform: translate(-50%, 0) scale(1);
        }

        /* Bottom Placement */
        :host([placement="bottom"]:not([for])) .tooltip {
          top: calc(100% + 12px);
          bottom: auto;
          left: 50%;
          transform: translate(-50%, -8px) scale(0.95);
        }
        :host([open][placement="bottom"]:not([for])) .tooltip {
          transform: translate(-50%, 0) scale(1);
        }

        /* Left Placement */
        :host([placement="left"]:not([for])) .tooltip {
          right: calc(100% + 12px);
          left: auto;
          top: 50%;
          transform: translate(8px, -50%) scale(0.95);
        }
        :host([open][placement="left"]:not([for])) .tooltip {
          transform: translate(0, -50%) scale(1);
        }

        /* Right Placement */
        :host([placement="right"]:not([for])) .tooltip {
          left: calc(100% + 12px);
          right: auto;
          top: 50%;
          transform: translate(-8px, -50%) scale(0.95);
        }
        :host([open][placement="right"]:not([for])) .tooltip {
          transform: translate(0, -50%) scale(1);
        }

        /* Target Mode (for) animations */
        :host([for]) .tooltip {
          position: absolute;
          top: 0;
          left: 0;
        }

        :host([for][placement="top"]) .tooltip { transform: translate(-50%, calc(-100% - 2px)) scale(0.95); }
        :host([open][for][placement="top"]) .tooltip { transform: translate(-50%, -100%) scale(1); }

        :host([for][placement="bottom"]) .tooltip { transform: translate(-50%, -8px) scale(0.95); }
        :host([open][for][placement="bottom"]) .tooltip { transform: translate(-50%, 0%) scale(1); }

        :host([for][placement="left"]) .tooltip { transform: translate(calc(-100% + 8px), -50%) scale(0.95); }
        :host([open][for][placement="left"]) .tooltip { transform: translate(-100%, -50%) scale(1); }

        :host([for][placement="right"]) .tooltip { transform: translate(-8px, -50%) scale(0.95); }
        :host([open][for][placement="right"]) .tooltip { transform: translate(0%, -50%) scale(1); }

        .arrow {
          position: absolute;
          width: 8px;
          height: 8px;
          background: var(--luna-tooltip-bg, rgba(20, 20, 20, 0.95));
          border: 1px solid rgba(255, 255, 255, 0.1);
          transform: rotate(45deg);
          z-index: -1;
        }

        /* Arrow Directions */
        .arrow { bottom: -5px; left: calc(50% - 4px); border-top: none; border-left: none; }
        :host([placement="bottom"]) .arrow { bottom: auto; top: -5px; border-bottom: none; border-right: none; border-top: 1px solid rgba(255, 255, 255, 0.1); border-left: 1px solid rgba(255, 255, 255, 0.1); }
        :host([placement="left"]) .arrow { bottom: auto; left: auto; right: -5px; top: calc(50% - 4px); border-bottom: none; border-left: none; border-top: 1px solid rgba(255, 255, 255, 0.1); border-right: 1px solid rgba(255, 255, 255, 0.1); }
        :host([placement="right"]) .arrow { bottom: auto; left: -4px; top: calc(50% - 4px); border-top: none; border-right: none; border-bottom: 1px solid rgba(255, 255, 255, 0.1); border-left: 1px solid rgba(255, 255, 255, 0.1); }
      </style>

      <slot></slot>
      <div class="tooltip">
        ${content || '<slot name="content"></slot>'}
        <div class="arrow"></div>
      </div>
    `;
  }
}

customElements.define('luna-tooltip', LunaTooltip);