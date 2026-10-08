# Notes App - Integrasi RESTful API & Webpack

Proyek Submission Akhir untuk kelas **Belajar Fundamental Front-End Web Development** di Dicoding Academy.

Aplikasi pencatatan (Notes App) modern dengan estetika **Syncscribe Dashboard**: pastel cards, notebook ruled body, sidebar navigation, recent folder badges, dan shortcut keyboard (⌘N, ⌘S, ⌘R). Dibangun menggunakan **Vanilla JavaScript (Web Components)**, **CSS Grid Layout**, dibundel menggunakan **Webpack**, dan terintegrasi penuh dengan **Dicoding Notes API v2**.

🔗 **Live Demo:** [https://notes-appz.netlify.app/](https://notes-appz.netlify.app/)
🐙 **GitHub Repository:** [https://github.com/zakski-bit/notes-app](https://github.com/zakski-bit/notes-app)

---

## 📌 Pemenuhan Kriteria Submission

### 🌟 Kriteria Wajib (100% Terpenuhi)

1. **Kriteria Wajib 1: Pertahankan Kriteria Submission Sebelumnya**
   - Tetap mengadopsi Web Components kustom (`<app-bar>`, `<note-input>`, `<note-item>`, `<note-list>`, `<loading-indicator>`, dan `<footer-bar>`).
   - Formulir tambah catatan dengan input judul dan `<textarea>` untuk isi catatan.
   - Realtime validation pada formulir input (karakter counter judul max 50 karakter & batas minimum isi catatan).
   - Layouting daftar catatan berbasis **CSS Grid Layout**.
2. **Kriteria Wajib 2: Memanfaatkan RESTful API sebagai Sumber Data**
   - Terhubung langsung dengan **Dicoding Notes API v2** (`https://notes-api.dicoding.dev/v2`).
   - Data lokal dumi telah dihapus sepenuhnya dan digantikan oleh REST API.
   - Mengambil daftar catatan (`GET /notes`).
   - Menambahkan catatan baru (`POST /notes`).
   - Menghapus catatan (`DELETE /notes/{id}`).
3. **Kriteria Wajib 3: Menggunakan Webpack sebagai Module Bundler**
   - Menerapkan `html-webpack-plugin`, `style-loader`, dan `css-loader`.
   - Menggunakan pemisahan konfigurasi modular via `webpack-merge`:
     - `webpack.common.js`: Konfigurasi dasar dan plugin.
     - `webpack.dev.js`: Mode development dengan `webpack-dev-server`.
     - `webpack.prod.js`: Mode production dengan optimasi minifikasi.
   - Perintah npm script:
     - `npm run start-dev`: Menjalankan server pengembangan (_webpack-dev-server_).
     - `npm run build`: Melakukan bundling proyek untuk tahap produksi.
4. **Kriteria Wajib 4: Menggunakan Fetch API**
   - Seluruh komunikasi data dengan RESTful API menggunakan `fetch()` berbasis _Promise_ dan _async/await_.
5. **Kriteria Wajib 5: Memiliki Indikator Loading**
   - Menerapkan komponen kustom **`<loading-indicator>`** dengan animasi spinner halus yang otomatis tampil saat proses request HTTP berlangsung dan disembunyikan menggunakan blok `finally`.

---

### 🌟 Kriteria Opsional (Mengejar Bintang 5 ⭐⭐⭐⭐⭐)

1. **Kriteria Opsional 1: Memiliki Fitur Arsip Catatan**
   - Mendukung arsip (`POST /notes/{id}/archive`) dan pembatalan arsip (`POST /notes/{id}/unarchive`).
   - Menyediakan tab navigasi untuk memfilter tampilan catatan: **Aktif**, **Arsip**, dan **Semua**.
2. **Kriteria Opsional 2: Menampilkan Feedback Saat Terjadi Error**
   - Mengintegrasikan pustaka **SweetAlert2** (`sweetalert2`) untuk menampilkan pesan dialog yang informatif dan elegan saat terjadi kesalahan jaringan/server, serta saat konfirmasi penghapusan catatan.
3. **Kriteria Opsional 3: Memiliki Efek Pergerakan Halus atau Animasi**
   - Animasi kemunculan kartu catatan (`fadeInSlideUp`), efek elevasi saat kartu di-_hover_, transisi tombol aksi yang halus, dan spinner loading modern.
4. **Kriteria Opsional 4: Menerapkan Prettier sebagai Code Formatter**
   - `prettier` terpasang di `devDependencies` pada `package.json`.
   - Berkas konfigurasi `.prettierrc` dan `.prettierignore` tersedia di root proyek.
   - Script `npm run format` tersedia untuk merapikan kode secara otomatis.

---

## 📂 Struktur Berkas Proyek

```
notes-app/
├── package.json             # Konfigurasi dependensi dan npm scripts
├── .prettierrc              # Konfigurasi code formatter Prettier
├── .prettierignore          # Berkas/folder yang diabaikan Prettier
├── webpack.common.js        # Konfigurasi Webpack utama (HtmlWebpackPlugin, CSS loader)
├── webpack.dev.js           # Konfigurasi Webpack development (webpack-dev-server)
├── webpack.prod.js          # Konfigurasi Webpack production
├── index.html               # Template HTML utama
├── README.md                # Dokumentasi proyek
└── src/
    ├── api/
    │   └── notes-api.js     # Layanan komunikasi RESTful API via Fetch API
    ├── components/
    │   ├── app-bar.js           # Web Component: Header aplikasi (Shadow DOM)
    │   ├── note-input.js        # Web Component: Form input & realtime validation
    │   ├── note-item.js         # Web Component: Kartu catatan, aksi hapus & arsip
    │   ├── note-list.js         # Web Component: Container CSS Grid & filter
    │   ├── loading-indicator.js # Web Component: Indikator loading interaktif
    │   └── footer-bar.js        # Web Component: Footer aplikasi
    ├── styles/
    │   └── style.css        # Stylesheet utama & animasi CSS
    └── index.js             # Entry point Webpack
```

---

## 🚀 Cara Menjalankan Proyek

### 1. Pasang Dependensi

```bash
npm install
```

### 2. Menjalankan Fase Development

```bash
npm run start-dev
```

Aplikasi akan otomatis terbuka di browser pada alamat `http://localhost:9000/`.

### 3. Membangun Fase Production (Build)

```bash
npm run build
```

Hasil kompilasi dan bundel yang optimal akan dibuat di dalam folder `dist/`.

### 4. Format Kode dengan Prettier

```bash
npm run format
```
