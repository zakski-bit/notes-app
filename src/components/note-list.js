import Swal from 'sweetalert2';
import NotesApi from '../api/notes-api';

/**
 * Komponen Web Component: <note-list>
 * Menyusun daftar catatan menggunakan CSS Grid Layout bergaya Syncscribe,
 * lengkap dengan pencarian real-time, sinkronisasi tab, Recent Folders dinamis,
 * penghitung jumlah catatan per folder, dan navigasi carousel.
 */
class NoteList extends HTMLElement {
  constructor() {
    super();
    this._notes = [];
    this._filter = 'active'; // 'active', 'archived', 'all'
    this._searchKeyword = '';
    this._activeFolder = null;
    this._folderSortMode = 'all'; // 'all', 'recent', 'modified'
    this._folders = this._loadFolders();
  }

  connectedCallback() {
    this.render();
    this._setupEventListeners();
    this.fetchNotesFromApi();

    // Listen to folders updated from sidebar
    document.addEventListener('folders-updated', (e) => {
      if (e.detail && e.detail.folders) {
        this._folders = e.detail.folders;
        this._renderRecentFolders();
      }
    });
  }

  _loadFolders() {
    const saved = localStorage.getItem('syncscribe_folders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback default
      }
    }
    return [
      'Bucket List',
      'Finances',
      'Travel Plans',
      'Shopping',
      'Personal',
      'Work',
      'Projects',
    ];
  }

  set filter(value) {
    this._filter = value;
    document.dispatchEvent(
      new CustomEvent('active-tab-changed', { detail: { tab: value } })
    );
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
      this._renderRecentFolders();
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

  _parseNoteFolder(note) {
    const title = note.title || '';
    const match = title.match(/^\[(.*?)\]\s*(.*)/);
    if (match) {
      return match[1];
    }
    // Fallback deteksi kata kunci di title atau body
    const lowerText = `${title} ${note.body || ''}`.toLowerCase();
    for (const f of this._folders) {
      if (lowerText.includes(f.toLowerCase())) {
        return f;
      }
    }
    return 'General';
  }

  _getFolderCode(name) {
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
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
                <button type="button" id="btnClearSearch" class="btn-clear-search" style="display: none;" title="Hapus pencarian">&times;</button>
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
            <div class="filter-notice-left">
              <span>Menampilkan folder: <strong id="filterFolderText"></strong></span>
              <span id="filterFolderCount" class="folder-badge-counter">0 catatan</span>
            </div>
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
            <h3 class="empty-title" id="emptyStateTitle">Tidak ada catatan ditemukan</h3>
            <p class="empty-desc" id="emptyStateDesc">Belum ada catatan yang tersimpan atau hasil pencarian tidak cocok.</p>
            <button type="button" class="btn-create-in-folder" id="btnCreateInFolder" style="display: none;">
              + Buat Catatan di Folder Ini
            </button>
          </div>
        </section>

        <!-- Section: Recent Folders (Syncscribe Bottom Area) -->
        <section class="sync-section recent-folders-section">
          <div class="sync-section-header">
            <h2 class="sync-title">Recent Folders</h2>
            <div class="sync-segmented-tabs folder-tabs">
              <button type="button" class="sync-tab-pill active" data-folder-mode="all">All</button>
              <button type="button" class="sync-tab-pill" data-folder-mode="recent">Recent</button>
              <button type="button" class="sync-tab-pill" data-folder-mode="modified">Last modified</button>
            </div>
          </div>

          <div class="sync-folders-carousel">
            <div class="sync-folders-row" id="foldersCarouselRow">
              <!-- Render daftar kartu folder secara dinamis -->
            </div>

            <!-- Carousel Next Arrow -->
            <button type="button" class="sync-carousel-arrow" id="btnNextFolder" aria-label="Geser folder selanjutnya" title="Geser folder">
              <svg viewBox="0 0 24 24">
                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
              </svg>
            </button>
          </div>
        </section>
      </div>
    `;

    this._renderRecentFolders();
  }

  _renderRecentFolders() {
    const row = this.querySelector('#foldersCarouselRow');
    if (!row) return;

    // Hitung jumlah catatan untuk masing-masing folder
    const folderStats = {};
    this._folders.forEach((f) => {
      folderStats[f] = { count: 0, lastDate: 0 };
    });

    this._notes.forEach((note) => {
      const folder = this._parseNoteFolder(note);
      if (folderStats[folder]) {
        folderStats[folder].count += 1;
        const noteTime = new Date(note.createdAt).getTime();
        if (noteTime > folderStats[folder].lastDate) {
          folderStats[folder].lastDate = noteTime;
        }
      }
    });

    let displayFolders = [...this._folders];

    if (this._folderSortMode === 'recent') {
      // Hanya tampilkan folder yang memiliki catatan
      displayFolders = displayFolders.filter((f) => folderStats[f].count > 0);
      if (displayFolders.length === 0) {
        displayFolders = this._folders.slice(0, 3);
      }
    } else if (this._folderSortMode === 'modified') {
      // Urutkan berdasarkan catatan termutakhir
      displayFolders.sort(
        (a, b) => folderStats[b].lastDate - folderStats[a].lastDate
      );
    }

    row.innerHTML = displayFolders
      .map((folder) => {
        const count = folderStats[folder] ? folderStats[folder].count : 0;
        const code = this._getFolderCode(folder);
        const isActive = this._activeFolder === folder;

        return `
          <div class="sync-folder-card ${isActive ? 'active' : ''}" data-folder="${folder}" title="${count} catatan di folder ${folder}">
            <div class="folder-graphic folder-orange">
              <div class="folder-tab"></div>
              <div class="folder-body">
                <span class="folder-code">${code}</span>
              </div>
            </div>
            <span class="folder-label">${folder}</span>
            <span class="folder-count-badge">${count} note${count === 1 ? '' : 's'}</span>
          </div>
        `;
      })
      .join('');

    // Re-attach event listeners untuk folder cards
    const cards = row.querySelectorAll('.sync-folder-card');
    cards.forEach((card) => {
      card.addEventListener('click', () => {
        const folderName = card.getAttribute('data-folder');
        if (this._activeFolder === folderName) {
          this._activeFolder = null;
          document.dispatchEvent(new CustomEvent('folder-filter-cleared'));
        } else {
          this._activeFolder = folderName;
          document.dispatchEvent(
            new CustomEvent('filter-by-folder', { detail: { tag: folderName } })
          );
        }
        this._updateList();
        this._renderRecentFolders();
      });
    });
  }

  _setupEventListeners() {
    const searchInput = this.querySelector('#searchNotesInput');
    const btnClearSearch = this.querySelector('#btnClearSearch');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchKeyword = e.target.value;
        if (btnClearSearch) {
          btnClearSearch.style.display = e.target.value ? 'block' : 'none';
        }
      });
    }

    if (btnClearSearch) {
      btnClearSearch.addEventListener('click', () => {
        if (searchInput) {
          searchInput.value = '';
          this.searchKeyword = '';
          btnClearSearch.style.display = 'none';
          searchInput.focus();
        }
      });
    }

    // Segmented tab filter (My Notes)
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

    // Segmented tab filter (Recent Folders mode)
    const folderModeBtns = this.querySelectorAll('.folder-tabs .sync-tab-pill');
    folderModeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        folderModeBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this._folderSortMode = btn.getAttribute('data-folder-mode');
        this._renderRecentFolders();
      });
    });

    // Tombol Next Arrow pada carousel
    const btnNextFolder = this.querySelector('#btnNextFolder');
    const foldersRow = this.querySelector('#foldersCarouselRow');
    if (btnNextFolder && foldersRow) {
      btnNextFolder.addEventListener('click', () => {
        const currentScroll = foldersRow.scrollLeft;
        const maxScroll = foldersRow.scrollWidth - foldersRow.clientWidth;
        if (currentScroll >= maxScroll - 10) {
          foldersRow.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          foldersRow.scrollBy({ left: 240, behavior: 'smooth' });
        }
      });
    }

    // Tombol reset filter folder
    const btnClearFolder = this.querySelector('#btnClearFolderFilter');
    if (btnClearFolder) {
      btnClearFolder.addEventListener('click', () => {
        this._activeFolder = null;
        document.dispatchEvent(new CustomEvent('folder-filter-cleared'));
        this._updateList();
        this._renderRecentFolders();
      });
    }

    // Tombol buat catatan di folder ini (pada empty state)
    const btnCreateInFolder = this.querySelector('#btnCreateInFolder');
    if (btnCreateInFolder) {
      btnCreateInFolder.addEventListener('click', () => {
        document.dispatchEvent(
          new CustomEvent('focus-create-note', {
            detail: { folder: this._activeFolder },
          })
        );
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
        this._renderRecentFolders();
      }
    });

    document.addEventListener('folder-filter-cleared', () => {
      this._activeFolder = null;
      this._updateList();
      this._renderRecentFolders();
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
    const emptyTitle = this.querySelector('#emptyStateTitle');
    const emptyDesc = this.querySelector('#emptyStateDesc');
    const btnCreateInFolder = this.querySelector('#btnCreateInFolder');
    const countBadge = this.querySelector('#notesCountBadge');
    const filterNotice = this.querySelector('#filterNotice');
    const filterFolderText = this.querySelector('#filterFolderText');
    const filterFolderCount = this.querySelector('#filterFolderCount');

    if (!gridContainer) return;

    let filteredNotes = this._notes;

    // Filter berdasarkan folder yang dipilih
    if (this._activeFolder) {
      filteredNotes = filteredNotes.filter((note) => {
        const folder = this._parseNoteFolder(note);
        return folder.toLowerCase() === this._activeFolder.toLowerCase();
      });

      if (filterNotice && filterFolderText && filterFolderCount) {
        filterNotice.style.display = 'flex';
        filterFolderText.textContent = this._activeFolder;
        filterFolderCount.textContent = `${filteredNotes.length} catatan`;
      }
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

      if (this._activeFolder) {
        emptyTitle.textContent = `Belum ada catatan di folder "${this._activeFolder}"`;
        emptyDesc.textContent = `Anda dapat langsung membuat catatan baru dan menyimpannya ke folder ini.`;
        if (btnCreateInFolder) {
          btnCreateInFolder.style.display = 'inline-flex';
          btnCreateInFolder.textContent = `+ Buat Catatan di Folder "${this._activeFolder}"`;
        }
      } else if (this._searchKeyword) {
        emptyTitle.textContent = 'Pencarian tidak ditemukan';
        emptyDesc.textContent = `Tidak ada catatan dengan kata kunci "${this._searchKeyword}".`;
        if (btnCreateInFolder) btnCreateInFolder.style.display = 'none';
      } else {
        emptyTitle.textContent = 'Tidak ada catatan';
        emptyDesc.textContent =
          this._filter === 'archived'
            ? 'Belum ada catatan yang diarsipkan.'
            : 'Belum ada catatan tersimpan. Klik "+ Create Note" untuk membuat catatan baru.';
        if (btnCreateInFolder) btnCreateInFolder.style.display = 'none';
      }
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
