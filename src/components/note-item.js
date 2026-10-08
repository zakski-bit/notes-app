import Swal from 'sweetalert2';
import NotesApi from '../api/notes-api';

/**
 * Komponen Web Component: <note-item>
 * Menampilkan kartu catatan individual bergaya Syncscribe dengan pastel header,
 * ekstraksi folder/kategori otomatis, notebook lined body, dan modal baca/detail interaktif.
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

  _formatTime(dateString) {
    if (!dateString) return '12:00 PM';
    try {
      const d = new Date(dateString);
      return d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return '12:00 PM';
    }
  }

  _formatFullDate(dateString) {
    if (!dateString) return '-';
    try {
      const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      };
      return new Date(dateString).toLocaleDateString('id-ID', options);
    } catch {
      return dateString;
    }
  }

  _parseFolder(title = '') {
    const match = title.match(/^\[(.*?)\]\s*(.*)/);
    if (match) {
      return {
        folder: match[1],
        cleanTitle: match[2] || 'Tanpa Judul',
      };
    }
    return {
      folder: null,
      cleanTitle: title || 'Tanpa Judul',
    };
  }

  _getThemeClass(id = '', folder = '') {
    const themes = [
      'theme-lavender',
      'theme-peach',
      'theme-lime',
      'theme-amber',
      'theme-sky',
    ];
    let str = (id || '') + (folder || '');
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    const index = Math.abs(hash) % themes.length;
    return themes[index];
  }

  render() {
    const id =
      this.getAttribute('note-id') ||
      (this._noteData && this._noteData.id) ||
      '';
    const rawTitle =
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

    const { folder, cleanTitle } = this._parseFolder(rawTitle);
    const safeTitle = this._escapeHtml(cleanTitle);
    const safeBody = this._escapeHtml(body);
    const formattedTime = this._formatTime(createdAt);
    const formattedFullDate = this._formatFullDate(createdAt);
    const themeClass = this._getThemeClass(id, folder);

    this.innerHTML = `
      <article class="sync-note-card ${themeClass} ${isArchived ? 'is-archived' : ''}" data-id="${id}">
        <!-- Pastel Header Banner (Syncscribe Aesthetic) -->
        <div class="sync-card-header">
          <div class="sync-header-left">
            ${
              folder
                ? `<span class="sync-folder-tag" title="Folder: ${folder}">📁 ${this._escapeHtml(folder)}</span>`
                : ''
            }
            <h3 class="sync-card-title" title="${safeTitle}">${safeTitle}</h3>
          </div>
          <div class="sync-header-right">
            <span class="sync-card-time">${formattedTime}</span>
            ${
              isArchived
                ? `<span class="sync-badge-archived" title="Diarsipkan">Arsip</span>`
                : ''
            }
          </div>
        </div>

        <!-- Ruled Lined Notepad Body (Clickable to open full detail) -->
        <div class="sync-card-body" title="Klik untuk membuka detail catatan">
          <p class="sync-body-text">${safeBody}</p>
        </div>

        <!-- Card Footer Info & Actions -->
        <div class="sync-card-footer">
          <span class="sync-footer-date" title="Dibuat pada ${formattedFullDate}">
            ${formattedFullDate}
          </span>

          <div class="sync-action-group">
            <!-- Tombol Arsip / Unarchive -->
            <button
              type="button"
              class="sync-btn-icon btn-archive"
              title="${isArchived ? 'Kembalikan dari Arsip' : 'Pindahkan ke Arsip'}"
              aria-label="${isArchived ? 'Kembalikan dari Arsip' : 'Pindahkan ke Arsip'}"
            >
              <svg viewBox="0 0 24 24">
                <path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z"/>
              </svg>
            </button>

            <!-- Tombol Hapus -->
            <button
              type="button"
              class="sync-btn-icon btn-delete"
              title="Hapus Catatan"
              aria-label="Hapus Catatan"
            >
              <svg viewBox="0 0 24 24">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
            </button>

            <!-- Lime Signature Pencil Badge (Interactive Quick View / Detail Button) -->
            <button
              type="button"
              class="sync-pencil-badge btn-detail-note"
              title="Buka detail & opsi catatan"
              aria-label="Buka detail catatan"
            >
              <svg viewBox="0 0 24 24">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
            </button>
          </div>
        </div>
      </article>
    `;
  }

  _setupActions() {
    const id = this.getAttribute('note-id');
    const isArchived = this.getAttribute('archived') === 'true';
    const deleteBtn = this.querySelector('.btn-delete');
    const archiveBtn = this.querySelector('.btn-archive');
    const detailBtn = this.querySelector('.btn-detail-note');
    const cardBody = this.querySelector('.sync-card-body');
    const cardHeader = this.querySelector('.sync-card-header');
    const loadingIndicator = document.querySelector('loading-indicator');

    // Handler Buka Modal Detail Catatan
    const openDetailModal = () => {
      const rawTitle =
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
      const isArchivedNow = this.getAttribute('archived') === 'true';
      const { folder, cleanTitle } = this._parseFolder(rawTitle);

      Swal.fire({
        title: cleanTitle,
        html: `
          <div style="text-align: left; font-size: 0.92rem; line-height: 1.6; color: #334155;">
            <div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.85rem; flex-wrap: wrap;">
              ${
                folder
                  ? `<span style="background: #f1f5f9; padding: 0.2rem 0.6rem; border-radius: 9999px; font-weight: 600; font-size: 0.8rem; color: #0f172a;">📁 ${this._escapeHtml(folder)}</span>`
                  : ''
              }
              <span style="background: ${isArchivedNow ? '#fee2e2' : '#ecfdf5'}; color: ${isArchivedNow ? '#991b1b' : '#065f46'}; padding: 0.2rem 0.6rem; border-radius: 9999px; font-weight: 600; font-size: 0.8rem;">
                ${isArchivedNow ? 'Diarsipkan' : 'Aktif'}
              </span>
              <span style="color: #94a3b8; font-size: 0.8rem; margin-left: auto;">
                ${this._formatFullDate(createdAt)} &bull; ${this._formatTime(createdAt)}
              </span>
            </div>

            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.1rem; max-height: 260px; overflow-y: auto; white-space: pre-line; word-break: break-word;">
              ${this._escapeHtml(body)}
            </div>
          </div>
        `,
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonColor: '#0f172a',
        denyButtonColor: isArchivedNow ? '#3b82f6' : '#64748b',
        cancelButtonColor: '#cbd5e1',
        confirmButtonText: '📋 Salin Isi Catatan',
        denyButtonText: isArchivedNow ? '📦 Batal Arsip' : '📦 Arsipkan',
        cancelButtonText: 'Tutup',
      }).then(async (result) => {
        if (result.isConfirmed) {
          // Salin ke clipboard
          try {
            await navigator.clipboard.writeText(`${cleanTitle}\n\n${body}`);
            Swal.fire({
              icon: 'success',
              title: 'Tersalin ke Clipboard!',
              timer: 1400,
              showConfirmButton: false,
            });
          } catch {
            Swal.fire({
              icon: 'info',
              title: 'Gagal Menyalin Otomatis',
              text: 'Perizinan clipboard tidak tersedia di peramban.',
            });
          }
        } else if (result.isDenied) {
          // Toggle arsip dari modal
          if (archiveBtn) archiveBtn.click();
        }
      });
    };

    if (detailBtn) {
      detailBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openDetailModal();
      });
    }

    if (cardBody) {
      cardBody.addEventListener('click', () => {
        openDetailModal();
      });
    }

    if (cardHeader) {
      cardHeader.addEventListener('click', () => {
        openDetailModal();
      });
    }

    // Handler Tombol Hapus
    if (deleteBtn) {
      deleteBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const rawTitle = this.getAttribute('title') || 'catatan ini';
        const { cleanTitle } = this._parseFolder(rawTitle);

        const result = await Swal.fire({
          title: 'Hapus Catatan?',
          html: `Apakah Anda yakin ingin menghapus catatan <strong>"${this._escapeHtml(cleanTitle)}"</strong>? Tindakan ini tidak dapat dibatalkan.`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#ef4444',
          cancelButtonColor: '#94a3b8',
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
              confirmButtonColor: '#0f172a',
            });
          } finally {
            if (loadingIndicator) {
              loadingIndicator.hide();
            }
          }
        }
      });
    }

    // Handler Tombol Arsip
    if (archiveBtn) {
      archiveBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
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
            confirmButtonColor: '#0f172a',
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
