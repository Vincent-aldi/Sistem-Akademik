import * as http from "http";
import * as fs from "fs";
import * as path from "path";
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

let notifier: INotifier = new EmailNotifier();
let academicService = new AcademicService(repository, notifier, transcriptService);

const notifLog: string[] = [];
const originalLog = console.log;
console.log = (...args: unknown[]) => {
  const text = args.map(String).join(" ");
  if (text.includes("[EMAIL]") || text.includes("[WHATSAPP]") || text.includes("[EXPORT")) {
    notifLog.unshift(text);
    if (notifLog.length > 20) notifLog.pop();
  }
  originalLog(...args);
};

// Data dummy
function seedDummyData(): void {
  const dummy: {
    nim: string;
    nama: string;
    jurusan: string;
    nilai: { mataKuliah: string; sks: number; nilai: number }[];
  }[] = [
    {
      nim: "21102001",
      nama: "Agus Wibowo",
      jurusan: "D3 Teknik Informatika",
      nilai: [
        { mataKuliah: "Pemrograman Berorientasi Objek", sks: 4, nilai: 3.75 },
        { mataKuliah: "Basis Data", sks: 3, nilai: 3.5 },
        { mataKuliah: "Struktur Data", sks: 3, nilai: 3.25 },
      ],
    },
    {
      nim: "21102002",
      nama: "Dadang Setiawan",
      jurusan: "D3 Sistem Informasi",
      nilai: [
        { mataKuliah: "Basis Data", sks: 3, nilai: 4.0 },
        { mataKuliah: "Pemrograman Web", sks: 3, nilai: 3.75 },
      ],
    },
    {
      nim: "21102003",
      nama: "Rendra Prasetyo",
      jurusan: "D3 Teknik Informatika",
      nilai: [
        { mataKuliah: "Jaringan Komputer", sks: 3, nilai: 3.0 },
        { mataKuliah: "Pemrograman Web", sks: 3, nilai: 3.5 },
        { mataKuliah: "Pemrograman Berorientasi Objek", sks: 4, nilai: 3.9 },
      ],
    },
    {
      nim: "21102004",
      nama: "Dewi Lestari",
      jurusan: "D3 Manajemen Informatika",
      nilai: [],
    },
  ];

  dummy.forEach((d) => {
    academicService.daftarMahasiswaBaru(d.nim, d.nama, d.jurusan);
    d.nilai.forEach((n) => academicService.tambahNilaiMahasiswa(d.nim, n.mataKuliah, n.sks, n.nilai));
  });

  notifLog.length = 0;
}

seedDummyData();

// Helper HTTP
function sendJson(res: http.ServerResponse, status: number, data: unknown): void {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
  });
  res.end(body);
}

function readBody(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => (raw += chunk));
    req.on("end", () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
};

function serveStatic(req: http.IncomingMessage, res: http.ServerResponse, pathname: string): boolean {
  const publicDir = path.join(__dirname, "..", "public");
  const filePath = path.join(publicDir, pathname === "/" ? "index.html" : pathname);
  if (!filePath.startsWith(publicDir)) return false;
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) return false;
  const ext = path.extname(filePath);
  res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
  fs.createReadStream(filePath).pipe(res);
  return true;
}

// Server 
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host}`);
  const pathname = url.pathname;
  const method = req.method || "GET";

  try {
    // GET /api/mahasiswa -> daftar semua mahasiswa
    if (method === "GET" && pathname === "/api/mahasiswa") {
      return sendJson(res, 200, { data: academicService.getSemuaMahasiswa(), notifLog });
    }

    // POST /api/mahasiswa -> tambah mahasiswa baru
    if (method === "POST" && pathname === "/api/mahasiswa") {
      const { nim, nama, jurusan } = await readBody(req);
      academicService.daftarMahasiswaBaru(String(nim), String(nama), String(jurusan));
      return sendJson(res, 201, { message: "Mahasiswa berhasil didaftarkan", notifLog });
    }

    // Pola /api/mahasiswa/:nim
    const matchNim = pathname.match(/^\/api\/mahasiswa\/([^/]+)(\/(nilai|transkrip|export))?$/);
    if (matchNim) {
      const nim = decodeURIComponent(matchNim[1]);
      const sub = matchNim[3];

      if (!sub && method === "PUT") {
        const data = await readBody(req);
        academicService.updateMahasiswa(nim, data);
        return sendJson(res, 200, { message: "Data mahasiswa berhasil diupdate" });
      }
      if (!sub && method === "DELETE") {
        academicService.hapusMahasiswa(nim);
        return sendJson(res, 200, { message: "Mahasiswa berhasil dihapus" });
      }
      if (!sub && method === "GET") {
        return sendJson(res, 200, { data: academicService.getMahasiswa(nim) });
      }
      if (sub === "nilai" && method === "POST") {
        const { mataKuliah, sks, nilai } = await readBody(req);
        academicService.tambahNilaiMahasiswa(nim, String(mataKuliah), Number(sks), Number(nilai));
        return sendJson(res, 201, { message: "Nilai berhasil ditambahkan" });
      }
      if (sub === "transkrip" && method === "GET") {
        academicService.cetakTranskrip(nim);
        return sendJson(res, 200, { data: academicService.getMahasiswa(nim) });
      }
      if (sub === "export" && method === "POST") {
        const isi = academicService.exportTranskrip(nim);
        return sendJson(res, 200, { message: "Transkrip berhasil diexport", isi, notifLog });
      }
    }

    // POST /api/notifier -> ganti channel notifikasi
    if (method === "POST" && pathname === "/api/notifier") {
      const { channel } = await readBody(req);
      notifier = channel === "whatsapp" ? new WhatsappNotifier() : new EmailNotifier();
      academicService = new AcademicService(repository, notifier, transcriptService);
      return sendJson(res, 200, { message: `Channel notifikasi diganti ke ${notifier.constructor.name}` });
    }

    // Static frontend (dashboard)
    if (method === "GET" && serveStatic(req, res, pathname)) return;

    sendJson(res, 404, { message: "Not found" });
  } catch (err) {
    sendJson(res, 400, { message: (err as Error).message });
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Dashboard Sistem Akademik berjalan di http://localhost:${PORT}`);
});
