class LunaToast extends HTMLElement {

  static get observedAttributes() {
    return ['variant', 'duration'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.dismiss = this.dismiss.bind(this);
  }

  connectedCallback() {
    this.render();

    const duration = parseInt(this.getAttribute('duration'), 10);
    if (!isNaN(duration) && duration > 0) {
      this._timer = setTimeout(this.dismiss, duration);
    }
  }

  disconnectedCallback() {
    clearTimeout(this._timer);
  }

  dismiss() {
    if (this._isDismissing) {
      return;
    }
    
    this._isDismissing = true;

    this.dispatchEvent(new CustomEvent('luna-dismiss', {
      bubbles: true,
      composed: true
    }));

    this.classList.add('dismissing');
    
    this.addEventListener('animationend', () => {
      this.remove();
    }, { once: true });

    // Fallback if animation fails
    setTimeout(() => {
      if (this.parentNode) this.remove();
    }, 500);
  }

  render() {
    const variant = this.getAttribute('variant') || 'info';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          animation: slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        :host(.dismissing) {
          animation: fade-out 0.2s ease-in forwards;
          pointer-events: none;
        }

        .toast {
          display: flex;
          gap: 0.75rem;
          align-items: flex-start;
          padding: 0.75rem 1rem;
          border-radius: var(--luna-radius, 0.5rem);
          background: var(--luna-bg);
          color: var(--luna-color);
          border: 1px solid var(--luna-border);
          box-shadow: 0 10px 20px rgba(0,0,0,0.15);
          font: inherit;
        }

        .content {
          flex: 1;
          line-height: 1.4;
        }

        button {
          all: unset;
          cursor: pointer;
          opacity: 0.6;
          font-size: 1.25rem;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          margin-top: -2px;
        }

        button:hover {
          opacity: 1;
        }

        /* Variants */
        .info {
          --luna-bg: #eef4ff;
          --luna-color: #1e3a8a;
          --luna-border: #c7d2fe;
        }

        .success {
          --luna-bg: #ecfdf5;
          --luna-color: #065f46;
          --luna-border: #a7f3d0;
        }

        .warning {
          --luna-bg: #fffbeb;
          --luna-color: #92400e;
          --luna-border: #fde68a;
        }

        .danger {
          --luna-bg: #fef2f2;
          --luna-color: #991b1b;
          --luna-border: #fecaca;
        }

        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes fade-out {
          from {
            opacity: 1;
            transform: scale(1);
          }
          to {
            opacity: 0;
            transform: scale(0.95);
          }
        }
      </style>

      <div class="toast ${variant}" part="toast" role="status">
        <div class="content" part="content">
          <slot></slot>
        </div>
        <button part="close" aria-label="Dismiss">×</button>
      </div>
    `;

    this.shadowRoot.querySelector('button')
      .addEventListener('click', () => this.dismiss());
  }

}

customElements.define('luna-toast', LunaToast);