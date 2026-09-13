"use client";

// Kartu "Wawasan AI" di beranda aplikasi.
//
// Alurnya sengaja dibuat atas permintaan pengguna, bukan otomatis saat halaman
// dibuka: dashboard tetap ringan dan minimalis, dan kuota Gemini tidak terpakai
// untuk sesuatu yang mungkin tidak dilihat.
//
// Angka-angkanya dihitung di server (src/lib/analisis.js); AI hanya menyusun
// kalimatnya. Kalau AI tidak tersedia, server tetap mengirim wawasan hasil
// hitungan murni — jadi kartu ini tidak pernah menampilkan pesan gagal.

import Emblem from "@/components/Emblem";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { useData } from "@/contexts/DataProvider";

// Warna per nada temuan. Merah dipakai untuk peringatan dan hijau untuk kabar
// baik — konsisten dengan arti warna di seluruh aplikasi.
const NADA = {
  baik: { titik: "bg-filup-green", teks: "text-filup-green" },
  netral: { titik: "bg-filup-primary", teks: "text-filup-primary" },
  peringatan: { titik: "bg-filup-red", teks: "text-filup-red" },
};

/** Tenggat bawaan untuk misi hasil saran: 30 hari dari hari ini. */
function tenggatTigaPuluhHari() {
  const d = new Date(Date.now() + 30 * 86400000);
  return d.toISOString().slice(0, 10);
}

function formatRupiahSingkat(nilai) {
  return `Rp${Number(nilai || 0).toLocaleString("id-ID")}`;
}

export default function WawasanAI() {
  const router = useRouter();
  const { transactions, missions, addMission } = useData();

  const [status, setStatus] = useState("idle"); // idle | memuat | siap
  const [wawasan, setWawasan] = useState(null);
  const [misiDibuat, setMisiDibuat] = useState(false);
  const [membuatMisi, setMembuatMisi] = useState(false);

  async function ambilWawasan() {
    setStatus("memuat");
    setMisiDibuat(false);
    try {
      const res = await fetch("/api/wawasan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions, missions }),
      });
      const data = await res.json();
      setWawasan(data.wawasan ?? null);
    } catch (err) {
      // Bahkan kalau jaringan putus, kartu tidak menampilkan pesan gagal —
      // cukup kembali ke keadaan awal supaya pengguna bisa mencoba lagi.
      console.error("Gagal mengambil wawasan:", err);
      setWawasan(null);
    }
    setStatus("siap");
  }

  async function buatMisiDariSaran() {
    if (!wawasan?.saranMisi || membuatMisi) return;
    setMembuatMisi(true);
    const hasil = await addMission({
      title: wawasan.saranMisi.judul,
      icon: wawasan.saranMisi.ikon,
      targetAmount: wawasan.saranMisi.targetAmount,
      deadline: tenggatTigaPuluhHari(),
      status: "active",
    });
    setMembuatMisi(false);
    if (hasil?.ok) setMisiDibuat(true);
  }

  const kosong = transactions.length === 0;

  return (
    <section className="card relative overflow-hidden p-5">

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <span className="label-mono">WAWASAN AI</span>
          <p className="mt-1.5 text-sm text-filup-muted">
            {kosong
              ? "Catat transaksi dulu, lalu AI bisa membaca polanya."
              : "AI membaca pola pengeluaranmu dan menyarankan satu misi."}
          </p>
        </div>
      </div>

      {status !== "siap" && (
        <Button
          onClick={ambilWawasan}
          disabled={status === "memuat" || kosong}
          size="sm"
          className="relative mt-4"
        >
          {status === "memuat" ? "Menganalisis..." : "Analisis keuanganku"}
        </Button>
      )}

      {status === "memuat" && (
        <div className="relative mt-4 space-y-2" aria-hidden="true">
          {[90, 75, 60].map((lebar) => (
            <div
              key={lebar}
              className="h-3 animate-pulse rounded-full bg-filup-surface-2"
              style={{ width: `${lebar}%` }}
            />
          ))}
        </div>
      )}

      {status === "siap" && wawasan && (
        <div className="relative mt-4">
          <p className="text-sm leading-relaxed text-filup-text">
            {wawasan.ringkasan}
          </p>

          {wawasan.temuan.length > 0 && (
            <ul className="mt-4 space-y-3 border-t border-white/5 pt-4">
              {wawasan.temuan.map((t, i) => {
                const nada = NADA[t.nada] ?? NADA.netral;
                return (
                  <li key={i} className="flex gap-2.5">
                    <span
                      aria-hidden="true"
                      className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${nada.titik}`}
                    />
                    <span>
                      <span className={`block text-xs font-bold ${nada.teks}`}>
                        {t.judul}
                      </span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-filup-muted">
                        {t.isi}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}

          {wawasan.saranMisi && (
            <div className="mt-4 rounded-xl border border-filup-primary/25 bg-filup-primary/8 p-4">
              <span className="label-mono">SARAN MISI</span>
              <div className="mt-2 flex items-center gap-2.5">
                <span className="text-filup-primary">
                  <Emblem nama={wawasan.saranMisi.ikon} size={22} />
                </span>
                <span>
                  <span className="block text-sm font-bold text-filup-text">
                    {wawasan.saranMisi.judul}
                  </span>
                  <span className="block font-mono text-xs text-filup-xp">
                    {formatRupiahSingkat(wawasan.saranMisi.targetAmount)}
                  </span>
                </span>
              </div>
              <p className="mt-2.5 text-xs leading-relaxed text-filup-muted">
                {wawasan.saranMisi.alasan}
              </p>

              {misiDibuat ? (
                <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-filup-green">
                  <Emblem nama="centang" size={13} />
                  Misi dibuat.{" "}
                  <button
                    onClick={() => router.push("/misi")}
                    className="underline underline-offset-2 hover:text-filup-text"
                  >
                    Lihat di halaman Misi
                  </button>
                </p>
              ) : (
                <Button
                  onClick={buatMisiDariSaran}
                  disabled={membuatMisi}
                  size="sm"
                  variant="outline"
                  className="mt-3"
                >
                  {membuatMisi ? "Menyimpan..." : "Buat misi ini"}
                </Button>
              )}
            </div>
          )}

          {/* Jujur soal asal wawasan — sejalan dengan nilai "Jujur soal AI"
              yang ditulis di halaman Tentang. */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-3">
            <span className="text-[10px] text-filup-muted">
              {wawasan.sumber === "ai"
                ? "Angka dihitung dari datamu, kalimatnya disusun oleh Gemini."
                : "Disusun langsung dari hitungan datamu, tanpa AI."}
            </span>
            <button
              onClick={ambilWawasan}
              className="text-[10px] font-semibold text-filup-primary hover:text-filup-text"
            >
              Analisis ulang
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
