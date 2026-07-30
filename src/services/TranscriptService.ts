import { Student } from "../models/Student";
import { ITranscriptExporter } from "../interfaces/ITranscriptExporter";

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
