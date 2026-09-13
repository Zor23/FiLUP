// Footer minimalis bersama untuk halaman publik.

import Link from "next/link";
import Logo from "@/components/Logo";
import { RasiPita } from "@/components/publik/Kilau";

export default function FooterPublik() {
  return (
    <footer className="relative overflow-hidden border-t border-myst-line/60">
      <RasiPita
        opacity={0.45}
        className="absolute left-1/2 top-0 w-48 -translate-x-1/2 -translate-y-1/2 text-myst-lilac"
      />

      {/* Tiga kolom: kiri dan kanan sama lebar (1fr), menu di tengah (auto).
          Dengan flex justify-between, kolom tengah bergeser mengikuti selisih
          lebar logo dan label — menu jadi tidak segaris dengan ornamen di atas.

          Ruang bawah dilebihkan (pb-28 / md:pb-24) supaya baris footer duduk
          di atas tombol WhatsApp yang melayang di pojok kiri bawah, bukan
          sebaris dengannya. */}
      <div className="relative mx-auto grid w-full max-w-6xl justify-items-center gap-6 px-5 pb-28 pt-10 md:grid-cols-[1fr_auto_1fr] md:items-center md:px-8 md:pb-24">
        <Logo serif size={26} className="text-myst-text md:justify-self-start" />

        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <Link href="/" className="text-xs text-myst-muted transition-colors hover:text-myst-text">
            Beranda
          </Link>
          <Link href="/tentang" className="text-xs text-myst-muted transition-colors hover:text-myst-text">
            Tentang
          </Link>
          <Link href="/cara-kerja" className="text-xs text-myst-muted transition-colors hover:text-myst-text">
            Cara Kerja
          </Link>
          <Link href="/register" className="text-xs text-myst-muted transition-colors hover:text-myst-text">
            Daftar
          </Link>
        </nav>

        <p className="label-mono md:justify-self-end">Tim STIBAJRA · 2026</p>
      </div>
    </footer>
  );
}
