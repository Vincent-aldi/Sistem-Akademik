import { IStudentRepository } from "../interfaces/IStudentRepository";
import { Student } from "../models/Student";
export class StudentRepository implements IStudentRepository {
  private students: Map<string, Student> = new Map();

  create(student: Student): void {
    if (this.students.has(student.nim)) {
      throw new Error(`Mahasiswa dengan NIM ${student.nim} sudah terdaftar`);
    }
    this.students.set(student.nim, student);
  }

  update(nim: string, data: Partial<{ nama: string; jurusan: string }>): void {
    const student = this.findByNim(nim);
    if (!student) {
      throw new Error(`Mahasiswa dengan NIM ${nim} tidak ditemukan`);
    }
    if (data.nama !== undefined) student.nama = data.nama;
    if (data.jurusan !== undefined) student.jurusan = data.jurusan;
  }

  delete(nim: string): void {
    if (!this.students.delete(nim)) {
      throw new Error(`Mahasiswa dengan NIM ${nim} tidak ditemukan`);
    }
  }

  findByNim(nim: string): Student | undefined {
    return this.students.get(nim);
  }

  findAll(): Student[] {
    return Array.from(this.students.values());
  }
}
