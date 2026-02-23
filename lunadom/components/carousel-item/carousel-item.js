// lunadom/components/carousel-item/carousel-item.js

/**
 * @customElement
 * @slot - Carousel item content
 * 
 * Attributes:
 * @attr current - Current slide index
 * 
 * CSS Custom Properties:
 * @cssprop  --luna-carousel-slide-bg - Slide background color
 */
class LunaCarouselItem extends HTMLElement {

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          flex: 0 0 100%;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
          background-color: var(--luna-carousel-slide-bg, transparent);
        }

        ::slotted(*) {
          max-width: 100%;
          max-height: 100%;
        }
      </style>

      <slot></slot>
    `;
  }
}

customElements.define('luna-carousel-item', LunaCarouselItem);