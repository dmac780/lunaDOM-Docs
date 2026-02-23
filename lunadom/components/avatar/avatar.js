// lunadom/components/avatar/avatar.js

/**
 * @customElement
 * @slot - Avatar content
 * 
 * Attributes:
 * @attr src - Image source
 * @attr alt - Image alt text
 * @attr size - Avatar size
 * @attr variant - Avatar variant
 * @attr status - Avatar status
 * 
 * CSS Custom Properties:
 * @cssprop --luna-radius - Border radius for the avatar
 * @cssprop --luna-accent - Accent color for the avatar
 */
class LunaAvatar extends HTMLElement {

  static get observedAttributes() {
    return ['src', 'alt', 'size', 'variant', 'status'];
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
    const src     = this.getAttribute('src') || '';
    const alt     = this.getAttribute('alt') || '';
    const size    = this.getAttribute('size') || '3rem';
    const variant = this.getAttribute('variant') || 'circle';
    const status  = this.getAttribute('status');

    const initials = alt
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          vertical-align: middle;
          position: relative;
          width: ${size};
          height: ${size};
        }

        .avatar {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: #2a2a2a;
          color: #888;
          font-weight: 600;
          font-size: calc(${size} * 0.4);
          user-select: none;
          border: 1px solid #333;
          transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        :host(:hover) .avatar {
          transform: scale(1.05);
          border-color: var(--luna-accent, #60a5fa);
        }

        .avatar.circle { border-radius: 50%; }
        .avatar.rounded { border-radius: 20%; }
        .avatar.square { border-radius: 8px; }

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .status {
          position: absolute;
          bottom: 4%;
          right: 4%;
          width: 25%;
          height: 25%;
          border-radius: 50%;
          border: 2px solid #0a0a0a;
          box-shadow: 0 0 8px rgba(0,0,0,0.5);
        }

        .status-online { background: #22c55e; box-shadow: 0 0 10px rgba(34, 197, 94, 0.4); }
        .status-busy { background: #ef4444; }
        .status-away { background: #eab308; }
        .status-offline { background: #444; }

        .initials {
          letter-spacing: -0.05em;
        }
      </style>

      <div class="avatar ${variant}" part="base">
        ${src ? `<img src="${src}" alt="${alt}" part="image">` : `<span class="initials" part="initials">${initials || '??'}</span>`}
      </div>
      ${status ? `<div class="status status-${status}" part="status"></div>` : ''}
    `;
  }
}

customElements.define('luna-avatar', LunaAvatar);