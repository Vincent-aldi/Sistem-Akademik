import { StudentRepository } from "./repositories/StudentRepository";
import { EmailNotifier } from "./notifications/EmailNotifier";
import { WhatsappNotifier } from "./notifications/WhatsappNotifier";
import { PdfTranscriptExporter } from "./exporters/PdfTranscriptExporter";
import { TranscriptService } from "./services/TranscriptService";
import { AcademicService } from "./services/AcademicService";

function main(): void {
  const repository = new StudentRepository();
  const notifier = new EmailNotifier();
  const exporter = new PdfTranscriptExporter();
  const transcriptService = new TranscriptService(exporter);

  const academicService = new AcademicService(repository, notifier, transcriptService);

  console.log("=== 1. Registrasi Mahasiswa Baru ===");
  academicService.daftarMahasiswaBaru("21102001", "Budi Santoso", "D3 Teknik Informatika");
  academicService.daftarMahasiswaBaru("21102002", "Siti Aminah", "D3 Teknik Informatika");

  console.log("\n=== 2. Update Data Mahasiswa ===");
  academicService.updateMahasiswa("21102002", { jurusan: "D3 Sistem Informasi" });

  console.log("\n=== 3. Tambah Nilai & Cetak Transkrip ===");
  const budi = repository.findByNim("21102001")!;
  budi.tambahNilai({ mataKuliah: "Pemrograman Berorientasi Objek", sks: 4, nilai: 3.75 });
  budi.tambahNilai({ mataKuliah: "Basis Data", sks: 3, nilai: 3.5 });
  academicService.cetakTranskrip("21102001");

  console.log("\n=== 4. Export Transkrip ke PDF ===");
  academicService.exportTranskrip("21102001");

  console.log("\n=== 5. Notifikasi via WhatsApp (bukti fleksibilitas DIP) ===");
  const academicServiceWa = new AcademicService(repository, new WhatsappNotifier(), transcriptService);
  academicServiceWa.exportTranskrip("21102001");

  console.log("\n=== 6. Hapus Mahasiswa ===");
  academicService.hapusMahasiswa("21102002");
  console.log("Sisa mahasiswa terdaftar:", repository.findAll().map((s) => s.nim));
}

main();
