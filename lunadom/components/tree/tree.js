// lunadom/components/tree/tree.js

/**
 * @customElement luna-tree
 * 
 * @slot - The content of the tree.
 * 
 * Attributes:
 * @attr {string} selection - The selection mode of the tree.
 * 
 * Events:
 * @event luna-selection-change - Emitted when the selection changes.
 */
class LunaTree extends HTMLElement {

  static get observedAttributes() {
    return ['selection'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.addEventListener('luna-select', (e) => this._handleSelection(e));
  }

  attributeChangedCallback() {
    // No-op for now as logic is handled on event
  }

  get selection() {
    return this.getAttribute('selection') || 'single';
  }

  set selection(val) {
    this.setAttribute('selection', val);
  }

  _getItems() {
    return Array.from(this.querySelectorAll('luna-tree-item'));
  }

  _handleSelection(e) {
    const item = e.detail.item;
    const mode = this.selection;

    if (item.disabled) {
      return;
    }
    
    // Check leaf-only selection
    if (mode === 'leaf' && !item._isLeaf) {
      return;
    }

    if (mode === 'single' || mode === 'leaf') {
      const items = this._getItems();
      items.forEach(i => {
        if (i !== item) {
          i.selected = false;
        }
      });
      item.selected = true;
    } else if (mode === 'multiple') {
      item.selected = !item.selected;
    }

    this.dispatchEvent(new CustomEvent('luna-selection-change', {
      bubbles: true,
      composed: true,
      detail: { 
        selection: this._getSelectedItems(),
        mode: mode
      }
    }));
  }

  _getSelectedItems() {
    return this._getItems().filter(i => i.selected);
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          font-family: inherit;
        }

        .tree-root {
          display: flex;
          flex-direction: column;
        }
      </style>
      <div class="tree-root" role="tree">
        <slot></slot>
      </div>
    `;
  }
}

customElements.define('luna-tree', LunaTree);