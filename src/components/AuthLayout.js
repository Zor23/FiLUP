import Link from "next/link";
import Emblem from "@/components/Emblem";
import Logo from "@/components/Logo";
import { RasiSudut, RasiTegak } from "@/components/publik/Kilau";

// Kerangka halaman Masuk & Daftar.
// Di HP: form saja (satu kolom). Di PC: form di kiri + panel promosi di kanan.
export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen">
      {/* ===== Kolom form ===== */}
      <div className="relative flex w-full flex-col justify-center px-4 pb-10 pt-20 md:w-1/2 md:px-12 md:py-10 lg:px-20">
        {/* Tombol kembali di pojok kiri atas. Di HP kolomnya diberi ruang atas
            ekstra (pt-20) supaya tombol ini tidak bertumpuk dengan logo. */}
        <Link
          href="/"
          className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3.5 py-2 text-xs font-semibold text-filup-muted transition-colors hover:border-white/35 hover:text-filup-text md:left-6 md:top-6"
        >
          <Emblem nama="kembali" size={14} />
          Kembali ke beranda
        </Link>

        <div className="transisi-halaman mx-auto w-full max-w-sm">
          <Logo href="/" size={34} />

          <h1 className="font-display mt-8 text-[28px] leading-tight tracking-tight md:text-[36px]">
            {title}
          </h1>
          <p className="mt-1.5 text-sm text-filup-muted">{subtitle}</p>

          <div className="mt-7">{children}</div>

          <p className="mt-6 text-center text-sm text-filup-muted">{footer}</p>
        </div>
      </div>

      {/* ===== Panel promosi (desktop) ===== */}
      <div className="latar-aurora relative hidden w-1/2 items-center justify-center overflow-hidden border-l border-white/5 bg-filup-bg-2/50 md:flex">
        <RasiTegak
          balik
          opacity={0.4}
          className="absolute -right-4 top-8 h-[400px] text-myst-lilac"
        />
        <RasiSudut
          opacity={0.32}
          className="absolute bottom-6 left-4 h-32 rotate-180 text-myst-lilac"
        />

        <div className="relative max-w-sm px-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-filup-primary/30 bg-filup-primary/10 px-3 py-1.5 text-xs font-semibold text-filup-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-filup-primary" />
            Finance Level Up
          </span>

          <h2 className="font-display mt-5 text-[34px] leading-tight tracking-tight">
            Kelola uang jajan,{" "}
            <span className="gradient-text-xp">kumpulkan XP</span>.
          </h2>

          <ul className="mt-7 space-y-4">
            {[
              { icon: "scan", t: "Scan struk, AI yang mencatat" },
              { icon: "misi", t: "Misi tabungan dengan progres jelas" },
              { icon: "asisten", t: "Asisten AI untuk saran keuangan" },
            ].map((f) => (
              <li key={f.t} className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-filup-surface-2 text-filup-primary ring-1 ring-inset ring-white/10">
                  <Emblem nama={f.icon} size={20} />
                </span>
                <span className="text-sm text-filup-muted">{f.t}</span>
              </li>
            ))}
          </ul>

          <p className="mt-9 border-t border-white/5 pt-5 text-xs text-filup-muted">
            Dibuat oleh Tim STIBAJRA — SMK TI Bali Global Jimbaran untuk Bali AI
            Tech Fest 2026.
          </p>
        </div>
      </div>
    </div>
  );
}
