"use client";

// Kuis literasi keuangan harian: satu soal per hari, sama untuk semua
// pengguna. Soalnya dari bank soal di src/lib/kuisHarian.js — ditulis tangan,
// bukan dikarang AI.
//
// Soal hari ini bergantung pada tanggal peramban, jadi isinya baru dirender
// setelah hydrate; halaman ini di-prerender saat build.

import { useState } from "react";
import AppShell from "@/components/AppShell";
import Button from "@/components/Button";
import Emblem from "@/components/Emblem";
import { useAuth } from "@/contexts/AuthProvider";
import { simpanJawabanKuis } from "@/lib/db";
import { useSudahDiKlien } from "@/lib/diKlien";
import { XP_REWARD } from "@/lib/gamification";
import {
  bacaCatatanDemo,
  beruntunAktif,
  kunciHari,
  kunciKemarin,
  simpanCatatanDemo,
  soalUntuk,
} from "@/lib/kuisHarian";

const HURUF = ["A", "B", "C", "D"];

export default function KuisPage() {
  const diKlien = useSudahDiKlien();

  return (
    <AppShell>
      <div className="space-y-5 md:mx-auto md:max-w-2xl">
        <section className="stagger">
          <span className="label-mono">KUIS HARIAN</span>
          <h1 className="font-display mt-2 text-[28px] leading-tight tracking-tight md:text-[38px]">
            Satu soal, setiap hari
          </h1>
          <p className="mt-1 text-sm text-filup-muted">
            Jawaban benar +{XP_REWARD.kuisBenar} XP. Belum tepat pun tetap +
            {XP_REWARD.kuisIkut} XP — yang penting kamu belajar.
          </p>
        </section>

        {diKlien ? (
          <KuisHariIni />
        ) : (
          <div className="card h-96 animate-pulse rounded-[1.75rem]" aria-hidden="true" />
        )}

        <p className="px-2 text-center text-[11px] leading-relaxed text-filup-muted">
          Soal ditulis dan diperiksa tim FiLUP, bukan dikarang AI. Soal
          berikutnya muncul besok.
        </p>
      </div>
    </AppShell>
  );
}

function KuisHariIni() {
  const { demoMode, user, rawProfile, applyDemoXP } = useAuth();

  const tanggal = kunciHari();
  const soal = soalUntuk(tanggal);
  const tanggalTampil = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const [catatanDemo, setCatatanDemo] = useState(() =>
    demoMode ? bacaCatatanDemo() : null
  );
  const [pilihan, setPilihan] = useState(null);
  const [hasil, setHasil] = useState(null);
  const [mengirim, setMengirim] = useState(false);
  const [galat, setGalat] = useState("");

  const catatan = demoMode ? catatanDemo : rawProfile?.kuis ?? null;
  const jawabanHariIni =
    hasil ?? (catatan?.tanggal === tanggal ? catatan : null);
  const beruntun =
    hasil?.beruntun ??
    beruntunAktif(
      catatan,
      demoMode ? catatanDemo?.beruntun : rawProfile?.kuisBeruntun,
      tanggal
    );

  async function kunciJawaban() {
    if (pilihan === null || mengirim) return;
    const benar = pilihan === soal.benar;
    setMengirim(true);
    setGalat("");

    if (demoMode) {
      const lanjut = catatanDemo?.tanggal === kunciKemarin();
      const baru = {
        tanggal,
        jawaban: pilihan,
        benar,
        beruntun: lanjut ? (Number(catatanDemo.beruntun) || 0) + 1 : 1,
      };
      simpanCatatanDemo(baru);
      setCatatanDemo(baru);
      const xp = benar ? XP_REWARD.kuisBenar : XP_REWARD.kuisIkut;
      applyDemoXP(xp);
      setHasil({ ...baru, xp });
      setMengirim(false);
      return;
    }

    try {
      const h = await simpanJawabanKuis(user.uid, rawProfile, {
        tanggal,
        jawaban: pilihan,
        benar,
      });
      setHasil({ tanggal, jawaban: pilihan, benar, beruntun: h.beruntun, xp: h.xpDidapat });
    } catch (err) {
      console.error("Simpan kuis:", err);
      setGalat(
        err?.code === "permission-denied"
          ? "Jawabanmu ditolak server. Pastikan firestore.rules terbaru sudah di-publish."
          : "Jawabanmu belum tersimpan. Periksa koneksi internetmu, lalu coba lagi."
      );
    }
    setMengirim(false);
  }

  return (
    <section className="stagger card rounded-[1.75rem] p-5 md:p-7" style={{ animationDelay: "60ms" }}>
      <div className="flex items-center justify-between gap-3 text-xs text-filup-muted">
        <span className="capitalize">{tanggalTampil}</span>
        {beruntun > 0 && (
          <span className="flex items-center gap-1 rounded-full bg-white/[0.06] px-2.5 py-1 font-bold text-filup-xp ring-1 ring-inset ring-white/10">
            <Emblem nama="beruntun" size={12} />
            {beruntun} hari beruntun
          </span>
        )}
      </div>

      <p className="mt-5 text-[11px] font-semibold uppercase tracking-wider text-filup-periwinkle">
        {soal.topik}
      </p>
      <h2 className="mt-1.5 text-[18px] font-bold leading-snug">{soal.tanya}</h2>

      <div role="radiogroup" aria-label="Pilihan jawaban" className="mt-5 space-y-2.5">
        {soal.pilihan.map((teks, i) => {
          const terjawab = Boolean(jawabanHariIni);
          const dipilih = terjawab ? jawabanHariIni.jawaban === i : pilihan === i;
          const kunci = terjawab && i === soal.benar;
          const keliru = terjawab && dipilih && i !== soal.benar;

          let gaya = "border-white/15 bg-white/[0.02] hover:border-white/35";
          if (kunci) gaya = "border-filup-green/60 bg-filup-green/10";
          else if (keliru) gaya = "border-filup-red/60 bg-filup-red/10";
          else if (dipilih) gaya = "border-filup-periwinkle bg-filup-periwinkle/15";

          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={dipilih}
              disabled={terjawab}
              onClick={() => setPilihan(i)}
              className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition-colors disabled:cursor-default ${gaya}`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                  kunci
                    ? "bg-filup-green text-[#06281c]"
                    : keliru
                      ? "bg-filup-red text-[#2a0707]"
                      : dipilih
                        ? "bg-filup-periwinkle text-white"
                        : "bg-white/10 text-filup-muted"
                }`}
              >
                {HURUF[i]}
              </span>
              <span className="flex-1 leading-relaxed">{teks}</span>
              {kunci && (
                <span className="shrink-0 text-xs font-semibold text-filup-green">
                  Jawaban benar
                </span>
              )}
              {keliru && (
                <span className="shrink-0 text-xs font-semibold text-filup-red">
                  Jawabanmu
                </span>
              )}
            </button>
          );
        })}
      </div>

      {jawabanHariIni ? (
        <div role="status" className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p
            className={`flex items-center gap-1.5 text-sm font-bold ${
              jawabanHariIni.benar ? "text-filup-green" : "text-filup-red"
            }`}
          >
            <Emblem nama={jawabanHariIni.benar ? "centang" : "peringatan"} size={16} />
            {jawabanHariIni.benar ? "Tepat!" : "Belum tepat."}
            {hasil?.xp > 0 && (
              <span className="ml-1 font-mono text-xs text-filup-xp">+{hasil.xp} XP</span>
            )}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-filup-text">{soal.penjelasan}</p>
          <p className="mt-3 text-xs text-filup-muted">
            Kamu sudah menjawab soal hari ini. Soal berikutnya muncul besok.
          </p>
        </div>
      ) : (
        <Button
          className="mt-5 w-full"
          disabled={pilihan === null || mengirim}
          onClick={kunciJawaban}
        >
          {mengirim ? "Menyimpan…" : pilihan === null ? "Pilih satu jawaban" : "Kunci jawaban"}
        </Button>
      )}

      {galat && (
        <p role="alert" className="mt-3 text-xs font-medium text-filup-red">
          {galat}
        </p>
      )}
    </section>
  );
}
