"use client";

// Penangkap galat tak terduga di sisi klien.
//
// Next.js mewajibkan berkas ini menjadi komponen klien dan menerima props
// { error, reset }. `reset` mencoba merender ulang bagian yang gagal tanpa
// memuat ulang seluruh halaman.

import { useEffect } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";

export default function Galat({ error, reset }) {
  useEffect(() => {
    // Dicatat ke console supaya masih bisa ditelusuri saat pengembangan.
    console.error("Galat aplikasi:", error);
  }, [error]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-myst-void px-5 text-center font-sans text-myst-text">

      <div className="transisi-halaman relative flex flex-col items-center">
        <div className="mb-8 flex items-center gap-4">
          <Logo teks={false} size={44} />
        </div>

        <p className="label-mono">ADA YANG TIDAK BERES</p>

        <h1 className="font-display mt-4 max-w-2xl text-[34px] leading-[1.1] tracking-[-0.02em] md:text-[56px]">
          Sesuatu gagal{" "}
          <span className="myst-gradient-word">dimuat</span>
        </h1>

        <p className="mt-6 max-w-md text-[15px] leading-relaxed text-myst-muted">
          Coba muat ulang bagian ini. Kalau masih gagal, kembali ke beranda —
          data yang sudah tersimpan tetap aman.
        </p>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={reset}
            className="rounded-full bg-myst-text px-8 py-3.5 text-sm font-semibold text-myst-void transition-opacity hover:opacity-85"
          >
            Coba Lagi
          </button>
          <Link
            href="/"
            className="rounded-full border border-myst-line px-8 py-3.5 text-sm text-myst-text transition-colors hover:border-myst-lilac/60"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
