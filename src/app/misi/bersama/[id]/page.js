"use client";

// Detail misi bersama: progres, kontribusi tiap anggota, dan formulir
// menabung. Angka terkumpul dihitung ringkasMisiBersama() di analisis.js
// dari kontribusi tiap anggota — tidak pernah disimpan.

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import Button from "@/components/Button";
import Emblem from "@/components/Emblem";
import { useSosial } from "@/contexts/SosialProvider";
import { ringkasMisiBersama, rupiah } from "@/lib/analisis";

const NOMINAL_CEPAT = [5000, 10000, 20000];

function sisaHari(deadline) {
  if (!deadline) return null;
  const tenggat = new Date(deadline);
  if (Number.isNaN(tenggat.getTime())) return null;
  return Math.max(0, Math.ceil((tenggat - new Date()) / 86400000));
}

function inisial(nama = "") {
  return (
    nama
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((k) => k[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

export default function DetailMisiBersamaPage() {
  const { id } = useParams();
  const router = useRouter();
  const { misiBersama, loading, uidSaya, tabungBersama, hapusMisiBersama } =
    useSosial();

  const [nominal, setNominal] = useState("");
  const [menyimpan, setMenyimpan] = useState(false);
  const [umpan, setUmpan] = useState(null);
  const [yakinHapus, setYakinHapus] = useState(false);

  const misi = misiBersama.find((m) => m.id === id);

  if (loading) {
    return (
      <AppShell>
        <div className="card h-72 animate-pulse rounded-[1.75rem] md:mx-auto md:max-w-2xl" />
      </AppShell>
    );
  }

  if (!misi) {
    return (
      <AppShell>
        <div className="card flex flex-col items-center gap-2 rounded-[1.75rem] px-6 py-10 text-center md:mx-auto md:max-w-2xl">
          <Emblem nama="arsip" size={28} className="text-filup-muted" />
          <p className="text-sm font-semibold">Misi bersama tidak ditemukan</p>
          <p className="max-w-xs text-xs leading-relaxed text-filup-muted">
            Misinya mungkin sudah dihapus pembuatnya, atau kamu bukan anggota
            misi ini.
          </p>
          <Link href="/misi" className="mt-2">
            <Button size="sm" variant="secondary">
              Kembali ke Misi
            </Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  const r = ringkasMisiBersama(misi);
  const hariLagi = sisaHari(misi.deadline);
  const pembuat = misi.pembuat === uidSaya;

  async function tabung(e) {
    e.preventDefault();
    if (menyimpan) return;
    setMenyimpan(true);
    setUmpan(null);
    const hasil = await tabungBersama(misi, nominal);
    setUmpan(
      hasil.ok
        ? { jenis: "ok", teks: `Setoran ${rupiah(Number(nominal))} tercatat. +${hasil.xpDidapat} XP` }
        : { jenis: "galat", teks: hasil.error }
    );
    if (hasil.ok) setNominal("");
    setMenyimpan(false);
  }

  async function hapus() {
    const hasil = await hapusMisiBersama(misi);
    if (hasil.ok) router.push("/misi");
    else setUmpan({ jenis: "galat", teks: hasil.error });
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
          <div className="mt-3 flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-filup-lavender text-[#2a1f55]">
              <Emblem nama={misi.icon ?? "misi"} size={23} />
            </span>
            <div className="min-w-0">
              <h1 className="font-display text-[26px] leading-tight tracking-tight md:text-[34px]">
                {misi.judul}
              </h1>
              <p className="text-xs text-filup-muted">
                Misi bersama · {r.perAnggota.length} anggota
                {hariLagi !== null && ` · ${hariLagi} hari lagi`}
              </p>
            </div>
          </div>
        </section>

        {/* Progres */}
        <section
          className="stagger card kartu-tint-indigo rounded-[1.75rem] p-5 md:p-6"
          style={{ animationDelay: "60ms" }}
        >
          <p className="text-xs text-filup-muted">Terkumpul bersama</p>
          <p className="mt-1 text-[34px] font-light leading-none tabular-nums">
            {rupiah(r.terkumpul)}
          </p>
          <p className="mt-1.5 text-xs text-filup-muted">
            dari target {rupiah(r.target)}
          </p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full ${r.selesai ? "progress-fill-done" : "progress-fill"}`}
              style={{ width: `${r.persen}%` }}
            />
          </div>
          <p className="mt-2 text-xs font-semibold">
            {r.selesai ? (
              <span className="flex items-center gap-1.5 text-filup-green">
                <Emblem nama="rayakan" size={13} />
                Target tercapai! Selamat untuk semua anggota.
              </span>
            ) : (
              <span className="text-filup-muted">
                {r.persen}% · kurang {rupiah(r.sisa)} lagi
              </span>
            )}
          </p>
        </section>

        {/* Formulir menabung */}
        {!r.selesai && (
          <section
            className="stagger card rounded-[1.75rem] p-5"
            style={{ animationDelay: "100ms" }}
          >
            <form onSubmit={tabung}>
              <label htmlFor="nominal" className="text-sm font-semibold">
                Catat setoranmu
              </label>
              <div className="mt-3 flex flex-wrap gap-2">
                {NOMINAL_CEPAT.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setNominal(String(n))}
                    className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold tabular-nums transition-colors ${
                      Number(nominal) === n
                        ? "border-filup-periwinkle bg-filup-periwinkle/15 text-filup-text"
                        : "border-white/15 text-filup-muted hover:border-white/35 hover:text-filup-text"
                    }`}
                  >
                    {rupiah(n)}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  id="nominal"
                  type="number"
                  min={500}
                  step={500}
                  inputMode="numeric"
                  value={nominal}
                  onChange={(e) => setNominal(e.target.value)}
                  placeholder="Nominal lain"
                  className="kolom-isian font-mono"
                />
                <Button
                  type="submit"
                  className="shrink-0"
                  disabled={menyimpan || !(Number(nominal) > 0)}
                >
                  {menyimpan ? "Menyimpan…" : "Tabung"}
                </Button>
              </div>
            </form>
            <p className="mt-3 text-xs leading-relaxed text-filup-muted">
              FiLUP mencatat, tidak memindahkan uang. Simpan uangnya di
              celengan atau rekeningmu sendiri.
            </p>
          </section>
        )}

        {umpan && (
          <p
            role="status"
            className={`flex items-center gap-1.5 text-xs font-medium ${
              umpan.jenis === "ok" ? "text-filup-green" : "text-filup-red"
            }`}
          >
            <Emblem nama={umpan.jenis === "ok" ? "centang" : "peringatan"} size={14} />
            {umpan.teks}
          </p>
        )}

        {/* Kontribusi anggota */}
        <section className="stagger" style={{ animationDelay: "140ms" }}>
          <h2 className="mb-2 text-[15px] font-bold tracking-tight">
            Setoran anggota
          </h2>
          <ul className="card divide-y divide-white/[0.06] rounded-[1.75rem] px-4">
            {r.perAnggota.map((a) => (
              <li key={a.uid} className="py-3">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="avatar-inisial flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                  >
                    {inisial(a.nama)}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                    {a.uid === uidSaya ? `${a.nama} (kamu)` : a.nama}
                    {a.uid === misi.pembuat && (
                      <span className="ml-1.5 text-[11px] font-normal text-filup-muted">
                        pembuat
                      </span>
                    )}
                  </span>
                  <span className="text-sm font-semibold tabular-nums">
                    {rupiah(a.jumlah)}
                  </span>
                </div>
                <div className="ml-12 mt-2 flex items-center gap-2">
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="progress-fill h-full rounded-full"
                      style={{ width: `${a.persen}%` }}
                    />
                  </div>
                  <span className="w-9 text-right text-[11px] tabular-nums text-filup-muted">
                    {a.persen}%
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {pembuat && (
          <section className="pt-2 text-center">
            {yakinHapus ? (
              <div className="card rounded-[1.5rem] p-4">
                <p className="text-sm font-semibold">
                  Hapus “{misi.judul}” untuk semua anggota?
                </p>
                <p className="mt-1 text-xs text-filup-muted">
                  Catatan setoran semua anggota ikut terhapus dan tidak bisa
                  dikembalikan.
                </p>
                <div className="mt-3 flex justify-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={hapus}
                    className="!border-filup-red/50 !text-filup-red hover:!bg-filup-red/10"
                  >
                    Hapus misi
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setYakinHapus(false)}>
                    Batal
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setYakinHapus(true)}
                className="text-xs font-semibold text-filup-muted underline-offset-4 hover:text-filup-red hover:underline"
              >
                Hapus misi bersama
              </button>
            )}
          </section>
        )}
      </div>
    </AppShell>
  );
}
