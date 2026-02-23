// lunadom/components/skeleton/skeleton.js

/**
 * @customElement luna-skeleton
 * 
 * Attributes:
 * @attr {'sheen' | 'pulse' | 'none'} effect - The animation effect to use. Defaults to 'sheen'.
 * @attr {'rect' | 'circle' | 'text' | 'avatar'} variant - The shape of the skeleton. Defaults to 'rect'.
 * 
 * CSS Custom Properties:
 * @cssprop --luna-skeleton-bg - The background color of the skeleton.
 * @cssprop --luna-skeleton-accent - The color of the animation effect (sheen).
 * @cssprop --luna-skeleton-speed - The duration of the animation cycle.
 * @cssprop --luna-skeleton-radius - The border radius of the skeleton.
 * @cssprop --luna-skeleton-clip-path - An optional clip-path to apply to the skeleton.
 */
class LunaSkeleton extends HTMLElement {

  static get observedAttributes() {
    return ['effect', 'variant'];
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

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          --luna-skeleton-bg: #2a2a2a;
          --luna-skeleton-accent: #3a3a3a;
          --luna-skeleton-speed: 2s;
          --luna-skeleton-radius: 0.25rem;
          --luna-skeleton-clip-path: none;
          
          display: block;
          position: relative;
          width: 100%;
          height: 100%;
        }

        .skeleton {
          position: relative;
          width: 100%;
          height: 100%;
          background: var(--luna-skeleton-bg);
          border-radius: var(--luna-skeleton-radius);
          clip-path: var(--luna-skeleton-clip-path);
          overflow: hidden;
        }

        /* Variants */
        :host([variant="circle"]) { --luna-skeleton-radius: 50%; }
        
        :host([variant="text"]) {
          width: 100%;
          height: 1.2em;
          margin-bottom: 0.5em;
        }

        :host([variant="avatar"]) {
          width: 3rem;
          height: 3rem;
          --luna-skeleton-radius: 50%;
        }

        /* Effects */
        .skeleton::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
        }

        /* Pulse */
        :host([effect="pulse"]) .skeleton {
          animation: pulse var(--luna-skeleton-speed) ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        /* Sheen */
        :host([effect="sheen"]) .skeleton::after {
          background: linear-gradient(
            90deg,
            transparent,
            var(--luna-skeleton-accent),
            transparent
          );
          transform: translateX(-100%);
          animation: sheen var(--luna-skeleton-speed) infinite;
        }

        @keyframes sheen {
          100% { transform: translateX(100%); }
        }

        /* None */
        :host([effect="none"]) .skeleton::after {
          display: none;
        }
      </style>

      <div class="skeleton" part="indicator"></div>
    `;
  }
}

customElements.define('luna-skeleton', LunaSkeleton);