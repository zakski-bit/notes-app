/**
 * Komponen Web Component: <footer-bar>
 * Footer aplikasi dengan informasi hak cipta dan submission Dicoding.
 */
class FooterBar extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  render() {
    const year = new Date().getFullYear();
    this.innerHTML = `
      <footer class="app-footer">
        <div class="footer-container">
          <p class="footer-text">
            &copy; ${year} <strong>Notes App</strong> &bull; Proyek Akhir: Integrasi Notes App dengan RESTful API.
          </p>
          <p class="footer-subtext">
            Dibangun dengan Vanilla JavaScript, Web Components, CSS Grid, dan Webpack.
          </p>
        </div>
      </footer>
    `;
  }
}

customElements.define('footer-bar', FooterBar);
