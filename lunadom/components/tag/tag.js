// lunadom/components/tag/tag.js

/**
 * @customElement luna-tag
 * 
 * @slot - The content of the tag.
 * @slot prefix - Content to display before the label.
 * 
 * Attributes:
 * @attr {'sm' | 'md' | 'lg'} size - The size of the tag. Defaults to 'md'.
 * @attr {boolean} pill - If present, the tag will have a pill shape.
 * @attr {boolean} removable - If present, adds a close button to the tag.
 * @attr {boolean} disabled - Whether the tag's remove button is disabled.
 * @attr {'neutral' | 'primary' | 'success' | 'warning' | 'danger'} variant - The visual style of the tag. Defaults to 'neutral'.
 * 
 * CSS Custom Properties:
 * @cssprop --luna-tag-bg - Background color of the tag.
 * @cssprop --luna-tag-color - Text color of the tag.
 * @cssprop --luna-tag-border - Border color of the tag.
 * 
 * Events:
 * @event luna-remove - Emitted when the remove button is clicked.
 */
class LunaTag extends HTMLElement {

  static get observedAttributes() {
    return ['size', 'pill', 'removable', 'disabled', 'variant'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal !== newVal) {
      this.render();
    }
  }

  handleRemove(e) {
    if (this.disabled) {
      return;
    }
    
    this.dispatchEvent(
      new CustomEvent('luna-remove', {
        bubbles: true,
        composed: true
      })
    );

    this.remove();
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  render() {
    const size = this.getAttribute('size') || 'md';
    const pill = this.hasAttribute('pill');
    const removable = this.hasAttribute('removable');
    const disabled = this.disabled;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          --luna-tag-bg: #2a2a2a;
          --luna-tag-color: #eee;
          --luna-tag-border: #444;
        }

        :host([variant="neutral"]) {
          --luna-tag-bg: #2a2a2a;
          --luna-tag-color: #eee;
          --luna-tag-border: #444;
        }

        :host([variant="primary"]) {
          --luna-tag-bg: rgba(37, 99, 235, 0.15);
          --luna-tag-color: #60a5fa;
          --luna-tag-border: rgba(37, 99, 235, 0.3);
        }

        :host([variant="success"]) {
          --luna-tag-bg: rgba(34, 197, 94, 0.15);
          --luna-tag-color: #4ade80;
          --luna-tag-border: rgba(34, 197, 94, 0.3);
        }

        :host([variant="warning"]) {
          --luna-tag-bg: rgba(234, 179, 8, 0.15);
          --luna-tag-color: #facc15;
          --luna-tag-border: rgba(234, 179, 黃, 0.3);
          --luna-tag-border: rgba(234, 179, 8, 0.3);
        }

        :host([variant="danger"]) {
          --luna-tag-bg: rgba(239, 68, 68, 0.15);
          --luna-tag-color: #f87171;
          --luna-tag-border: rgba(239, 68, 68, 0.3);
        }

        .tag {
          display: inline-flex;
          align-items: center;
          gap: 0.35em;
          padding: 0.25em 0.75em;
          font-size: var(--luna-font-size-${size}, 0.8125rem);
          font-weight: 500;
          border-radius: ${pill ? '999px' : '4px'};
          background: var(--luna-tag-bg);
          color: var(--luna-tag-color);
          border: 1px solid var(--luna-tag-border);
          line-height: normal;
          user-select: none;
          opacity: ${disabled ? 0.5 : 1};
          pointer-events: ${disabled ? 'none' : 'auto'};
          white-space: nowrap;
        }

        :host([size="sm"]) .tag {
          padding: 0.15em 0.5em;
          font-size: 0.75rem;
        }

        :host([size="lg"]) .tag {
          padding: 0.4em 1em;
          font-size: 0.9375rem;
        }

        .remove {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          color: inherit;
          cursor: pointer;
          padding: 0;
          margin-left: 0.25rem;
          margin-right: -0.25rem;
          width: 1.25rem;
          height: 1.25rem;
          border-radius: 50%;
          font-size: 1.125rem;
          transition: background 0.2s;
          opacity: 0.7;
        }

        .remove:hover {
          background: rgba(255, 255, 255, 0.1);
          opacity: 1;
        }

        :host([variant="neutral"]) .remove:hover { background: rgba(255, 255, 255, 0.1); }
        :host([variant="primary"]) .remove:hover { background: rgba(37, 99, 235, 0.2); }
        :host([variant="success"]) .remove:hover { background: rgba(34, 197, 94, 0.2); }
        :host([variant="warning"]) .remove:hover { background: rgba(234, 179, 8, 0.2); }
        :host([variant="danger"]) .remove:hover { background: rgba(239, 68, 68, 0.2); }

        ::slotted(*) {
          display: inline-flex;
          align-items: center;
        }
      </style>

      <span class="tag" part="base">
        <slot name="prefix"></slot>
        <slot></slot>

        ${
          removable
            ? `<button
                class="remove"
                part="remove"
                aria-label="Remove tag"
              >&times;</button>`
            : ''
        }
      </span>
    `;

    const removeBtn = this.shadowRoot.querySelector('.remove');
    if (removeBtn) {
      removeBtn.addEventListener('click', (e) => this.handleRemove(e));
    }
  }
}

customElements.define('luna-tag', LunaTag);