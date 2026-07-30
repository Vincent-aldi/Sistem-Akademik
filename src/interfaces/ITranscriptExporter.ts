import { Student } from "../models/Student";
export interface ITranscriptExporter {
  export(student: Student): string;
}
