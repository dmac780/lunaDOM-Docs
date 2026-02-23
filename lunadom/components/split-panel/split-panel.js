// lunadom/components/split-panel/split-panel.js

/**
 * @customElement luna-split-panel
 * 
 * @slot start - The content of the first (top or left) panel.
 * @slot end - The content of the second (bottom or right) panel.
 * @slot bottom - Alias for the 'end' slot.
 * @slot divider - Optional custom content to display within the divider.
 * 
 * Attributes:
 * @attr {string} position - The split position (e.g., '50%', '200px'). Defaults to '50%'.
 * @attr {boolean} vertical - If present, splits the panel vertically instead of horizontally.
 * @attr {'start' | 'end'} primary - Which panel should have a fixed size while the other expands.
 * @attr {string} snap - A space-separated list of values to snap to (e.g., '50% 200px').
 * @attr {number} snap-threshold - The distance in pixels at which snapping occurs. Defaults to 12.
 * @attr {boolean} disabled - Whether resizing is disabled.
 * @attr {string} overflow - The overflow style for the panels. Defaults to 'hidden'.
 * 
 * CSS Custom Properties:
 * @cssprop --divider-width - The width (or height if vertical) of the divider line.
 * @cssprop --divider-hit-area - The invisible area around the divider that triggers resizing.
 * @cssprop --divider-color - The color of the divider line.
 * @cssprop --divider-color-active - The color of the divider when hovered or dragging.
 * @cssprop --handle-size - The length of the handles in the divider center.
 * @cssprop --handle-color - The color of the dots in the divider handles.
 * 
 * Events:
 * @event luna-reposition - Emitted when the split position is changed via dragging.
 */
class LunaSplitPanel extends HTMLElement {
  
  static get observedAttributes() {
    return ['position', 'vertical', 'primary', 'snap', 'snap-threshold', 'disabled', 'overflow'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._isDragging = false;
    this._position = 50;
    this._isVertical = false;
    this._snapThreshold = 12;
    this._primary = null;
    this._isPositionPercent = true;
  }

  connectedCallback() {
    this.render();
    this._setupDragging();
    this._updatePositionFromAttr();
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal === newVal) {
      return;
    }
    
    if (name === 'position') {
      this._updatePositionFromAttr();
    } else if (name === 'vertical') {
      this._isVertical = this.hasAttribute('vertical');
      this.render();
    } else if (name === 'primary') {
      this._primary = newVal;
      this.render();
    } else if (name === 'snap-threshold') {
      this._snapThreshold = parseInt(newVal) || 12;
    } else if (name === 'overflow') {
      this.render();
    }
    
    this._applyPosition();
  }

  _updatePositionFromAttr() {
    const attr = this.getAttribute('position') || '50%';
    if (attr.includes('%')) {
      this._position = parseFloat(attr);
      this._isPositionPercent = true;
    } else {
      this._position = parseFloat(attr);
      this._isPositionPercent = false;
    }
    this._applyPosition();
  }

  _applyPosition() {
    if (!this._startPanel || !this._endPanel) {
      return;
    }
    
    const prop    = this._isVertical ? 'height' : 'width';
    const minProp = this._isVertical ? 'minHeight' : 'minWidth';
    const maxProp = this._isVertical ? 'maxHeight' : 'maxWidth';
    const value   = this._isPositionPercent ? `${this._position}%` : `${this._position}px`;

    // RESET STYLES
    this._startPanel.style.removeProperty('width');
    this._startPanel.style.removeProperty('height');
    this._startPanel.style.removeProperty('min-width');
    this._startPanel.style.removeProperty('min-height');
    this._startPanel.style.removeProperty('max-width');
    this._startPanel.style.removeProperty('max-height');
    this._endPanel.style.removeProperty('width');
    this._endPanel.style.removeProperty('height');
    this._endPanel.style.removeProperty('min-width');
    this._endPanel.style.removeProperty('min-height');
    this._endPanel.style.removeProperty('max-width');
    this._endPanel.style.removeProperty('max-height');

    const minSize = '50px';

    if (this._primary === 'end') {

      this._startPanel.style.flex = '1 1 0';
      this._startPanel.style[minProp] = minSize;
      this._endPanel.style.flex   = '0 1 auto';
      this._endPanel.style[prop]  = value;
      this._endPanel.style[minProp] = minSize;
      this._endPanel.style[maxProp] = `calc(100% - ${minSize})`;

    } else if (this._primary === 'start') {

      this._startPanel.style.flex  = '0 1 auto';
      this._startPanel.style[prop] = value;
      this._startPanel.style[minProp] = minSize;
      this._startPanel.style[maxProp] = `calc(100% - ${minSize})`;
      this._endPanel.style.flex    = '1 1 0';
      this._endPanel.style[minProp] = minSize;

    } else {

      this._startPanel.style.flex = `0 1 ${value}`;
      this._startPanel.style[minProp] = minSize;
      this._startPanel.style[maxProp] = `calc(100% - ${minSize})`;
      this._endPanel.style.flex   = '1 1 0';
      this._endPanel.style[minProp] = minSize;

    }
  }

  _setupDragging() {
    const divider = this.shadowRoot.getElementById('divider');
    
    const onMouseDown = (e) => {
      if (this.hasAttribute('disabled')) {
        return;
      }
      
      this._isDragging = true;
      divider.classList.add('dragging');
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      document.body.style.cursor = this._isVertical ? 'row-resize' : 'col-resize';
      e.preventDefault();
    };

    const onMouseMove = (e) => {
      if (!this._isDragging) {
        return;
      }
      
      const rect = this.getBoundingClientRect();
      let pos;
      let total;

      if (this._isVertical) {
        pos = e.clientY - rect.top;
        total = rect.height;
      } else {
        pos = e.clientX - rect.left;
        total = rect.width;
      }

      // If primary is 'end', the position should be measured from the end
      if (this._primary === 'end') {
        pos = total - pos;
      }

      // Snapping logic
      pos = this._handleSnapping(pos, total);

      // Clamp position
      pos = Math.max(0, Math.min(pos, total));

      if (this._isPositionPercent) {
        this._position = (pos / total) * 100;
        this.setAttribute('position', `${this._position.toFixed(2)}%`);
      } else {
        this._position = pos;
        this.setAttribute('position', `${Math.round(this._position)}px`);
      }

      this._applyPosition();
      
      this.dispatchEvent(new CustomEvent('luna-reposition', {
        detail: { position: this.getAttribute('position'), value: this._position }
      }));
    };

    const onMouseUp = () => {
      this._isDragging = false;
      divider.classList.remove('dragging');
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
    };

    divider.addEventListener('mousedown', onMouseDown);
  }

  _handleSnapping(pos, total) {
    const snapAttr = this.getAttribute('snap');
    if (!snapAttr) {
      return pos;
    }
    
    let snapStr = snapAttr.replace(/repeat\((\d+),\s*([^\)]+)\)/g, (match, count, value) => {
      return Array(parseInt(count)).fill(value).join(' ');
    });

    const snaps = snapStr.split(/\s+/).filter(Boolean).map(s => {
      if (s.includes('%')) {
        return (parseFloat(s) / 100) * total;
      }

      if (s.includes('px')) {
        return parseFloat(s);
      }

      return parseFloat(s);
    });

    for (const snapPos of snaps) {
      if (Math.abs(pos - snapPos) <= this._snapThreshold) {
        return snapPos;
      }
    }
    return pos;
  }

  render() {
    const vertical = this.hasAttribute('vertical');
    const overflow = this.getAttribute('overflow') || 'hidden';
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          --divider-width: 4px;
          --divider-hit-area: 12px;
          --divider-color: var(--luna-border, #333);
          --divider-color-active: var(--luna-accent, #3b82f6);
          --handle-size: 24px;
          --handle-color: #888;
          
          display: flex;
          width: 100%;
          height: 100%;
          overflow: hidden;
          flex-direction: ${vertical ? 'column' : 'row'};
          box-sizing: border-box;
          contain: layout size;
        }

        .panel {
          position: relative;
          overflow: ${overflow};
          box-sizing: border-box;
          flex-shrink: 1;
          min-width: 0;
          min-height: 0;
        }

        #divider {
          flex: 0 0 var(--divider-width);
          background: var(--divider-color);
          position: relative;
          cursor: ${vertical ? 'row-resize' : 'col-resize'};
          transition: background 0.2s;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        #divider:hover, #divider.dragging {
          background: var(--divider-color-active);
        }

        #divider::after {
          content: '';
          position: absolute;
          ${vertical ? 'top: 50%; left: 0; width: 100%; height: var(--divider-hit-area); transform: translateY(-50%);' : 'left: 50%; top: 0; height: 100%; width: var(--divider-hit-area); transform: translateX(-50%);'}
        }

        .divider-handle {
          position: absolute;
          background: var(--divider-color);
          border: 1px solid var(--divider-color);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          z-index: 11;
          transition: background 0.2s, border-color 0.2s;
        }

        #divider:hover .divider-handle,
        #divider.dragging .divider-handle {
          background: var(--divider-color-active);
          border-color: var(--divider-color-active);
        }

        ${vertical ? `
          .divider-handle { width: var(--handle-size); height: 8px; flex-direction: row; }
        ` : `
          .divider-handle { height: var(--handle-size); width: 8px; flex-direction: column; }
        `}

        .divider-dots {
          display: flex;
          gap: 2px;
          ${vertical ? 'flex-direction: row;' : 'flex-direction: column;'}
        }

        .dot {
          width: 2px;
          height: 2px;
          background: var(--handle-color);
          border-radius: 50%;
        }

        :host([disabled]) #divider {
          cursor: not-allowed;
          opacity: 0.5;
        }

        ::slotted(*) {
          width: 100%;
          height: 100%;
          display: block;
        }
      </style>

      <div class="panel" id="start">
        <slot name="start"></slot>
      </div>

      <div id="divider" part="divider">
        <div class="divider-handle">
          <div class="divider-dots">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
        </div>
        <slot name="divider"></slot>
      </div>

      <div class="panel" id="end">
        <slot name="end"></slot>
        <slot name="bottom"></slot>
      </div>
    `;

    this._startPanel = this.shadowRoot.getElementById('start');
    this._endPanel   = this.shadowRoot.getElementById('end');
    this._applyPosition();
  }
}

customElements.define('luna-split-panel', LunaSplitPanel);
