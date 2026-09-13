"use client";

// Navigasi bersama untuk halaman publik (/, /tentang, /cara-kerja).
// Transparan di puncak halaman, menjadi buram (backdrop-blur) setelah
// gulir 40px. Di HP menu berubah jadi panel geser.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "@/components/Logo";

const MENU = [
  { href: "/", label: "Beranda" },
  { href: "/tentang", label: "Tentang" },
  { href: "/cara-kerja", label: "Cara Kerja" },
];

export default function NavPublik() {
  const pathname = usePathname();
  const [tergulir, setTergulir] = useState(false);
  const [bukaMenu, setBukaMenu] = useState(false);

  useEffect(() => {
    function onScroll() {
      setTergulir(window.scrollY > 40);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Tutup panel saat pindah halaman. Disetel SAAT RENDER, bukan di dalam
  // useEffect: React menjalankan ulang render ini sebelum apa pun tampil ke
  // layar, jadi panelnya tidak sempat terlihat sekejap di halaman baru.
  const [jalurTerakhir, setJalurTerakhir] = useState(pathname);
  if (jalurTerakhir !== pathname) {
    setJalurTerakhir(pathname);
    setBukaMenu(false);
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
        tergulir
          ? "border-b border-myst-line/60 bg-myst-void/80 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 md:px-8">
        {/* Logo + wordmark serif */}
        <Logo href="/" serif size={30} className="text-myst-text" />

        {/* Menu tengah — desktop */}
        <nav className="hidden items-center gap-8 md:flex">
          {MENU.map((m) => {
            const aktif = pathname === m.href;
            return (
              <Link
                key={m.href}
                href={m.href}
                className={`relative py-1 text-sm transition-colors ${
                  aktif ? "text-myst-text" : "text-myst-muted hover:text-myst-text"
                }`}
              >
                {m.label}
                {aktif && (
                  <span className="absolute inset-x-0 -bottom-0.5 h-px bg-myst-lilac" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Tombol kanan — desktop */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="rounded-full border border-myst-line px-4 py-2 text-sm text-myst-text transition-colors hover:border-myst-lilac/60"
          >
            Masuk
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-myst-text px-4 py-2 text-sm font-semibold text-myst-void transition-opacity hover:opacity-85"
          >
            Mulai Gratis
          </Link>
        </div>

        {/* Tombol menu — HP */}
        <button
          onClick={() => setBukaMenu((b) => !b)}
          aria-expanded={bukaMenu}
          aria-label={bukaMenu ? "Tutup menu" : "Buka menu"}
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-full border border-myst-line md:hidden"
        >
          <span
            className={`h-px w-4 bg-myst-text transition-transform ${
              bukaMenu ? "translate-y-[3.5px] rotate-45" : ""
            }`}
          />
          <span
            className={`h-px w-4 bg-myst-text transition-transform ${
              bukaMenu ? "-translate-y-[3.5px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {/* Panel geser — HP */}
      <div
        className={`overflow-hidden border-b border-myst-line/60 bg-myst-void/95 backdrop-blur-xl transition-all duration-300 md:hidden ${
          bukaMenu ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="space-y-1 px-5 py-4">
          {MENU.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className={`block rounded-lg px-3 py-2.5 text-sm ${
                pathname === m.href
                  ? "bg-myst-raised text-myst-text"
                  : "text-myst-muted"
              }`}
            >
              {m.label}
            </Link>
          ))}
          <div className="flex gap-2 pt-3">
            <Link
              href="/login"
              className="flex-1 rounded-full border border-myst-line py-2.5 text-center text-sm text-myst-text"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="flex-1 rounded-full bg-myst-text py-2.5 text-center text-sm font-semibold text-myst-void"
            >
              Mulai Gratis
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
