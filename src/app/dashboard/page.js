"use client";

// Beranda aplikasi.
//
// Dua tata letak untuk dua cara pakai yang berbeda, bukan satu tata letak yang
// diregangkan:
//
// - HP (<1024px): kartu saldo terang di atas dengan empat aksi bulat di
//   dalamnya, misi aktif yang bisa digeser, lalu lembar "Aktivitas terbaru".
//   Tombol Scan menjadi tombol bundar di tengah navigasi bawah (AppShell).
// - PC (>=1024px): laporan — judul besar, saldo di kanan atas, strip
//   pengeluaran per kategori, grafik pengeluaran harian, dan kolom misi.
//
// Seluruh angka uang datang dari src/lib/analisis.js (hitungStatistik,
// pengeluaranHarian). Komponen ini hanya menyusun tampilannya.
//
// Yang sengaja TIDAK ditiru dari referensi desain: lonceng notifikasi, kolom
// pencarian, tab, dan tombol bagikan/perbesar di grafik. FiLUP tidak punya
// fitur-fitur itu, dan tombol yang tidak berbuat apa-apa menggerus kepercayaan
// — hal yang paling mahal di aplikasi keuangan.

import { useMemo } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import Emblem from "@/components/Emblem";
import TransactionRow from "@/components/TransactionRow";
import WawasanAI from "@/components/WawasanAI";
import KartuKuis from "@/components/KartuKuis";
import TombolWhatsApp from "@/components/TombolWhatsApp";
import { useAuth } from "@/contexts/AuthProvider";
import { useData } from "@/contexts/DataProvider";
import { CATEGORY_STYLE } from "@/lib/mockData";
import {
  hitungStatistik,
  pengeluaranHarian,
  rupiah,
  rupiahSingkat,
} from "@/lib/analisis";
import { rankForLevel } from "@/lib/ranks";

const AKSI = [
  { href: "/scan", icon: "scan", label: "Scan" },
  { href: "/misi/baru", icon: "misi", label: "Misi baru" },
  { href: "/asisten", icon: "asisten", label: "Tanya AI" },
  { href: "/riwayat", icon: "riwayat", label: "Riwayat" },
];

const JUMLAH_HARI_GRAFIK = 14;

/* ---------- Pembantu tampilan ---------- */

function inisial(nama = "") {
  const huruf = nama
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((k) => k[0]?.toUpperCase() ?? "")
    .join("");
  return huruf || "F";
}

/** Saldo bisa negatif; tanda minusnya ditaruh di depan "Rp", bukan di tengah. */
function rupiahBertanda(n) {
  return n < 0 ? `−${rupiah(-n)}` : rupiah(n);
}

function sisaHari(deadline) {
  if (!deadline) return null;
  const tenggat = new Date(deadline);
  if (Number.isNaN(tenggat.getTime())) return null;
  return Math.max(0, Math.ceil((tenggat - new Date()) / 86400000));
}

function persenMisi(m) {
  const target = Number(m.targetAmount) || 0;
  if (target <= 0) return 0;
  return Math.min(
    100,
    Math.round(((Number(m.currentAmount) || 0) / target) * 100)
  );
}

function kunciHari(d) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/** Mengelompokkan transaksi per hari: "Hari ini", "Kemarin", lalu tanggal. */
function kelompokPerHari(daftar) {
  const sekarang = new Date();
  const kemarin = new Date(
    sekarang.getFullYear(),
    sekarang.getMonth(),
    sekarang.getDate() - 1
  );
  const grup = [];
  for (const tx of daftar) {
    const d = new Date(tx.createdAt);
    if (Number.isNaN(d.getTime())) continue;
    const k = kunciHari(d);
    const label =
      k === kunciHari(sekarang)
        ? "Hari ini"
        : k === kunciHari(kemarin)
          ? "Kemarin"
          : d.toLocaleDateString("id-ID", { day: "numeric", month: "long" });
    const terakhir = grup[grup.length - 1];
    if (terakhir && terakhir.kunci === k) terakhir.isi.push(tx);
    else grup.push({ kunci: k, label, isi: [tx] });
  }
  return grup;
}

// Anak tangga pembulatan sumbu. Kalau hanya 1–2–5–10, puncak Rp25 rb
// dibulatkan ke Rp50 rb dan batang tertinggi cuma mencapai separuh grafik.
const ANAK_TANGGA_SUMBU = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];

/**
 * Batas atas sumbu grafik yang "bulat", dengan ruang ±10% di atas puncak
 * untuk label nominalnya: 25.000 → 30.000, 18.000 → 20.000.
 */
function batasSumbu(maks) {
  if (maks <= 0) return 10000;
  const target = maks * 1.1;
  const pangkat = 10 ** Math.floor(Math.log10(target));
  const langkah = ANAK_TANGGA_SUMBU.find((a) => a * pangkat >= target) ?? 10;
  return langkah * pangkat;
}

/* ---------- Bagian-bagian kecil ---------- */

function JudulBagian({ judul, href, tautan = "Lihat semua" }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-[17px] font-bold tracking-tight text-filup-text">
        {judul}
      </h2>
      {href && (
        <Link
          href={href}
          className="text-[13px] font-semibold text-filup-muted transition-colors hover:text-filup-text"
        >
          {tautan}
        </Link>
      )}
    </div>
  );
}

function KeadaanKosong({ ikon, judul, isi, href, aksi }) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
      <Emblem nama={ikon} size={26} className="text-filup-periwinkle" />
      <p className="text-sm font-semibold text-filup-text">{judul}</p>
      <p className="max-w-xs text-xs leading-relaxed text-filup-muted">{isi}</p>
      {href && (
        <Link
          href={href}
          className="btn-gradient mt-2 rounded-full px-4 py-2 text-xs font-semibold text-white"
        >
          {aksi}
        </Link>
      )}
    </div>
  );
}

function BarisAktivitas({ tx }) {
  const masuk = tx.type === "income";
  const gaya = CATEGORY_STYLE[tx.category] ?? CATEGORY_STYLE.Lainnya;
  const jam = new Date(tx.createdAt).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <li className="flex items-center gap-3 py-3">
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/[0.06] ring-1 ring-inset ring-white/10 ${gaya.tint}`}
      >
        <Emblem nama={gaya.icon} size={20} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14px] font-semibold text-filup-text">
          {tx.merchant}
        </span>
        <span className="block truncate text-[12px] text-filup-muted">
          {tx.category} · {jam}
        </span>
      </span>
      <span
        className={`shrink-0 whitespace-nowrap text-[14px] font-semibold tabular-nums ${
          masuk ? "text-filup-green" : "text-filup-red"
        }`}
      >
        {masuk ? "+" : "−"}
        {rupiah(tx.amount)}
      </span>
    </li>
  );
}

/* ---------- Grafik pengeluaran harian (PC) ---------- */

function GrafikHarian({ hari }) {
  const maks = Math.max(0, ...hari.map((h) => h.total));
  const skala = batasSumbu(maks);
  const puncak = maks > 0 ? hari.find((h) => h.total === maks) : null;
  const total = hari.reduce((s, h) => s + h.total, 0);

  const tanggal = (h) =>
    new Date(`${h.tanggal}T12:00:00`).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });

  const ringkasan = puncak
    ? `Pengeluaran ${hari.length} hari terakhir: total ${rupiah(total)}, tertinggi ${rupiah(puncak.total)} pada ${tanggal(puncak)}.`
    : `Belum ada pengeluaran dalam ${hari.length} hari terakhir.`;

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[17px] font-bold tracking-tight">
            Pengeluaran harian
          </h2>
          <p className="mt-0.5 text-xs text-filup-muted">
            Total {rupiah(total)} dalam {hari.length} hari terakhir
          </p>
        </div>
        <Link
          href="/riwayat"
          className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-filup-muted transition-colors hover:border-white/25 hover:text-filup-text"
        >
          Lihat riwayat
        </Link>
      </div>

      {maks === 0 ? (
        <p className="py-16 text-center text-sm text-filup-muted">
          Belum ada pengeluaran dalam {hari.length} hari terakhir.
        </p>
      ) : (
        <div className="mt-8 flex gap-3" role="img" aria-label={ringkasan}>
          {/* sumbu Y */}
          <div
            aria-hidden="true"
            className="flex h-56 w-14 shrink-0 flex-col justify-between text-right text-[11px] tabular-nums text-filup-muted"
          >
            <span className="-translate-y-1/2">{rupiahSingkat(skala)}</span>
            <span className="-translate-y-1/2">{rupiahSingkat(skala / 2)}</span>
            <span className="translate-y-1/2">Rp0</span>
          </div>

          <div className="min-w-0 flex-1" aria-hidden="true">
            <div className="relative h-56">
              {/* garis bantu */}
              {[0, 50, 100].map((y) => (
                <span
                  key={y}
                  className="absolute inset-x-0 border-t border-dashed border-white/[0.07]"
                  style={{ top: `${y}%` }}
                />
              ))}

              <div className="relative flex h-full items-end gap-2">
                {hari.map((h) => {
                  const ada = h.total > 0;
                  const kelas = !ada
                    ? "batang-kosong"
                    : h === puncak
                      ? "batang-puncak"
                      : "batang-isi";
                  return (
                    <div
                      key={h.tanggal}
                      className="flex h-full flex-1 items-end"
                      title={`${tanggal(h)}: ${rupiah(h.total)}`}
                    >
                      <div
                        className={`relative w-full rounded-[12px] ${kelas}`}
                        style={{
                          height: ada
                            ? `${Math.max(6, (h.total / skala) * 100)}%`
                            : "14%",
                        }}
                      >
                        {ada && (
                          <span
                            className={`absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] tabular-nums ${
                              h === puncak
                                ? "font-bold text-filup-text"
                                : "text-filup-muted"
                            }`}
                          >
                            {rupiahSingkat(h.total)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* label tanggal */}
            <div className="mt-3 flex gap-2">
              {hari.map((h) => (
                <span
                  key={h.tanggal}
                  className={`flex-1 rounded-full py-1 text-center text-[11px] tabular-nums ${
                    h.hariIni
                      ? "bg-filup-periwinkle/20 font-bold text-filup-text"
                      : "text-filup-muted"
                  }`}
                >
                  {Number(h.tanggal.slice(8, 10))}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Halaman ---------- */

export default function DashboardPage() {
  const { profile } = useAuth();
  const {
    transactions,
    missions,
    activeMissions,
    balance,
    totalIncome,
    totalExpense,
    loading,
    dataError,
  } = useData();

  const stat = useMemo(
    () => hitungStatistik(transactions, missions),
    [transactions, missions]
  );
  const hari = useMemo(
    () => pengeluaranHarian(transactions, JUMLAH_HARI_GRAFIK),
    [transactions]
  );

  const nama = profile.name.split(" ")[0];
  const rank = rankForLevel(profile.level);
  const aktivitas = kelompokPerHari(transactions.slice(0, 6));
  const kategoriUtama = stat.kategori.slice(0, 4);
  const jumlahMasuk = transactions.filter((t) => t.type === "income").length;
  const jumlahKeluar = transactions.length - jumlahMasuk;

  const galat = dataError && (
    <div className="rounded-xl border border-filup-red/30 bg-filup-red/10 px-3 py-2.5">
      <p className="text-xs font-medium text-filup-red">{dataError}</p>
    </div>
  );

  return (
    <AppShell tanpaHeaderMobile lebar>
      {/* ============================================================
          HP — kartu saldo, aksi bulat, misi geser, lembar aktivitas
          ============================================================ */}
      <div className="lg:hidden">
        <header className="stagger flex items-center justify-between gap-3">
          <Link
            href="/profil"
            aria-label="Buka profil"
            className="avatar-inisial flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold"
          >
            {inisial(profile.name)}
          </Link>
          <div className="min-w-0 text-center">
            <p className="text-[12px] text-filup-muted">Halo,</p>
            <p className="truncate text-[15px] font-bold leading-tight">
              {profile.name}
            </p>
            <p className="mt-0.5 text-[11px] text-filup-muted">
              Level {profile.level} · {rank.name}
            </p>
          </div>
          <span className="flex h-11 min-w-11 shrink-0 items-center justify-center gap-1 rounded-full bg-white/[0.07] px-3 text-[13px] font-bold text-filup-xp ring-1 ring-inset ring-white/10">
            <Emblem nama="beruntun" size={15} />
            {profile.streakDays}
            <span className="sr-only"> hari beruntun</span>
          </span>
        </header>

        {galat && <div className="mt-4">{galat}</div>}

        {/* Kartu saldo */}
        <section
          className="kartu-saldo stagger mt-5 px-4 pb-5 pt-6 text-center"
          style={{ animationDelay: "60ms" }}
        >
          <p className="text-[12px] font-medium text-[#5a4f78]">Saldo kamu</p>
          <p className="mt-1.5 text-[36px] font-bold leading-none tracking-tight tabular-nums text-[#1a1233]">
            {balance < 0 && "−"}
            <span className="text-[#8a80ad]">Rp</span>
            {Math.abs(balance).toLocaleString("id-ID")}
          </p>
          <p className="mt-2.5 flex justify-center gap-3 text-[12px] font-semibold tabular-nums">
            <span className="text-emerald-800">+{rupiah(totalIncome)}</span>
            <span className="text-[#8a80ad]" aria-hidden="true">
              ·
            </span>
            <span className="text-red-700">−{rupiah(totalExpense)}</span>
          </p>

          <nav aria-label="Aksi cepat" className="mt-5 grid grid-cols-4 gap-1">
            {AKSI.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="flex flex-col items-center gap-1.5 rounded-2xl py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5b5ff0]"
              >
                <span className="tombol-bulat">
                  <Emblem nama={a.icon} size={20} />
                </span>
                <span className="text-[11px] font-semibold text-[#2a1f55]">
                  {a.label}
                </span>
              </Link>
            ))}
          </nav>
        </section>

        {/* Misi aktif — geser ke samping */}
        <section className="stagger mt-7" style={{ animationDelay: "120ms" }}>
          <JudulBagian judul="Misi aktif" href="/misi" />
          {activeMissions.length === 0 ? (
            <div className="card mt-3">
              <KeadaanKosong
                ikon="misi"
                judul="Belum ada misi"
                isi="Tentukan satu barang yang ingin kamu beli, lalu kejar targetnya sedikit demi sedikit."
                href="/misi/baru"
                aksi="Buat misi"
              />
            </div>
          ) : (
            <div className="-mx-4 mt-3 flex snap-x snap-mandatory tanpa-bilah-gulir scroll-px-4 gap-3 overflow-x-auto px-4 pb-1">
              {activeMissions.map((m) => {
                const pct = persenMisi(m);
                const hariLagi = sisaHari(m.deadline);
                const sisa = Math.max(
                  0,
                  (Number(m.targetAmount) || 0) - (Number(m.currentAmount) || 0)
                );
                return (
                  <Link
                    key={m.id}
                    href="/misi"
                    className="kartu-misi-geser flex w-[264px] shrink-0 snap-start items-center gap-3 p-4"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-filup-lavender text-[#2a1f55]">
                      <Emblem nama={m.icon ?? "misi"} size={22} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-bold">
                        {m.title}
                      </span>
                      <span className="block truncate text-[12px] text-filup-muted">
                        Sisa {rupiah(sisa)}
                        {hariLagi !== null && ` · ${hariLagi} hari`}
                      </span>
                      <span className="mt-2 block h-1 overflow-hidden rounded-full bg-white/10">
                        <span
                          className="progress-fill block h-full rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </span>
                    </span>
                  </Link>
                );
              })}
              <Link
                href="/misi/baru"
                className="flex w-[88px] shrink-0 snap-start flex-col items-center justify-center gap-1.5 rounded-[1.5rem] border border-dashed border-white/15 text-filup-muted transition-colors hover:border-white/30 hover:text-filup-text"
              >
                <Emblem nama="misi" size={20} />
                <span className="text-[11px] font-semibold">Misi baru</span>
              </Link>
            </div>
          )}
        </section>

        {/* Kuis harian */}
        <div className="stagger mt-6" style={{ animationDelay: "140ms" }}>
          <KartuKuis />
        </div>

        {/* Wawasan AI */}
        <div className="stagger mt-6" style={{ animationDelay: "160ms" }}>
          <WawasanAI />
        </div>

        {/* Lembar aktivitas */}
        <section
          className="lembar stagger -mx-4 mt-7 px-4 pb-2 pt-3"
          style={{ animationDelay: "200ms" }}
        >
          <div
            aria-hidden="true"
            className="mx-auto h-1 w-10 rounded-full bg-white/15"
          />
          <div className="mt-4">
            <JudulBagian judul="Aktivitas terbaru" href="/riwayat" />
          </div>

          {loading ? (
            <p className="py-8 text-center text-xs text-filup-muted">
              Memuat catatanmu…
            </p>
          ) : aktivitas.length === 0 ? (
            <KeadaanKosong
              ikon="scan"
              judul="Belum ada catatan"
              isi="Foto struk pertamamu, dan aktivitasnya muncul di sini."
              href="/scan"
              aksi="Scan struk"
            />
          ) : (
            aktivitas.map((g) => (
              <div key={g.kunci} className="mt-4">
                <p className="border-b border-white/[0.08] pb-2 text-[11px] font-semibold uppercase tracking-wider text-filup-muted">
                  {g.label}
                </p>
                <ul>
                  {g.isi.map((tx) => (
                    <BarisAktivitas key={tx.id} tx={tx} />
                  ))}
                </ul>
              </div>
            ))
          )}
        </section>
      </div>

      {/* ============================================================
          PC — laporan keuangan
          ============================================================ */}
      <div className="hidden lg:block">
        {/* Kepala laporan */}
        <section className="stagger flex items-start justify-between gap-8">
          <div>
            <p className="flex items-center gap-2 text-sm text-filup-muted">
              Halo, {nama}
              <span className="flex items-center gap-1 rounded-full bg-white/[0.06] px-2 py-0.5 text-[12px] font-bold text-filup-xp ring-1 ring-inset ring-white/10">
                <Emblem nama="beruntun" size={12} />
                {profile.streakDays} hari beruntun
              </span>
            </p>
            <h1 className="mt-2 text-[46px] font-light leading-none tracking-[-0.02em]">
              Laporan Keuangan
            </h1>
            <p className="mt-4 inline-flex rounded-full border border-white/10 px-3 py-1 text-xs text-filup-muted">
              Semua catatan · grafik {JUMLAH_HARI_GRAFIK} hari terakhir
            </p>
          </div>

          <div className="shrink-0 text-right">
            <div className="flex justify-end gap-2">
              <Link
                href="/misi/baru"
                className="rounded-full border border-white/12 px-4 py-2 text-xs font-semibold text-filup-text transition-colors hover:border-white/30"
              >
                Buat misi
              </Link>
              <Link
                href="/scan"
                className="btn-gradient rounded-full px-4 py-2 text-xs font-semibold text-white"
              >
                Catat transaksi
              </Link>
            </div>
            <p className="mt-6 text-[46px] font-light leading-none tracking-[-0.02em] tabular-nums">
              {rupiahBertanda(balance)}
            </p>
            <p className="mt-1.5 text-xs text-filup-muted">Saldo saat ini</p>
            {stat.trenPersen !== null && (
              <p
                className={`mt-1 text-xs font-semibold ${
                  stat.trenPersen > 0 ? "text-filup-red" : "text-filup-green"
                }`}
              >
                {stat.trenPersen > 0 ? "▲" : "▼"} {Math.abs(stat.trenPersen)}%
                pengeluaran pekan ini
              </p>
            )}
          </div>
        </section>

        {galat && <div className="mt-6">{galat}</div>}

        {/* Strip pengeluaran per kategori */}
        <section
          className="stagger mt-8 border-y border-white/[0.08]"
          style={{ animationDelay: "60ms" }}
          aria-label="Pengeluaran per kategori"
        >
          {kategoriUtama.length === 0 ? (
            <p className="py-6 text-center text-sm text-filup-muted">
              Belum ada pengeluaran untuk dirinci per kategori.
            </p>
          ) : (
            <div
              className="grid"
              style={{
                gridTemplateColumns: `repeat(${kategoriUtama.length}, minmax(0, 1fr))`,
              }}
            >
              {kategoriUtama.map((k, i) => (
                <div
                  key={k.nama}
                  className={`px-5 py-5 ${i > 0 ? "border-l border-white/[0.08]" : ""}`}
                >
                  <p className="text-[24px] font-light leading-none tabular-nums">
                    {rupiah(k.total)}
                  </p>
                  <p className="mt-2 flex items-center justify-between text-xs text-filup-muted">
                    <span className="flex items-center gap-1.5">
                      <Emblem
                        nama={(CATEGORY_STYLE[k.nama] ?? CATEGORY_STYLE.Lainnya).icon}
                        size={13}
                      />
                      {k.nama}
                    </span>
                    <span className="tabular-nums">{k.persen}%</span>
                  </p>
                  {/* Meter garis: bagian yang terang = porsi kategori ini dari
                      seluruh pengeluaran. Angkanya sudah tertulis di atas,
                      jadi meternya disembunyikan dari pembaca layar. */}
                  <div className="meter-garis mt-3" aria-hidden="true">
                    <div
                      className="meter-garis-isi"
                      style={{ width: `${k.persen}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="mt-6 grid grid-cols-3 items-start gap-5">
          {/* ---- Kolom utama ---- */}
          <div className="col-span-2 space-y-5">
            <section
              className="stagger card rounded-[1.75rem] p-6"
              style={{ animationDelay: "120ms" }}
            >
              {loading ? (
                <div className="space-y-4">
                  <div className="h-5 w-48 animate-pulse rounded-full bg-white/[0.06]" />
                  <div className="h-56 animate-pulse rounded-2xl bg-white/[0.04]" />
                </div>
              ) : (
                <GrafikHarian hari={hari} />
              )}
            </section>

            <div
              className="stagger grid grid-cols-2 gap-5"
              style={{ animationDelay: "160ms" }}
            >
              <section className="card kartu-tint-hijau rounded-[1.75rem] p-5">
                <p className="text-sm font-semibold text-filup-text">Pemasukan</p>
                <p className="mt-4 text-[30px] font-light leading-none tabular-nums text-filup-green">
                  +{rupiah(totalIncome)}
                </p>
                <p className="mt-2 text-xs text-filup-muted">
                  dari {jumlahMasuk} catatan
                </p>
              </section>
              <section className="card kartu-tint-merah rounded-[1.75rem] p-5">
                <p className="text-sm font-semibold text-filup-text">
                  Pengeluaran
                </p>
                <p className="mt-4 text-[30px] font-light leading-none tabular-nums text-filup-red">
                  −{rupiah(totalExpense)}
                </p>
                <p className="mt-2 text-xs text-filup-muted">
                  dari {jumlahKeluar} catatan · rata-rata{" "}
                  {rupiah(stat.rataHarian)}/hari
                </p>
              </section>
            </div>

            <div className="stagger" style={{ animationDelay: "200ms" }}>
              <WawasanAI />
            </div>
          </div>

          {/* ---- Kolom kanan ---- */}
          <aside className="space-y-5">
            <div className="stagger" style={{ animationDelay: "120ms" }}>
              <KartuKuis />
            </div>

            <section className="stagger" style={{ animationDelay: "140ms" }}>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-[17px] font-bold tracking-tight">
                  Misi tabungan
                </h2>
                <Link
                  href="/misi/baru"
                  className="rounded-full border border-white/12 px-3 py-1.5 text-xs font-semibold text-filup-text transition-colors hover:border-white/30"
                >
                  + Buat
                </Link>
              </div>

              <div className="mt-3 space-y-3">
                {activeMissions.length === 0 ? (
                  <div className="card rounded-[1.75rem]">
                    <KeadaanKosong
                      ikon="misi"
                      judul="Belum ada misi"
                      isi="Tentukan satu barang yang ingin kamu beli, lalu kejar targetnya."
                      href="/misi/baru"
                      aksi="Buat misi"
                    />
                  </div>
                ) : (
                  activeMissions.slice(0, 3).map((m, i) => {
                    const pct = persenMisi(m);
                    const hariLagi = sisaHari(m.deadline);
                    return (
                      <Link
                        key={m.id}
                        href="/misi"
                        className={`card card-hover block rounded-[1.75rem] p-5 ${
                          i % 2 === 0 ? "kartu-tint-lilac" : "kartu-tint-indigo"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-filup-lavender text-[#2a1f55]">
                              <Emblem nama={m.icon ?? "misi"} size={19} />
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-bold">
                                {m.title}
                              </span>
                              <span className="block text-[12px] text-filup-muted">
                                {hariLagi === null
                                  ? "Tanpa tenggat"
                                  : `${hariLagi} hari lagi`}
                              </span>
                            </span>
                          </div>
                          <span className="text-sm font-bold tabular-nums">
                            {pct}%
                          </span>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-[17px] font-light tabular-nums">
                              {rupiah(m.currentAmount)}
                            </p>
                            <p className="text-[11px] text-filup-muted">
                              Terkumpul
                            </p>
                          </div>
                          <div>
                            <p className="text-[17px] font-light tabular-nums">
                              {rupiah(m.targetAmount)}
                            </p>
                            <p className="text-[11px] text-filup-muted">Target</p>
                          </div>
                        </div>

                        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="progress-fill h-full rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </section>

            <section className="stagger" style={{ animationDelay: "180ms" }}>
              <JudulBagian judul="Transaksi terbaru" href="/riwayat" />
              <div className="card mt-3 rounded-[1.75rem] px-4 py-1">
                {loading ? (
                  <p className="py-6 text-center text-xs text-filup-muted">
                    Memuat catatanmu…
                  </p>
                ) : transactions.length === 0 ? (
                  <KeadaanKosong
                    ikon="scan"
                    judul="Belum ada catatan"
                    isi="Foto struk pertamamu, dan transaksinya muncul di sini."
                    href="/scan"
                    aksi="Scan struk"
                  />
                ) : (
                  transactions
                    .slice(0, 4)
                    .map((tx) => <TransactionRow key={tx.id} tx={tx} />)
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>
      {/* Kontak — dirender lewat portal, jadi letaknya di sini tidak penting */}
      <TombolWhatsApp
        posisi="aplikasi"
        pesan="Halo FiLUP, saya butuh bantuan soal aplikasinya."
      />
    </AppShell>
  );
}
