// lunadom/components/card/card.js

/**
 * @customElement luna-card
 *
 * @slot image   - Card hero image / media area. Omit to collapse the image region.
 * @slot header  - Card title / heading content.
 * @slot         - (default) Card body content.
 * @slot footer  - Card footer content (actions, meta, etc.). Omit to hide the divider + footer.
 *
 * Attributes:
 * @attr {string}  size    - CSS max-width value (default: 350px)
 * @attr {boolean} glass   - Enables glassmorphism variant
 *
 * CSS Custom Properties:
 * @cssprop --luna-card-bg          - Background color (default: #1a1a1a)
 * @cssprop --luna-card-color       - Body text color (default: #bbb)
 * @cssprop --luna-card-border      - Border color (default: #333)
 * @cssprop --luna-card-radius      - Border radius (default: 1rem)
 * @cssprop --luna-card-padding     - Inner padding shorthand (default: 1.5rem)
 * @cssprop --luna-footer-justify   - justify-content for footer slot (default: flex-start)
 * @cssprop --luna-footer-align     - align-items for footer slot (default: center)
 * @cssprop --luna-accent           - Accent colour used on hover border highlight
 */
class LunaCard extends HTMLElement {

  static get observedAttributes() {
    return ['size', 'glass'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._onSlotChange = this._onSlotChange.bind(this);
  }

  connectedCallback() {
    this._render();
    this._bindSlotListeners();
  }

  attributeChangedCallback() {
    if (this.isConnected) {
      this._render();
      this._bindSlotListeners();
    }
  }

  _bindSlotListeners() {
    const slots = this.shadowRoot.querySelectorAll('slot');
    slots.forEach(slot => {
      slot.removeEventListener('slotchange', this._onSlotChange);
      slot.addEventListener('slotchange', this._onSlotChange);
    });
    this._updateSlotVisibility();
  }

  _onSlotChange() {
    this._updateSlotVisibility();
  }

  _hasSlotContent(slotName) {
    const selector = slotName ? `slot[name="${slotName}"]` : 'slot:not([name])';
    const slot = this.shadowRoot.querySelector(selector);
    if (!slot) {
      return false;
    }
    return slot.assignedNodes({ flatten: true }).length > 0;
  }

  _updateSlotVisibility() {
    const imageWrap  = this.shadowRoot.querySelector('.image-container');
    const footerWrap = this.shadowRoot.querySelector('.footer');

    if (imageWrap) {
      imageWrap.hidden = !this._hasSlotContent('image');
    }

    if (footerWrap) {
      footerWrap.hidden = !this._hasSlotContent('footer');
    }
  }

  _render() {
    const size  = this.getAttribute('size') || '350px';
    const glass = this.hasAttribute('glass');

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          max-width: ${size};
        }

        /* ── card shell ── */
        .card {
          position: relative;
          background: var(--luna-card-bg, #1a1a1a);
          color: var(--luna-card-color, #bbb);
          border: 1px solid var(--luna-card-border, #333);
          border-radius: var(--luna-card-radius, 1rem);
          font-family: inherit;
          display: flex;
          flex-direction: column;
          box-shadow: 0 10px 30px rgba(0,0,0,.4);
          transition:
            transform 0.2s cubic-bezier(0.4, 0, 0.2, 1),
            box-shadow 0.2s ease,
            border-color 0.2s ease;

          /* overflow must be hidden for image radius clipping,
             but we move backdrop-filter to the pseudo-element
             so the blur is not clipped. */
          overflow: hidden;
        }

        :host(:hover) .card {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0,0,0,.6);
          border-color: #444;
        }

        /* ── glassmorphism ── */
        /* backdrop-filter on a pseudo-element that sits BEHIND the content
           so overflow:hidden on .card does not clip the blur effect. */
        .card.glass {
          background: rgba(255,255,255,0.04);
          border-color: rgba(255,255,255,0.12);
        }

        .card.glass::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          backdrop-filter: blur(16px) saturate(1.6);
          -webkit-backdrop-filter: blur(16px) saturate(1.6);
          z-index: 0;
          pointer-events: none;
        }

        /* keep all real content above the blur layer */
        .image-container,
        .header,
        .body,
        .footer {
          position: relative;
          z-index: 1;
        }

        :host(:hover) .card.glass {
          border-color: rgba(255,255,255,0.22);
          background: rgba(255,255,255,0.07);
        }

        /* ── image ── */
        .image-container {
          width: 100%;
          aspect-ratio: 16 / 9;
          overflow: hidden;
          background: #222;
          /* when hidden attr is set by JS, display:none takes over */
        }

        .image-container[hidden] {
          display: none;
        }

        ::slotted([slot="image"]) {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.3s ease;
        }

        :host(:hover) ::slotted([slot="image"]) {
          transform: scale(1.05);
        }

        /* ── header ── */
        .header {
          padding: var(--luna-card-padding, 1.5rem) var(--luna-card-padding, 1.5rem) 0.5rem;
          font-size: 1.25rem;
          font-weight: 600;
          color: #fff;
        }

        /* tighten top padding when there is no image */
        .card:not(.has-image) .header {
          padding-top: var(--luna-card-padding, 1.5rem);
        }

        /* ── body ── */
        .body {
          padding: 0.75rem var(--luna-card-padding, 1.5rem) var(--luna-card-padding, 1.5rem);
          font-size: 0.9375rem;
          line-height: 1.6;
          flex: 1;
        }

        /* when footer is hidden, body already owns the bottom padding */

        /* ── footer ── */
        .footer {
          padding: 1rem var(--luna-card-padding, 1.5rem) var(--luna-card-padding, 1.5rem);
          display: flex;
          gap: 0.75rem;
          align-items: var(--luna-footer-align, center);
          justify-content: var(--luna-footer-justify, flex-start);
          border-top: 1px solid var(--luna-card-border, #333);
        }

        .footer[hidden] {
          display: none;
        }

        ::slotted([slot="footer"]) {
          display: contents;
        }
      </style>

      <div class="card ${glass ? 'glass' : ''}" part="base">
        <div class="image-container" part="image-container">
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
    `;
  }
}

customElements.define('luna-card', LunaCard);