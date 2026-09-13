"use client";

import Emblem from "@/components/Emblem";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import AppShell from "@/components/AppShell";
import XPBar from "@/components/XPBar";
import RankBadge from "@/components/RankBadge";
import { rankForLevel, RANKS } from "@/lib/ranks";
import Button from "@/components/Button";
import { useAuth } from "@/contexts/AuthProvider";
import { useData } from "@/contexts/DataProvider";
import { formatRupiah } from "@/lib/mockData";

// Lencana dihitung dari data nyata, bukan daftar tetap.
function hitungLencana({ selesai, streakDays, level, jumlahTransaksi }) {
  return [
    {
      id: "b1",
      name: "Misi Pertama",
      desc: "Menyelesaikan 1 misi tabungan",
      icon: "misi",
      unlocked: selesai >= 1,
    },
    {
      id: "b2",
      name: "7 Hari Beruntun",
      desc: "Mencatat 7 hari tanpa jeda",
      icon: "beruntun",
      unlocked: streakDays >= 7,
    },
    {
      id: "b3",
      name: "Rajin Mencatat",
      desc: "Mencatat 10 transaksi",
      icon: "catatan",
      unlocked: jumlahTransaksi >= 10,
    },
    {
      id: "b4",
      name: "Level 5",
      desc: "Mencapai level 5",
      icon: "rayakan",
      unlocked: level >= 5,
    },
  ];
}

export default function ProfilPage() {
  const router = useRouter();
  const { user, profile, logout, demoMode } = useAuth();
  const { completedMissions, transactions, totalSaved } = useData();
  const [loggingOut, setLoggingOut] = useState(false);

  const selesai = completedMissions.length;
  const badges = hitungLencana({
    selesai,
    streakDays: profile.streakDays,
    level: profile.level,
    jumlahTransaksi: transactions.length,
  });
  const unlocked = badges.filter((b) => b.unlocked).length;

  async function handleLogout() {
    setLoggingOut(true);
    await logout();
    router.replace("/login");
  }

  return (
    <AppShell>
      <div className="space-y-5 md:mx-auto md:max-w-2xl">
        {/* ===== Kartu profil ===== */}
        <section className="stagger card relative overflow-hidden p-6 text-center">

          <div className="relative flex flex-col items-center">
            <div className="relative">
              <div className="glow-primary flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-filup-primary to-filup-primary-dark text-2xl font-extrabold text-white ring-4 ring-filup-bg">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <span className="absolute -bottom-2 -right-2">
                <RankBadge level={profile.level} size={34} withGlow />
              </span>
            </div>

            <h1 className="font-display mt-4 text-2xl leading-tight tracking-tight">
              {profile.name}
            </h1>
            <p className="gradient-text-xp text-sm font-bold">
              Rank {rankForLevel(profile.level).name} · Level {profile.level}
            </p>
            {user?.email && (
              <p className="mt-1 text-xs text-filup-muted">{user.email}</p>
            )}

            <div className="mt-5 grid w-full grid-cols-3 gap-3 border-t border-white/5 pt-5">
              <Stat value={profile.streakDays} label="Hari beruntun" />
              <Stat value={selesai} label="Misi selesai" />
              <Stat value={`${unlocked}/${badges.length}`} label="Lencana" />
            </div>

            <div className="mt-5 w-full">
              <XPBar
                level={profile.level}
                xp={profile.xp}
                xpToNextLevel={profile.xpToNextLevel}
              />
            </div>
          </div>
        </section>

        {/* ===== Total tabungan ===== */}
        <section
          className="stagger card flex items-center justify-between p-5"
          style={{ animationDelay: "60ms" }}
        >
          <div>
            <p className="text-[11px] uppercase tracking-wider text-filup-muted">
              Total pernah ditabung
            </p>
            <p className="mt-1 font-mono text-2xl font-extrabold text-filup-xp">
              {formatRupiah(totalSaved)}
            </p>
          </div>
          <Emblem nama="brankas" size={30} className="text-filup-xp" />
        </section>

        {/* ===== Jenjang rank ===== */}
        <section className="stagger" style={{ animationDelay: "90ms" }}>
          <h2 className="label-mono mb-3 block">
            Jenjang Rank
          </h2>
          <div className="card p-4">
            <div className="flex items-start justify-between gap-1">
              {RANKS.map((r) => {
                const tercapai = profile.level >= r.minLevel;
                const aktif = rankForLevel(profile.level).id === r.id;
                return (
                  <div
                    key={r.id}
                    className={`flex flex-1 flex-col items-center gap-1 text-center transition-all ${
                      tercapai ? "" : "opacity-35 grayscale"
                    }`}
                    title={`${r.name} — mulai Level ${r.minLevel}. ${r.desc}`}
                  >
                    <RankBadge rank={r} size={aktif ? 44 : 34} withGlow={aktif} />
                    <span
                      className={`text-[10px] font-bold leading-tight ${
                        aktif ? "text-filup-xp" : "text-filup-text"
                      }`}
                    >
                      {r.name}
                    </span>
                    <span className="text-[9px] text-filup-muted">
                      Lv.{r.minLevel}+
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 border-t border-white/5 pt-3 text-center text-[11px] text-filup-muted">
              {rankForLevel(profile.level).desc}
            </p>
          </div>
        </section>

        {/* ===== Lencana ===== */}
        <section className="stagger" style={{ animationDelay: "120ms" }}>
          <h2 className="label-mono mb-3 block">
            Lencana Pencapaian
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {badges.map((b) => (
              <div
                key={b.id}
                title={b.desc}
                className={`card flex flex-col items-center gap-1.5 p-4 text-center transition-all ${
                  b.unlocked
                    ? "!border-filup-xp/35 glow-xp"
                    : "opacity-45 grayscale"
                }`}
              >
                <Emblem
                  nama={b.icon}
                  size={26}
                  className={b.unlocked ? "text-filup-xp" : "text-filup-muted"}
                />
                <span className="text-[11px] font-bold leading-tight">
                  {b.name}
                </span>
                <span className="text-[10px] leading-tight text-filup-muted">
                  {b.unlocked ? "Terbuka" : "Belum terbuka"}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ===== Menu ===== */}
        <section
          className="stagger space-y-2"
          style={{ animationDelay: "180ms" }}
        >
          <MenuLink href="/teman" icon="teman" label="Teman" />
          <MenuLink href="/kuis" icon="kuis" label="Kuis harian" />
          <MenuLink href="/riwayat" icon="riwayat" label="Riwayat Transaksi" />
          <MenuLink href="/misi" icon="misi" label="Semua Misi" />
          <div className="card flex items-center justify-between p-4 opacity-55">
            <span className="flex items-center gap-3 text-sm font-semibold">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-filup-surface-2 text-filup-muted ring-1 ring-inset ring-white/10">
                <Emblem nama="pengaturan" size={18} />
              </span>
              Pengaturan Akun
            </span>
            <span className="text-[11px] text-filup-muted">Segera hadir</span>
          </div>
        </section>

        <Button
          variant="secondary"
          className="stagger w-full"
          style={{ animationDelay: "240ms" }}
          onClick={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? "Keluar..." : "Keluar dari Akun"}
        </Button>

        {demoMode && (
          <p className="pb-2 text-center text-[11px] text-filup-muted">
            Mode demo — sebagian angka masih memakai data contoh.
          </p>
        )}
      </div>
    </AppShell>
  );
}

function Stat({ value, label }) {
  return (
    <div>
      <p className="text-lg font-extrabold">{value}</p>
      <p className="text-[10px] leading-tight text-filup-muted">{label}</p>
    </div>
  );
}

function MenuLink({ href, icon, label }) {
  return (
    <Link
      href={href}
      className="card card-hover flex items-center justify-between p-4"
    >
      <span className="flex items-center gap-3 text-sm font-semibold">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-filup-surface-2 text-filup-primary ring-1 ring-inset ring-white/10">
          <Emblem nama={icon} size={18} />
        </span>
        {label}
      </span>
      <span className="text-filup-muted">›</span>
    </Link>
  );
}
