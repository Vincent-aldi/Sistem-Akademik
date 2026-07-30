import { Student } from "../models/Student";
import { ITranscriptExporter } from "../interfaces/ITranscriptExporter";

/**
 * SRP: hanya menangani presentasi transkrip (cetak ke layar & export).
 * DIP: bergantung pada abstraksi ITranscriptExporter, bukan pada
 * implementasi PdfTranscriptExporter secara langsung. Exporter
 * di-inject lewat constructor.
 */
export class TranscriptService {
  private exporter: ITranscriptExporter;

  constructor(exporter: ITranscriptExporter) {
    this.exporter = exporter;
  }

  print(student: Student): void {
    console.log(`--- Transkrip ${student.nama} (${student.nim}) ---`);
    student.transkrip.forEach((m) =>
      console.log(`${m.mataKuliah} : ${m.nilai}`)
    );
    console.log(`IPK: ${student.hitungIPK()}`);
  }

  export(student: Student): string {
    return this.exporter.export(student);
  }
}
