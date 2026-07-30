import * as readline from "readline/promises";
import { stdin as input, stdout as output } from "process";
import { StudentRepository } from "./repositories/StudentRepository";
import { EmailNotifier } from "./notifications/EmailNotifier";
import { WhatsappNotifier } from "./notifications/WhatsappNotifier";
import { PdfTranscriptExporter } from "./exporters/PdfTranscriptExporter";
import { TranscriptService } from "./services/TranscriptService";
import { AcademicService } from "./services/AcademicService";
import { INotifier } from "./interfaces/INotifier";

const repository = new StudentRepository();
const exporter = new PdfTranscriptExporter();
const transcriptService = new TranscriptService(exporter);

// Notifier bisa ditukar tanpa mengubah AcademicService sama sekali.
let notifier: INotifier = new EmailNotifier();
let academicService = new AcademicService(repository, notifier, transcriptService);

const rl = readline.createInterface({ input, output });

function tampilkanMenu(): void {
  console.log("\n==================== SISTEM AKADEMIK ====================");
  console.log(`Channel notifikasi aktif: ${notifier.constructor.name}`);
  console.log("1. Tambah Mahasiswa Baru");
  console.log("2. Lihat Semua Mahasiswa");
  console.log("3. Update Data Mahasiswa");
  console.log("4. Hapus Mahasiswa");
  console.log("5. Tambah Nilai Mata Kuliah");
  console.log("6. Cetak Transkrip");
  console.log("7. Export Transkrip ke PDF");
  console.log("8. Ganti Channel Notifikasi (Email/WhatsApp)");
  console.log("0. Keluar");
  console.log("==========================================================");
}

async function tambahMahasiswa(): Promise<void> {
  const nim = await rl.question("Masukkan NIM: ");
  const nama = await rl.question("Masukkan Nama: ");
  const jurusan = await rl.question("Masukkan Jurusan: ");
  try {
    academicService.daftarMahasiswaBaru(nim.trim(), nama.trim(), jurusan.trim());
    console.log(`✔ Mahasiswa ${nama} (${nim}) berhasil didaftarkan.`);
  } catch (err) {
    console.log(`✘ Gagal: ${(err as Error).message}`);
  }
}

function lihatSemuaMahasiswa(): void {
  const data = academicService.getSemuaMahasiswa();
  if (data.length === 0) {
    console.log("Belum ada mahasiswa terdaftar.");
    return;
  }
  console.log("\nNIM        | Nama                 | Jurusan                     | IPK");
  console.log("-----------|----------------------|------------------------------|------");
  data.forEach((m) => {
    console.log(
      `${m.nim.padEnd(10)} | ${m.nama.padEnd(20)} | ${m.jurusan.padEnd(28)} | ${m.ipk}`
    );
  });
}

async function updateMahasiswa(): Promise<void> {
  const nim = await rl.question("NIM yang akan diupdate: ");
  const nama = await rl.question("Nama baru (kosongkan jika tidak diubah): ");
  const jurusan = await rl.question("Jurusan baru (kosongkan jika tidak diubah): ");
  try {
    academicService.updateMahasiswa(nim.trim(), {
      ...(nama.trim() ? { nama: nama.trim() } : {}),
      ...(jurusan.trim() ? { jurusan: jurusan.trim() } : {}),
    });
    console.log("✔ Data mahasiswa berhasil diupdate.");
  } catch (err) {
    console.log(`✘ Gagal: ${(err as Error).message}`);
  }
}

async function hapusMahasiswa(): Promise<void> {
  const nim = await rl.question("NIM yang akan dihapus: ");
  try {
    academicService.hapusMahasiswa(nim.trim());
    console.log("✔ Mahasiswa berhasil dihapus.");
  } catch (err) {
    console.log(`✘ Gagal: ${(err as Error).message}`);
  }
}

async function tambahNilai(): Promise<void> {
  const nim = await rl.question("NIM mahasiswa: ");
  const mataKuliah = await rl.question("Nama mata kuliah: ");
  const sks = Number(await rl.question("Jumlah SKS: "));
  const nilai = Number(await rl.question("Nilai (0 - 4): "));
  try {
    academicService.tambahNilaiMahasiswa(nim.trim(), mataKuliah.trim(), sks, nilai);
    console.log("✔ Nilai berhasil ditambahkan.");
  } catch (err) {
    console.log(`✘ Gagal: ${(err as Error).message}`);
  }
}

async function cetakTranskrip(): Promise<void> {
  const nim = await rl.question("NIM mahasiswa: ");
  try {
    academicService.cetakTranskrip(nim.trim());
  } catch (err) {
    console.log(`✘ Gagal: ${(err as Error).message}`);
  }
}

async function exportTranskrip(): Promise<void> {
  const nim = await rl.question("NIM mahasiswa: ");
  try {
    academicService.exportTranskrip(nim.trim());
    console.log("✔ Transkrip berhasil diexport & notifikasi terkirim.");
  } catch (err) {
    console.log(`✘ Gagal: ${(err as Error).message}`);
  }
}

async function gantiNotifier(): Promise<void> {
  const pilihan = await rl.question("Pilih channel (1=Email, 2=WhatsApp): ");
  notifier = pilihan.trim() === "2" ? new WhatsappNotifier() : new EmailNotifier();
  academicService = new AcademicService(repository, notifier, transcriptService);
  console.log(`✔ Channel notifikasi diganti ke ${notifier.constructor.name}.`);
}

async function main(): Promise<void> {
  console.log("Selamat datang di Sistem Akademik (mode interaktif).");
  let jalan = true;
  while (jalan) {
    tampilkanMenu();
    const pilihan = (await rl.question("Pilih menu: ")).trim();
    switch (pilihan) {
      case "1": await tambahMahasiswa(); break;
      case "2": lihatSemuaMahasiswa(); break;
      case "3": await updateMahasiswa(); break;
      case "4": await hapusMahasiswa(); break;
      case "5": await tambahNilai(); break;
      case "6": await cetakTranskrip(); break;
      case "7": await exportTranskrip(); break;
      case "8": await gantiNotifier(); break;
      case "0": jalan = false; break;
      default: console.log("Pilihan tidak dikenal, coba lagi.");
    }
  }
  console.log("Terima kasih, program selesai.");
  rl.close();
}

main();
