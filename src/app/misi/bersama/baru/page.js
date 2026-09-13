"use client";

// Membuat misi bersama: satu target tabungan yang dikejar beberapa teman.

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import Button from "@/components/Button";
import Emblem from "@/components/Emblem";
import { MAKS_ANGGOTA, useSosial } from "@/contexts/SosialProvider";
import { rupiah } from "@/lib/analisis";

const PILIHAN_LAMBANG = [
  "misi",
  "transport",
  "rayakan",
  "permainan",
  "musik",
  "buku",
  "belanja",
  "piala",
];

export default function MisiBersamaBaruPage() {
  const router = useRouter();
  const { teman, loading, buatMisiBersama } = useSosial();

  const [judul, setJudul] = useState("");
  const [icon, setIcon] = useState("misi");
  const [target, setTarget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [dipilih, setDipilih] = useState([]);
  const [galat, setGalat] = useState("");
  const [menyimpan, setMenyimpan] = useState(false);

  const maksTeman = MAKS_ANGGOTA - 1;
  const jumlahOrang = dipilih.length + 1;

  // Perkiraan tabungan per orang per minggu, dihitung langsung di layar.
  const minggu = deadline
    ? Math.max(
        1,
        Math.ceil((new Date(deadline) - new Date()) / (7 * 86400000))
      )
    : null;
  const perOrang =
    minggu && Number(target) > 0 && dipilih.length > 0
      ? Math.ceil(Number(target) / jumlahOrang / minggu)
      : null;

  function alihkan(uid) {
    setDipilih((lama) =>
      lama.includes(uid)
        ? lama.filter((u) => u !== uid)
        : lama.length >= maksTeman
          ? lama
          : [...lama, uid]
    );
  }

  async function simpan(e) {
    e.preventDefault();
    setGalat("");
    setMenyimpan(true);
    const hasil = await buatMisiBersama({
      judul,
      icon,
      targetAmount: target,
      deadline,
      temanUids: dipilih,
    });
    if (hasil.ok) {
      router.push(`/misi/bersama/${hasil.id}`);
      return;
    }
    setGalat(hasil.error);
    setMenyimpan(false);
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
            Misi Bersama Baru
          </h1>
          <p className="mt-1 text-sm text-filup-muted">
            Menabung bareng teman untuk satu tujuan — liburan kelas, kado, atau
            barang yang dipakai bersama.
          </p>
        </section>

        {loading ? (
          <div className="card h-64 animate-pulse rounded-[1.5rem]" />
        ) : teman.length === 0 ? (
          <div className="card flex flex-col items-center gap-2 rounded-[1.5rem] px-6 py-10 text-center">
            <Emblem nama="teman" size={28} className="text-filup-periwinkle" />
            <p className="text-sm font-semibold">Tambahkan teman dulu</p>
            <p className="max-w-xs text-xs leading-relaxed text-filup-muted">
              Misi bersama hanya bisa dibuat dengan orang yang sudah menjadi
              temanmu di FiLUP.
            </p>
            <Link href="/teman" className="mt-2">
              <Button size="sm">Tambah teman</Button>
            </Link>
          </div>
        ) : (
          <form
            onSubmit={simpan}
            className="stagger card space-y-5 rounded-[1.5rem] p-5"
            style={{ animationDelay: "60ms" }}
          >
            <div>
              <label htmlFor="judul" className="mb-1.5 block text-xs font-semibold text-filup-muted">
                Nama misi
              </label>
              <input
                id="judul"
                required
                maxLength={60}
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                placeholder="Misalnya: Liburan kelas ke Bedugul"
                className="kolom-isian"
              />
            </div>

            <div>
              <p className="mb-1.5 text-xs font-semibold text-filup-muted">Lambang</p>
              <div role="radiogroup" aria-label="Lambang misi" className="flex flex-wrap gap-2">
                {PILIHAN_LAMBANG.map((nama) => {
                  const aktif = icon === nama;
                  return (
                    <button
                      key={nama}
                      type="button"
                      role="radio"
                      aria-checked={aktif}
                      aria-label={nama}
                      onClick={() => setIcon(nama)}
                      className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-colors ${
                        aktif
                          ? "border-filup-periwinkle bg-filup-periwinkle/15 text-filup-text"
                          : "border-white/15 text-filup-muted hover:border-white/35 hover:text-filup-text"
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
                <label htmlFor="target" className="mb-1.5 block text-xs font-semibold text-filup-muted">
                  Target bersama (Rp)
                </label>
                <input
                  id="target"
                  type="number"
                  required
                  min={1000}
                  step={1000}
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="600000"
                  className="kolom-isian font-mono"
                />
              </div>
              <div>
                <label htmlFor="tenggat" className="mb-1.5 block text-xs font-semibold text-filup-muted">
                  Tenggat
                </label>
                <input
                  id="tenggat"
                  type="date"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="kolom-isian"
                />
              </div>
            </div>

            <fieldset>
              <legend className="mb-1.5 text-xs font-semibold text-filup-muted">
                Ajak teman ({dipilih.length}/{maksTeman})
              </legend>
              <div className="flex flex-wrap gap-2">
                {teman.map((t) => {
                  const aktif = dipilih.includes(t.temanUid);
                  const penuh = !aktif && dipilih.length >= maksTeman;
                  return (
                    <button
                      key={t.temanUid}
                      type="button"
                      role="checkbox"
                      aria-checked={aktif}
                      disabled={penuh}
                      onClick={() => alihkan(t.temanUid)}
                      className={`flex items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-3.5 text-sm font-semibold transition-colors disabled:opacity-40 ${
                        aktif
                          ? "border-filup-periwinkle bg-filup-periwinkle/15 text-filup-text"
                          : "border-white/15 text-filup-muted hover:border-white/35 hover:text-filup-text"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className="avatar-inisial flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold"
                      >
                        {aktif ? <Emblem nama="centang" size={13} /> : t.nama.slice(0, 1)}
                      </span>
                      {t.nama}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {perOrang && (
              <div className="rounded-xl border border-filup-periwinkle/30 bg-filup-periwinkle/10 p-3.5 text-xs leading-relaxed text-filup-muted">
                Kalau dibagi rata untuk {jumlahOrang} orang selama {minggu} minggu,
                setiap orang cukup menabung sekitar{" "}
                <span className="font-mono font-bold text-filup-text">
                  {rupiah(perOrang)}
                </span>{" "}
                per minggu.
              </div>
            )}

            <p className="text-xs leading-relaxed text-filup-muted">
              FiLUP mencatat tabungan, tidak memindahkan uang. Setiap anggota
              menyimpan uangnya sendiri — di celengan atau rekeningnya — lalu
              mencatat setorannya di sini.
            </p>

            {galat && (
              <p role="alert" className="text-xs font-medium text-filup-red">
                {galat}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={menyimpan}>
              {menyimpan ? "Menyimpan…" : "Buat misi bersama"}
            </Button>
          </form>
        )}
      </div>
    </AppShell>
  );
}
