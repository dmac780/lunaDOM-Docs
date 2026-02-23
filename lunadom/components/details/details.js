// lunadom/components/details/details.js

/**
 * @customElement luna-details
 * 
 * @slot - The content to be shown/hidden when the component is toggled.
 * @slot summary - The summary text or content displayed as the header.
 * @slot icon - An optional icon to display before the summary text.
 * 
 * Attributes:
 * @attr {boolean} open - Whether the content is currently expanded.
 * @attr {boolean} disabled - Whether the component is disabled and cannot be toggled.
 * @attr {string} group - An optional group name for accordion-like behavior.
 * 
 * CSS Custom Properties:
 * @cssprop --luna-details-bg - Background color for the component.
 * @cssprop --luna-details-border - Color of the surrounding border.
 * @cssprop --luna-details-accent - Color of the accent (chevron and focus ring).
 * @cssprop --luna-details-radius - Border radius for the component.
 * @cssprop --luna-details-padding - Padding for the header/summary area.
 * 
 * Events:
 * @event luna-show - Emitted when the content is expanded.
 * @event luna-hide - Emitted when the content is collapsed.
 */
class LunaDetails extends HTMLElement {

  static get observedAttributes() {
    return ['open', 'disabled', 'group'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.toggle = this.toggle.bind(this);
    this._isRendered = false;
  }

  connectedCallback() {
    if (!this._isRendered) {
      this.render();
      this._isRendered = true;
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'open' && newValue !== null && oldValue === null) {
      this.closeGroup();
    }
  }

  toggle() {
    if (this.hasAttribute('disabled')) {
      return;
    }

    const isOpen = this.hasAttribute('open');
    if (!isOpen) {
      this.closeGroup();
    }

    this.toggleAttribute('open');

    this.dispatchEvent(
      new CustomEvent(this.hasAttribute('open') ? 'luna-show' : 'luna-hide', {
        bubbles: true,
        composed: true
      })
    );
  }

  closeGroup() {
    const group = this.getAttribute('group');
    if (!group) {
      return;
    }

    document
      .querySelectorAll(`luna-details[group="${group}"]`)
      .forEach(el => el !== this && el.removeAttribute('open'));
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: inherit;
          --luna-details-bg: rgba(26, 26, 26, 0.5);
          --luna-details-border: rgba(255, 255, 255, 0.1);
          --luna-details-accent: var(--luna-accent, #2563eb);
          --luna-details-radius: 12px;
          --luna-details-padding: 1.25rem 1.5rem;
          
          margin-bottom: 1rem;
          border: 1px solid var(--luna-details-border);
          border-radius: var(--luna-details-radius);
          background: var(--luna-details-bg);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          overflow: hidden;
          transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
        }

        :host([open]) {
          border-color: var(--luna-details-accent);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          background: rgba(26, 26, 26, 0.8);
        }

        .summary {
          display: flex;
          align-items: center;
          gap: 1rem;
          cursor: pointer;
          padding: var(--luna-details-padding);
          user-select: none;
          transition: all 0.2s ease;
          position: relative;
          z-index: 2;
        }

        .summary:hover {
          background: rgba(255, 255, 255, 0.03);
        }

        .summary:focus-visible {
          outline: 2px solid var(--luna-details-accent);
          outline-offset: -2px;
        }

        :host([disabled]) .summary {
          opacity: 0.4;
          cursor: not-allowed;
          pointer-events: none;
        }

        .icon-container {
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--luna-details-accent);
          transition: transform 0.15s ease;
        }

        .label {
          flex: 1;
          font-size: 1rem;
          font-weight: 600;
          color: #eee;
        }

        .chevron {
          width: 20px;
          height: 20px;
          color: #666;
          transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
          transform: rotate(0deg);
        }

        :host([open]) .chevron {
          transform: rotate(180deg);
          color: var(--luna-details-accent);
        }

        .content {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.15s cubic-bezier(0.4, 0, 0.2, 1);
        }

        :host([open]) .content {
          max-height: 2000px;
        }

        .inner-content {
          padding: 0 1.5rem 1.5rem 1.5rem;
          color: #aaa;
          font-size: 0.9375rem;
          line-height: 1.6;
        }

        .divider {
          height: 1px;
          background: var(--luna-details-border);
          margin: 0 var(--luna-details-padding);
          opacity: 0;
          transition: opacity 0.15s ease;
          position: relative;
          z-index: 1;
        }

        :host([open]) .divider {
          opacity: 1;
        }
      </style>

      <div class="summary" id="trigger" tabindex="0" role="button">
        <div class="icon-container">
          <slot name="icon"></slot>
        </div>
        <div class="label">
          <slot name="summary"></slot>
        </div>
        <div class="chevron">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
      </div>

      <div class="divider"></div>

      <div class="content">
        <div class="inner-content">
          <slot></slot>
        </div>
      </div>
    `;

    this.shadowRoot.getElementById('trigger').addEventListener('click', this.toggle);
    this.shadowRoot.getElementById('trigger').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggle();
      }
    });
  }
}

customElements.define('luna-details', LunaDetails);