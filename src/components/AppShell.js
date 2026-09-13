"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import RankBadge from "@/components/RankBadge";
import Emblem from "@/components/Emblem";
import Logo from "@/components/Logo";
import { rankForLevel } from "@/lib/ranks";

// Teman dan Kuis hanya ada di sidebar PC. Di HP, navigasi bawah tetap lima
// tombol (lebih dari itu, tiap target sentuh jadi terlalu sempit); keduanya
// dijangkau lewat kartu di beranda dan menu di Profil.
const NAV_ITEMS = [
  { href: "/dashboard", label: "Beranda", icon: "beranda" },
  { href: "/scan", label: "Scan", icon: "scan" },
  { href: "/misi", label: "Misi", icon: "misi" },
  { href: "/teman", label: "Teman", icon: "teman" },
  { href: "/kuis", label: "Kuis harian", icon: "kuis" },
  { href: "/asisten", label: "Asisten", icon: "asisten" },
  { href: "/profil", label: "Profil", icon: "profil" },
];

// Urutan navigasi bawah di HP. Scan dipindah ke TENGAH dan dijadikan tombol
// bundar yang menonjol: memotret struk adalah janji utama aplikasi ini, jadi
// ia tidak boleh punya bobot yang sama dengan empat menu lainnya — dan posisi
// tengah paling mudah dijangkau ibu jari.
const NAV_BAWAH = ["/dashboard", "/misi", "/scan", "/asisten", "/profil"].map(
  (href) => NAV_ITEMS.find((n) => n.href === href)
);

function inisial(nama = "") {
  const huruf = nama
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((k) => k[0]?.toUpperCase() ?? "")
    .join("");
  return huruf || "F";
}

function LevelPill({ profile, className = "" }) {
  const pct = Math.min(
    100,
    Math.round((profile.xp / profile.xpToNextLevel) * 100)
  );

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2">
          <RankBadge level={profile.level} size={24} />
          <span className="leading-tight">
            <span className="block text-xs font-bold text-filup-text">
              {rankForLevel(profile.level).name}
            </span>
            <span className="block text-[11px] text-filup-muted">
              Level {profile.level}
            </span>
          </span>
        </span>
        <span className="font-mono text-[11px] text-filup-muted">
          {profile.xp}/{profile.xpToNextLevel}
        </span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-filup-bg-2">
        <div className="xp-fill h-full rounded-full" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/** Layar tunggu saat status login masih diperiksa. */
function AuthLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <span className="animate-pulse">
        <Logo teks={false} size={52} />
      </span>
      <p className="text-sm text-filup-muted">Memuat akunmu...</p>
    </div>
  );
}

/**
 * @param tanpaHeaderMobile  sembunyikan bilah atas di HP — dipakai halaman yang
 *                           punya kepala sendiri (beranda aplikasi)
 * @param lebar              wadah isi lebih lebar di PC (untuk tata letak laporan)
 */
export default function AppShell({
  children,
  tanpaHeaderMobile = false,
  lebar = false,
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, user, loading, isLoggedIn, demoMode } = useAuth();

  // Penjaga halaman: kalau belum login, arahkan ke halaman masuk.
  // Di mode demo penjaga ini tidak aktif supaya tampilan tetap bisa dijelajahi.
  useEffect(() => {
    if (!loading && !isLoggedIn) router.replace("/login");
  }, [loading, isLoggedIn, router]);

  if (loading) return <AuthLoading />;
  if (!isLoggedIn) return <AuthLoading />;

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* ===== Sidebar (desktop) ===== */}
      <aside className="hidden shrink-0 border-r border-white/[0.06] bg-filup-bg-2/50 px-4 py-6 backdrop-blur-xl md:sticky md:top-0 md:flex md:h-screen md:w-64 md:flex-col">
        <Link href="/dashboard" className="mb-9 px-2">
          <Logo size={30} className="text-filup-text" />
        </Link>

        <nav className="flex-1 space-y-1" aria-label="Navigasi utama">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-white/[0.07] text-filup-text"
                    : "text-filup-muted hover:bg-white/[0.04] hover:text-filup-text"
                }`}
              >
                <Emblem
                  nama={item.icon}
                  size={19}
                  className={active ? "text-filup-periwinkle" : ""}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {demoMode && <DemoNotice className="mb-3" />}

        {/* Kartu pengguna di kaki sidebar */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3">
          <Link href="/profil" className="flex items-center gap-3">
            <span className="avatar-inisial flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold">
              {inisial(profile.name)}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-filup-text">
                {profile.name}
              </span>
              <span className="block truncate text-[11px] text-filup-muted">
                {user?.email ?? "Akun demo"}
              </span>
            </span>
          </Link>
          <LevelPill
            profile={profile}
            className="mt-3 border-t border-white/[0.06] pt-3"
          />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* ===== Top bar (mobile) ===== */}
        {!tanpaHeaderMobile && (
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/5 bg-filup-bg/80 px-4 py-3 backdrop-blur-xl md:hidden">
            <Link href="/dashboard">
              <Logo size={28} className="text-filup-text" />
            </Link>
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-filup-surface-2/70 py-1 pl-1 pr-3">
              <RankBadge level={profile.level} size={22} />
              <span className="font-mono text-[11px] text-filup-muted">
                {profile.xp}/{profile.xpToNextLevel}
              </span>
            </div>
          </header>
        )}

        {/* ===== Konten ===== */}
        <main
          className={`transisi-halaman mx-auto w-full max-w-md flex-1 px-4 pb-32 pt-5 md:px-8 md:pb-12 md:pt-8 ${
            lebar ? "md:max-w-6xl" : "md:max-w-5xl"
          }`}
        >
          {demoMode && <DemoNotice className="mb-4 md:hidden" />}
          {children}
        </main>

        {/* ===== Bottom nav (mobile) ===== */}
        <nav
          aria-label="Navigasi utama"
          className="fixed bottom-0 left-1/2 z-20 w-full max-w-md -translate-x-1/2 border-t border-white/[0.08] bg-[#120c1f]/95 px-2 pb-2 pt-1.5 backdrop-blur-xl md:hidden"
        >
          <ul className="grid grid-cols-5 items-end">
            {NAV_BAWAH.map((item) => {
              const active = pathname === item.href;

              if (item.href === "/scan") {
                return (
                  <li key={item.href} className="flex justify-center">
                    <Link
                      href="/scan"
                      aria-label="Scan struk"
                      aria-current={active ? "page" : undefined}
                      className="fab-scan flex -translate-y-6 items-center justify-center"
                    >
                      <Emblem nama="scan" size={24} />
                    </Link>
                  </li>
                );
              }

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] font-semibold transition-colors ${
                      active ? "text-filup-text" : "text-filup-muted"
                    }`}
                  >
                    <Emblem
                      nama={item.icon}
                      size={21}
                      className={active ? "text-filup-periwinkle" : ""}
                    />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}

/** Penanda bahwa aplikasi memakai data contoh (Firebase belum dikonfigurasi). */
function DemoNotice({ className = "" }) {
  return (
    <div
      className={`rounded-xl border border-filup-xp/25 bg-filup-xp/8 px-3 py-2 ${className}`}
    >
      <p className="text-[11px] leading-snug text-filup-xp">
        <span className="font-bold">Mode Demo</span> — data contoh. Isi{" "}
        <code className="font-mono">.env.local</code> untuk mengaktifkan akun
        sungguhan.
      </p>
    </div>
  );
}
