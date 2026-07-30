import { IStudentRepository } from "../interfaces/IStudentRepository";
import { INotifier } from "../interfaces/INotifier";
import { Student } from "../models/Student";
import { TranscriptService } from "./TranscriptService";

export class AcademicService {
  private repository: IStudentRepository;
  private notifier: INotifier;
  private transcriptService: TranscriptService;

  constructor(
    repository: IStudentRepository,
    notifier: INotifier,
    transcriptService: TranscriptService
  ) {
    this.repository = repository;
    this.notifier = notifier;
    this.transcriptService = transcriptService;
  }

  daftarMahasiswaBaru(nim: string, nama: string, jurusan: string): Student {
    const student = new Student(nim, nama, jurusan);
    this.repository.create(student);
    this.notifier.send(nim, `Selamat ${nama}, pendaftaran akun akademik berhasil.`);
    return student;
  }

  updateMahasiswa(nim: string, data: Partial<{ nama: string; jurusan: string }>): void {
    this.repository.update(nim, data);
  }

  hapusMahasiswa(nim: string): void {
    this.repository.delete(nim);
  }

  cetakTranskrip(nim: string): void {
    const student = this.getMahasiswaOrThrow(nim);
    this.transcriptService.print(student);
  }

  exportTranskrip(nim: string): string {
    const student = this.getMahasiswaOrThrow(nim);
    const hasil = this.transcriptService.export(student);
    this.notifier.send(nim, `Transkrip Anda telah berhasil diexport.`);
    return hasil;
  }

  tambahNilaiMahasiswa(nim: string, mataKuliah: string, sks: number, nilai: number): void {
    const student = this.getMahasiswaOrThrow(nim);
    student.tambahNilai({ mataKuliah, sks, nilai });
  }

  getSemuaMahasiswa() {
    return this.repository.findAll().map((s) => ({
      nim: s.nim,
      nama: s.nama,
      jurusan: s.jurusan,
      ipk: s.hitungIPK(),
      transkrip: s.transkrip,
    }));
  }

  getMahasiswa(nim: string) {
    const student = this.getMahasiswaOrThrow(nim);
    return {
      nim: student.nim,
      nama: student.nama,
      jurusan: student.jurusan,
      ipk: student.hitungIPK(),
      transkrip: student.transkrip,
    };
  }

  private getMahasiswaOrThrow(nim: string): Student {
    const student = this.repository.findByNim(nim);
    if (!student) {
      throw new Error(`Mahasiswa dengan NIM ${nim} tidak ditemukan`);
    }
    return student;
  }
}
