import Swal from 'sweetalert2';
import NotesApi from '../api/notes-api';

/**
 * Komponen Web Component: <note-item>
 * Menampilkan kartu catatan individual dengan custom attributes dan aksi API langsung.
 */
class NoteItem extends HTMLElement {
  constructor() {
    super();
    this._noteData = null;
  }

  static get observedAttributes() {
    return ['note-id', 'title', 'created-at', 'archived'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue && this.isConnected) {
      this.render();
      this._setupActions();
    }
  }

  connectedCallback() {
    this.render();
    this._setupActions();
  }

  set note(data) {
    this._noteData = data;
    if (data) {
      this.setAttribute('note-id', data.id || '');
      this.setAttribute('title', data.title || '');
      this.setAttribute('created-at', data.createdAt || '');
      this.setAttribute('archived', data.archived ? 'true' : 'false');
    }
    this.render();
    this._setupActions();
  }

  get note() {
    return this._noteData;
  }

  _escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  _formatDate(dateString) {
    if (!dateString) return '-';
    try {
      const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      };
      return new Date(dateString).toLocaleDateString('id-ID', options);
    } catch {
      return dateString;
    }
  }

  render() {
    const id =
      this.getAttribute('note-id') ||
      (this._noteData && this._noteData.id) ||
      '';
    const title =
      this.getAttribute('title') ||
      (this._noteData && this._noteData.title) ||
      'Tanpa Judul';
    const body =
      (this._noteData && this._noteData.body) ||
      this.getAttribute('body') ||
      '';
    const createdAt =
      this.getAttribute('created-at') ||
      (this._noteData && this._noteData.createdAt) ||
      '';
    const isArchived = this.getAttribute('archived') === 'true';

    const safeTitle = this._escapeHtml(title);
    const safeBody = this._escapeHtml(body);
    const formattedDate = this._formatDate(createdAt);

    this.innerHTML = `
      <article class="note-card ${isArchived ? 'is-archived' : ''}" data-id="${id}">
        <div class="note-card-header">
          <h3 class="note-card-title" title="${safeTitle}">${safeTitle}</h3>
          <span class="note-badge ${isArchived ? 'badge-archived' : 'badge-active'}">
            ${isArchived ? 'Diarsipkan' : 'Aktif'}
          </span>
        </div>

        <time class="note-card-date" datetime="${createdAt}">
          <svg viewBox="0 0 24 24" class="date-icon" aria-hidden="true">
            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
          </svg>
          <span>${formattedDate}</span>
        </time>

        <div class="note-card-body">
          <p>${safeBody}</p>
        </div>

        <div class="note-card-actions">
          <button type="button" class="btn-action btn-archive" title="${isArchived ? 'Pindahkan ke Aktif' : 'Arsipkan Catatan'}">
            <svg viewBox="0 0 24 24" class="action-icon">
              <path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z"/>
            </svg>
            <span>${isArchived ? 'Batal Arsip' : 'Arsipkan'}</span>
          </button>

          <button type="button" class="btn-action btn-delete" title="Hapus Catatan">
            <svg viewBox="0 0 24 24" class="action-icon">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
            <span>Hapus</span>
          </button>
        </div>
      </article>
    `;
  }

  _setupActions() {
    const id = this.getAttribute('note-id');
    const isArchived = this.getAttribute('archived') === 'true';
    const deleteBtn = this.querySelector('.btn-delete');
    const archiveBtn = this.querySelector('.btn-archive');
    const loadingIndicator = document.querySelector('loading-indicator');

    if (deleteBtn) {
      deleteBtn.addEventListener('click', async () => {
        const title = this.getAttribute('title') || 'catatan ini';

        const result = await Swal.fire({
          title: 'Hapus Catatan?',
          html: `Apakah Anda yakin ingin menghapus catatan <strong>"${this._escapeHtml(title)}"</strong>? Tindakan ini tidak dapat dibatalkan.`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#e11d48',
          cancelButtonColor: '#64748b',
          confirmButtonText: 'Ya, Hapus!',
          cancelButtonText: 'Batal',
        });

        if (result.isConfirmed) {
          try {
            if (loadingIndicator) {
              loadingIndicator.show('Menghapus catatan dari server...');
            }

            await NotesApi.deleteNote(id);

            Swal.fire({
              icon: 'success',
              title: 'Catatan Terhapus',
              text: 'Catatan telah berhasil dihapus dari server.',
              timer: 1500,
              showConfirmButton: false,
            });

            document.dispatchEvent(
              new CustomEvent('note-deleted', {
                detail: { id },
                bubbles: true,
              })
            );
          } catch (error) {
            Swal.fire({
              icon: 'error',
              title: 'Gagal Menghapus Catatan',
              text:
                error.message ||
                'Terjadi kesalahan saat menghapus catatan dari server.',
              confirmButtonColor: '#4f46e5',
            });
          } finally {
            if (loadingIndicator) {
              loadingIndicator.hide();
            }
          }
        }
      });
    }

    if (archiveBtn) {
      archiveBtn.addEventListener('click', async () => {
        try {
          if (loadingIndicator) {
            loadingIndicator.show(
              isArchived
                ? 'Mengembalikan catatan dari arsip...'
                : 'Memindahkan catatan ke arsip...'
            );
          }

          if (isArchived) {
            await NotesApi.unarchiveNote(id);
          } else {
            await NotesApi.archiveNote(id);
          }

          Swal.fire({
            icon: 'success',
            title: isArchived ? 'Dipindahkan ke Aktif' : 'Berhasil Diarsipkan',
            text: isArchived
              ? 'Catatan kini kembali berada di daftar catatan aktif.'
              : 'Catatan telah berhasil dipindahkan ke daftar arsip.',
            timer: 1500,
            showConfirmButton: false,
          });

          document.dispatchEvent(
            new CustomEvent('note-archived-toggled', {
              detail: { id, archived: !isArchived },
              bubbles: true,
            })
          );
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Gagal Mengubah Status Arsip',
            text:
              error.message ||
              'Terjadi kendala saat memperbarui status arsip di server.',
            confirmButtonColor: '#4f46e5',
          });
        } finally {
          if (loadingIndicator) {
            loadingIndicator.hide();
          }
        }
      });
    }
  }
}

customElements.define('note-item', NoteItem);
