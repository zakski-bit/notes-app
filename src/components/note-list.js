import Swal from 'sweetalert2';
import NotesApi from '../api/notes-api';

/**
 * Komponen Web Component: <note-list>
 * Menyusun daftar catatan menggunakan CSS Grid Layout dan mengambil data langsung dari RESTful API.
 */
class NoteList extends HTMLElement {
  constructor() {
    super();
    this._notes = [];
    this._filter = 'active'; // 'active', 'archived', 'all'
    this._searchKeyword = '';
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
        // Ambil keduanya untuk tab 'Semua'
        const [activeNotes, archivedNotes] = await Promise.all([
          NotesApi.getNotes(),
          NotesApi.getArchivedNotes(),
        ]);
        data = [...activeNotes, ...archivedNotes];
      }

      // Urutkan berdasarkan tanggal terbaru
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
        confirmButtonColor: '#4f46e5',
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
      <section class="notes-section">
        <div class="notes-header-bar">
          <div class="section-title-wrapper">
            <h2 class="section-title">Daftar Catatan</h2>
            <span id="notesCountBadge" class="notes-count">0 Catatan</span>
          </div>

          <!-- Filter Tabs & Pencarian -->
          <div class="filter-controls">
            <div class="search-box">
              <svg viewBox="0 0 24 24" class="search-icon" aria-hidden="true">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              <input
                type="search"
                id="searchNotesInput"
                class="search-input"
                placeholder="Cari berdasarkan judul atau isi..."
                aria-label="Cari catatan"
              />
            </div>

            <div class="tab-group" role="tablist">
              <button type="button" class="tab-btn active" data-filter="active" role="tab">Aktif</button>
              <button type="button" class="tab-btn" data-filter="archived" role="tab">Arsip</button>
              <button type="button" class="tab-btn" data-filter="all" role="tab">Semua</button>
            </div>
          </div>
        </div>

        <!-- Grid Container untuk Catatan (CSS Grid Layout - Kriteria Wajib 3) -->
        <div id="notesGrid" class="notes-grid">
          <!-- Item <note-item> akan di-render di sini secara dinamis -->
        </div>

        <!-- State Kosong (Empty State) -->
        <div id="emptyState" class="empty-state" style="display: none;">
          <div class="empty-state-icon">
            <svg viewBox="0 0 24 24">
              <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-2.14 2.14-2.14-2.14a.996.996 0 10-1.41 1.41l2.85 2.85c.39.39 1.02.39 1.41 0l2.85-2.85a.996.996 0 00-1.42-1.41z"/>
            </svg>
          </div>
          <h3 class="empty-state-title">Tidak ada catatan ditemukan</h3>
          <p class="empty-state-desc">Belum ada catatan di bagian ini atau tidak ada catatan yang sesuai dengan kata kunci pencarian Anda.</p>
        </div>
      </section>
    `;
  }

  _setupEventListeners() {
    const searchInput = this.querySelector('#searchNotesInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchKeyword = e.target.value;
      });
    }

    const tabButtons = this.querySelectorAll('.tab-btn');
    tabButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        tabButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.filter = btn.getAttribute('data-filter');
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

    if (!gridContainer) return;

    let filteredNotes = this._notes;
    if (this._searchKeyword.trim()) {
      const keyword = this._searchKeyword.toLowerCase().trim();
      filteredNotes = filteredNotes.filter(
        (note) =>
          (note.title && note.title.toLowerCase().includes(keyword)) ||
          (note.body && note.body.toLowerCase().includes(keyword))
      );
    }

    if (countBadge) {
      countBadge.textContent = `${filteredNotes.length} Catatan`;
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

      // Animasi kemunculan kartu (Kriteria Opsional 3)
      noteItem.style.animationDelay = `${Math.min(index * 0.05, 0.5)}s`;
      noteItem.classList.add('note-item-animate');

      gridContainer.appendChild(noteItem);
    });
  }
}

customElements.define('note-list', NoteList);
