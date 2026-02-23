// lunadom/components/card/card.js

/**
 * @customElement
 * @slot - Card content
 * @slot prefix - Prefix content
 * @slot suffix - Suffix content
 * 
 * Attributes:
 * @attr size - Card size (sm, md, lg)
 * @attr glass - Makes the card glass-like
 * 
 * CSS Custom Properties:
 * @cssprop  --luna-card-bg - Background color
 * @cssprop  --luna-card-color - Text color
 * @cssprop  --luna-card-border - Border color
 * @cssprop  --luna-card-radius - Border radius override
 */
class LunaCard extends HTMLElement {

  static get observedAttributes() {
    return ['size', 'glass'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const size  = this.getAttribute('size') || '350px';
    const glass = this.hasAttribute('glass');

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          max-width: ${size};
          --luna-card-bg: #1a1a1a;
          --luna-card-color: #eee;
          --luna-card-border: #333;
          --luna-card-radius: 1rem;
        }

        .card {
          position: relative;
          background: var(--luna-card-bg);
          color: var(--luna-card-color);
          border: 1px solid var(--luna-card-border);
          border-radius: var(--luna-card-radius);
          overflow: hidden;
          font-family: inherit;
          display: flex;
          flex-direction: column;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
          transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s;
        }

        :host(:hover) .card {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
          border-color: #444;
        }

        .glass .card {
          background: rgba(26, 26, 26, 0.7);
          backdrop-filter: blur(12px);
          border-color: rgba(255, 255, 255, 0.1);
        }

        .image-container {
          width: 100%;
          aspect-ratio: 16 / 9;
          overflow: hidden;
          background: #222;
        }

        ::slotted([slot="image"]) {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
        }

        :host(:hover) ::slotted([slot="image"]) {
          transform: scale(1.05);
        }

        .header {
          padding: 1.5rem 1.5rem 0.5rem 1.5rem;
          font-size: 1.25rem;
          font-weight: 600;
          color: #fff;
        }

        .body {
          padding: 1rem 1.5rem;
          font-size: 0.9375rem;
          line-height: 1.6;
          color: #bbb;
          flex: 1;
        }

        .footer {
          padding: 1rem 1.5rem 1.5rem 1.5rem;
          display: flex;
          gap: 1rem;
          align-items: center;
          border-top: 1px solid var(--luna-card-border);
          margin-top: 0.5rem;
        }

        ::slotted([slot="footer"]) {
          display: flex;
          gap: 0.75rem;
          flex: 1;
        }
      </style>

      <div class="card-container ${glass ? 'glass' : ''}" part="base">
        <div class="card">
          <div class="image-container">
            <slot name="image"></slot>
          </div>
          <div class="header" part="header">
            <slot name="header"></slot>
          </div>
          <div class="body" part="body">
            <slot></slot>
          </div>
          <div class="footer" part="footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('luna-card', LunaCard);
