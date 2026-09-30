/**
 * Entry Point Webpack: Notes App
 * Mengimpor stylesheet dan mendaftarkan seluruh Web Components.
 */

// Import Stylesheet agar diproses oleh Webpack (css-loader & style-loader)
import './styles/style.css';

// Import Web Components
import './components/loading-indicator';
import './components/app-bar';
import './components/note-input';
import './components/note-item';
import './components/note-list';
import './components/footer-bar';

document.addEventListener('DOMContentLoaded', () => {
  console.log(
    'Notes App (RESTful API & Webpack Edition) berhasil diinisialisasi!'
  );
});
