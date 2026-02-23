// lunadom/components/code/code.js

/**
 * @customElement luna-code
 * 
 * @slot - The code content to be displayed and syntax-highlighted.
 * 
 * Attributes:
 * @attr {string} language - The programming language for syntax highlighting (html, js, css, etc.). Defaults to 'html'.
 * @attr {boolean} no-toolbar - If present, hides the toolbar with dots and copy button.
 * @attr {boolean} no-lines - If present, hides line numbers.
 * 
 * CSS Custom Properties:
 * @cssprop --luna-code-bg - Background color of the code block. Defaults to #161618.
 * @cssprop --luna-code-border - Border color. Defaults to #2a2a2d.
 * @cssprop --luna-code-toolbar-bg - Background color of the toolbar. Defaults to #1c1c1f.
 * @cssprop --luna-code-text - Text color for code. Defaults to #b0b8c4.
 * @cssprop --luna-code-comment - Color for comments. Defaults to #5a8f5a.
 * @cssprop --luna-code-line-number - Color for line numbers. Defaults to #333.
 * @cssprop --luna-code-radius - Border radius. Defaults to 8px.
 * @cssprop --luna-code-font-size - Font size for code. Defaults to 0.82rem.
 * @cssprop --luna-code-line-height - Line height for code. Defaults to 1.65.
 * @cssprop --luna-code-padding - Padding inside code area. Defaults to 1.2rem 1.4rem.
 * 
 * Events:
 * @event luna-copy - Emitted when code is copied to clipboard.
 */
class LunaCode extends HTMLElement {

  static get observedAttributes() {
    return ['language', 'no-toolbar', 'no-lines'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._isRendered = false;
    this._originalCode = '';
  }

  connectedCallback() {
    if (!this._isRendered) {
      this._originalCode = this.textContent;
      this._setup();
      this._isRendered = true;
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (this._isRendered && oldValue !== newValue) {
      this._update();
    }
  }

  _setup() {
    const lang = this.getAttribute('language') || 'html';
    const code = this._dedent(this._originalCode).trim();
    const highlighted = this._highlight(code, lang);
    this._render(highlighted, lang);
  }

  _update() {
    const lang = this.getAttribute('language') || 'html';
    const code = this._dedent(this._originalCode).trim();
    const highlighted = this._highlight(code, lang);
    
    const codeEl = this.shadowRoot.getElementById('codeEl');
    if (codeEl) {
      codeEl.innerHTML = this._buildLines(highlighted);
    }
    
    const langBadge = this.shadowRoot.getElementById('langBadge');
    if (langBadge) {
      langBadge.textContent = this._escape(lang);
    }
  }

  _dedent(str) {
    const lines = str.split('\n');
    
    while (lines.length && !lines[0].trim()) {
      lines.shift();
    }
    
    while (lines.length && !lines[lines.length - 1].trim()) {
      lines.pop();
    }
    
    if (lines.length === 0) {
      return '';
    }
    
    const indent = Math.min(
      ...lines.filter(l => l.trim()).map(l => l.match(/^(\s*)/)[1].length)
    );
    
    return lines.map(l => l.slice(indent)).join('\n');
  }

  _escape(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  _highlight(code, lang) {
    return this._tokenize(code);
  }

  _tokenize(src) {
    let out = '';
    let i = 0;
    const len = src.length;

    const peek = (n = 0) => src[i + n] || '';
    const slice = (a, b) => src.slice(a, b);

    while (i < len) {
      const ch = src[i];

      // Single-line comment
      if (ch === '/' && peek(1) === '/') {
        const end = src.indexOf('\n', i);
        const raw = end === -1 ? slice(i) : slice(i, end);
        out += `<span class="cm">${this._escape(raw)}</span>`;
        i += raw.length;
        continue;
      }

      // Block comment /* ... */
      if (ch === '/' && peek(1) === '*') {
        const end = src.indexOf('*/', i + 2);
        const raw = end === -1 ? slice(i) : slice(i, end + 2);
        out += this._spanMultiline(raw, 'cm');
        i += raw.length;
        continue;
      }

      // HTML comment <!-- ... -->
      if (ch === '<' && slice(i, i + 4) === '<!--') {
        const end = src.indexOf('-->', i);
        const raw = end === -1 ? slice(i) : slice(i, end + 3);
        out += this._spanMultiline(raw, 'cm');
        i += raw.length;
        continue;
      }

      // HTML tag — find the closing > searching forward through the full source
      if (ch === '<' && (peek(1) === '/' || /[a-zA-Z!]/.test(peek(1)))) {
        const end = src.indexOf('>', i);
        if (end !== -1) {
          const tagSrc = slice(i, end + 1);
          out += this._colorTag(tagSrc);
          i += tagSrc.length;
          continue;
        }
      }

      // Quoted string — multiline: stop only at the matching closing quote
      if (ch === '"' || ch === "'") {
        const quote = ch;
        let j = i + 1;
        while (j < len && src[j] !== quote) {
          if (src[j] === '\\') j++;
          j++;
        }
        const raw = slice(i, j + 1);
        out += this._spanMultiline(raw, 'str');
        i = j + 1;
        continue;
      }

      if (ch === '\n') {
        out += '\n';
        i++;
        continue;
      }

      out += `<span class="pl">${this._escape(ch)}</span>`;
      i++;
    }

    return out;
  }

  // Wrap a potentially multiline raw string in a span, preserving newlines
  // so that _buildLines can split on them correctly.
  _spanMultiline(raw, cls) {
    return raw
      .split('\n')
      .map(part => `<span class="${cls}">${this._escape(part)}</span>`)
      .join('\n');
  }

  _colorTag(tagSrc) {
    let out = '<span class="tg">';
    let i = 0;

    while (i < tagSrc.length) {
      const ch = tagSrc[i];

      if (ch === '\n') {
        // Close the tg span across the newline so _buildLines splits cleanly
        out += '</span>\n<span class="tg">';
        i++;
        continue;
      }

      if (ch === '"' || ch === "'") {
        const q = ch;
        let j = i + 1;
        while (j < tagSrc.length && tagSrc[j] !== q) {
          if (tagSrc[j] === '\\') j++;
          j++;
        }
        const strRaw = tagSrc.slice(i, j + 1);
        out += `</span>${this._spanMultiline(strRaw, 'str')}<span class="tg">`;
        i = j + 1;
        continue;
      }

      out += this._escape(ch);
      i++;
    }

    out += '</span>';
    return out;
  }

  _buildLines(highlighted) {
    const hasLineNumbers = !this.hasAttribute('no-lines');
    
    if (hasLineNumbers) {
      return highlighted.split('\n').map((line, i) =>
        `<span class="line"><span class="ln">${i + 1}</span><span>${line || ' '}</span></span>`
      ).join('');
    } else {
      return highlighted.split('\n').map(line =>
        `<span class="line"><span>${line || ' '}</span></span>`
      ).join('');
    }
  }

  _render(highlighted, lang) {
    const hasToolbar = !this.hasAttribute('no-toolbar');
    const hasLineNumbers = !this.hasAttribute('no-lines');
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
          --luna-code-bg: #161618;
          --luna-code-border: #2a2a2d;
          --luna-code-toolbar-bg: #1c1c1f;
          --luna-code-text: #b0b8c4;
          --luna-code-comment: #5a8f5a;
          --luna-code-line-number: #333;
          --luna-code-radius: 8px;
          --luna-code-font-size: 0.82rem;
          --luna-code-line-height: 1.65;
          --luna-code-padding: 1.2rem 1.4rem;
        }

        .wrapper {
          background: var(--luna-code-bg);
          border: 1px solid var(--luna-code-border);
          border-radius: var(--luna-code-radius);
          overflow: hidden;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
        }

        .toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.55rem 1rem;
          background: var(--luna-code-toolbar-bg);
          border-bottom: 1px solid var(--luna-code-border);
          user-select: none;
        }

        .toolbar.hidden {
          display: none;
        }

        .dots {
          display: flex;
          gap: 6px;
        }

        .dot {
          width: 11px;
          height: 11px;
          border-radius: 50%;
        }

        .dot-r {
          background: #ff5f57;
        }

        .dot-y {
          background: #ffbd2e;
        }

        .dot-g {
          background: #28c840;
        }

        .lang-badge {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #444;
          font-family: inherit;
        }

        .copy-btn {
          background: none;
          border: 1px solid #333;
          border-radius: 4px;
          color: #555;
          font-size: 0.65rem;
          font-family: inherit;
          letter-spacing: 0.06em;
          padding: 2px 8px;
          cursor: pointer;
          transition: color 0.15s, border-color 0.15s;
        }

        .copy-btn:hover {
          color: #aaa;
          border-color: #555;
        }

        .copy-btn.copied {
          color: #4caf7d;
          border-color: #4caf7d;
        }

        .scroll {
          overflow-x: auto;
          padding: var(--luna-code-padding);
        }

        pre {
          margin: 0;
          padding: 0;
          white-space: pre;
          tab-size: 2;
          font-size: var(--luna-code-font-size);
          line-height: var(--luna-code-line-height);
        }

        code {
          color: #ffffff;
          display: block;
        }

        .cm {
          color: #5a9e5a;
          font-style: italic;
        }

        .tg {
          color: #6ab0f5;
        }

        .str {
          color: #e06c6c;
        }

        .pl {
          color: #ffffff;
        }

        .line {
          display: ${hasLineNumbers ? 'grid' : 'block'};
          grid-template-columns: ${hasLineNumbers ? '2.4em 1fr' : '1fr'};
          gap: ${hasLineNumbers ? '0.8em' : '0'};
          min-height: calc(var(--luna-code-line-height) * 1em);
        }

        .ln {
          color: var(--luna-code-line-number);
          text-align: right;
          user-select: none;
          flex-shrink: 0;
        }
      </style>

      <div class="wrapper">
        <div class="toolbar ${hasToolbar ? '' : 'hidden'}">
          <div class="dots">
            <div class="dot dot-r"></div>
            <div class="dot dot-y"></div>
            <div class="dot dot-g"></div>
          </div>
          <span class="lang-badge" id="langBadge">${this._escape(lang)}</span>
          <button class="copy-btn" id="copyBtn">copy</button>
        </div>
        <div class="scroll">
          <pre><code id="codeEl">${this._buildLines(highlighted)}</code></pre>
        </div>
      </div>
    `;

    const copyBtn = this.shadowRoot.getElementById('copyBtn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        this._handleCopy();
      });
    }
  }

  _handleCopy() {
    const code = this._dedent(this._originalCode).trim();
    
    navigator.clipboard.writeText(code).then(() => {
      const btn = this.shadowRoot.getElementById('copyBtn');
      if (btn) {
        btn.textContent = 'copied!';
        btn.classList.add('copied');
        
        setTimeout(() => {
          btn.textContent = 'copy';
          btn.classList.remove('copied');
        }, 1800);
      }
      
      this.dispatchEvent(new CustomEvent('luna-copy', {
        bubbles: true,
        composed: true,
        detail: { code }
      }));
    });
  }
}

customElements.define('luna-code', LunaCode);
