// Halaman Tentang — cerita tim di balik FiLUP, tema Mystic Editorial.

import Link from "next/link";
import NavPublik from "@/components/publik/NavPublik";
import { RasiPita, RasiSudut, RasiTegak } from "@/components/publik/Kilau";
import FooterPublik from "@/components/publik/FooterPublik";
import Logo from "@/components/Logo";
import { Reveal } from "@/components/LandingFx";

export const metadata = {
  title: "Tentang",  // template di layout.js sudah menambahkan " — FiLUP"
  description:
    "Cerita di balik FiLUP: dua pelajar SMK yang ingin mengubah cara pelajar mengatur uang jajannya.",
};

const PROFIL = [
  {
    no: "I",
    arcana: "Sang Pembangun",
    nama: "Rafa Perfours Mita",
    peran: "Pengembangan & Integrasi AI",
    isi: "Menulis seluruh kode FiLUP, dari autentikasi sampai pembacaan struk oleh AI.",
  },
  {
    no: "II",
    arcana: "Sang Perancang",
    nama: "Komang Tri Saguna Narya Ardana",
    peran: "Desain & Pengalaman Pengguna",
    isi: "Menyusun tampilan, alur, dan bahasa FiLUP agar terasa ringan dipakai pelajar.",
  },
];

const NILAI = [
  {
    judul: "Jujur soal AI",
    isi: "Kalau hasilnya masih simulasi, kami tulis apa adanya. AI membantu membaca, bukan mengambil keputusan untukmu.",
  },
  {
    judul: "Datamu milikmu",
    isi: "Catatan keuangan hanya bisa diakses oleh akunmu sendiri.",
  },
  {
    judul: "Ringan lebih dulu",
    isi: "Fitur boleh banyak, tapi mencatat satu transaksi harus tetap selesai dalam hitungan detik.",
  },
];

/** Kartu profil bergaya tarot — tanpa flip, cukup terangkat saat disorot. */
function KartuProfil({ p }) {
  return (
    <div className="group relative w-full max-w-[300px] border border-myst-line bg-myst-raised p-2 transition-transform duration-300 hover:-translate-y-3">
      <div className="border border-myst-line/60 px-6 pb-8 pt-6 text-center">
        <span className="label-mono !text-myst-lilac">{p.no}</span>

        {/* monogram dalam lingkaran busur */}
        <div className="relative mx-auto mt-6 flex h-28 w-28 items-center justify-center">
          <svg viewBox="0 0 80 80" aria-hidden="true" className="absolute inset-0 h-full w-full" fill="none">
            <circle cx="40" cy="40" r="37" stroke="var(--myst-line)" strokeWidth="1" strokeDasharray="4 6" />
            <circle cx="40" cy="40" r="29" stroke="var(--myst-line)" strokeWidth="1" />
          </svg>
          <span className="font-display text-4xl text-myst-lilac">
            {p.nama.charAt(0)}
          </span>
        </div>

        <p className="font-display mt-6 text-lg uppercase tracking-[0.14em] text-myst-text">
          {p.arcana}
        </p>
        <div className="mx-auto my-3 h-px w-10 bg-myst-line" />
        <p className="text-sm font-semibold text-myst-text">{p.nama}</p>
        <p className="label-mono mt-2">{p.peran}</p>
        <p className="mt-4 text-[13px] leading-relaxed text-myst-muted">{p.isi}</p>
      </div>

      {/* cahaya lilac tipis saat disorot */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ boxShadow: "0 24px 50px -16px rgba(0,0,0,0.7), 0 0 36px -8px rgba(201,169,255,0.35)" }} />
    </div>
  );
}

export default function Tentang() {
  return (
    <div className="min-h-screen bg-myst-void font-sans text-myst-text">
      <NavPublik />

      <main className="transisi-halaman relative">
        {/* ===== Hero ===== */}
        <section className="latar-aurora relative overflow-hidden px-5 pb-16 pt-36 text-center md:pb-24 md:pt-44">
          <RasiTegak
            opacity={0.4}
            className="absolute -left-4 top-28 hidden h-[380px] text-myst-lilac lg:block"
          />
          <RasiSudut
            balik
            opacity={0.38}
            className="absolute right-3 top-28 hidden h-36 text-myst-lilac md:block"
          />

          <div className="relative mx-auto max-w-4xl">
            <p className="label-mono">TENTANG FILUP</p>
            <h1 className="font-display mt-5 text-[36px] leading-[1.05] tracking-[-0.02em] md:text-[72px]">
              Dua pelajar, satu kebiasaan yang ingin kami{" "}
              <span className="myst-gradient-word">ubah</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-myst-muted md:text-[17px]">
              FiLUP lahir dari masalah yang kami alami sendiri: uang jajan
              habis, dan tidak ada yang ingat ke mana perginya.
            </p>
            <RasiPita opacity={0.5} className="mx-auto mt-10 w-52 text-myst-lilac" />
          </div>
        </section>

        {/* ===== Cerita ===== */}
        <section className="mx-auto max-w-2xl px-5 pb-20 md:pb-28">
          <Reveal>
            <div className="hairline mb-10" />
            <p className="text-[15px] leading-[1.9] text-myst-muted md:text-[17px]">
              Mencatat pengeluaran itu membosankan. Kami sudah mencoba buku
              catatan, aplikasi keuangan orang dewasa, sampai catatan di HP —
              semuanya berhenti di minggu kedua. Bukan karena malas mencatat,
              tapi karena mencatat terasa seperti pekerjaan tambahan yang tidak
              ada hadiahnya.
            </p>
            <p className="mt-6 text-[15px] leading-[1.9] text-myst-muted md:text-[17px]">
              FiLUP menghapus dua hambatan itu sekaligus. Foto struknya, biar
              AI yang mengetik. Lalu setiap catatan memberi XP, setiap misi
              tabungan punya progres yang terlihat — supaya kebiasaan baik
              terasa seperti naik level, bukan seperti tugas.
            </p>
            <div className="hairline mt-10" />
          </Reveal>
        </section>

        {/* ===== Kartu profil ===== */}
        <section className="relative mx-auto max-w-5xl overflow-hidden px-5 pb-20 md:pb-28">
          <Reveal className="relative text-center">
            <p className="label-mono">DUA ARCANA DI BALIK MEJA</p>
            <h2 className="font-display mt-4 text-[30px] md:text-[48px]">
              Tim STIBAJRA
            </h2>
          </Reveal>

          <div className="relative mt-12 flex flex-col items-center justify-center gap-8 md:flex-row md:items-stretch">
            {PROFIL.map((p, i) => (
              <Reveal key={p.no} delay={i * 120} className="flex justify-center">
                <KartuProfil p={p} />
              </Reveal>
            ))}
          </div>
        </section>

        {/* ===== Nilai ===== */}
        <section className="mx-auto max-w-6xl px-5 pb-20 md:px-8 md:pb-28">
          <div className="grid gap-px overflow-hidden border border-myst-line bg-myst-line md:grid-cols-3">
            {NILAI.map((n, i) => (
              <div key={n.judul} className="relative bg-myst-surface p-8">
                <span className="label-mono !text-myst-lilac">
                  {["I", "II", "III"][i]}
                </span>
                <h3 className="font-display mt-3 text-xl text-myst-text">
                  {n.judul}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-myst-muted">
                  {n.isi}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ===== Konteks lomba ===== */}
        <section className="relative mx-auto max-w-2xl overflow-hidden px-5 pb-20 text-center md:pb-28">

          {/* lambang FiLUP */}
          <div className="relative mb-6 flex items-center justify-center gap-3.5">
            <Logo teks={false} size={40} />
          </div>

          <p className="relative text-[15px] leading-relaxed text-myst-muted">
            FiLUP dikembangkan oleh{" "}
            <span className="text-myst-text">Tim STIBAJRA</span> dari{" "}
            <span className="text-myst-text">SMK TI Bali Global Jimbaran</span>{" "}
            untuk <span className="text-myst-text">Bali AI Tech Fest 2026</span>,
            kategori AI Web Innovation Challenge.
          </p>
        </section>

        {/* ===== Ajakan ===== */}
        <section className="mx-auto max-w-6xl px-5 pb-24 text-center md:pb-32">
          <div className="hairline mb-12" />
          <h2 className="font-display text-[28px] leading-tight md:text-[44px]">
            Ikut mengubah kebiasaannya?
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
