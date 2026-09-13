"use client";

import Emblem from "@/components/Emblem";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import Button from "@/components/Button";
import MissionCard from "@/components/MissionCard";
import { useData } from "@/contexts/DataProvider";
import { formatRupiah } from "@/lib/mockData";
import KartuMisiBersama from "@/components/KartuMisiBersama";
import { useSosial } from "@/contexts/SosialProvider";

export default function MisiPage() {
  const {
    activeMissions: active,
    completedMissions: completed,
    totalSaved: totalTerkumpul,
    loading,
  } = useData();
  const { misiBersama, uidSaya, teman } = useSosial();

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Judul + tombol */}
        <section className="stagger flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="label-mono">TARGET · PROGRES</span>
            <h1 className="font-display mt-2 text-[28px] leading-tight tracking-tight md:text-[38px]">
              Misi Tabungan
            </h1>
            <p className="mt-1 text-sm text-filup-muted">
              Kejar target tabunganmu seperti menyelesaikan misi di game.
            </p>
          </div>
          <Link href="/misi/baru" className="shrink-0">
            <Button className="w-full sm:w-auto">+ Buat Misi Baru</Button>
          </Link>
        </section>

        {/* Ringkasan */}
        <section
          className="stagger grid grid-cols-3 gap-3"
          style={{ animationDelay: "60ms" }}
        >
          {[
            { label: "Berjalan", value: active.length, tint: "text-filup-primary" },
            { label: "Selesai", value: completed.length, tint: "text-filup-green" },
            {
              label: "Terkumpul",
              value: formatRupiah(totalTerkumpul),
              tint: "text-filup-xp",
              mono: true,
            },
          ].map((s) => (
            <div key={s.label} className="card p-4">
              <p className="text-[11px] uppercase tracking-wider text-filup-muted">
                {s.label}
              </p>
              <p
                className={`mt-1 font-extrabold ${s.tint} ${
                  s.mono ? "font-mono text-sm md:text-base" : "text-2xl"
                }`}
              >
                {s.value}
              </p>
            </div>
          ))}
        </section>

        {/* Misi berjalan */}
        <section className="stagger" style={{ animationDelay: "120ms" }}>
          <h2 className="label-mono mb-3 flex items-center gap-2">
            Sedang Berjalan
            <span className="rounded-full bg-filup-surface-2 px-2 py-0.5 text-[11px] font-semibold text-filup-muted">
              {active.length}
            </span>
          </h2>

          {loading ? (
            <p className="card px-6 py-8 text-center text-sm text-filup-muted">
              Memuat misi...
            </p>
          ) : active.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {active.map((m) => (
                <MissionCard key={m.id} mission={m} />
              ))}
            </div>
          )}
        </section>

        {/* Misi bersama */}
        <section className="stagger" style={{ animationDelay: "150ms" }}>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="label-mono flex items-center gap-2">
              Misi Bersama
              <span className="rounded-full bg-filup-surface-2 px-2 py-0.5 text-[11px] font-semibold text-filup-muted">
                {misiBersama.length}
              </span>
            </h2>
            <Link
              href="/misi/bersama/baru"
              className="text-xs font-semibold text-filup-periwinkle transition-colors hover:text-filup-text"
            >
              + Misi bersama
            </Link>
          </div>

          {misiBersama.length === 0 ? (
            <div className="card flex flex-col items-center gap-2 border-dashed px-6 py-8 text-center">
              <Emblem nama="bersama" size={28} className="text-filup-periwinkle" />
              <p className="text-sm font-semibold">Menabung bareng teman</p>
              <p className="max-w-xs text-xs leading-relaxed text-filup-muted">
                Kejar satu target bersama — liburan kelas, kado, atau barang
                yang dipakai bareng — dan lihat setoran setiap anggota.
              </p>
              <Link
                href={teman.length > 0 ? "/misi/bersama/baru" : "/teman"}
                className="mt-1"
              >
                <Button size="sm">
                  {teman.length > 0 ? "Buat misi bersama" : "Tambah teman dulu"}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {misiBersama.map((m) => (
                <KartuMisiBersama key={m.id} misi={m} uidSaya={uidSaya} />
              ))}
            </div>
          )}
        </section>

        {/* Misi selesai */}
        {completed.length > 0 && (
          <section className="stagger" style={{ animationDelay: "180ms" }}>
            <h2 className="label-mono mb-3 flex items-center gap-2">
              Selesai
              <span className="rounded-full bg-filup-green/15 px-2 py-0.5 text-[11px] font-semibold text-filup-green">
                {completed.length}
              </span>
            </h2>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {completed.map((m) => (
                <MissionCard key={m.id} mission={m} />
              ))}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}

function EmptyState() {
  return (
    <div className="card flex flex-col items-center gap-3 border-dashed px-6 py-10 text-center">
      <Emblem nama="misi" size={30} className="text-filup-primary" />
      <p className="text-sm font-semibold">Belum ada misi berjalan</p>
      <p className="max-w-xs text-xs text-filup-muted">
        Buat misi pertamamu — misalnya menabung untuk sepatu baru — dan mulai
        kumpulkan XP.
      </p>
      <Link href="/misi/baru" className="mt-1">
        <Button size="sm">Buat Misi</Button>
      </Link>
    </div>
  );
}
