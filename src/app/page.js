// Beranda FiLUP — tema "Mystic Editorial".
// Pesan produk: pencatatan keuangan bergaya game untuk pelajar, dengan empat
// fitur inti.
//
// Hero dibagi dua: kalimat utama di kiri, mockup HP berisi dashboard di
// kanan. Aplikasi keuangan perlu MEMPERLIHATKAN produknya — melihat
// antarmuka dan angka yang nyata adalah sinyal kepercayaan terkuat, jauh
// lebih kuat daripada kalimat tentangnya.
//
// Ornamen rasi (bintang, pusaran, garis bertitik) hanya ada di tepi dan
// sudut, diam, dan tidak pernah berada di belakang teks atau angka.

import Link from "next/link";
import NavPublik from "@/components/publik/NavPublik";
import TombolWhatsApp from "@/components/TombolWhatsApp";
import FooterPublik from "@/components/publik/FooterPublik";
import DekTarot from "@/components/publik/KartuTarot";
import Logo from "@/components/Logo";
import Emblem from "@/components/Emblem";
import PonselDashboard from "@/components/publik/PonselDashboard";
import { RasiPita, RasiSudut, RasiTegak } from "@/components/publik/Kilau";
import { Reveal } from "@/components/LandingFx";

// Data keempat kartu tarot — isi teks dari dokumen redesain.
const KARTU_TAROT = [
  {
    no: "I",
    arcana: "Sang Pembaca",
    judul: "Scan Struk Otomatis",
    mono: "OCR · GEMINI",
    emblem: "pembaca",
    belakang:
      "Foto struk belanja atau bukti transfer, AI langsung membaca nominal dan kategorinya — kamu tinggal mengoreksi kalau ada yang meleset.",
  },
  {
    no: "II",
    arcana: "Sang Misi",
    judul: "Misi Tabungan",
    mono: "TARGET · PROGRES",
    emblem: "misi",
    belakang:
      "Buat misi untuk barang impianmu, lalu kejar targetnya seperti main game, lengkap dengan sisa hari dan progres.",
  },
  {
    no: "III",
    arcana: "Sang Penasihat",
    judul: "Asisten AI",
    mono: "CHAT · KONTEKS",
    emblem: "penasihat",
    belakang:
      "Tanya kondisi keuanganmu kapan saja dan dapat saran yang realistis, karena asistennya tahu saldo dan misimu yang sebenarnya.",
  },
  {
    no: "IV",
    arcana: "Sang Bintang",
    judul: "Naik Level",
    mono: "XP · LENCANA",
    emblem: "bintang",
    belakang:
      "Konsisten mencatat dan menabung membuat XP naik, level bertambah, dan lencana terbuka satu per satu.",
  },
];

const CUPLIKAN_LANGKAH = [
  { no: "I", judul: "Foto struknya", isi: "Arahkan kamera ke struk atau bukti transfer." },
  { no: "II", judul: "AI membaca", isi: "Nominal dan kategori terisi otomatis — kamu tinggal memeriksa." },
  { no: "III", judul: "XP naik", isi: "Setiap catatan menambah XP menuju level berikutnya." },
];

export default function Beranda() {
  return (
    <div className="relative min-h-screen bg-myst-void font-sans text-myst-text">
      <NavPublik />
      <TombolWhatsApp />

      <main className="transisi-halaman relative z-10">
        {/* ================= HERO ================= */}
        {/* overflow-x-clip, BUKAN overflow-hidden: rasi di tepi tetap dipotong ke
            samping (mencegah gulir horizontal), tapi cahaya ungu di bawah HP
            boleh turun melewati batas section. Dengan overflow-hidden cahaya
            itu terpotong lurus dan terlihat seperti kotak. */}
        <section className="latar-aurora relative flex min-h-[92vh] items-center overflow-x-clip px-5 pb-20 pt-28 md:px-8 md:pt-32 lg:pb-16">
          {/* rasi di tepi — hanya layar lebar, supaya di HP tidak menabrak judul */}
          <RasiTegak
            opacity={0.45}
            className="absolute -left-16 top-24 hidden h-[400px] text-myst-lilac xl:block"
          />
          <RasiSudut
            balik
            opacity={0.4}
            className="absolute right-4 top-20 hidden h-36 text-myst-lilac lg:block"
          />

          <div className="relative mx-auto grid w-full max-w-6xl items-center gap-14 lg:grid-cols-[1.12fr_0.88fr] lg:gap-8">
            {/* ---- kalimat utama ---- */}
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
              <h1 className="font-display text-[13vw] leading-[1.02] tracking-[-0.02em] sm:text-[56px] md:text-[80px] lg:text-[72px] xl:text-[88px]">
                Catat sekali,
                <br />
                naik level <span className="myst-gradient-word">seterusnya</span>
              </h1>

              <p className="mt-7 max-w-md text-[15px] leading-relaxed text-myst-muted md:text-[17px]">
                Aplikasi keuangan untuk pelajar. Foto struknya, AI yang mencatat,
                kamu yang naik level.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className="rounded-full bg-myst-text px-8 py-3.5 text-sm font-semibold text-myst-void transition-opacity hover:opacity-85"
                >
                  Mulai Gratis
                </Link>
                <Link
                  href="/cara-kerja"
                  className="rounded-full border border-myst-line px-8 py-3.5 text-sm text-myst-text transition-colors hover:border-myst-lilac/60"
                >
                  Lihat Cara Kerja
                </Link>
              </div>
            </div>

            {/* ---- mockup HP ---- */}
            <div className="relative flex justify-center lg:justify-end">
              <RasiTegak
                balik
                opacity={0.4}
                className="absolute -right-24 top-6 hidden h-[460px] text-myst-lilac lg:block"
              />

              <div className="relative">
                <PonselDashboard />

                {/* dua catatan melayang — ringkasan alur: struk terbaca, XP naik.
                    Keduanya di sisi KIRI: sisi kanan layar HP berisi kolom nominal,
                    dan catatan yang menutupi angka merusak ilustrasinya. */}
                <div
                  aria-hidden="true"
                  className="kartu-melayang absolute -left-24 top-28 hidden items-center gap-2.5 px-3.5 py-2.5 sm:flex"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-filup-periwinkle/20 text-filup-periwinkle">
                    <Emblem nama="scan" size={16} />
                  </span>
                  <span className="leading-tight">
                    <span className="block text-[11px] font-bold text-myst-text">Struk terbaca</span>
                    <span className="block text-[10px] text-myst-muted">Indomaret · Rp18.000</span>
                  </span>
                </div>
                <div
                  aria-hidden="true"
                  className="kartu-melayang absolute -left-32 bottom-36 hidden items-center gap-2 px-3.5 py-2.5 sm:flex"
                >
                  <Emblem nama="rayakan" size={16} className="text-filup-xp" />
                  <span className="leading-tight">
                    <span className="block text-[11px] font-bold text-filup-xp">+10 XP</span>
                    <span className="block text-[10px] text-myst-muted">Level 4 · Celengan</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= EMPAT KARTU TAROT ================= */}
        <section className="relative mx-auto w-full max-w-6xl overflow-hidden px-5 py-20 md:px-8 md:py-28">

          <RasiSudut
            opacity={0.35}
            className="absolute -right-2 top-16 hidden h-32 text-myst-lilac lg:block"
          />

          <Reveal className="relative mx-auto max-w-2xl text-center">
            <RasiPita opacity={0.5} className="mx-auto mb-6 w-56 text-myst-lilac" />
            <p className="label-mono">EMPAT ARCANA · EMPAT FITUR</p>
            <h2 className="font-display mt-4 text-[32px] leading-tight md:text-[56px]">
              Semua yang kamu butuh untuk{" "}
              <span className="myst-gradient-word">melek keuangan</span>
            </h2>
            <p className="mt-4 text-[15px] text-myst-muted md:text-[17px]">
              Dirancang khusus untuk pelajar — sederhana, cepat, dan tidak
              membosankan. Ketuk kartunya untuk membalik.
            </p>
          </Reveal>

          <div className="relative mt-10 md:mt-14">
            <DekTarot kartu={KARTU_TAROT} />
          </div>
        </section>

        {/* ================= PITA STATISTIK ================= */}
        <section className="mx-auto w-full max-w-6xl px-5 md:px-8">
          <div className="hairline" />
          <div className="flex flex-col items-center justify-center gap-3 py-7 sm:flex-row sm:gap-10">
            <span className="label-mono !text-myst-text">4 FITUR INTI</span>
            <span className="hidden h-3 w-px bg-myst-line sm:block" />
            <span className="label-mono !text-myst-text">
              &lt; 10 DETIK PER CATATAN
            </span>
            <span className="hidden h-3 w-px bg-myst-line sm:block" />
            <span className="label-mono !text-myst-text">
              100% BAHASA INDONESIA
            </span>
          </div>
          <div className="hairline" />
        </section>

        {/* ================= CUPLIKAN CARA KERJA ================= */}
        <section className="relative mx-auto w-full max-w-6xl overflow-hidden px-5 py-20 md:px-8 md:py-28">

          <RasiSudut
            balik
            opacity={0.35}
            className="absolute -left-2 top-12 hidden h-32 text-myst-lilac lg:block"
          />

          <Reveal className="relative mx-auto max-w-2xl text-center">
            <p className="label-mono">RITUALNYA SEDERHANA</p>
            <h2 className="font-display mt-4 text-[32px] leading-tight md:text-[56px]">
              Cukup tiga langkah
            </h2>
          </Reveal>

          <div className="relative mt-12 grid gap-4 md:grid-cols-3 md:gap-6">
            {CUPLIKAN_LANGKAH.map((l, i) => (
              <Reveal
                key={l.no}
                delay={i * 110}
                className="relative border border-myst-line bg-myst-surface/70 p-6 backdrop-blur-sm"
              >
                <span className="label-mono !text-myst-lilac">{l.no}</span>
                <h3 className="font-display mt-3 text-xl text-myst-text">
                  {l.judul}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-myst-muted">
                  {l.isi}
                </p>
              </Reveal>
            ))}
          </div>

          <Reveal className="relative mt-10 text-center">
            <Link
              href="/cara-kerja"
              className="text-sm font-semibold text-myst-lilac underline decoration-myst-lilac/40 underline-offset-4 transition-colors hover:text-myst-text"
            >
              Lihat keenam langkahnya →
            </Link>
          </Reveal>
        </section>

        {/* ================= AJAKAN PENUTUP ================= */}
        <section className="relative mx-auto w-full max-w-6xl px-5 pb-24 md:px-8 md:pb-32">
          <div className="latar-aurora-kartu relative overflow-hidden rounded-[1.75rem] border border-white/10 px-6 py-16 text-center md:py-20">
            <RasiSudut
              opacity={0.4}
              className="absolute -right-3 -top-3 h-28 text-myst-lilac md:h-36"
            />
            <RasiSudut
              balik
              opacity={0.3}
              className="absolute -bottom-6 -left-3 hidden h-32 rotate-180 text-myst-lilac md:block"
            />

            <Reveal className="relative">
              <Logo teks={false} size={44} className="mx-auto mb-6 justify-center" />
              <h2 className="font-display mx-auto max-w-2xl text-[30px] leading-tight md:text-[52px]">
                Kartumu sudah menunggu untuk{" "}
                <span className="myst-gradient-word">dibuka</span>
              </h2>
              <p className="mx-auto mt-4 max-w-md text-[15px] text-myst-muted">
                Buat akun gratis, catat transaksi pertamamu, dan lihat sendiri
                seberapa cepat XP-mu bertambah.
              </p>
              <Link
                href="/register"
                className="mt-8 inline-block rounded-full bg-myst-text px-8 py-3.5 text-sm font-semibold text-myst-void transition-opacity hover:opacity-85"
              >
                Buat Akun Sekarang
              </Link>
            </Reveal>
          </div>
        </section>
      </main>

      <div className="relative z-10">
        <FooterPublik />
      </div>
    </div>
  );
}
