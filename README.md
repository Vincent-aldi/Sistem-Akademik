# 🎓 Sistem Akademik

Proyek ini merupakan hasil refactoring **AcademicSystem** dengan menerapkan prinsip-prinsip **SOLID** (SRP, ISP, dan DIP) menggunakan **TypeScript**. Selain itu, proyek ini juga mengimplementasikan konsep dasar **Object-Oriented Programming (OOP)** seperti:

- Class & Object
- Constructor
- Encapsulation
- Module (Export & Import)

---

# 🚀 Instalasi

Pastikan **Node.js** sudah terpasang pada komputer Anda.

1. Clone repository

```bash
git clone https://github.com/username/nama-repository.git
```

2. Masuk ke folder project

```bash
cd nama-repository
```

3. Install seluruh dependency

```bash
npm install
```

---

# ▶️ Menjalankan Program

Project ini menyediakan **3 mode** yang dapat dijalankan. Seluruh mode menggunakan service yang sama (`AcademicService`, `StudentRepository`, dan lainnya). Perbedaannya hanya pada **entry point** yang digunakan.

---

## 1. Demo Mode

Mode ini menjalankan simulasi sistem secara otomatis tanpa input dari pengguna.

Jalankan:

```bash
npm start
```

**Cocok digunakan untuk:**

- Melihat contoh penggunaan sistem
- Demonstrasi cepat
- Pengujian awal

---

## 2. CLI (Command Line Interface)

Mode interaktif melalui terminal.

Jalankan:

```bash
npm run cli
```

Menu yang tersedia:

- ➕ Tambah Mahasiswa
- 📋 Lihat Seluruh Mahasiswa
- ✏️ Update Data Mahasiswa
- ❌ Hapus Mahasiswa
- 📝 Tambah Nilai
- 📄 Cetak Transkrip
- 📑 Export Transkrip ke PDF
- 📧 Ganti Channel Notifikasi (Email / WhatsApp)

Semua fitur dapat digunakan tanpa perlu mengubah source code.

---

## 3. Web Dashboard

Mode ini menjalankan server lokal sekaligus menampilkan dashboard berbasis web.

Jalankan:

```bash
npm run server
```

Setelah server berhasil dijalankan, buka browser dan akses:

```
http://localhost:3000
```

Dashboard menyediakan fitur:

- 👨‍🎓 Registrasi Mahasiswa Baru
- 📋 Daftar Mahasiswa beserta IPK
- 📝 Penambahan Nilai
- 📄 Export Transkrip PDF
- 📧 Pergantian Channel Notifikasi (Email / WhatsApp)
- 📜 Log Aktivitas Sistem secara real-time

---

# 📁 Struktur Folder

```
src/
├── models/
│   └── Student.ts
│
├── interfaces/
│   ├── IStudentRepository.ts
│   ├── INotifier.ts
│   └── ITranscriptExporter.ts
│
├── repositories/
│   └── StudentRepository.ts
│
├── notifications/
│   ├── EmailNotifier.ts
│   └── WhatsappNotifier.ts
│
├── exporters/
│   └── PdfTranscriptExporter.ts
│
├── services/
│   ├── AcademicService.ts
│   └── TranscriptService.ts
│
├── index.ts      # Demo Mode
├── cli.ts        # CLI Mode
└── server.ts     # Web Dashboard

public/
├── index.html
├── style.css
└── script.js
```

---

# 🛠️ Teknologi yang Digunakan

- TypeScript
- Node.js
- HTML
- CSS
- JavaScript
- PDFKit

---

# 📌 Catatan

Pastikan seluruh dependency telah berhasil di-install menggunakan:

```bash
npm install
```

Kemudian jalankan salah satu mode sesuai kebutuhan:

| Mode | Perintah |
|------|----------|
| Demo | `npm start` |
| CLI | `npm run cli` |
| Web Dashboard | `npm run server` |

Untuk mode **Web Dashboard**, akses aplikasi melalui:

```
http://localhost:3000
```
