const tbody = document.getElementById("tbodyMahasiswa");
const logList = document.getElementById("logList");
const overlay = document.getElementById("overlay");
const panelTitle = document.getElementById("panelTitle");
const panelBody = document.getElementById("panelBody");
const notifierToggle = document.getElementById("notifierToggle");

async function api(path, options) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Terjadi kesalahan");
  return data;
}

function renderLog(entries) {
  if (!entries || entries.length === 0) {
    logList.innerHTML = `<li class="log-list__empty">Belum ada aktivitas.</li>`;
    return;
  }
  logList.innerHTML = entries.map((e) => `<li>${escapeHtml(e)}</li>`).join("");
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

async function muatDaftarMahasiswa() {
  const { data, notifLog } = await api("/api/mahasiswa");
  renderLog(notifLog);
  if (!data || data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty-row">Belum ada mahasiswa terdaftar.</td></tr>`;
    return;
  }
  tbody.innerHTML = data.map((m) => `
    <tr>
      <td>${escapeHtml(m.nim)}</td>
      <td style="font-family:var(--sans)">${escapeHtml(m.nama)}</td>
      <td style="font-family:var(--sans)">${escapeHtml(m.jurusan)}</td>
      <td><span class="ipk-badge">${m.ipk.toFixed(2)}</span></td>
      <td class="col-aksi">
        <button class="btn btn--ghost" data-action="detail" data-nim="${m.nim}">Detail</button>
        <button class="btn btn--ghost btn--danger" data-action="hapus" data-nim="${m.nim}">Hapus</button>
      </td>
    </tr>
  `).join("");
}

// Form tambah mahasiswa
document.getElementById("formTambah").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const fd = new FormData(form);
  try {
    const { notifLog } = await api("/api/mahasiswa", {
      method: "POST",
      body: JSON.stringify({
        nim: fd.get("nim"),
        nama: fd.get("nama"),
        jurusan: fd.get("jurusan"),
      }),
    });
    form.reset();
    renderLog(notifLog);
    await muatDaftarMahasiswa();
  } catch (err) {
    alert(err.message);
  }
});

// Toggle channel notifikasi
notifierToggle.addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-channel]");
  if (!btn) return;
  const channel = btn.dataset.channel;
  await api("/api/notifier", { method: "POST", body: JSON.stringify({ channel }) });
  [...notifierToggle.children].forEach((c) => c.classList.toggle("is-active", c === btn));
});

// Aksi tabel (detail / hapus)
tbody.addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const nim = btn.dataset.nim;

  if (btn.dataset.action === "hapus") {
    if (!confirm(`Hapus mahasiswa NIM ${nim}?`)) return;
    await api(`/api/mahasiswa/${encodeURIComponent(nim)}`, { method: "DELETE" });
    await muatDaftarMahasiswa();
    return;
  }

  if (btn.dataset.action === "detail") {
    await bukaPanelDetail(nim);
  }
});

async function bukaPanelDetail(nim) {
  const { data } = await api(`/api/mahasiswa/${encodeURIComponent(nim)}`);
  panelTitle.textContent = `${data.nama} — ${data.nim}`;

  const transkripHtml = data.transkrip.length
    ? data.transkrip.map((t) => `
        <div class="transkrip-row">
          <span>${escapeHtml(t.mataKuliah)} (${t.sks} sks)</span>
          <span>${t.nilai.toFixed(2)}</span>
        </div>`).join("")
    : `<p style="color:var(--ink-soft); font-size:13px;">Belum ada nilai.</p>`;

  panelBody.innerHTML = `
    <p style="font-size:13px; color:var(--ink-soft);">${escapeHtml(data.jurusan)} · IPK saat ini: <span class="ipk-badge">${data.ipk.toFixed(2)}</span></p>
    <div>${transkripHtml}</div>
    <hr class="section-divider" />
    <h2 style="font-size:14px;">Tambah Nilai Mata Kuliah</h2>
    <form id="formNilai" class="stacked-form">
      <label>Mata Kuliah <input type="text" name="mataKuliah" required placeholder="Masukan Mata Kuliah" /></label>
      <label>SKS <input type="number" name="sks" min="1" max="6" required placeholder="Masukan SKS" /></label>
      <label>Nilai (0 - 4) <input type="number" name="nilai" min="0" max="4" step="0.01" required placeholder="Masukan Nilai" /></label>
      <button type="submit" class="btn btn--primary">Simpan Nilai</button>
    </form>
    <hr class="section-divider" />
    <div style="display:flex; gap:10px;">
      <button class="btn" id="btnExport">Export Transkrip (PDF)</button>
    </div>
    <p id="exportResult" style="font-size:12px; color:var(--ink-soft); white-space:pre-wrap; font-family:var(--mono); margin-top:10px;"></p>
  `;

  document.getElementById("formNilai").addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const fd = new FormData(ev.target);
    await api(`/api/mahasiswa/${encodeURIComponent(nim)}/nilai`, {
      method: "POST",
      body: JSON.stringify({
        mataKuliah: fd.get("mataKuliah"),
        sks: Number(fd.get("sks")),
        nilai: Number(fd.get("nilai")),
      }),
    });
    await bukaPanelDetail(nim);
    await muatDaftarMahasiswa();
  });

  document.getElementById("btnExport").addEventListener("click", async () => {
    const { isi, notifLog } = await api(`/api/mahasiswa/${encodeURIComponent(nim)}/export`, { method: "POST" });
    document.getElementById("exportResult").textContent = isi;
    renderLog(notifLog);
  });

  overlay.classList.add("is-open");
}

document.getElementById("panelClose").addEventListener("click", () => overlay.classList.remove("is-open"));
overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.classList.remove("is-open"); });

muatDaftarMahasiswa();
