// Kartu ringkas misi bersama, dipakai di halaman Misi.

import Link from "next/link";
import Emblem from "@/components/Emblem";
import { ringkasMisiBersama, rupiah } from "@/lib/analisis";

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

export default function KartuMisiBersama({ misi, uidSaya }) {
  const r = ringkasMisiBersama(misi);
  const setoranku = r.perAnggota.find((a) => a.uid === uidSaya)?.jumlah ?? 0;
  const tampil = r.perAnggota.slice(0, 4);
  const lebih = r.perAnggota.length - tampil.length;

  return (
    <Link
      href={`/misi/bersama/${misi.id}`}
      className="card card-hover kartu-tint-indigo block rounded-[1.5rem] p-4"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-filup-lavender text-[#2a1f55]">
          <Emblem nama={misi.icon ?? "misi"} size={21} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate font-bold tracking-tight">{misi.judul}</h3>
            {r.selesai ? (
              <span className="shrink-0 rounded-full bg-filup-green/15 px-2 py-0.5 text-[11px] font-semibold text-filup-green ring-1 ring-inset ring-filup-green/30">
                Tercapai
              </span>
            ) : (
              <span className="shrink-0 text-sm font-bold tabular-nums">{r.persen}%</span>
            )}
          </div>
          <p className="mt-0.5 text-[12px] text-filup-muted">
            {rupiah(r.terkumpul)} dari {rupiah(r.target)}
          </p>
        </div>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full ${r.selesai ? "progress-fill-done" : "progress-fill"}`}
          style={{ width: `${r.persen}%` }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex -space-x-2" aria-hidden="true">
          {tampil.map((a) => (
            <span
              key={a.uid}
              className="avatar-inisial flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold ring-2 ring-[#1a1226]"
            >
              {inisial(a.nama)}
            </span>
          ))}
          {lebih > 0 && (
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold ring-2 ring-[#1a1226]">
              +{lebih}
            </span>
          )}
        </div>
        <span className="text-[12px] text-filup-muted">
          <span className="sr-only">{r.perAnggota.length} anggota. </span>
          Setoranmu {rupiah(setoranku)}
        </span>
      </div>
    </Link>
  );
}
