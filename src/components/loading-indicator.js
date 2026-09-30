/**
 * Komponen Web Component: <loading-indicator>
 * Menampilkan indikator loading saat proses HTTP Request berlangsung (Kriteria Wajib 5).
 */
class LoadingIndicator extends HTMLElement {
  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['active', 'message'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }

  connectedCallback() {
    this.render();
  }

  show(message = 'Memproses data...') {
    this.setAttribute('message', message);
    this.setAttribute('active', 'true');
  }

  hide() {
    this.removeAttribute('active');
  }

  get isActive() {
    return this.getAttribute('active') === 'true';
  }

  get message() {
    return this.getAttribute('message') || 'Sedang memuat data...';
  }

  render() {
    this._shadowRoot.innerHTML = `
      <style>
        :host {
          display: ${this.isActive ? 'flex' : 'none'};
          position: fixed;
          inset: 0;
          background-color: rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(4px);
          z-index: 9999;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.2s ease-in-out forwards;
        }

        .spinner-card {
          background-color: #ffffff;
          padding: 1.5rem 2rem;
          border-radius: 16px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          gap: 1.25rem;
          max-width: 90%;
          border: 1px solid #e2e8f0;
          animation: popIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .spinner {
          width: 32px;
          height: 32px;
          border: 3.5px solid #e0e7ff;
          border-top-color: #4f46e5;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          flex-shrink: 0;
        }

        .loading-text {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 0.95rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes popIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      </style>

      <div class="spinner-card" role="status" aria-live="polite">
        <div class="spinner" aria-hidden="true"></div>
        <p class="loading-text">${this.message}</p>
      </div>
    `;
  }
}

customElements.define('loading-indicator', LoadingIndicator);
