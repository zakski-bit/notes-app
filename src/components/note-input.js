import Swal from 'sweetalert2';
import NotesApi from '../api/notes-api';

/**
 * Komponen Web Component: <note-input>
 * Menangani formulir tambah catatan dengan Realtime Validation dan integrasi RESTful API.
 */
class NoteInput extends HTMLElement {
  constructor() {
    super();
    this._maxTitleLength = 50;
    this._minBodyLength = 5;
  }

  connectedCallback() {
    this.render();
    this._initElements();
    this._setupEventListeners();
  }

  render() {
    this.innerHTML = `
      <section class="card note-input-card">
        <div class="note-input-header">
          <div class="input-header-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
            </svg>
          </div>
          <div>
            <h2 class="note-input-title">Buat Catatan Baru</h2>
            <p class="note-input-subtitle">Catatan akan disimpan langsung ke server melalui RESTful API.</p>
          </div>
        </div>

        <form id="addNoteForm" novalidate>
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
              placeholder="Contoh: Rencana Belajar Webpack"
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
  }

  _initElements() {
    this._form = this.querySelector('#addNoteForm');
    this._titleInput = this.querySelector('#noteTitle');
    this._titleCounter = this.querySelector('#titleCounter');
    this._titleError = this.querySelector('#titleError');

    this._bodyInput = this.querySelector('#noteBody');
    this._bodyCounter = this.querySelector('#bodyCounter');
    this._bodyError = this.querySelector('#bodyError');

    this._submitBtn = this.querySelector('#submitBtn');
  }

  _setupEventListeners() {
    // Realtime validation untuk judul
    this._titleInput.addEventListener('input', () => {
      this._validateTitle();
    });

    this._titleInput.addEventListener('blur', () => {
      this._validateTitle(true);
    });

    // Realtime validation untuk isi catatan
    this._bodyInput.addEventListener('input', () => {
      this._validateBody();
    });

    this._bodyInput.addEventListener('blur', () => {
      this._validateBody(true);
    });

    // Handle submit formulir
    this._form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const isTitleValid = this._validateTitle(true);
      const isBodyValid = this._validateBody(true);

      if (!isTitleValid || !isBodyValid) {
        if (!isTitleValid) this._titleInput.focus();
        else this._bodyInput.focus();
        return;
      }

      const noteData = {
        title: this._titleInput.value.trim(),
        body: this._bodyInput.value.trim(),
      };

      const loadingIndicator = document.querySelector('loading-indicator');

      try {
        // Tampilkan indikator loading (Kriteria Wajib 5)
        if (loadingIndicator) {
          loadingIndicator.show('Menyimpan catatan ke server...');
        }
        this._submitBtn.disabled = true;

        // Mengirim request ke RESTful API (Kriteria Wajib 2 & 4)
        const createdNote = await NotesApi.createNote(noteData);

        // Reset form
        this._resetForm();

        // Notifikasi sukses (Kriteria Opsional 2)
        Swal.fire({
          icon: 'success',
          title: 'Berhasil Disimpan!',
          text: 'Catatan baru Anda berhasil tersimpan di server.',
          timer: 1600,
          showConfirmButton: false,
        });

        // Trigger event agar daftar catatan diperbarui secara otomatis
        document.dispatchEvent(
          new CustomEvent('note-created', {
            detail: { note: createdNote },
            bubbles: true,
          })
        );
      } catch (error) {
        // Notifikasi kegagalan / error feedback (Kriteria Opsional 2)
        Swal.fire({
          icon: 'error',
          title: 'Gagal Menyimpan Catatan',
          text:
            error.message ||
            'Terjadi kendala pada jaringan atau server. Silakan coba lagi.',
          confirmButtonColor: '#4f46e5',
        });
      } finally {
        // Pastikan loading indicator selalu disembunyikan di blok finally
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
  }
}

customElements.define('note-input', NoteInput);
