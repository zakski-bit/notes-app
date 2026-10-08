import Swal from 'sweetalert2';

/**
 * Komponen Web Component: <app-bar>
 * Sidebar navigasi interaktif bergaya Syncscribe dengan Shadow DOM,
 * Custom Attributes, manajemen folder dinamis, dan sinkronisasi status.
 */
class AppBar extends HTMLElement {
  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: 'open' });
    this._folders = this._loadFolders();
    this._userName = localStorage.getItem('syncscribe_user') || 'Meet Desai';
    this._workspaceName =
      localStorage.getItem('syncscribe_workspace') || 'Syncscribe';
  }

  static get observedAttributes() {
    return ['title', 'user', 'caption'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue && this.isConnected) {
      this.render();
      this._setupEvents();
    }
  }

  connectedCallback() {
    this.render();
    this._setupEvents();

    // Listen to tab changes from note-list to keep sidebar in sync
    document.addEventListener('active-tab-changed', (e) => {
      const activeTab = e.detail && e.detail.tab;
      this._updateActiveNav(activeTab);
    });

    // Listen to note-list requests to reset active folder selection
    document.addEventListener('folder-filter-cleared', () => {
      const folderItems = this._shadowRoot.querySelectorAll('.folder-item');
      folderItems.forEach((f) => f.classList.remove('active'));
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

  _saveFolders() {
    localStorage.setItem('syncscribe_folders', JSON.stringify(this._folders));
    document.dispatchEvent(
      new CustomEvent('folders-updated', { detail: { folders: this._folders } })
    );
  }

  get title() {
    return this._workspaceName || this.getAttribute('title') || 'Syncscribe';
  }

  get user() {
    return this._userName || this.getAttribute('user') || 'Meet Desai';
  }

  get caption() {
    return this.getAttribute('caption') || 'RESTful API v2';
  }

  render() {
    const folderListHtml = this._folders
      .map(
        (folder) => `
        <li class="folder-item" data-tag="${folder}">
          <div class="folder-item-left">
            <span class="folder-bullet"></span>
            <span class="folder-text">${folder}</span>
          </div>
          <button type="button" class="btn-delete-folder" data-delete-folder="${folder}" title="Hapus folder ${folder}">
            &times;
          </button>
        </li>
      `
      )
      .join('');

    this._shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 270px;
          flex-shrink: 0;
          background-color: #fafbfc;
          border-right: 1px solid #edf0f5;
          padding: 1.75rem 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          box-sizing: border-box;
          user-select: none;
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        /* Profile Header */
        .profile-section {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.35rem 0.5rem 0.65rem;
          cursor: pointer;
          border-radius: 14px;
          transition: background-color 0.15s ease;
        }

        .profile-section:hover {
          background-color: #f1f4f9;
        }

        .profile-left {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          overflow: hidden;
        }

        .brand-logo {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #cbf53d;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #0f172a;
          box-shadow: 0 4px 14px rgba(203, 245, 61, 0.45);
          flex-shrink: 0;
          transition: transform 0.2s ease;
        }

        .profile-section:hover .brand-logo {
          transform: scale(1.05);
        }

        .brand-logo svg {
          width: 24px;
          height: 24px;
          fill: currentColor;
        }

        .profile-info {
          overflow: hidden;
        }

        .profile-info h1 {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 1.05rem;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.015em;
          line-height: 1.2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .profile-info p {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 0.78rem;
          color: #8392a5;
          margin-top: 0.15rem;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .chevron-icon {
          color: #94a3b8;
          width: 18px;
          height: 18px;
          flex-shrink: 0;
        }

        /* Create Note Button (Black pill with shortcut) */
        .create-btn {
          width: 100%;
          background-color: #0f172a;
          color: #ffffff;
          border: none;
          border-radius: 9999px;
          padding: 0.85rem 1.2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 0.92rem;
          font-weight: 600;
          box-shadow: 0 4px 14px rgba(15, 23, 42, 0.15);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .create-btn:hover {
          background-color: #1e293b;
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(15, 23, 42, 0.22);
        }

        .create-btn:active {
          transform: translateY(0);
        }

        .create-btn-left {
          display: flex;
          align-items: center;
          gap: 0.55rem;
        }

        .btn-plus-icon {
          width: 18px;
          height: 18px;
          fill: currentColor;
        }

        .kbd-badge {
          background-color: #273549;
          color: #94a3b8;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.72rem;
          font-weight: 600;
          padding: 0.2rem 0.5rem;
          border-radius: 6px;
        }

        /* Nav List */
        .nav-group {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .nav-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.65rem 0.85rem;
          border-radius: 12px;
          color: #475569;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          background: transparent;
          border: none;
          width: 100%;
          text-align: left;
        }

        .nav-item:hover {
          background-color: #f1f4f9;
          color: #0f172a;
        }

        .nav-item.active {
          background-color: #f1f4f9;
          color: #0f172a;
          font-weight: 700;
        }

        .nav-item-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .nav-item svg {
          width: 18px;
          height: 18px;
          fill: currentColor;
          opacity: 0.75;
        }

        .nav-item .kbd-hint {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          color: #94a3b8;
        }

        /* Folders Section */
        .folders-container {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .folders-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.5rem 0.5rem 0.25rem;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 0.82rem;
          font-weight: 700;
          color: #334155;
        }

        .folders-header-left {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .folders-header-actions {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .btn-add-folder {
          width: 22px;
          height: 22px;
          border-radius: 6px;
          background-color: transparent;
          border: 1px solid transparent;
          color: #64748b;
          font-size: 1.1rem;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-add-folder:hover {
          background-color: #e2e8f0;
          color: #0f172a;
        }

        .folder-list {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          list-style: none;
          margin-top: 0.35rem;
          max-height: 220px;
          overflow-y: auto;
          padding-right: 0.25rem;
        }

        .folder-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.5rem 0.85rem;
          border-radius: 10px;
          color: #64748b;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 0.84rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
          position: relative;
        }

        .folder-item-left {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          overflow: hidden;
        }

        .folder-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .btn-delete-folder {
          opacity: 0;
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 1.1rem;
          cursor: pointer;
          padding: 0 4px;
          border-radius: 4px;
          transition: all 0.15s ease;
        }

        .folder-item:hover .btn-delete-folder {
          opacity: 1;
        }

        .btn-delete-folder:hover {
          color: #ef4444;
          background-color: #fee2e2;
        }

        .folder-item:hover {
          background-color: #f1f4f9;
          color: #0f172a;
          transform: translateX(2px);
        }

        .folder-item.active {
          background-color: #f1f4f9;
          color: #0f172a;
          font-weight: 700;
        }

        .folder-bullet {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background-color: #cbd5e1;
          flex-shrink: 0;
        }

        .folder-item:hover .folder-bullet,
        .folder-item.active .folder-bullet {
          background-color: #cbf53d;
        }

        /* Bottom Utils */
        .bottom-utils {
          margin-top: auto;
          padding-top: 1rem;
          border-top: 1px solid #edf0f5;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .util-item {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.55rem 0.85rem;
          border-radius: 10px;
          color: #64748b;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 0.82rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
          background: transparent;
          border: none;
          width: 100%;
          text-align: left;
        }

        .util-item:hover {
          color: #0f172a;
          background-color: #f1f4f9;
        }

        .util-item svg {
          width: 17px;
          height: 17px;
          fill: currentColor;
        }

        /* Mobile Responsive */
        @media (max-width: 900px) {
          :host {
            width: 100%;
            border-right: none;
            border-bottom: 1px solid #edf0f5;
            padding: 1.25rem 1.25rem 1rem;
            gap: 1rem;
          }

          .folder-list, .bottom-utils, .folders-header {
            display: none;
          }

          .nav-group {
            flex-direction: row;
            flex-wrap: wrap;
          }

          .nav-item {
            width: auto;
            flex: 1;
            justify-content: center;
          }

          .nav-item .kbd-hint {
            display: none;
          }
        }
      </style>

      <!-- Profile / Brand (Clickable to Edit) -->
      <div class="profile-section" id="profileSection" title="Klik untuk mengubah nama workspace & user">
        <div class="profile-left">
          <div class="brand-logo" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 20.3a1 1 0 001.35 1.35l2.69-.62A8.96 8.96 0 0012 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 15c-1.39 0-2.69-.38-3.81-1.04l-.27-.16-1.6.37.37-1.6-.16-.27A6.97 6.97 0 015 12c0-3.86 3.14-7 7-7s7 3.14 7 7-3.14 7-7 7z"/>
            </svg>
          </div>
          <div class="profile-info">
            <h1 id="txtTitle">${this.title}</h1>
            <p id="txtUser">${this.user}</p>
          </div>
        </div>
        <svg class="chevron-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
        </svg>
      </div>

      <!-- Action Button: Create Note -->
      <button type="button" class="create-btn" id="btnCreateNote">
        <div class="create-btn-left">
          <svg class="btn-plus-icon" viewBox="0 0 24 24">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
          <span>Create Note</span>
        </div>
        <span class="kbd-badge">⌘N</span>
      </button>

      <!-- Nav Items -->
      <nav class="nav-group" role="navigation">
        <button type="button" class="nav-item active" data-action="all">
          <div class="nav-item-left">
            <svg viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
            </svg>
            <span>All Notes</span>
          </div>
        </button>

        <button type="button" class="nav-item" data-action="search">
          <div class="nav-item-left">
            <svg viewBox="0 0 24 24">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <span>Search</span>
          </div>
          <span class="kbd-hint">⌘S</span>
        </button>

        <button type="button" class="nav-item" data-action="archive">
          <div class="nav-item-left">
            <svg viewBox="0 0 24 24">
              <path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z"/>
            </svg>
            <span>Archives</span>
          </div>
          <span class="kbd-hint">⌘R</span>
        </button>
      </nav>

      <!-- Folders Section -->
      <div class="folders-container">
        <div class="folders-header">
          <div class="folders-header-left">
            <svg viewBox="0 0 24 24" style="width: 17px; height: 17px; fill: #64748b;">
              <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
            </svg>
            <span>Folders</span>
          </div>
          <div class="folders-header-actions">
            <button type="button" class="btn-add-folder" id="btnAddFolder" title="Tambah folder baru">
              +
            </button>
          </div>
        </div>

        <ul class="folder-list" id="folderList">
          ${folderListHtml}
        </ul>
      </div>

      <!-- Bottom Utils -->
      <div class="bottom-utils">
        <button type="button" class="util-item" id="btnApiHelp">
          <svg viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 16h-2v-2h2v2zm1.07-7.75l-.9.92C12.45 11.9 12 12.5 12 14h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z"/>
          </svg>
          <span>Dicoding Notes API v2</span>
        </button>

        <button type="button" class="util-item" id="btnSettings">
          <svg viewBox="0 0 24 24">
            <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
          </svg>
          <span>Tools & Webpack Info</span>
        </button>
      </div>
    `;
  }

  _updateActiveNav(activeTab) {
    const navItems = this._shadowRoot.querySelectorAll('.nav-item');
    navItems.forEach((btn) => btn.classList.remove('active'));
    if (activeTab === 'archived') {
      const archBtn = this._shadowRoot.querySelector(
        '.nav-item[data-action="archive"]'
      );
      if (archBtn) archBtn.classList.add('active');
    } else {
      const allBtn = this._shadowRoot.querySelector(
        '.nav-item[data-action="all"]'
      );
      if (allBtn) allBtn.classList.add('active');
    }
  }

  _setupEvents() {
    // 1. Profile section click -> Edit Workspace & User Profile
    const profileSection = this._shadowRoot.querySelector('#profileSection');
    if (profileSection) {
      profileSection.addEventListener('click', async () => {
        const { value: formValues } = await Swal.fire({
          title: 'Ubah Profil Workspace',
          html: `
            <div style="display: flex; flex-direction: column; gap: 0.85rem; text-align: left; font-size: 0.9rem;">
              <label><strong>Nama Workspace / Aplikasi:</strong></label>
              <input id="swalWorkspace" class="swal2-input" style="margin: 0;" placeholder="Contoh: Syncscribe, My Workspace" value="${this.title}" />
              <label style="margin-top: 0.5rem;"><strong>Nama Pengguna:</strong></label>
              <input id="swalUser" class="swal2-input" style="margin: 0;" placeholder="Contoh: Meet Desai, Zaki" value="${this.user}" />
            </div>
          `,
          focusConfirm: false,
          showCancelButton: true,
          confirmButtonColor: '#0f172a',
          cancelButtonColor: '#94a3b8',
          confirmButtonText: 'Simpan',
          cancelButtonText: 'Batal',
          preConfirm: () => {
            const workspace = document
              .getElementById('swalWorkspace')
              .value.trim();
            const user = document.getElementById('swalUser').value.trim();
            if (!workspace || !user) {
              Swal.showValidationMessage(
                'Nama dan Workspace tidak boleh kosong!'
              );
              return false;
            }
            return { workspace, user };
          },
        });

        if (formValues) {
          this._workspaceName = formValues.workspace;
          this._userName = formValues.user;
          localStorage.setItem('syncscribe_workspace', this._workspaceName);
          localStorage.setItem('syncscribe_user', this._userName);
          this.render();
          this._setupEvents();
          Swal.fire({
            icon: 'success',
            title: 'Profil Diperbarui!',
            timer: 1300,
            showConfirmButton: false,
          });
        }
      });
    }

    // 2. Button Create Note
    const btnCreate = this._shadowRoot.querySelector('#btnCreateNote');
    if (btnCreate) {
      btnCreate.addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('focus-create-note'));
      });
    }

    // 3. Global Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      // Don't trigger shortcuts if user is typing in input or textarea
      const activeTag = document.activeElement
        ? document.activeElement.tagName.toLowerCase()
        : '';
      if (activeTag === 'input' || activeTag === 'textarea') return;

      if ((e.ctrlKey || e.metaKey || e.altKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        document.dispatchEvent(new CustomEvent('focus-create-note'));
      }
      if ((e.ctrlKey || e.metaKey || e.altKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        document.dispatchEvent(new CustomEvent('focus-search'));
      }
      if ((e.ctrlKey || e.metaKey || e.altKey) && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        document.dispatchEvent(
          new CustomEvent('switch-tab', { detail: { tab: 'archived' } })
        );
      }
    });

    // 4. Nav Items
    const navItems = this._shadowRoot.querySelectorAll('.nav-item');
    navItems.forEach((btn) => {
      btn.addEventListener('click', () => {
        navItems.forEach((i) => i.classList.remove('active'));
        btn.classList.add('active');
        const action = btn.getAttribute('data-action');
        if (action === 'all') {
          document.dispatchEvent(
            new CustomEvent('switch-tab', { detail: { tab: 'active' } })
          );
        } else if (action === 'search') {
          document.dispatchEvent(new CustomEvent('focus-search'));
        } else if (action === 'archive') {
          document.dispatchEvent(
            new CustomEvent('switch-tab', { detail: { tab: 'archived' } })
          );
        }
      });
    });

    // 5. Button Add Folder (+)
    const btnAddFolder = this._shadowRoot.querySelector('#btnAddFolder');
    if (btnAddFolder) {
      btnAddFolder.addEventListener('click', async () => {
        const { value: folderName } = await Swal.fire({
          title: 'Tambah Folder Baru',
          input: 'text',
          inputPlaceholder: 'Contoh: Kuliah, Ide Konten, Buku...',
          showCancelButton: true,
          confirmButtonColor: '#0f172a',
          cancelButtonColor: '#94a3b8',
          confirmButtonText: 'Tambah Folder',
          cancelButtonText: 'Batal',
          inputValidator: (value) => {
            if (!value || !value.trim()) {
              return 'Nama folder tidak boleh kosong!';
            }
            if (
              this._folders.some(
                (f) => f.toLowerCase() === value.trim().toLowerCase()
              )
            ) {
              return 'Folder dengan nama ini sudah ada!';
            }
            return null;
          },
        });

        if (folderName) {
          const trimmed = folderName.trim();
          this._folders.push(trimmed);
          this._saveFolders();
          this.render();
          this._setupEvents();

          Swal.fire({
            icon: 'success',
            title: `Folder "${trimmed}" Ditambahkan!`,
            timer: 1400,
            showConfirmButton: false,
          });

          // Otomatis filter ke folder yang baru dibuat
          document.dispatchEvent(
            new CustomEvent('filter-by-folder', { detail: { tag: trimmed } })
          );
        }
      });
    }

    // 6. Folder Items Click (Filter & Delete)
    const folderItems = this._shadowRoot.querySelectorAll('.folder-item');
    folderItems.forEach((item) => {
      item.addEventListener('click', (e) => {
        // Abaikan jika yang diklik tombol delete folder
        if (e.target.closest('.btn-delete-folder')) return;

        const isCurrentlyActive = item.classList.contains('active');
        folderItems.forEach((f) => f.classList.remove('active'));

        if (isCurrentlyActive) {
          // Toggle off
          document.dispatchEvent(new CustomEvent('folder-filter-cleared'));
        } else {
          item.classList.add('active');
          const tag = item.getAttribute('data-tag');
          document.dispatchEvent(
            new CustomEvent('filter-by-folder', { detail: { tag } })
          );
        }
      });
    });

    // 7. Delete Folder Buttons
    const deleteFolderBtns =
      this._shadowRoot.querySelectorAll('.btn-delete-folder');
    deleteFolderBtns.forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const folderToDelete = btn.getAttribute('data-delete-folder');
        const confirmResult = await Swal.fire({
          title: `Hapus Folder "${folderToDelete}"?`,
          text: 'Folder ini akan dihapus dari daftar menu.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#ef4444',
          cancelButtonColor: '#94a3b8',
          confirmButtonText: 'Ya, Hapus',
          cancelButtonText: 'Batal',
        });

        if (confirmResult.isConfirmed) {
          this._folders = this._folders.filter((f) => f !== folderToDelete);
          this._saveFolders();
          this.render();
          this._setupEvents();
          document.dispatchEvent(new CustomEvent('folder-filter-cleared'));
        }
      });
    });

    // 8. Help & Settings Modals
    const btnApiHelp = this._shadowRoot.querySelector('#btnApiHelp');
    if (btnApiHelp) {
      btnApiHelp.addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('show-api-info'));
      });
    }

    const btnSettings = this._shadowRoot.querySelector('#btnSettings');
    if (btnSettings) {
      btnSettings.addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('show-settings-info'));
      });
    }
  }
}

customElements.define('app-bar', AppBar);
