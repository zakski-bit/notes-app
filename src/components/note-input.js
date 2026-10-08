import Swal from 'sweetalert2';
import NotesApi from '../api/notes-api';

/**
 * Komponen Web Component: <note-input>
 * Menangani formulir tambah catatan dengan Realtime Validation,
 * pemilih folder / kategori dinamis, dan integrasi RESTful API.
 */
class NoteInput extends HTMLElement {
  constructor() {
    super();
    this._maxTitleLength = 50;
    this._minBodyLength = 5;
    this._isOpen = false;
    this._selectedFolder = 'General';
    this._folders = this._loadFolders();
  }

  connectedCallback() {
    this.render();
    this._initElements();
    this._setupEventListeners();

    // Listen to folders updated from sidebar
    document.addEventListener('folders-updated', (e) => {
      if (e.detail && e.detail.folders) {
        this._folders = e.detail.folders;
        this._renderFolderPills();
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

  render() {
    this.innerHTML = `
      <section class="card note-input-card ${this._isOpen ? 'is-open' : ''}" id="noteInputContainer">
        <div class="note-input-toggle-bar" id="noteInputToggleBar">
          <div class="toggle-bar-left">
            <div class="input-header-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
            </div>
            <div>
              <h2 class="note-input-title">Buat Catatan Baru</h2>
              <p class="note-input-subtitle">Tuliskan ide, memo, atau rencana kerja Anda ke server.</p>
            </div>
          </div>
          <button type="button" class="btn-toggle-form" id="btnToggleForm" aria-label="Buka tutup formulir">
            <span class="toggle-text">${this._isOpen ? 'Tutup Formulir' : '+ Buka Formulir'}</span>
            <svg viewBox="0 0 24 24" class="toggle-chevron ${this._isOpen ? 'rotated' : ''}">
              <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
            </svg>
          </button>
        </div>

        <form id="addNoteForm" class="note-form ${this._isOpen ? 'form-expanded' : 'form-collapsed'}" novalidate>
          <!-- Pemilih Folder / Kategori -->
          <div class="form-group">
            <div class="label-wrapper">
              <label class="form-label">Pilih Folder / Kategori</label>
              <span class="folder-selected-hint" id="folderSelectedHint">Folder: <strong>${this._selectedFolder}</strong></span>
            </div>
            <div class="folder-pill-selector" id="folderPillSelector">
              <!-- Render pills dinamis -->
            </div>
          </div>

          <!-- Input Judul -->
          <div class="form-group">
            <div class="label-wrapper">
              <label for="noteTitle" class="form-label">Judul Catatan <span class="required">*</span></label>
              <span id="titleCounter" class="char-counter" aria-live="polite">Sisa karakter: ${this._maxTitleLength}</span>
            </div>
            <input
              type="text"
              id="noteTitle"
              class="form-control"
              placeholder="Contoh: Rencana Belajar Webpack & Web Components"
              maxlength="${this._maxTitleLength}"
              required
              autocomplete="off"
            />
            <div id="titleError" class="validation-message" aria-live="polite"></div>
          </div>

          <!-- Input Isi (Body) -->
          <div class="form-group">
            <div class="label-wrapper">
              <label for="noteBody" class="form-label">Isi Catatan <span class="required">*</span></label>
              <span id="bodyCounter" class="char-counter" aria-live="polite">0 karakter (min. ${this._minBodyLength})</span>
            </div>
            <textarea
              id="noteBody"
              class="form-control textarea-control"
              placeholder="Tuliskan isi atau detail catatan Anda di sini..."
              rows="4"
              required
            ></textarea>
            <div id="bodyError" class="validation-message" aria-live="polite"></div>
          </div>

          <!-- Tombol Aksi -->
          <div class="form-actions">
            <button type="button" id="btnCancelForm" class="btn btn-secondary">
              Batal
            </button>
            <button type="submit" id="submitBtn" class="btn btn-primary">
              <svg viewBox="0 0 24 24" class="btn-icon">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
              <span>Simpan Catatan</span>
            </button>
          </div>
        </form>
      </section>
    `;

    this._renderFolderPills();
  }

  _renderFolderPills() {
    const container = this.querySelector('#folderPillSelector');
    if (!container) return;

    const allOptions = ['General', ...this._folders];
    const uniqueOptions = Array.from(new Set(allOptions));

    container.innerHTML = uniqueOptions
      .map(
        (folder) => `
        <button
          type="button"
          class="folder-chip ${folder === this._selectedFolder ? 'active' : ''}"
          data-folder="${folder}"
        >
          📁 ${folder}
        </button>
      `
      )
      .join('');

    const chips = container.querySelectorAll('.folder-chip');
    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        chips.forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
        this._selectedFolder = chip.getAttribute('data-folder');
        const hint = this.querySelector('#folderSelectedHint');
        if (hint) {
          hint.innerHTML = `Folder: <strong>${this._selectedFolder}</strong>`;
        }
      });
    });
  }

  _initElements() {
    this._container = this.querySelector('#noteInputContainer');
    this._form = this.querySelector('#addNoteForm');
    this._toggleBtn = this.querySelector('#btnToggleForm');
    this._toggleBar = this.querySelector('#noteInputToggleBar');
    this._cancelBtn = this.querySelector('#btnCancelForm');

    this._titleInput = this.querySelector('#noteTitle');
    this._titleCounter = this.querySelector('#titleCounter');
    this._titleError = this.querySelector('#titleError');

    this._bodyInput = this.querySelector('#noteBody');
    this._bodyCounter = this.querySelector('#bodyCounter');
    this._bodyError = this.querySelector('#bodyError');

    this._submitBtn = this.querySelector('#submitBtn');
  }

  setOpen(open, preselectedFolder = null) {
    this._isOpen = open;
    if (preselectedFolder) {
      this._selectedFolder = preselectedFolder;
      this._renderFolderPills();
      const hint = this.querySelector('#folderSelectedHint');
      if (hint) {
        hint.innerHTML = `Folder: <strong>${this._selectedFolder}</strong>`;
      }
    }

    if (this._container && this._form) {
      if (this._isOpen) {
        this._container.classList.add('is-open');
        this._form.classList.remove('form-collapsed');
        this._form.classList.add('form-expanded');
        this.querySelector('.toggle-text').textContent = 'Tutup Formulir';
        this.querySelector('.toggle-chevron').classList.add('rotated');
      } else {
        this._container.classList.remove('is-open');
        this._form.classList.add('form-collapsed');
        this._form.classList.remove('form-expanded');
        this.querySelector('.toggle-text').textContent = '+ Buka Formulir';
        this.querySelector('.toggle-chevron').classList.remove('rotated');
      }
    }
  }

  _setupEventListeners() {
    if (this._toggleBtn) {
      this._toggleBtn.addEventListener('click', () => {
        this.setOpen(!this._isOpen);
        if (this._isOpen && this._titleInput) {
          setTimeout(() => this._titleInput.focus(), 150);
        }
      });
    }

    if (this._cancelBtn) {
      this._cancelBtn.addEventListener('click', () => {
        this._resetForm();
        this.setOpen(false);
      });
    }

    // Mendengarkan custom event focus-create-note
    document.addEventListener('focus-create-note', (e) => {
      const folder = e.detail && e.detail.folder;
      this.setOpen(true, folder);
      if (this._titleInput) {
        this._container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => this._titleInput.focus(), 250);
      }
    });

    // Realtime validation
    this._titleInput.addEventListener('input', () => {
      this._validateTitle();
    });

    this._titleInput.addEventListener('blur', () => {
      this._validateTitle(true);
    });

    this._bodyInput.addEventListener('input', () => {
      this._validateBody();
    });

    this._bodyInput.addEventListener('blur', () => {
      this._validateBody(true);
    });

    // Handle form submit
    this._form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const isTitleValid = this._validateTitle(true);
      const isBodyValid = this._validateBody(true);

      if (!isTitleValid || !isBodyValid) {
        if (!isTitleValid) this._titleInput.focus();
        else this._bodyInput.focus();
        return;
      }

      // Format judul dengan tag folder jika bukan 'General'
      const rawTitle = this._titleInput.value.trim();
      const finalTitle =
        this._selectedFolder && this._selectedFolder !== 'General'
          ? `[${this._selectedFolder}] ${rawTitle}`
          : rawTitle;

      const noteData = {
        title: finalTitle,
        body: this._bodyInput.value.trim(),
      };

      const loadingIndicator = document.querySelector('loading-indicator');

      try {
        if (loadingIndicator) {
          loadingIndicator.show('Menyimpan catatan ke server...');
        }
        this._submitBtn.disabled = true;

        const createdNote = await NotesApi.createNote(noteData);

        this._resetForm();
        this.setOpen(false);

        Swal.fire({
          icon: 'success',
          title: 'Berhasil Disimpan!',
          text: `Catatan berhasil disimpan ke folder ${this._selectedFolder}.`,
          timer: 1600,
          showConfirmButton: false,
        });

        document.dispatchEvent(
          new CustomEvent('note-created', {
            detail: { note: createdNote },
            bubbles: true,
          })
        );
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Gagal Menyimpan Catatan',
          text:
            error.message ||
            'Terjadi kendala pada jaringan atau server. Silakan coba lagi.',
          confirmButtonColor: '#0f172a',
        });
      } finally {
        if (loadingIndicator) {
          loadingIndicator.hide();
        }
        this._submitBtn.disabled = false;
      }
    });
  }

  _validateTitle(forceCheck = false) {
    const value = this._titleInput.value;
    const remaining = this._maxTitleLength - value.length;

    this._titleCounter.textContent = `Sisa karakter: ${remaining}`;
    if (remaining <= 5 && remaining > 0) {
      this._titleCounter.className = 'char-counter warning';
    } else if (remaining === 0) {
      this._titleCounter.className = 'char-counter danger';
    } else {
      this._titleCounter.className = 'char-counter';
    }

    if (forceCheck || value.length > 0) {
      if (!value.trim()) {
        this._titleInput.classList.add('is-invalid');
        this._titleInput.classList.remove('is-valid');
        this._titleError.textContent = 'Judul catatan tidak boleh kosong!';
        return false;
      }

      this._titleInput.classList.remove('is-invalid');
      this._titleInput.classList.add('is-valid');
      this._titleError.textContent = '';
      return true;
    }

    this._titleInput.classList.remove('is-invalid', 'is-valid');
    this._titleError.textContent = '';
    return false;
  }

  _validateBody(forceCheck = false) {
    const value = this._bodyInput.value;
    const currentLength = value.length;

    this._bodyCounter.textContent = `${currentLength} karakter (min. ${this._minBodyLength})`;

    if (forceCheck || currentLength > 0) {
      if (!value.trim()) {
        this._bodyInput.classList.add('is-invalid');
        this._bodyInput.classList.remove('is-valid');
        this._bodyError.textContent = 'Isi catatan tidak boleh kosong!';
        return false;
      }

      if (value.trim().length < this._minBodyLength) {
        this._bodyInput.classList.add('is-invalid');
        this._bodyInput.classList.remove('is-valid');
        this._bodyError.textContent = `Isi catatan terlalu pendek (minimal ${this._minBodyLength} karakter).`;
        return false;
      }

      this._bodyInput.classList.remove('is-invalid');
      this._bodyInput.classList.add('is-valid');
      this._bodyError.textContent = '';
      return true;
    }

    this._bodyInput.classList.remove('is-invalid', 'is-valid');
    this._bodyError.textContent = '';
    return false;
  }

  _resetForm() {
    this._form.reset();
    this._titleInput.classList.remove('is-valid', 'is-invalid');
    this._bodyInput.classList.remove('is-valid', 'is-invalid');
    this._titleError.textContent = '';
    this._bodyError.textContent = '';
    this._titleCounter.textContent = `Sisa karakter: ${this._maxTitleLength}`;
    this._titleCounter.className = 'char-counter';
    this._bodyCounter.textContent = `0 karakter (min. ${this._minBodyLength})`;
    this._selectedFolder = 'General';
    this._renderFolderPills();
  }
}

customElements.define('note-input', NoteInput);
