"use client";

import Emblem from "@/components/Emblem";
import { useRef, useState } from "react";
import AppShell from "@/components/AppShell";
import Button from "@/components/Button";
import { useRouter } from "next/navigation";
import { useData } from "@/contexts/DataProvider";
import { formatRupiah } from "@/lib/mockData";
import { kompresGambar } from "@/lib/kompresGambar";

const TIPS = [
  "Pastikan seluruh struk terlihat dalam foto.",
  "Hindari bayangan dan pantulan cahaya.",
  "Bukti transfer dari m-banking juga bisa dibaca.",
];

const KATEGORI = ["Jajan", "Makanan", "Transport", "Belanja", "Uang Saku", "Lainnya"];

// Hasil contoh yang dipakai kalau GEMINI_API_KEY belum diisi, supaya alur
// aplikasi tetap bisa diperagakan tanpa API key.
const DEMO_RESULT = {
  merchant: "Indomaret",
  amount: 27500,
  category: "Jajan",
  type: "expense",
};

// Langkah-langkah proses, selalu terlihat supaya pengguna tahu posisinya.
const LANGKAH = ["Foto", "Periksa", "Selesai"];

export default function ScanPage() {
  const router = useRouter();
  const { addTransaction } = useData();
  const fileInputRef = useRef(null);

  // Nilai form hasil bacaan AI — bisa dikoreksi pengguna sebelum disimpan.
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | result | error | saved
  const [error, setError] = useState("");
  const [simulated, setSimulated] = useState(false);
  const [dragging, setDragging] = useState(false);

  // Posisi di stepper (indeks LANGKAH).
  const langkahAktif =
    status === "saved" ? 2 : status === "result" ? 1 : 0;

  async function processFile(file) {
    if (!file || !file.type?.startsWith("image/")) return;

    setPreview(URL.createObjectURL(file));
    setStatus("loading");
    setError("");
    setSimulated(false);

    // Foto kamera HP bisa 3-12 MB. Diperkecil dulu supaya unggahan cepat di
    // data seluler dan tidak ditolak server karena kebesaran.
    const berkas = await kompresGambar(file);

    // Model sibuk ditangani diam-diam: indikator "AI sedang membaca" tetap
    // berjalan sambil aplikasi berpindah ke model lain, tanpa pesan teknis.
    const MAX_SILENT_RETRIES = 2;
    let skipModels = [];

    for (let attempt = 0; ; attempt++) {
      try {
        const formData = new FormData();
        formData.append("image", berkas);
        if (skipModels.length) {
          formData.append("skipModels", skipModels.join(","));
        }

        const res = await fetch("/api/scan-receipt", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();

        if (res.ok) {
          setForm(toForm(data));
          setStatus("result");
          return;
        }

        // API key belum diisi → tampilkan hasil simulasi, bukan pesan error,
        // supaya demo tetap berjalan.
        if (data.code === "NO_API_KEY") {
          setForm(toForm(DEMO_RESULT));
          setSimulated(true);
          setStatus("result");
          return;
        }

        if (data.code === "MODEL_BUSY" && attempt < MAX_SILENT_RETRIES) {
          skipModels = [...new Set([...skipModels, ...(data.tried ?? [])])];
          await new Promise((r) => setTimeout(r, 1500));
          continue;
        }

        if (data.code === "MODEL_BUSY") {
          setError(
            "AI sedang sibuk membaca banyak permintaan. Coba ketuk “Coba Lagi” sebentar lagi."
          );
          setStatus("error");
          return;
        }

        setError(data.error ?? "Gagal membaca struk. Coba foto ulang.");
        setStatus("error");
        return;
      } catch {
        if (attempt < MAX_SILENT_RETRIES) {
          await new Promise((r) => setTimeout(r, 1500));
          continue;
        }
        setError("Tidak dapat menghubungi server. Periksa koneksi internetmu.");
        setStatus("error");
        return;
      }
    }
  }

  async function handleSave() {
    if (!form || saving) return;
    setSaving(true);

    const hasil = await addTransaction({
      merchant: form.merchant.trim() || "Tanpa nama",
      amount: Number(form.amount) || 0,
      type: form.type,
      category: form.category,
      source: "struk",
    });

    setSaving(false);

    if (!hasil.ok) {
      setError(hasil.error ?? "Gagal menyimpan transaksi.");
      setStatus("error");
      return;
    }

    // Tunjukkan dulu umpan balik sukses + XP, baru pindah ke dashboard —
    // supaya pengguna sempat melihat hasil usahanya.
    setStatus("saved");
    setTimeout(() => router.push("/dashboard"), 1600);
  }

  function reset() {
    setPreview(null);
    setForm(null);
    setError("");
    setSimulated(false);
    setStatus("idle");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <AppShell>
      <div className="space-y-5 md:mx-auto md:max-w-4xl">
        <section className="stagger flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="label-mono">LANGKAH I · PEMBACAAN</span>
            <h1 className="font-display mt-2 text-[28px] leading-tight tracking-tight md:text-[38px]">
              Scan Struk
            </h1>
            <p className="mt-1 text-sm text-filup-muted">
              Foto struk atau bukti transfer — AI yang mencatat.
            </p>
          </div>

          {/* Stepper */}
          <div className="flex items-center gap-1.5">
            {LANGKAH.map((l, i) => (
              <div key={l} className="flex items-center gap-1.5">
                <span
                  className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold transition-all ${
                    i === langkahAktif
                      ? "btn-gradient text-white"
                      : i < langkahAktif
                        ? "bg-filup-green/15 text-filup-green"
                        : "bg-filup-surface-2/60 text-filup-muted"
                  }`}
                >
                  {i < langkahAktif ? <Emblem nama="centang" size={11} /> : i + 1}{" "}
                  {l}
                </span>
                {i < LANGKAH.length - 1 && (
                  <span className="h-px w-3 bg-filup-border" />
                )}
              </div>
            ))}
          </div>
        </section>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => processFile(e.target.files?.[0])}
          className="hidden"
        />

        {/* ===== Langkah 1: pilih foto ===== */}
        {status === "idle" && (
          <div className="grid gap-4 md:grid-cols-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                processFile(e.dataTransfer.files?.[0]);
              }}
              className={`stagger card card-hover group flex w-full flex-col items-center justify-center gap-4 border-dashed py-14 md:col-span-2 ${
                dragging ? "!border-filup-primary/70 bg-filup-primary/5" : ""
              }`}
              style={{ animationDelay: "60ms" }}
            >
              <span className="relative flex h-20 w-20 items-center justify-center">
                <span className="absolute inset-0 animate-ping rounded-full bg-filup-primary/15" />
                <span className="glow-primary relative flex h-16 w-16 items-center justify-center rounded-2xl bg-filup-primary/15 text-filup-primary ring-1 ring-inset ring-filup-primary/30 transition-transform duration-300 group-hover:scale-110">
                  <Emblem nama="scan" size={32} />
                </span>
              </span>
              <span className="text-center">
                <span className="block text-sm font-bold">
                  Ketuk untuk ambil foto
                </span>
                <span className="mt-1 block text-xs text-filup-muted">
                  unggah dari galeri, atau seret gambar ke sini
                </span>
              </span>
              <span className="rounded-full border border-filup-xp/30 bg-filup-xp/10 px-3 py-1 text-[11px] font-bold text-filup-xp">
                +10 XP per transaksi
              </span>
            </button>

            {/* Tips */}
            <section
              className="stagger card p-4 md:self-start"
              style={{ animationDelay: "120ms" }}
            >
              <p className="mb-2 flex items-center gap-1.5 text-xs font-bold">
                <Emblem nama="gagasan" size={14} className="text-filup-primary" />
                Tips agar terbaca akurat
              </p>
              <ul className="space-y-1.5">
                {TIPS.map((t) => (
                  <li
                    key={t}
                    className="flex gap-2 text-xs leading-relaxed text-filup-muted"
                  >
                    <span className="text-filup-primary">•</span>
                    {t}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}

        {/* ===== Memproses / periksa: gambar & panel berdampingan di PC ===== */}
        {status !== "idle" && status !== "saved" && (
          <div className="grid gap-4 md:grid-cols-5 md:items-start">
            {/* Pratinjau gambar */}
            {preview && (
              <div className="animate-pop card overflow-hidden p-0 md:col-span-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="Pratinjau struk"
                  className="max-h-64 w-full object-cover md:max-h-[420px]"
                />
                {status === "result" && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-t border-white/5 py-2.5 text-xs font-semibold text-filup-muted transition-colors hover:text-filup-text"
                  >
                    Ganti Foto
                  </button>
                )}
              </div>
            )}

            <div className="space-y-4 md:col-span-3">
              {/* Proses AI */}
              {status === "loading" && (
                <div className="card animate-pop flex items-center gap-4 p-5">
                  <span className="relative flex h-11 w-11 shrink-0 items-center justify-center">
                    <span className="absolute h-11 w-11 animate-spin rounded-full border-2 border-filup-primary/25 border-t-filup-primary" />
                    <Emblem nama="kecerdasan" size={19} className="text-filup-primary" />
                  </span>
                  <div>
                    <p className="text-sm font-bold">AI sedang membaca struk...</p>
                    <p className="mt-0.5 text-xs text-filup-muted">
                      Mengenali nama toko, nominal, dan kategori transaksi.
                    </p>
                  </div>
                </div>
              )}

              {/* Gagal membaca */}
              {status === "error" && (
                <div className="card animate-pop space-y-4 p-5">
                  <div className="flex items-start gap-2 rounded-xl border border-filup-red/25 bg-filup-red/10 px-3 py-2.5">
                    <Emblem nama="peringatan" size={16} className="mt-px shrink-0 text-filup-red" />
                    <p className="text-xs font-medium text-filup-red">{error}</p>
                  </div>
                  <Button variant="secondary" className="w-full" onClick={reset}>
                    Coba Lagi
                  </Button>
                </div>
              )}

              {/* Langkah 2: periksa hasil */}
              {status === "result" && form && (
                <div className="card animate-pop space-y-4 p-5">
                  {simulated ? (
                    <div className="flex items-start gap-2 rounded-xl border border-filup-xp/25 bg-filup-xp/10 px-3 py-2.5">
                      <Emblem nama="uji" size={16} className="mt-px shrink-0 text-filup-xp" />
                      <p className="text-xs font-medium text-filup-xp">
                        Hasil simulasi —{" "}
                        <code className="font-mono">GEMINI_API_KEY</code> belum
                        diisi, jadi struk belum benar-benar dibaca AI.
                      </p>
                    </div>
                  ) : (
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-filup-green">
                      <Emblem nama="centang" size={13} />
                      Terbaca! Periksa sebentar, koreksi kalau ada yang keliru.
                    </p>
                  )}

                  {/* Nominal — ditampilkan paling besar karena paling penting */}
                  <div className="rounded-2xl border border-white/8 bg-filup-bg-2/60 p-4 text-center">
                    <label
                      htmlFor="nominal"
                      className="text-[11px] font-medium uppercase tracking-wider text-filup-muted"
                    >
                      Nominal
                    </label>
                    <div className="mt-1 flex items-baseline justify-center gap-1">
                      <span
                        className={`font-mono text-lg font-bold ${
                          form.type === "income"
                            ? "text-filup-green"
                            : "text-filup-red"
                        }`}
                      >
                        {form.type === "income" ? "+" : "−"}
                      </span>
                      <input
                        id="nominal"
                        type="number"
                        min={0}
                        value={form.amount}
                        onChange={(e) =>
                          setForm({ ...form, amount: e.target.value })
                        }
                        className="w-40 bg-transparent text-center font-mono text-3xl font-extrabold outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                    </div>
                    <p className="mt-0.5 font-mono text-[11px] text-filup-muted">
                      {formatRupiah(Number(form.amount) || 0)}
                    </p>
                  </div>

                  {/* Jenis: dua tombol besar, bukan dropdown */}
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { v: "expense", label: "Pengeluaran", icon: "↑", tint: "red" },
                      { v: "income", label: "Pemasukan", icon: "↓", tint: "green" },
                    ].map((j) => (
                      <button
                        key={j.v}
                        type="button"
                        onClick={() => setForm({ ...form, type: j.v })}
                        className={`rounded-xl border py-2.5 text-xs font-bold transition-all ${
                          form.type === j.v
                            ? j.tint === "red"
                              ? "border-filup-red/50 bg-filup-red/12 text-filup-red"
                              : "border-filup-green/50 bg-filup-green/12 text-filup-green"
                            : "border-filup-border bg-filup-bg-2 text-filup-muted hover:text-filup-text"
                        }`}
                      >
                        {j.icon} {j.label}
                      </button>
                    ))}
                  </div>

                  {/* Kategori: chip yang tinggal diketuk, bukan dropdown */}
                  <div>
                    <p className="mb-1.5 text-xs font-semibold text-filup-muted">
                      Kategori
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {KATEGORI.map((k) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => setForm({ ...form, category: k })}
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                            form.category === k
                              ? "btn-gradient text-white"
                              : "border border-filup-border bg-filup-bg-2 text-filup-muted hover:text-filup-text"
                          }`}
                        >
                          {k}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="merchant"
                      className="mb-1.5 block text-xs font-semibold text-filup-muted"
                    >
                      Nama Toko / Sumber
                    </label>
                    <input
                      id="merchant"
                      value={form.merchant}
                      onChange={(e) =>
                        setForm({ ...form, merchant: e.target.value })
                      }
                      className="w-full rounded-xl border border-filup-border bg-filup-bg-2 px-3 py-2.5 text-sm outline-none transition-colors focus:border-filup-primary"
                    />
                  </div>

                  <div className="flex gap-3 pt-1">
                    <Button
                      variant="secondary"
                      className="flex-1"
                      onClick={reset}
                      disabled={saving}
                    >
                      Ulangi
                    </Button>
                    <Button
                      className="flex-[2]"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? "Menyimpan..." : "Simpan · +10 XP"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== Langkah 3: tersimpan ===== */}
        {status === "saved" && (
          <div className="card animate-pop flex flex-col items-center gap-3 px-6 py-12 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-filup-green/15 text-filup-green ring-1 ring-inset ring-filup-green/40">
              <Emblem nama="centang" size={30} />
            </span>
            <p className="text-lg font-extrabold">Transaksi tersimpan!</p>
            <span className="animate-pop rounded-full border border-filup-xp/40 bg-filup-xp/15 px-4 py-1.5 text-sm font-extrabold text-filup-xp">
              +10 XP
            </span>
            <p className="text-xs text-filup-muted">
              Mengantarmu kembali ke dashboard...
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}

// Mengubah hasil bacaan AI menjadi nilai awal form yang bisa diedit.
function toForm(data) {
  return {
    merchant: String(data.merchant ?? ""),
    amount: String(Number(data.amount) || 0),
    type: data.type === "income" ? "income" : "expense",
    category: normalizeCategory(data.category),
  };
}

// AI mengembalikan kategori dalam huruf kecil; disesuaikan dengan pilihan
// yang tersedia. Kategori tak dikenal jatuh ke "Lainnya".
function normalizeCategory(value) {
  const map = {
    makanan: "Makanan",
    transport: "Transport",
    jajan: "Jajan",
    belanja: "Belanja",
    "uang saku": "Uang Saku",
    lainnya: "Lainnya",
  };
  return map[String(value ?? "").toLowerCase().trim()] ?? "Lainnya";
}
