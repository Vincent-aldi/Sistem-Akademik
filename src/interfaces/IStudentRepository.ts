import { Student } from "../models/Student";
export interface IStudentRepository {
  create(student: Student): void;
  update(nim: string, data: Partial<{ nama: string; jurusan: string }>): void;
  delete(nim: string): void;
  findByNim(nim: string): Student | undefined;
  findAll(): Student[];
}
