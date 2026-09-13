"use client";

// Kartu "Kuis harian" di dashboard: soal hari ini, atau status kalau sudah
// dijawab. Isinya bergantung pada tanggal peramban, jadi baru dirender
// setelah hydrate — sebelum itu yang tampil kerangka kosong setinggi kartu.

import Link from "next/link";
import Emblem from "@/components/Emblem";
import { useAuth } from "@/contexts/AuthProvider";
import { useSudahDiKlien } from "@/lib/diKlien";
import { XP_REWARD } from "@/lib/gamification";
import {
  bacaCatatanDemo,
  beruntunAktif,
  kunciHari,
  soalUntuk,
} from "@/lib/kuisHarian";

export default function KartuKuis() {
  const diKlien = useSudahDiKlien();
  const { demoMode, rawProfile } = useAuth();

  if (!diKlien) {
    return (
      <div aria-hidden="true" className="card h-[132px] animate-pulse rounded-[1.5rem]" />
    );
  }

  const tanggal = kunciHari();
  const soal = soalUntuk(tanggal);
  const catatan = demoMode ? bacaCatatanDemo() : rawProfile?.kuis ?? null;
  const beruntun = beruntunAktif(
    catatan,
    demoMode ? catatan?.beruntun : rawProfile?.kuisBeruntun,
    tanggal
  );
  const sudah = catatan?.tanggal === tanggal;

  return (
    <Link href="/kuis" className="card card-hover block rounded-[1.5rem] p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-filup-periwinkle/15 text-filup-periwinkle">
            <Emblem nama="kuis" size={19} />
          </span>
          <span className="text-[15px] font-bold tracking-tight">Kuis harian</span>
        </span>
        {beruntun > 0 && (
          <span className="flex items-center gap-1 rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] font-bold text-filup-xp ring-1 ring-inset ring-white/10">
            <Emblem nama="beruntun" size={11} />
            {beruntun} hari
          </span>
        )}
      </div>

      {sudah ? (
        <p className="mt-3 flex items-start gap-1.5 text-sm leading-relaxed text-filup-muted">
          <Emblem
            nama={catatan.benar ? "centang" : "peringatan"}
            size={15}
            className={`mt-0.5 ${catatan.benar ? "text-filup-green" : "text-filup-red"}`}
          />
          Sudah dijawab hari ini — {catatan.benar ? "jawabanmu tepat" : "jawabanmu belum tepat"}.
          Soal berikutnya besok.
        </p>
      ) : (
        <>
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-filup-text">
            {soal.tanya}
          </p>
          <p className="mt-3 text-xs font-semibold text-filup-periwinkle">
            Jawab sekarang · +{XP_REWARD.kuisBenar} XP →
          </p>
        </>
      )}
    </Link>
  );
}
