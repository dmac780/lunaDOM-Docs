// lunadom/components/tab-group/tab-group.js

/**
 * @customElement luna-tab-group
 * 
 * @slot nav - The container for luna-tab components.
 * @slot - The container for luna-tab-panel components.
 * 
 * Attributes:
 * @attr {'top' | 'bottom' | 'start' | 'end'} placement - Where to position the tab navigation relative to the panels. Defaults to 'top'.
 * @attr {boolean} no-scroll - If present, disables the scrolling behavior of the tab navigation.
 * 
 * CSS Custom Properties:
 * @cssprop --luna-tab-group-border - The color of the divider between tabs and panels.
 * @cssprop --luna-tab-scroll-button-size - The size of the navigation scroll buttons.
 * @cssprop --luna-accent - Primary accent color used for indicators.
 * 
 * Events:
 * @event luna-tab-show - Emitted when a new tab is selected.
 */
class LunaTabGroup extends HTMLElement {

  static get observedAttributes() {
    return ['placement', 'no-scroll'];
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
    this._syncTabs();
    this._initResizeObserver();
  }

  disconnectedCallback() {
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
    }
  }

  attributeChangedCallback(name) {
    if (this._isRendered && name === 'placement') {
      this._setup();
      this._updateScrollButtons();
    }
  }

  _setup() {
    const placement  = this.getAttribute('placement') || 'top';
    const isVertical = placement === 'start' || placement === 'end';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: flex;
          flex-direction: ${isVertical ? 'row' : 'column'};
          width: 100%;
          --luna-tab-group-border: rgba(255, 255, 255, 0.08);
          --luna-tab-scroll-button-size: 2.25rem;
        }

        .tabs-header {
          position: relative;
          display: flex;
          align-items: stretch;
          order: ${placement === 'bottom' || placement === 'end' ? 2 : 1};
          border-${placement === 'top' ? 'bottom' : placement === 'bottom' ? 'top' : placement === 'start' ? 'right' : 'left'}: 1px solid var(--luna-tab-group-border);
        }

        .nav-container {
          display: flex;
          flex: 1;
          flex-direction: ${isVertical ? 'column' : 'row'};
          overflow-x: auto;
          overflow-y: hidden;
          scrollbar-width: none;
          scroll-behavior: smooth;
        }

        .nav-container::-webkit-scrollbar {
          display: none;
        }

        .scroll-button {
          display: none;
          align-items: center;
          justify-content: center;
          width: var(--luna-tab-scroll-button-size);
          background: transparent;
          border: none;
          color: #666;
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
          font-size: 1.25rem;
          line-height: 1;
        }

        .scroll-button:hover:not([disabled]) {
          color: var(--luna-accent, #3b82f6);
          background: rgba(255, 255, 255, 0.05);
        }

        .scroll-button[disabled] {
          opacity: 0.2;
          cursor: not-allowed;
        }

        :host(:not([no-scroll])) .scroll-button.visible {
          display: flex;
        }

        /* Order adjustment for vertical */
        .panels-container { order: ${placement === 'bottom' || placement === 'end' ? 1 : 2}; flex: 1; }

        ::slotted(luna-tab) {
          ${placement === 'bottom' ? 'border-bottom: none; border-top: 2px solid transparent; margin-top: -1px;' : ''}
          ${placement === 'start' ? 'border-bottom: none; border-right: 2px solid transparent; margin-right: -1px;' : ''}
          ${placement === 'end' ? 'border-bottom: none; border-left: 2px solid transparent; margin-left: -1px;' : ''}
        }

        ::slotted(luna-tab[active]) {
          ${placement === 'bottom' ? 'border-top-color: var(--luna-accent, #3b82f6);' : ''}
          ${placement === 'start' ? 'border-right-color: var(--luna-accent, #3b82f6);' : ''}
          ${placement === 'end' ? 'border-left-color: var(--luna-accent, #3b82f6);' : ''}
        }

        :host([no-scroll]) .nav-container {
          overflow: hidden;
          flex-wrap: wrap;
        }
      </style>

      <div class="tabs-header">
        <button class="scroll-button" id="prev" aria-label="Previous tab">
          ${isVertical ? '↑' : '←'}
        </button>
        
        <div class="nav-container" id="nav" role="tablist">
          <slot name="nav"></slot>
        </div>

        <button class="scroll-button" id="next" aria-label="Next tab">
          ${isVertical ? '↓' : '→'}
        </button>
      </div>

      <div class="panels-container">
        <slot></slot>
      </div>
    `;

    this._nav     = this.shadowRoot.getElementById('nav');
    this._btnPrev = this.shadowRoot.getElementById('prev');
    this._btnNext = this.shadowRoot.getElementById('next');

    this._nav.addEventListener('click', (e) => this._handleTabClick(e));
    this._nav.addEventListener('keydown', (e) => this._handleKeyDown(e));
    this._nav.addEventListener('scroll', () => this._updateScrollButtons());
    
    this._btnPrev.addEventListener('click', () => this._scroll('prev'));
    this._btnNext.addEventListener('click', () => this._scroll('next'));
    
    this.addEventListener('luna-close', (e) => this._handleTabClose(e));
  }

  _initResizeObserver() {
    this._resizeObserver = new ResizeObserver(() => {
      this._updateScrollButtons();
    });
    this._resizeObserver.observe(this._nav);
  }

  _updateScrollButtons() {
    if (!this._nav || !this._btnPrev || !this._btnNext) {
      return;
    }
    
    const placement  = this.getAttribute('placement') || 'top';
    const isVertical = placement === 'start' || placement === 'end';
    
    let hasOverflow;
    let isAtStart;
    let isAtEnd;

    if (isVertical) {
      hasOverflow = this._nav.scrollHeight > this._nav.clientHeight;
      isAtStart   = this._nav.scrollTop <= 0;
      isAtEnd     = this._nav.scrollTop + this._nav.clientHeight >= this._nav.scrollHeight - 1;
    } else {
      hasOverflow = this._nav.scrollWidth > this._nav.clientWidth;
      isAtStart   = this._nav.scrollLeft <= 0;
      isAtEnd     = this._nav.scrollLeft + this._nav.clientWidth >= this._nav.scrollWidth - 1;
    }

    this._btnPrev.classList.toggle('visible', hasOverflow);
    this._btnNext.classList.toggle('visible', hasOverflow);
    
    this._btnPrev.disabled = isAtStart;
    this._btnNext.disabled = isAtEnd;
  }

  _scroll(direction) {
    const placement  = this.getAttribute('placement') || 'top';
    const isVertical = placement === 'start' || placement === 'end';
    const amount     = isVertical ? this._nav.clientHeight * 0.8 : this._nav.clientWidth * 0.8;
    
    if (isVertical) {
      this._nav.scrollTop += (direction === 'next' ? amount : -amount);
    } else {
      this._nav.scrollLeft += (direction === 'next' ? amount : -amount);
    }
  }

  _syncTabs() {
    const tabs = this._getTabs();
    const activeTab = tabs.find(t => t.active) || tabs.find(t => !t.disabled);
    
    if (activeTab) {
      this._setActiveTab(activeTab, false);
    }
  }

  _getTabs() {
    const slot = this.shadowRoot.querySelector('slot[name="nav"]');
    if (!slot) {
      return [];
    }
    
    return slot.assignedElements().filter(el => el.tagName === 'LUNA-TAB');
  }

  _getPanels() {
    const slot = this.shadowRoot.querySelector('slot:not([name])');
    if (!slot) {
      return [];
    }
    
    return slot.assignedElements().filter(el => el.tagName === 'LUNA-TAB-PANEL');
  }

  _handleTabClick(e) {
    const tab = e.target.closest('luna-tab');
    if (tab && !tab.disabled) {
      this._setActiveTab(tab, true);
    }
  }

  _setActiveTab(tab, shouldFocus = true) {
    const tabs   = this._getTabs();
    const panels = this._getPanels();

    tabs.forEach(t => {
      t.active = (t === tab);
      t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
      t.setAttribute('tabindex', t === tab ? '0' : '-1');
    });

    panels.forEach(p => {
      p.toggleAttribute('active', p.getAttribute('name') === tab.getAttribute('panel'));
    });

    if (shouldFocus) {
      tab.focus({ preventScroll: true });
    }
    
    this.dispatchEvent(new CustomEvent('luna-tab-show', {
      detail: { tab: tab, name: tab.getAttribute('panel') }
    }));
  }

  _handleKeyDown(e) {
    const tabs = this._getTabs().filter(t => !t.disabled);
    const activeIndex = tabs.indexOf(document.activeElement);
    if (activeIndex === -1) {
      return;
    }
    
    let nextIndex;
    const placement  = this.getAttribute('placement') || 'top';
    const isVertical = placement === 'start' || placement === 'end';

    if (isVertical) {
      if (e.key === 'ArrowDown') {
        nextIndex = (activeIndex + 1) % tabs.length;
      }

      if (e.key === 'ArrowUp') {
        nextIndex = (activeIndex - 1 + tabs.length) % tabs.length;
      }
    } else {
      if (e.key === 'ArrowRight') {
        nextIndex = (activeIndex + 1) % tabs.length;
      }

      if (e.key === 'ArrowLeft') {
        nextIndex = (activeIndex - 1 + tabs.length) % tabs.length;
      }
    }

    if (nextIndex !== undefined) {
      e.preventDefault();
      this._setActiveTab(tabs[nextIndex], true);
    }

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this._setActiveTab(tabs[activeIndex], true);
    }
  }

  _handleTabClose(e) {
    const tabToRemove = e.detail.tab;
    const tabs = this._getTabs();
    
    if (tabToRemove.active) {
      const remaining = tabs.filter(t => t !== tabToRemove && !t.disabled);
      if (remaining.length > 0) {
        this._setActiveTab(remaining[0], true);
      }
    }

    tabToRemove.remove();

    const panelName = tabToRemove.getAttribute('panel');
    const panels    = this._getPanels();

    const panelToRemove = panels.find(p => p.getAttribute('name') === panelName);
    if (panelToRemove) {
      panelToRemove.remove();
    }
    
    this._updateScrollButtons();
  }
}

customElements.define('luna-tab-group', LunaTabGroup);