import { ITranscriptExporter } from "../interfaces/ITranscriptExporter";
import { Student } from "../models/Student";
export class PdfTranscriptExporter implements ITranscriptExporter {
  export(student: Student): string {
    const lines: string[] = [];
    lines.push(`=== TRANSKRIP NILAI (PDF) ===`);
    lines.push(`NIM   : ${student.nim}`);
    lines.push(`Nama  : ${student.nama}`);
    lines.push(`Prodi : ${student.jurusan}`);
    lines.push(`-----------------------------`);
    student.transkrip.forEach((m) => {
      lines.push(`${m.mataKuliah} (${m.sks} sks) : ${m.nilai.toFixed(2)}`);
    });
    lines.push(`-----------------------------`);
    lines.push(`IPK   : ${student.hitungIPK()}`);
    const content = lines.join("\n");
    console.log(`[EXPORT PDF] Transkrip ${student.nim} berhasil dibuat (${content.length} karakter)`);
    return content;
  }
}
