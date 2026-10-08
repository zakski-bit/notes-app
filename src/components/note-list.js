import Swal from 'sweetalert2';
import NotesApi from '../api/notes-api';

/**
 * Komponen Web Component: <note-list>
 * Menyusun daftar catatan menggunakan CSS Grid Layout bergaya Syncscribe,
 * lengkap dengan bagian 'My Notes' dan 'Recent Folders'.
 */
class NoteList extends HTMLElement {
  constructor() {
    super();
    this._notes = [];
    this._filter = 'active'; // 'active', 'archived', 'all'
    this._searchKeyword = '';
    this._activeFolder = null;
  }

  connectedCallback() {
    this.render();
    this._setupEventListeners();
    this.fetchNotesFromApi();
  }

  set filter(value) {
    this._filter = value;
    this.fetchNotesFromApi();
  }

  set searchKeyword(keyword) {
    this._searchKeyword = keyword;
    this._updateList();
  }

  async fetchNotesFromApi() {
    const loadingIndicator = document.querySelector('loading-indicator');

    try {
      if (loadingIndicator) {
        loadingIndicator.show('Mengambil catatan dari server...');
      }

      let data = [];
      if (this._filter === 'active') {
        data = await NotesApi.getNotes();
      } else if (this._filter === 'archived') {
        data = await NotesApi.getArchivedNotes();
      } else {
        const [activeNotes, archivedNotes] = await Promise.all([
          NotesApi.getNotes(),
          NotesApi.getArchivedNotes(),
        ]);
        data = [...activeNotes, ...archivedNotes];
      }

      this._notes = data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      this._updateList();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Memuat Catatan',
        text:
          error.message ||
          'Terjadi kendala saat menghubungkan ke RESTful API Dicoding.',
        confirmButtonColor: '#0f172a',
      });
      this._notes = [];
      this._updateList();
    } finally {
      if (loadingIndicator) {
        loadingIndicator.hide();
      }
    }
  }

  render() {
    this.innerHTML = `
      <div class="sync-dashboard-content">
        <!-- Section: My Notes -->
        <section class="sync-section my-notes-section">
          <div class="sync-section-header">
            <div class="sync-header-title-box">
              <h2 class="sync-title">My Notes</h2>
              <span id="notesCountBadge" class="sync-count-pill">0 Notes</span>
            </div>

            <!-- Controls: Search & Time/Tab Filters -->
            <div class="sync-controls">
              <!-- Search Box -->
              <div class="sync-search-wrapper">
                <svg viewBox="0 0 24 24" class="sync-search-icon" aria-hidden="true">
                  <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
                <input
                  type="search"
                  id="searchNotesInput"
                  class="sync-search-input"
                  placeholder="Cari catatan..."
                  aria-label="Cari catatan"
                />
              </div>

              <!-- Segmented Tab Group (Syncscribe Pill Controls) -->
              <div class="sync-segmented-tabs" role="tablist">
                <button type="button" class="sync-tab-pill active" data-filter="active" role="tab">Aktif</button>
                <button type="button" class="sync-tab-pill" data-filter="archived" role="tab">Arsip</button>
                <button type="button" class="sync-tab-pill" data-filter="all" role="tab">Semua</button>
              </div>
            </div>
          </div>

          <!-- Active Filter Tag Notice -->
          <div id="filterNotice" class="sync-filter-notice" style="display: none;">
            <span>Menampilkan folder: <strong id="filterFolderText"></strong></span>
            <button type="button" id="btnClearFolderFilter" class="btn-clear-filter">Reset Filter &times;</button>
          </div>

          <!-- Notes CSS Grid Layout (Kriteria Wajib 3) -->
          <div id="notesGrid" class="sync-notes-grid">
            <!-- Komponen <note-item> akan di-render di sini secara dinamis -->
          </div>

          <!-- Empty State -->
          <div id="emptyState" class="sync-empty-state" style="display: none;">
            <div class="empty-state-bubble">
              <svg viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
              </svg>
            </div>
            <h3 class="empty-title">Tidak ada catatan ditemukan</h3>
            <p class="empty-desc">Belum ada catatan yang tersimpan atau hasil pencarian tidak cocok.</p>
          </div>
        </section>

        <!-- Section: Recent Folders (Syncscribe Bottom Area) -->
        <section class="sync-section recent-folders-section">
          <div class="sync-section-header">
            <h2 class="sync-title">Recent Folders</h2>
            <div class="sync-segmented-tabs">
              <button type="button" class="sync-tab-pill active">All</button>
              <button type="button" class="sync-tab-pill">Recent</button>
              <button type="button" class="sync-tab-pill">Last modified</button>
            </div>
          </div>

          <div class="sync-folders-carousel">
            <div class="sync-folders-row">
              <!-- Folder 1: Bucket List (BL) -->
              <div class="sync-folder-card" data-folder="Bucket List">
                <div class="folder-graphic folder-orange">
                  <div class="folder-tab"></div>
                  <div class="folder-body">
                    <span class="folder-code">BL</span>
                  </div>
                </div>
                <span class="folder-label">Bucket List</span>
              </div>

              <!-- Folder 2: Finances (Fi) -->
              <div class="sync-folder-card" data-folder="Finances">
                <div class="folder-graphic folder-orange">
                  <div class="folder-tab"></div>
                  <div class="folder-body">
                    <span class="folder-code">Fi</span>
                  </div>
                </div>
                <span class="folder-label">Finances</span>
              </div>

              <!-- Folder 3: Travel Plans (TP) -->
              <div class="sync-folder-card" data-folder="Travel Plans">
                <div class="folder-graphic folder-orange">
                  <div class="folder-tab"></div>
                  <div class="folder-body">
                    <span class="folder-code">TP</span>
                  </div>
                </div>
                <span class="folder-label">Travel Plans</span>
              </div>

              <!-- Folder 4: Shopping (Sh) -->
              <div class="sync-folder-card" data-folder="Shopping">
                <div class="folder-graphic folder-orange">
                  <div class="folder-tab"></div>
                  <div class="folder-body">
                    <span class="folder-code">Sh</span>
                  </div>
                </div>
                <span class="folder-label">Shopping</span>
              </div>

              <!-- Folder 5: Personal (Pe) -->
              <div class="sync-folder-card" data-folder="Personal">
                <div class="folder-graphic folder-orange">
                  <div class="folder-tab"></div>
                  <div class="folder-body">
                    <span class="folder-code">Pe</span>
                  </div>
                </div>
                <span class="folder-label">Personal</span>
              </div>
            </div>

            <!-- Carousel Next Arrow -->
            <button type="button" class="sync-carousel-arrow" id="btnNextFolder" aria-label="Lihat folder selanjutnya">
              <svg viewBox="0 0 24 24">
                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
              </svg>
            </button>
          </div>
        </section>
      </div>
    `;
  }

  _setupEventListeners() {
    const searchInput = this.querySelector('#searchNotesInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchKeyword = e.target.value;
      });
    }

    // Segmented tab filter
    const tabButtons = this.querySelectorAll(
      '.my-notes-section .sync-tab-pill'
    );
    tabButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        tabButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.filter = btn.getAttribute('data-filter');
      });
    });

    // Recent Folder cards click
    const folderCards = this.querySelectorAll('.sync-folder-card');
    folderCards.forEach((card) => {
      card.addEventListener('click', () => {
        const folderName = card.getAttribute('data-folder');
        if (this._activeFolder === folderName) {
          this._activeFolder = null;
          card.classList.remove('active');
        } else {
          folderCards.forEach((c) => c.classList.remove('active'));
          card.classList.add('active');
          this._activeFolder = folderName;
        }
        this._updateList();
      });
    });

    const btnClear = this.querySelector('#btnClearFolderFilter');
    if (btnClear) {
      btnClear.addEventListener('click', () => {
        this._activeFolder = null;
        folderCards.forEach((c) => c.classList.remove('active'));
        this._updateList();
      });
    }

    // Listeners untuk Custom Events dari Sidebar / App-Bar
    document.addEventListener('switch-tab', (e) => {
      const tab = e.detail && e.detail.tab;
      if (tab) {
        tabButtons.forEach((btn) => {
          if (btn.getAttribute('data-filter') === tab) {
            btn.click();
          }
        });
      }
    });

    document.addEventListener('focus-search', () => {
      if (searchInput) {
        searchInput.focus();
        searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });

    document.addEventListener('filter-by-folder', (e) => {
      const tag = e.detail && e.detail.tag;
      if (tag) {
        this._activeFolder = tag;
        this._updateList();
      }
    });

    document.addEventListener('show-api-info', () => {
      Swal.fire({
        title: 'Dicoding Notes API v2',
        html: `
          <div style="text-align: left; font-size: 0.9rem; line-height: 1.6; color: #334155;">
            <p><strong>Base URL:</strong> <code>https://notes-api.dicoding.dev/v2</code></p>
            <p style="margin-top: 0.5rem;"><strong>Endpoint Terintegrasi:</strong></p>
            <ul style="padding-left: 1.25rem; margin-top: 0.35rem;">
              <li><code>GET /notes</code> &mdash; Catatan aktif</li>
              <li><code>GET /notes/archived</code> &mdash; Catatan arsip</li>
              <li><code>POST /notes</code> &mdash; Simpan catatan baru</li>
              <li><code>DELETE /notes/{id}</code> &mdash; Hapus catatan</li>
              <li><code>POST /notes/{id}/archive</code> &mdash; Arsipkan catatan</li>
              <li><code>POST /notes/{id}/unarchive</code> &mdash; Batal arsip</li>
            </ul>
          </div>
        `,
        icon: 'info',
        confirmButtonColor: '#0f172a',
      });
    });

    document.addEventListener('show-settings-info', () => {
      Swal.fire({
        title: 'Pengaturan & Teknologi',
        html: `
          <div style="text-align: left; font-size: 0.9rem; line-height: 1.6; color: #334155;">
            <p><strong>Arsitektur:</strong> Web Components (Custom Elements, Shadow DOM)</p>
            <p><strong>Layout:</strong> CSS Grid & Flexbox</p>
            <p><strong>Build Tool:</strong> Webpack 5 (Babel, HtmlWebpackPlugin, StyleLoader, CssLoader)</p>
            <p><strong>Deployment:</strong> Netlify CI/CD dari GitHub</p>
          </div>
        `,
        icon: 'info',
        confirmButtonColor: '#0f172a',
      });
    });

    document.addEventListener('note-created', () => {
      this.fetchNotesFromApi();
    });

    document.addEventListener('note-deleted', () => {
      this.fetchNotesFromApi();
    });

    document.addEventListener('note-archived-toggled', () => {
      this.fetchNotesFromApi();
    });
  }

  _updateList() {
    const gridContainer = this.querySelector('#notesGrid');
    const emptyState = this.querySelector('#emptyState');
    const countBadge = this.querySelector('#notesCountBadge');
    const filterNotice = this.querySelector('#filterNotice');
    const filterFolderText = this.querySelector('#filterFolderText');

    if (!gridContainer) return;

    let filteredNotes = this._notes;

    // Filter berdasarkan folder yang dipilih
    if (this._activeFolder) {
      if (filterNotice && filterFolderText) {
        filterNotice.style.display = 'flex';
        filterFolderText.textContent = this._activeFolder;
      }
      const folderKey = this._activeFolder.toLowerCase();
      filteredNotes = filteredNotes.filter((note) => {
        const title = (note.title || '').toLowerCase();
        const body = (note.body || '').toLowerCase();
        return title.includes(folderKey) || body.includes(folderKey);
      });
    } else {
      if (filterNotice) filterNotice.style.display = 'none';
    }

    // Filter berdasarkan kata kunci pencarian
    if (this._searchKeyword.trim()) {
      const keyword = this._searchKeyword.toLowerCase().trim();
      filteredNotes = filteredNotes.filter(
        (note) =>
          (note.title && note.title.toLowerCase().includes(keyword)) ||
          (note.body && note.body.toLowerCase().includes(keyword))
      );
    }

    if (countBadge) {
      countBadge.textContent = `${filteredNotes.length} Notes`;
    }

    if (filteredNotes.length === 0) {
      gridContainer.innerHTML = '';
      emptyState.style.display = 'flex';
      return;
    }

    emptyState.style.display = 'none';
    gridContainer.innerHTML = '';

    filteredNotes.forEach((noteData, index) => {
      const noteItem = document.createElement('note-item');
      noteItem.note = noteData;
      noteItem.setAttribute('note-id', noteData.id);
      noteItem.setAttribute('title', noteData.title);
      noteItem.setAttribute('created-at', noteData.createdAt);
      noteItem.setAttribute('archived', noteData.archived ? 'true' : 'false');

      // Animasi kemunculan kartu
      noteItem.style.animationDelay = `${Math.min(index * 0.05, 0.4)}s`;
      noteItem.classList.add('note-item-animate');

      gridContainer.appendChild(noteItem);
    });
  }
}

customElements.define('note-list', NoteList);
