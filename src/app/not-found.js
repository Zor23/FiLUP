// Halaman 404 — memakai tema Mystic Editorial supaya halaman salah alamat
// tetap terasa bagian dari FiLUP, bukan layar error mentah dari framework.

import Link from "next/link";
import Logo from "@/components/Logo";

export const metadata = {
  title: "Halaman tidak ditemukan — FiLUP",
};

export default function TidakDitemukan() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-myst-void px-5 text-center font-sans text-myst-text">

      <div className="transisi-halaman relative flex flex-col items-center">
        <div className="mb-8 flex items-center gap-4">
          <Logo teks={false} size={48} />
        </div>

        <p className="label-mono">GALAT 404</p>

        <h1 className="font-display mt-4 text-[48px] leading-[1.05] tracking-[-0.02em] md:text-[80px]">
          Kartu ini{" "}
          <span className="myst-gradient-word">tidak ada</span>
        </h1>

        <p className="mt-6 max-w-md text-[15px] leading-relaxed text-myst-muted md:text-[17px]">
          Halaman yang kamu cari sudah dipindah, dihapus, atau alamatnya salah
          ketik. Tidak ada catatan keuanganmu yang hilang.
        </p>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="rounded-full bg-myst-text px-8 py-3.5 text-sm font-semibold text-myst-void transition-opacity hover:opacity-85"
          >
            Kembali ke Beranda
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full border border-myst-line px-8 py-3.5 text-sm text-myst-text transition-colors hover:border-myst-lilac/60"
          >
            Buka Aplikasi
          </Link>
        </div>
      </div>
    </div>
  );
}
