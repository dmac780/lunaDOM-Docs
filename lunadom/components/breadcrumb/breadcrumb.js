// lunadom/components/breadcrumb/breadcrumb.js

/**
 * @customElement
 * @slot - Breadcrumb content
 * 
 * Attributes:
 * @attr label - Breadcrumb label
 */
class LunaBreadcrumb extends HTMLElement {

  static get observedAttributes() {
    return ['label'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.shadowRoot.querySelector('slot').addEventListener('slotchange', () => this._syncSeparators());
  }

  _syncSeparators() {
    const items = Array.from(this.querySelectorAll('luna-breadcrumb-item'));

    items.forEach((item, index) => {
      // If the item doesn't have its own separator slot, we could potentially inject one,
      // but usually, it's easier to let the item handle its own internal separator display 
      // based on :last-of-type.
      
      // However, to support a global separator defined in the parent:
      const existingSeparator = item.querySelector('[slot="separator"]');
      if (!existingSeparator && this.querySelector('[slot="separator"]')) {
        const sep = this.querySelector('[slot="separator"]').cloneNode(true);
        item.appendChild(sep);
      }
    });
  }

  render() {
    const label = this.getAttribute('label') || 'Breadcrumb';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }

        nav {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          line-height: 1;
        }
      </style>

      <nav aria-label="${label}" part="base">
        <slot></slot>
      </nav>

      <slot name="separator" hidden></slot>
    `;
  }
}

customElements.define('luna-breadcrumb', LunaBreadcrumb);
