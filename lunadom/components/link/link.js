// lunadom/components/link/link.js

/**
 * @customElement luna-link
 * 
 * @slot - The primary content of the link.
 * @slot prefix - Content to display before the link text.
 * @slot suffix - Content to display after the link text.
 * 
 * Attributes:
 * @attr {'link' | 'primary' | 'secondary'} variant - The visual style of the link. Defaults to 'link'.
 * @attr {string} href - The URL the link points to.
 * @attr {string} target - Where to open the link (e.g., '_blank'). Defaults to '_self'.
 * @attr {boolean} disabled - Whether the link is disabled.
 * 
 * CSS Custom Properties:
 * @cssprop --luna-link-color - The text color of the link.
 * @cssprop --luna-accent - The primary accent color for links and buttons.
 * @cssprop --luna-link-hover-color - The text color when the link is hovered.
 */
class LunaLink extends HTMLElement {

  static get observedAttributes() {
    return ['variant', 'href', 'target', 'disabled'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._isRendered = false;
  }

  connectedCallback() {
    if (!this._isRendered) {
      this._setup();
      this._isRendered = true;
    }
  }

  attributeChangedCallback() {
    this._setup();
  }

  _setup() {
    const href     = this.getAttribute('href') || '#';
    const target   = this.getAttribute('target') || '_self';
    const disabled = this.hasAttribute('disabled');

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-flex;
          vertical-align: middle;
        }

        a {
          font: inherit;
          text-decoration: none;
          color: var(--luna-link-color, var(--luna-accent, #60a5fa));
          transition: all 0.2s;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          border-radius: 4px;
        }

        a:hover {
          color: var(--luna-link-hover-color, #93c5fd);
          text-decoration: underline;
        }

        /* Variant for button-like links */
        :host([variant="primary"]) a, :host([variant="secondary"]) a {
          padding: 0.5rem 1rem;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 500;
        }

        :host([variant="primary"]) a {
          background: var(--luna-accent, #2563eb);
          color: #fff;
        }
        :host([variant="primary"]) a:hover {
          background: #1d4ed8;
          text-decoration: none;
        }

        :host([variant="secondary"]) a {
          background: #2a2a2a;
          color: #eee;
          border: 1px solid #444;
        }
        :host([variant="secondary"]) a:hover {
          background: #333;
          text-decoration: none;
        }

        :host([disabled]) a {
          opacity: 0.5;
          pointer-events: none;
          cursor: not-allowed;
          filter: grayscale(1);
        }
      </style>

      <a href="${disabled ? 'javascript:void(0)' : href}" target="${target}" part="base">
        <slot name="prefix"></slot>
        <slot></slot>
        <slot name="suffix"></slot>
      </a>
    `;
  }
}

customElements.define('luna-link', LunaLink);