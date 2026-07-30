export interface NilaiMataKuliah {
  mataKuliah: string;
  sks: number;
  nilai: number;
}
export class Student {
  private _nim: string;
  private _nama: string;
  private _jurusan: string;
  private _transkrip: NilaiMataKuliah[];

  constructor(nim: string, nama: string, jurusan: string) {
    this._nim = nim;
    this._nama = nama;
    this._jurusan = jurusan;
    this._transkrip = [];
  }

  get nim(): string {
    return this._nim;
  }

  get nama(): string {
    return this._nama;
  }

  set nama(value: string) {
    if (!value.trim()) {
      throw new Error("Nama tidak boleh kosong");
    }
    this._nama = value;
  }

  get jurusan(): string {
    return this._jurusan;
  }

  set jurusan(value: string) {
    this._jurusan = value;
  }

  get transkrip(): ReadonlyArray<NilaiMataKuliah> {
    return this._transkrip;
  }

  tambahNilai(item: NilaiMataKuliah): void {
    if (item.nilai < 0 || item.nilai > 4) {
      throw new Error("Nilai harus berada pada rentang 0 - 4");
    }
    this._transkrip.push(item);
  }

  hitungIPK(): number {
    if (this._transkrip.length === 0) return 0;
    const totalSks = this._transkrip.reduce((acc, m) => acc + m.sks, 0);
    const totalBobot = this._transkrip.reduce(
      (acc, m) => acc + m.sks * m.nilai,
      0
    );
    return Number((totalBobot / totalSks).toFixed(2));
  }
}
