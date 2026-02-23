// lunadom/components/dialog/dialog.js

/**
 * @customElement luna-dialog
 * 
 * @slot - The main content of the dialog.
 * @slot title - The title of the dialog, displayed in the header.
 * @slot footer - Content for the dialog footer, typically action buttons.
 * 
 * Attributes:
 * @attr {boolean} open - Whether the dialog is visible.
 * @attr {string} initial-focus - A selector for the element to receive focus when the dialog opens.
 * 
 * CSS Custom Properties:
 * @cssprop --luna-dialog-max-width - Maximum width of the dialog panel.
 * @cssprop --luna-dialog-bg - Background color of the dialog panel.
 * @cssprop --luna-dialog-color - Text color for the dialog content.
 * @cssprop --luna-dialog-radius - Border radius of the dialog panel.
 * @cssprop --luna-dialog-padding - Internal padding for the dialog sections.
 * @cssprop --luna-dialog-overlay - Background color/overlay for the backdrop.
 * @cssprop --luna-dialog-border - Border color of the dialog panel.
 * @cssprop --luna-dialog-shadow - Box shadow for the dialog panel.
 * 
 * Events:
 * @event luna-show - Emitted when the dialog opens.
 * @event luna-hide - Emitted when the dialog closes.
 * @event luna-request-close - Emitted when the dialog is requested to close (via overlay, ESC, or close button). Can be cancelled.
 */
class LunaDialog extends HTMLElement {

  static get observedAttributes() {
    return ['open', 'initial-focus'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.onKeydown = this.onKeydown.bind(this);
    this.handleOverlayClick = this.handleOverlayClick.bind(this);
    this._isRendered = false;
  }

  connectedCallback() {
    if (!this._isRendered) {
      this.render();
      this._isRendered = true;
    }
    document.addEventListener('keydown', this.onKeydown);
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this.onKeydown);
    document.body.style.overflow = '';
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'open') {
      const isOpen = newValue !== null;
      document.body.style.overflow = isOpen ? 'hidden' : '';
      
      if (isOpen) {
        requestAnimationFrame(() => this.trapFocus());
        this.dispatchEvent(new CustomEvent('luna-show', { bubbles: true, composed: true }));
      } else {
        this.dispatchEvent(new CustomEvent('luna-hide', { bubbles: true, composed: true }));
      }
    }
  }

  show() {
    this.setAttribute('open', '');
  }

  hide(source = 'api') {
    const ev = new CustomEvent('luna-request-close', {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: { source }
    });

    if (!this.dispatchEvent(ev)) {
      return;
    }
    this.removeAttribute('open');
  }

  onKeydown(e) {
    if (e.key === 'Escape' && this.hasAttribute('open')) {
      this.hide('escape');
    }
  }

  handleOverlayClick() {
    this.hide('overlay');
  }

  trapFocus() {
    const selector = this.getAttribute('initial-focus');
    const el = selector
      ? this.shadowRoot.querySelector(selector)
      : this.shadowRoot.querySelector('[autofocus], button, input, [tabindex="0"]');

    el?.focus();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          --luna-dialog-max-width: 520px;
          --luna-dialog-bg: var(--luna-bg, #fff);
          --luna-dialog-color: var(--luna-color, #111);
          --luna-dialog-radius: var(--luna-radius, 1rem);
          --luna-dialog-padding: 1.5rem;
          --luna-dialog-overlay: rgba(0, 0, 0, 0.4);
          --luna-dialog-border: var(--luna-border, #e5e7eb);
          --luna-dialog-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);

          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          transition: opacity 0.3s, visibility 0.3s;
        }

        :host([open]) {
          opacity: 1;
          visibility: visible;
          pointer-events: auto;
        }

        .overlay {
          position: absolute;
          inset: 0;
          background: var(--luna-dialog-overlay);
          backdrop-filter: blur(4px);
          transition: opacity 0.3s;
        }

        .dialog {
          position: relative;
          width: calc(100% - 2rem);
          max-width: var(--luna-dialog-max-width);
          max-height: 90vh;
          background: var(--luna-dialog-bg);
          color: var(--luna-dialog-color);
          border-radius: var(--luna-dialog-radius);
          border: 1px solid var(--luna-dialog-border);
          display: flex;
          flex-direction: column;
          box-shadow: var(--luna-dialog-shadow);
          transform: scale(0.95) translateY(10px);
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          overflow: hidden;
        }

        :host([open]) .dialog {
          transform: scale(1) translateY(0);
        }

        header {
          padding: var(--luna-dialog-padding);
          padding-bottom: 0.75rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .title {
          font-size: 1.25rem;
          font-weight: 700;
          flex: 1;
          margin: 0;
          color: inherit;
        }

        .close-btn {
          all: unset;
          cursor: pointer;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background 0.2s;
          font-size: 1.25rem;
          opacity: 0.5;
        }

        .close-btn:hover {
          background: rgba(0, 0, 0, 0.05);
          opacity: 1;
        }

        main {
          padding: var(--luna-dialog-padding);
          padding-top: 0.75rem;
          overflow-y: auto;
          flex: 1;
          font-size: 1rem;
          line-height: 1.6;
        }

        footer {
          padding: var(--luna-dialog-padding);
          padding-top: 1rem;
          border-top: 1px solid var(--luna-dialog-border);
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          background: rgba(0, 0, 0, 0.01);
        }

        ::slotted(luna-button) {
          --luna-radius: 0.5rem;
        }
      </style>

      <div class="overlay" id="overlay"></div>

      <div class="dialog" part="dialog" role="dialog" aria-modal="true">
        <header part="header">
          <h2 class="title" part="title"><slot name="title">Dialog</slot></h2>
          <button class="close-btn" id="close" aria-label="Close">✕</button>
        </header>

        <main part="body">
          <slot></slot>
        </main>

        <footer part="footer">
          <slot name="footer"></slot>
        </footer>
      </div>
    `;

    this.shadowRoot.getElementById('overlay').addEventListener('click', this.handleOverlayClick);
    this.shadowRoot.getElementById('close').addEventListener('click', () => this.hide('close-button'));
  }
}

customElements.define('luna-dialog', LunaDialog);
