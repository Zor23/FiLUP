"use client";

import Emblem from "@/components/Emblem";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import Button from "@/components/Button";
import { useData } from "@/contexts/DataProvider";
import { formatRupiah } from "@/lib/mockData";

// Pilihan cepat supaya pengguna tidak perlu mengetik dari nol.
const PRESETS = [
  { icon: "sepatu", title: "Sepatu Baru", amount: 450000 },
  { icon: "permainan", title: "Top Up Game", amount: 100000 },
  { icon: "musik", title: "Alat Musik", amount: 750000 },
  { icon: "buku", title: "Buku & Alat Tulis", amount: 150000 },
];

// Lambang yang bisa dipilih untuk misi. Dulu bagian ini kolom ketik emoji —
// hasilnya bergantung papan ketik masing-masing perangkat dan hampir selalu
// membawa warna hangat yang bertabrakan dengan tema. Sekarang pilihannya
// tertutup, jadi tidak ada misi yang bisa keluar dari tema.
const PILIHAN_LAMBANG = [
  "misi",
  "sepatu",
  "permainan",
  "musik",
  "buku",
  "belanja",
  "transport",
  "piala",
];

export default function MisiBaruPage() {
  const router = useRouter();
  const { addMission } = useData();
  const [error, setError] = useState("");
  const [icon, setIcon] = useState("misi");
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(false);

  function applyPreset(p) {
    setIcon(p.icon);
    setTitle(p.title);
    setTarget(String(p.amount));
  }

  // Perkiraan tabungan per minggu, dihitung langsung di layar.
  const weeks = deadline
    ? Math.max(
        1,
        Math.ceil(
          (new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24 * 7)
        )
      )
    : null;
  const perWeek = weeks && target ? Math.ceil(Number(target) / weeks) : null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const hasil = await addMission({
      title: title.trim(),
      icon,
      targetAmount: Number(target),
      deadline,
    });

    if (hasil.ok) {
      router.push("/misi");
      return;
    }

    setError(hasil.error ?? "Gagal menyimpan misi.");
    setLoading(false);
  }

  return (
    <AppShell>
      <div className="space-y-5 md:mx-auto md:max-w-2xl">
        <section className="stagger">
          <Link
            href="/misi"
            className="text-xs font-semibold text-filup-muted hover:text-filup-text"
          >
            ← Kembali ke Misi
          </Link>
          <h1 className="font-display mt-2 text-[28px] leading-tight tracking-tight md:text-[38px]">
            Buat Misi Baru
          </h1>
          <p className="mt-1 text-sm text-filup-muted">
            Tentukan target tabunganmu, lalu kejar sampai selesai.
          </p>
        </section>

        {/* Pilihan cepat */}
        <section className="stagger" style={{ animationDelay: "60ms" }}>
          <p className="mb-2 text-xs font-semibold text-filup-muted">
            Pilihan cepat
          </p>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {PRESETS.map((p) => (
              <button
                key={p.title}
                type="button"
                onClick={() => applyPreset(p)}
                className={`card card-hover p-3 text-left ${
                  title === p.title ? "!border-filup-primary/60" : ""
                }`}
              >
                <Emblem nama={p.icon} size={22} className="text-filup-primary" />
                <p className="mt-1.5 text-xs font-bold leading-tight">
                  {p.title}
                </p>
                <p className="font-mono text-[10px] text-filup-muted">
                  {formatRupiah(p.amount)}
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="stagger card space-y-4 p-5"
          style={{ animationDelay: "120ms" }}
        >
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-filup-muted">
              Nama Misi
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Misalnya: Sepatu Basket Baru"
              className="w-full rounded-xl border border-filup-border bg-filup-bg-2 px-3 py-2.5 text-sm outline-none transition-colors focus:border-filup-primary"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-filup-muted">
              Lambang
            </label>
            <div
              role="radiogroup"
              aria-label="Lambang misi"
              className="flex flex-wrap gap-2"
            >
              {PILIHAN_LAMBANG.map((nama) => {
                const dipilih = icon === nama;
                return (
                  <button
                    key={nama}
                    type="button"
                    role="radio"
                    aria-checked={dipilih}
                    onClick={() => setIcon(nama)}
                    className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-colors ${
                      dipilih
                        ? "border-filup-primary/60 bg-filup-primary/15 text-filup-primary"
                        : "border-filup-border bg-filup-bg-2 text-filup-muted hover:border-filup-primary/40 hover:text-filup-text"
                    }`}
                  >
                    <Emblem nama={nama} size={21} />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-filup-muted">
                Target Nominal (Rp)
              </label>
              <input
                type="number"
                required
                min={1000}
                step={1000}
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="450000"
                className="w-full rounded-xl border border-filup-border bg-filup-bg-2 px-3 py-2.5 font-mono text-sm outline-none transition-colors focus:border-filup-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-filup-muted">
                Target Tanggal Selesai
              </label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full rounded-xl border border-filup-border bg-filup-bg-2 px-3 py-2.5 text-sm outline-none transition-colors focus:border-filup-primary"
              />
            </div>
          </div>

          {/* Perkiraan otomatis */}
          {perWeek && (
            <div className="animate-pop rounded-xl border border-filup-primary/25 bg-filup-primary/8 p-3.5">
              <p className="text-xs text-filup-muted">
                Untuk mencapai target ini dalam{" "}
                <span className="font-semibold text-filup-text">
                  {weeks} minggu
                </span>
                , kamu perlu menabung sekitar
              </p>
              <p className="mt-1 font-mono text-lg font-extrabold text-filup-primary">
                {formatRupiah(perWeek)}
                <span className="text-xs font-medium text-filup-muted">
                  {" "}
                  / minggu
                </span>
              </p>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-filup-red/30 bg-filup-red/10 px-3 py-2.5">
              <p className="text-xs font-medium text-filup-red">{error}</p>
            </div>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? "Menyimpan..." : "Buat Misi & Mulai Kumpulkan XP"}
          </Button>
        </form>
      </div>
    </AppShell>
  );
}
