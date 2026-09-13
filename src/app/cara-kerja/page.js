// Halaman Cara Kerja — enam langkah FiLUP sebagai "tebaran kartu",
// diagram alur SVG sederhana, penjelasan jujur soal AI, dan tanya-jawab.

import Link from "next/link";
import NavPublik from "@/components/publik/NavPublik";
import { RasiPita, RasiSudut, RasiTegak } from "@/components/publik/Kilau";
import FooterPublik from "@/components/publik/FooterPublik";
import { Reveal } from "@/components/LandingFx";

export const metadata = {
  title: "Cara Kerja",  // template di layout.js sudah menambahkan " — FiLUP"
  description:
    "Enam langkah cara kerja FiLUP: dari foto struk, dibaca AI, sampai XP naik.",
};

const LANGKAH = [
  {
    no: "I",
    judul: "Buat akun",
    isi: "Daftar dengan email. Semua catatanmu tersimpan aman dan hanya bisa dibuka oleh akunmu sendiri.",
  },
  {
    no: "II",
    judul: "Foto struknya",
    isi: "Belanja, jajan, atau transfer — buka halaman Scan, foto buktinya langsung dari kamera HP.",
  },
  {
    no: "III",
    judul: "AI membaca",
    isi: "AI membaca nama toko, nominal total, dan menebak kategorinya secara otomatis dalam hitungan detik.",
  },
  {
    no: "IV",
    judul: "Kamu yang memutuskan",
    isi: "Hasil bacaan AI muncul sebagai formulir yang sudah terisi. Periksa, koreksi kalau perlu, baru simpan.",
  },
  {
    no: "V",
    judul: "Saldo & misi ikut bergerak",
    isi: "Saldo dihitung ulang otomatis dari seluruh transaksimu, dan progres misi tabungan ikut terupdate.",
  },
  {
    no: "VI",
    judul: "XP naik, level bertambah",
    isi: "Setiap catatan memberi XP. Kumpulkan cukup XP untuk naik level dan membuka lencana.",
  },
];

const TANYA_JAWAB = [
  {
    t: "Struk saya kusut, apakah tetap terbaca?",
    j: "Biasanya masih. Kalau gagal, formulir manual otomatis muncul.",
  },
  {
    t: "Apakah datanya bisa dilihat orang lain?",
    j: "Tidak. Setiap akun hanya bisa membaca datanya sendiri.",
  },
  {
    t: "Bagaimana kalau saya salah simpan?",
    j: "Transaksi bisa dilihat dan dikelola dari halaman Riwayat.",
  },
  {
    t: "Apakah gratis?",
    j: "Ya. FiLUP dibuat sebagai karya lomba dan bisa dipakai tanpa biaya.",
  },
];

/** Diagram alur sederhana: Foto → AI → Koreksi → Tersimpan → XP naik. */
function DiagramAlur() {
  const simpul = ["Foto struk", "AI membaca", "Kamu mengoreksi", "Tersimpan", "XP naik"];
  return (
    <div className="overflow-x-auto">
      <svg
        viewBox="0 0 920 120"
        role="img"
        aria-label="Alur: foto struk, AI membaca, kamu mengoreksi, tersimpan, XP naik"
        className="mx-auto min-w-[720px] max-w-full"
      >
        {simpul.map((s, i) => {
          const x = 20 + i * 185;
          const terakhir = i === simpul.length - 1;
          return (
            <g key={s}>
              <rect
                x={x}
                y="34"
                width="150"
                height="52"
                fill={terakhir ? "rgba(201,169,255,0.1)" : "var(--myst-surface)"}
                stroke={terakhir ? "var(--myst-lilac)" : "var(--myst-line)"}
                strokeWidth="1"
              />
              <text
                x={x + 75}
                y="64"
                textAnchor="middle"
                fill={terakhir ? "var(--myst-lilac)" : "var(--myst-text)"}
                fontSize="14"
                fontFamily="var(--font-sans)"
              >
                {s}
              </text>
              {!terakhir && (
                <g stroke="var(--myst-violet)" strokeWidth="1">
                  <line x1={x + 154} y1="60" x2={x + 181} y2="60" strokeDasharray="3 4" />
                  <path d={`M${x + 181} 60 l-5 -3.5 M${x + 181} 60 l-5 3.5`} fill="none" />
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function CaraKerja() {
  return (
    <div className="min-h-screen bg-myst-void font-sans text-myst-text">
      <NavPublik />

      <main className="transisi-halaman relative">
        {/* ===== Hero ===== */}
        <section className="latar-aurora relative overflow-hidden px-5 pb-16 pt-36 text-center md:pb-24 md:pt-44">
          <RasiTegak
            balik
            opacity={0.4}
            className="absolute -left-4 top-28 hidden h-[380px] text-myst-lilac lg:block"
          />
          <RasiSudut
            opacity={0.38}
            className="absolute right-3 top-28 hidden h-36 text-myst-lilac md:block"
          />

          <div className="relative mx-auto max-w-4xl">
            <p className="label-mono">CARA KERJA</p>
            <h1 className="font-display mt-5 text-[36px] leading-[1.05] tracking-[-0.02em] md:text-[72px]">
              Enam langkah, dan uangmu berhenti{" "}
              <span className="myst-gradient-word">menghilang</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-myst-muted md:text-[17px]">
              Tidak ada yang rumit. Ini seluruh cara kerja FiLUP dari awal
              sampai kamu naik level.
            </p>
            <RasiPita opacity={0.5} className="mx-auto mt-10 w-52 text-myst-lilac" />
          </div>
        </section>

        {/* ===== Enam langkah: tebaran kartu ===== */}
        <section className="relative mx-auto max-w-6xl overflow-hidden px-5 pb-20 md:px-8 md:pb-28">

          {/* garis rambut bertitik yang "menghubungkan" tebaran (desktop) */}
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-8 hidden h-[calc(100%-6rem)] w-px -translate-x-1/2 md:block"
            style={{
              background:
                "repeating-linear-gradient(180deg, var(--myst-line) 0 4px, transparent 4px 12px)",
            }}
          />

          <div className="relative space-y-5 md:space-y-0">
            {LANGKAH.map((l, i) => {
              const kiri = i % 2 === 0;
              return (
                <Reveal
                  key={l.no}
                  delay={60}
                  className={`md:flex md:py-4 ${kiri ? "md:justify-start" : "md:justify-end"}`}
                >
                  <div
                    className={`relative w-full border border-myst-line bg-myst-surface p-6 transition-transform duration-300 hover:-translate-y-1.5 md:w-[46%] ${
                      kiri ? "md:-rotate-1" : "md:rotate-1"
                    }`}
                  >
                    {/* titik penghubung ke garis tengah */}
                    <span
                      aria-hidden="true"
                      className={`absolute top-1/2 hidden h-2 w-2 -translate-y-1/2 rounded-full bg-myst-violet md:block ${
                        kiri ? "-right-[4.6%]" : "-left-[4.6%]"
                      }`}
                    />
                    <div className="flex items-baseline gap-4">
                      <span className="font-display text-2xl text-myst-lilac">
                        {l.no}
                      </span>
                      <div>
                        <h3 className="font-display text-xl text-myst-text">
                          {l.judul}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-myst-muted">
                          {l.isi}
                        </p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* ===== Diagram alur ===== */}
        <section className="mx-auto max-w-6xl px-5 pb-20 md:px-8 md:pb-28">
          <Reveal>
            <div className="relative overflow-hidden border border-myst-line bg-myst-raised/60 px-4 py-10 md:px-8">
              <p className="label-mono relative mb-8 text-center">
                SEKALI SCAN, DARI AWAL SAMPAI XP
              </p>
              <DiagramAlur />
            </div>
          </Reveal>
        </section>

        {/* ===== Apa yang dilakukan AI-nya ===== */}
        <section className="mx-auto max-w-2xl px-5 pb-20 text-center md:pb-28">
          <Reveal>
            <h2 className="font-display text-[28px] leading-tight md:text-[44px]">
              Apa yang dilakukan AI-nya?
            </h2>
            <p className="mt-6 text-[15px] leading-[1.9] text-myst-muted md:text-[17px]">
              FiLUP memakai Gemini untuk dua hal: membaca gambar struk, dan
              menjawab pertanyaan di halaman Asisten. AI tidak pernah menyimpan
              transaksi tanpa persetujuanmu — setiap hasil bacaan selalu
              ditampilkan sebagai formulir yang bisa kamu koreksi lebih dulu.
              Kalau AI gagal membaca gambar, kamu tetap bisa mengisi manual.
            </p>
          </Reveal>
        </section>

        {/* ===== Tanya-jawab ===== */}
        <section className="mx-auto max-w-2xl px-5 pb-20 md:pb-28">
          <Reveal className="text-center">
            <p className="label-mono">TANYA-JAWAB SINGKAT</p>
          </Reveal>
          <div className="mt-8 divide-y divide-myst-line border-y border-myst-line">
            {TANYA_JAWAB.map((q) => (
              <Reveal key={q.t} className="py-6">
                <h3 className="font-display text-lg text-myst-text">{q.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-myst-muted">
                  {q.j}
                </p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ===== Ajakan ===== */}
        <section className="relative mx-auto max-w-6xl overflow-hidden px-5 pb-24 text-center md:pb-32">
          <h2 className="font-display relative text-[28px] leading-tight md:text-[44px]">
            Langkah pertamamu dimulai{" "}
            <span className="myst-gradient-word">di sini</span>
          </h2>
          <Link
            href="/register"
            className="mt-7 inline-block rounded-full bg-myst-text px-8 py-3.5 text-sm font-semibold text-myst-void transition-opacity hover:opacity-85"
          >
            Mulai Gratis
          </Link>
        </section>
      </main>

      <FooterPublik />
    </div>
  );
}
