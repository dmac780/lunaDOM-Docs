/**
 * @customElement luna-copy-button
 * 
 * @slot - The button's label text.
 * @slot icon - A custom icon to display (replaces default copy icon).
 * 
 * Attributes:
 * @attr {string} target - The ID of the element whose value/text should be copied.
 * @attr {string} value - The literal text to copy if no target is provided.
 * @attr {string} success-text - The text to show in the tooltip upon successful copy. Defaults to 'Copied!'.
 * @attr {'primary'} variant - The button's visual variant. Defaults to 'neutral'.
 * @attr {string} tooltip - The tooltip text to show on hover. Defaults to 'Copy to clipboard'.
 * @attr {'sm' | 'md' | 'lg'} size - The size of the button. Defaults to 'md'.
 * 
 * CSS Custom Properties:
 * @cssprop --luna-copy-bg - Background color of the button.
 * @cssprop --luna-copy-border - Border color of the button.
 * @cssprop --luna-copy-color - Text and icon color.
 * @cssprop --luna-copy-accent - Background color for the 'primary' variant.
 * @cssprop --luna-copy-radius - Border radius of the button.
 * @cssprop --luna-copy-padding - Internal padding of the button.
 * 
 * Events:
 * @event luna-copy - Emitted when text is successfully copied to the clipboard.
 */
class LunaCopyButton extends HTMLElement {
  
  static get observedAttributes() {
    return ['target', 'success-text', 'variant', 'tooltip', 'size', 'value'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.copy = this.copy.bind(this);
    this._copying = false;
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (this.shadowRoot.innerHTML && name !== 'value') {
      this.render();
    }
  }

  async copy() {
    if (this._copying) {
      return;
    }
    
    let text       = this.getAttribute('value') || '';
    const targetId = this.getAttribute('target');
    
    if (targetId) {
      const target = document.getElementById(targetId);
      if (target) {
        if (target.value !== undefined) {
          text = target.value;
        } else if (target.hasAttribute('value')) {
          text = target.getAttribute('value');
        } else {
          text = target.textContent.trim();
        }
      }
    }

    if (!text) {
      return;
    }

    try {
      this._copying = true;

      await navigator.clipboard.writeText(text);

      this.dispatchEvent(new CustomEvent('luna-copy', {
        bubbles: true,
        composed: true,
        detail: { text }
      }));

      this.showSuccess();
    } catch (e) {
      console.error('Copy failed', e);
      this._copying = false;
    }
  }

  showSuccess() {
    const button      = this.shadowRoot.querySelector('button');
    const successText = this.getAttribute('success-text') || 'Copied!';
    const tooltip     = this.shadowRoot.querySelector('luna-tooltip');
    
    button.classList.add('success');
    
    if (tooltip) {
      const originalTooltip = tooltip.getAttribute('content');
      tooltip.setAttribute('content', successText);
      tooltip.show();
      
      setTimeout(() => {
        button.classList.remove('success');
        tooltip.hide();
        setTimeout(() => {
          tooltip.setAttribute('content', originalTooltip);
          this._copying = false;
        }, 300);
      }, 2000);
    } else {
      setTimeout(() => {
        button.classList.remove('success');
        this._copying = false;
      }, 2000);
    }
  }

  render() {
    const tooltipText = this.getAttribute('tooltip') || 'Copy to clipboard';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          font-family: inherit;
          --luna-copy-bg: rgba(255, 255, 255, 0.05);
          --luna-copy-border: rgba(255, 255, 255, 0.1);
          --luna-copy-color: #eee;
          --luna-copy-accent: var(--luna-accent, #2563eb);
          --luna-copy-radius: 8px;
          --luna-copy-padding: 0.5rem 0.75rem;
        }

        button {
          all: unset;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.625rem;
          padding: var(--luna-copy-padding);
          border-radius: var(--luna-copy-radius);
          background: var(--luna-copy-bg);
          border: 1px solid var(--luna-copy-border);
          color: var(--luna-copy-color);
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          position: relative;
          overflow: hidden;
        }

        button:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
        }

        button:active {
          transform: scale(0.95);
        }

        :host([variant="primary"]) button {
          background: var(--luna-copy-accent);
          border-color: rgba(255, 255, 255, 0.1);
          color: #fff;
        }

        :host([variant="primary"]) button:hover {
          filter: brightness(1.1);
          box-shadow: 0 0 15px rgba(37, 99, 235, 0.4);
        }

        /* Sizes */
        :host([size="sm"]) { --luna-copy-padding: 0.25rem 0.5rem; --luna-copy-radius: 6px; }
        :host([size="sm"]) button { font-size: 0.75rem; }
        :host([size="lg"]) { --luna-copy-padding: 0.75rem 1.25rem; --luna-copy-radius: 12px; }
        :host([size="lg"]) button { font-size: 1rem; }

        .icon-container {
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .label-container {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        button.success .icon-container,
        button.success .label-container {
          opacity: 0;
          transform: translateY(-10px) scale(0.8);
          pointer-events: none;
        }

        .success-icon {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -40%) scale(0.5);
          opacity: 0;
          color: #22c55e;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          font-size: 1.25rem;
          pointer-events: none;
        }

        button.success .success-icon {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1);
        }

        button.success {
          border-color: rgba(34, 197, 94, 0.4) !important;
          background: rgba(34, 197, 94, 0.1) !important;
        }

        /* Layout for icon-only */
        :host(:not([has-label])) button {
          padding: 0;
          width: 36px;
          height: 36px;
          justify-content: center;
        }
      </style>

      <luna-tooltip content="${tooltipText}" trigger="manual">
        <button type="button" part="button">
          <span class="icon-container">
            <slot name="icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            </slot>
          </span>
          <span class="label-container">
            <slot></slot>
          </span>
          <span class="success-icon">✓</span>
        </button>
      </luna-tooltip>
    `;

    const button = this.shadowRoot.querySelector('button');
    button.addEventListener('click', this.copy);
    
    // Check if we have visible text in the default slot
    const slot = this.shadowRoot.querySelector('slot:not([name])');
    const hasLabel = slot.assignedNodes().some(node => node.textContent.trim().length > 0);
    if (hasLabel) {
      this.setAttribute('has-label', '');
    } else {
      this.removeAttribute('has-label');
    }
  }
}

customElements.define('luna-copy-button', LunaCopyButton);