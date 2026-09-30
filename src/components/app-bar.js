/**
 * Komponen Web Component: <app-bar>
 * Memanfaatkan Shadow DOM dan Custom Attribute (Kriteria Wajib 1, 4 & Kriteria Opsional 3).
 */
class AppBar extends HTMLElement {
  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['title', 'caption'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }

  connectedCallback() {
    this.render();
  }

  get title() {
    return this.getAttribute('title') || 'Notes App API';
  }

  get caption() {
    return (
      this.getAttribute('caption') ||
      'Kelola ide dan catatan terintegrasi dengan RESTful API'
    );
  }

  render() {
    this._shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          color: #f8fafc;
          box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.25);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .brand-wrapper {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .brand-icon {
          width: 42px;
          height: 42px;
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
          flex-shrink: 0;
        }

        .brand-icon svg {
          width: 24px;
          height: 24px;
          fill: currentColor;
        }

        .brand-text h1 {
          font-size: 1.35rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin: 0;
          color: #ffffff;
          line-height: 1.2;
        }

        .brand-text p {
          font-size: 0.82rem;
          color: #94a3b8;
          margin: 0.15rem 0 0;
          font-weight: 400;
        }

        .badge-live {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.75rem;
          font-weight: 500;
          padding: 0.35rem 0.75rem;
          border-radius: 9999px;
          background-color: rgba(99, 102, 241, 0.18);
          color: #a5b4fc;
          border: 1px solid rgba(165, 180, 252, 0.25);
        }

        .dot-indicator {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background-color: #34d399;
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.15); }
        }

        @media (max-width: 640px) {
          .header-container {
            padding: 0.85rem 1rem;
          }
          .brand-text h1 {
            font-size: 1.15rem;
          }
          .brand-text p {
            display: none;
          }
          .badge-live {
            font-size: 0.7rem;
            padding: 0.25rem 0.5rem;
          }
        }
      </style>

      <header class="header-container">
        <div class="brand-wrapper">
          <div class="brand-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
            </svg>
          </div>
          <div class="brand-text">
            <h1>${this.title}</h1>
            <p>${this.caption}</p>
          </div>
        </div>
        <div class="badge-live">
          <span class="dot-indicator"></span>
          <span>RESTful API Connected</span>
        </div>
      </header>
    `;
  }
}

customElements.define('app-bar', AppBar);
