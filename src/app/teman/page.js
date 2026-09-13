"use client";

// Halaman Teman: kode teman milik pengguna, tambah teman lewat kode,
// permintaan yang masuk dan keluar, serta daftar teman.
//
// Teman ditambahkan lewat KODE, bukan lewat email atau pencarian nama.
// Penggunanya pelajar: pencarian lewat email membocorkan siapa saja yang
// punya akun, dan pencarian nama membuka jalan bagi orang asing untuk
// mengirim permintaan. Kode hanya diketahui orang yang memang diberi.

import { useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import Button from "@/components/Button";
import Emblem from "@/components/Emblem";
import { useSosial } from "@/contexts/SosialProvider";

function inisial(nama = "") {
  const huruf = nama
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((k) => k[0]?.toUpperCase() ?? "")
    .join("");
  return huruf || "?";
}

function BarisTeman({ nama, level, children }) {
  return (
    <li className="flex items-center gap-3 py-3">
      <span
        aria-hidden="true"
        className="avatar-inisial flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold"
      >
        {inisial(nama)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">{nama}</span>
        {level != null && (
          <span className="block text-xs text-filup-muted">Level {level}</span>
        )}
      </span>
      <span className="flex shrink-0 flex-wrap items-center justify-end gap-2">
        {children}
      </span>
    </li>
  );
}

function JudulBagian({ children, jumlah }) {
  return (
    <h2 className="mb-2 flex items-center gap-2 text-[15px] font-bold tracking-tight">
      {children}
      {jumlah != null && (
        <span className="rounded-full bg-white/[0.07] px-2 py-0.5 text-[11px] font-semibold text-filup-muted">
          {jumlah}
        </span>
      )}
    </h2>
  );
}

export default function TemanPage() {
  const {
    kodeSaya,
    galatKode,
    teman,
    permintaanMasuk,
    permintaanKeluar,
    loading,
    galat,
    demoMode,
    tambahTeman,
    terimaTeman,
    hapusTeman,
  } = useSosial();

  const [kode, setKode] = useState("");
  const [mengirim, setMengirim] = useState(false);
  const [umpan, setUmpan] = useState(null);
  const [tersalin, setTersalin] = useState(false);
  const [akanDihapus, setAkanDihapus] = useState(null);
  const [sibuk, setSibuk] = useState(null);

  async function kirim(e) {
    e.preventDefault();
    if (mengirim) return;
    setMengirim(true);
    setUmpan(null);
    const hasil = await tambahTeman(kode);
    setUmpan(
      hasil.ok
        ? { jenis: "ok", teks: hasil.pesan }
        : { jenis: "galat", teks: hasil.error }
    );
    if (hasil.ok) setKode("");
    setMengirim(false);
  }

  async function salin() {
    try {
      await navigator.clipboard.writeText(kodeSaya);
      setTersalin(true);
      setTimeout(() => setTersalin(false), 2000);
    } catch {
      // Peramban menolak akses papan klip — kodenya tetap terlihat untuk
      // disalin manual.
    }
  }

  async function jalankan(id, aksi) {
    setSibuk(id);
    const hasil = await aksi(id);
    if (!hasil.ok) setUmpan({ jenis: "galat", teks: hasil.error });
    setSibuk(null);
    setAkanDihapus(null);
  }

  return (
    <AppShell>
      <div className="space-y-6 md:mx-auto md:max-w-3xl">
        <section className="stagger">
          <span className="label-mono">TEMAN</span>
          <h1 className="font-display mt-2 text-[28px] leading-tight tracking-tight md:text-[38px]">
            Teman menabung
          </h1>
          <p className="mt-1 text-sm text-filup-muted">
            Tambahkan teman lewat kode, lalu kejar target bareng lewat misi
            bersama.
          </p>
        </section>

        {galat && (
          <p
            role="alert"
            className="rounded-xl border border-filup-red/30 bg-filup-red/10 px-3 py-2.5 text-xs font-medium text-filup-red"
          >
            {galat}
          </p>
        )}

        <div
          className="stagger grid gap-4 md:grid-cols-2"
          style={{ animationDelay: "60ms" }}
        >
          {/* Kode milik pengguna */}
          <section className="card kartu-tint-indigo rounded-[1.5rem] p-5">
            <p className="text-sm font-semibold">Kode temanmu</p>
            {kodeSaya ? (
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="font-mono text-[28px] font-bold tracking-[0.25em]">
                  {kodeSaya}
                </p>
                <Button size="sm" variant="secondary" onClick={salin}>
                  <Emblem nama={tersalin ? "centang" : "salin"} size={15} />
                  {tersalin ? "Tersalin" : "Salin"}
                </Button>
              </div>
            ) : (
              <p className="mt-3 text-sm text-filup-muted">
                {galatKode || "Menyiapkan kodemu…"}
              </p>
            )}
            <p className="mt-3 text-xs leading-relaxed text-filup-muted">
              Bagikan kode ini ke temanmu. Siapa pun yang punya kode ini bisa
              mengirim permintaan, tapi kamu yang memutuskan menerimanya.
            </p>
          </section>

          {/* Tambah teman */}
          <section className="card rounded-[1.5rem] p-5">
            <form onSubmit={kirim}>
              <label htmlFor="kode-teman" className="text-sm font-semibold">
                Tambah teman
              </label>
              <p id="bantuan-kode" className="mt-1 text-xs text-filup-muted">
                Masukkan 6 karakter kode milik temanmu.
                {demoMode && " Mode demo: coba BAYU27, SEKAR5, atau PUTU64."}
              </p>
              <div className="mt-3 flex gap-2">
                <input
                  id="kode-teman"
                  value={kode}
                  onChange={(e) => setKode(e.target.value.toUpperCase())}
                  maxLength={12}
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  placeholder="ABC234"
                  aria-describedby="bantuan-kode"
                  className="kolom-isian font-mono uppercase tracking-[0.2em]"
                />
                <Button
                  type="submit"
                  disabled={mengirim || kode.trim().length === 0}
                  className="shrink-0"
                >
                  {mengirim ? "Mengirim…" : "Kirim"}
                </Button>
              </div>
            </form>
            {umpan && (
              <p
                role="status"
                className={`mt-3 flex items-start gap-1.5 text-xs font-medium ${
                  umpan.jenis === "ok" ? "text-filup-green" : "text-filup-red"
                }`}
              >
                <Emblem
                  nama={umpan.jenis === "ok" ? "centang" : "peringatan"}
                  size={14}
                  className="mt-px"
                />
                {umpan.teks}
              </p>
            )}
          </section>
        </div>

        {/* Permintaan masuk */}
        {permintaanMasuk.length > 0 && (
          <section className="stagger" style={{ animationDelay: "100ms" }}>
            <JudulBagian jumlah={permintaanMasuk.length}>
              Ingin berteman denganmu
            </JudulBagian>
            <ul className="card divide-y divide-white/[0.06] rounded-[1.5rem] px-4">
              {permintaanMasuk.map((p) => (
                <BarisTeman key={p.id} nama={p.nama} level={p.level}>
                  <Button
                    size="sm"
                    disabled={sibuk === p.id}
                    onClick={() => jalankan(p.id, terimaTeman)}
                  >
                    Terima
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={sibuk === p.id}
                    onClick={() => jalankan(p.id, hapusTeman)}
                  >
                    Tolak
                  </Button>
                </BarisTeman>
              ))}
            </ul>
          </section>
        )}

        {/* Permintaan keluar */}
        {permintaanKeluar.length > 0 && (
          <section className="stagger" style={{ animationDelay: "120ms" }}>
            <JudulBagian jumlah={permintaanKeluar.length}>
              Menunggu jawaban
            </JudulBagian>
            <ul className="card divide-y divide-white/[0.06] rounded-[1.5rem] px-4">
              {permintaanKeluar.map((p) => (
                <BarisTeman key={p.id} nama={p.nama} level={p.level}>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={sibuk === p.id}
                    onClick={() => jalankan(p.id, hapusTeman)}
                  >
                    Batalkan
                  </Button>
                </BarisTeman>
              ))}
            </ul>
          </section>
        )}

        {/* Daftar teman */}
        <section className="stagger" style={{ animationDelay: "140ms" }}>
          <JudulBagian jumlah={loading ? null : teman.length}>Temanmu</JudulBagian>
          {loading ? (
            <p className="card rounded-[1.5rem] px-6 py-8 text-center text-sm text-filup-muted">
              Memuat daftar teman…
            </p>
          ) : teman.length === 0 ? (
            <div className="card flex flex-col items-center gap-2 rounded-[1.5rem] px-6 py-8 text-center">
              <Emblem nama="teman" size={28} className="text-filup-periwinkle" />
              <p className="text-sm font-semibold">Belum ada teman</p>
              <p className="max-w-xs text-xs leading-relaxed text-filup-muted">
                Bagikan kodemu atau masukkan kode temanmu di atas. Setelah
                berteman, kalian bisa menabung bareng lewat misi bersama.
              </p>
            </div>
          ) : (
            <ul className="card divide-y divide-white/[0.06] rounded-[1.5rem] px-4">
              {teman.map((t) => (
                <BarisTeman key={t.id} nama={t.nama} level={t.level}>
                  {akanDihapus === t.id ? (
                    <>
                      <span className="text-xs text-filup-muted">
                        Hapus {t.nama}?
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={sibuk === t.id}
                        onClick={() => jalankan(t.id, hapusTeman)}
                        className="!border-filup-red/50 !text-filup-red hover:!bg-filup-red/10"
                      >
                        Hapus teman
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setAkanDihapus(null)}
                      >
                        Batal
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setAkanDihapus(t.id)}
                    >
                      Hapus
                    </Button>
                  )}
                </BarisTeman>
              ))}
            </ul>
          )}
        </section>

        {teman.length > 0 && (
          <Link
            href="/misi/bersama/baru"
            className="stagger card card-hover kartu-tint-lilac flex items-center gap-4 rounded-[1.5rem] p-5"
            style={{ animationDelay: "160ms" }}
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-filup-lavender text-[#2a1f55]">
              <Emblem nama="bersama" size={22} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold">Menabung bareng</span>
              <span className="block text-xs text-filup-muted">
                Buat misi bersama dengan temanmu untuk satu tujuan.
              </span>
            </span>
            <span aria-hidden="true" className="text-filup-muted">
              →
            </span>
          </Link>
        )}
      </div>
    </AppShell>
  );
}
