/**
 * Modul RESTful API: Notes API v2 Dicoding
 * Menggunakan Fetch API untuk interaksi data secara asinkron.
 * Sumber: https://notes-api.dicoding.dev/v2
 */

const BASE_URL = 'https://notes-api.dicoding.dev/v2';

class NotesApi {
  // Mendapatkan semua catatan aktif
  static async getNotes() {
    try {
      const response = await fetch(`${BASE_URL}/notes`);
      const responseJson = await response.json();

      if (!response.ok) {
        throw new Error(
          responseJson.message || 'Gagal mengambil daftar catatan.'
        );
      }

      return responseJson.data;
    } catch (error) {
      throw new Error(
        error.message || 'Terjadi kesalahan jaringan saat memuat catatan.'
      );
    }
  }

  // Mendapatkan semua catatan yang diarsipkan (Kriteria Opsional 1)
  static async getArchivedNotes() {
    try {
      const response = await fetch(`${BASE_URL}/notes/archived`);
      const responseJson = await response.json();

      if (!response.ok) {
        throw new Error(
          responseJson.message || 'Gagal mengambil daftar catatan terarsip.'
        );
      }

      return responseJson.data;
    } catch (error) {
      throw new Error(
        error.message || 'Terjadi kesalahan jaringan saat memuat arsip.'
      );
    }
  }

  // Menambahkan catatan baru
  static async createNote({ title, body }) {
    try {
      const response = await fetch(`${BASE_URL}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, body }),
      });

      const responseJson = await response.json();

      if (!response.ok) {
        throw new Error(
          responseJson.message || 'Gagal menambahkan catatan baru.'
        );
      }

      return responseJson.data;
    } catch (error) {
      throw new Error(
        error.message || 'Terjadi kesalahan jaringan saat menyimpan catatan.'
      );
    }
  }

  // Menghapus catatan berdasarkan ID
  static async deleteNote(id) {
    try {
      const response = await fetch(`${BASE_URL}/notes/${id}`, {
        method: 'DELETE',
      });

      const responseJson = await response.json();

      if (!response.ok) {
        throw new Error(responseJson.message || 'Gagal menghapus catatan.');
      }

      return responseJson.message;
    } catch (error) {
      throw new Error(
        error.message || 'Terjadi kesalahan jaringan saat menghapus catatan.'
      );
    }
  }

  // Mengarsipkan catatan berdasarkan ID (Kriteria Opsional 1)
  static async archiveNote(id) {
    try {
      const response = await fetch(`${BASE_URL}/notes/${id}/archive`, {
        method: 'POST',
      });

      const responseJson = await response.json();

      if (!response.ok) {
        throw new Error(responseJson.message || 'Gagal mengarsipkan catatan.');
      }

      return responseJson.message;
    } catch (error) {
      throw new Error(
        error.message || 'Terjadi kesalahan jaringan saat mengarsipkan catatan.'
      );
    }
  }

  // Membatalkan arsip catatan berdasarkan ID (Kriteria Opsional 1)
  static async unarchiveNote(id) {
    try {
      const response = await fetch(`${BASE_URL}/notes/${id}/unarchive`, {
        method: 'POST',
      });

      const responseJson = await response.json();

      if (!response.ok) {
        throw new Error(
          responseJson.message || 'Gagal mengembalikan catatan dari arsip.'
        );
      }

      return responseJson.message;
    } catch (error) {
      throw new Error(
        error.message || 'Terjadi kesalahan jaringan saat membatalkan arsip.'
      );
    }
  }
}

export default NotesApi;
