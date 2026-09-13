"use client";

// Empat kartu tarot fitur — bagian terpenting tema Mystic Editorial.
//
// Dua susunan yang berbeda, bukan satu susunan yang dipaksakan:
//
// - Layar lebar (>=1024px): KIPAS. Empat kartu utuh berdampingan
//   (-6°/-2°/+2°/+6°), dibalik di tempat saat diklik.
// - Layar sempit (<1024px): TUMPUKAN TANGGA. Empat kartu penuh tidak muat
//   berdampingan di 390px, dan menggulir horizontal membuat kartu keempat
//   nyaris tidak pernah ditemukan. Jadi kartunya ditumpuk menurun seperti
//   kartu yang dikembangkan di tangan — tiap kartu menyembul di bawah kartu
//   sebelumnya, jadi keempatnya terlihat sekaligus tanpa perlu digulir.
//
//   Diketuk: kartunya naik ke tengah atas dulu (350 ms), baru modal isinya
//   muncul. Dua tahap, bukan langsung — supaya jelas modal itu berasal dari
//   kartu yang mana.
//
// Perilaku kipas:
// - Diam     : tersusun seperti kipas (-6°/-2°/+2°/+6°).
// - Disorot  : tegak, terangkat, sedikit membesar, kilau holografik menyapu,
//              plus kemiringan 3D halus mengikuti pointer (hanya perangkat
//              ber-kursor; di layar sentuh dimatikan).
// - Diklik   : berputar 180° pada sumbu Y memperlihatkan sisi penjelasan.
//              Hanya satu kartu terbuka pada satu waktu. Bisa lewat keyboard.
// - reduce-motion: kipas, tilt, kilau, dan flip 3D mati; pergantian sisi
//              menjadi fade sederhana.

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Reveal } from "@/components/LandingFx";
import { Kilau4 } from "@/components/publik/Kilau";

/* ---------- Emblem line-art (satu per arcana) ---------- */

function Emblem({ jenis }) {
  const g = {
    fill: "none",
    stroke: "var(--myst-lilac)",
    strokeWidth: 1.6,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  switch (jenis) {
    case "pembaca": // struk dengan mata
      return (
        <g {...g}>
          <path d="M24 12 h32 v36 l-4 -3 -4 3 -4 -3 -4 3 -4 -3 -4 3 -4 -3 -4 3 Z" />
          <path d="M30 20 h20 M30 40 h20" opacity="0.55" />
          <ellipse cx="40" cy="30" rx="9" ry="5.5" />
          <circle cx="40" cy="30" r="2.2" fill="var(--myst-lilac)" stroke="none" />
        </g>
      );
    case "misi": // anak panah menancap di target
      return (
        <g {...g}>
          <circle cx="40" cy="36" r="16" />
          <circle cx="40" cy="36" r="9" opacity="0.7" />
          <circle cx="40" cy="36" r="2.2" fill="var(--myst-lilac)" stroke="none" />
          <path d="M40 36 L56 20" />
          <path d="M56 20 l-7 1.5 M56 20 l-1.5 7" />
        </g>
      );
    case "penasihat": // bulan sabit + gelembung bicara
      return (
        <g {...g}>
          <path d="M34 14 a15 15 0 1 0 12 24 a12 12 0 0 1 -12 -24 Z" />
          <path d="M44 34 h16 a3 3 0 0 1 3 3 v10 a3 3 0 0 1 -3 3 h-8 l-5 5 v-5 h-3 a3 3 0 0 1 -3 -3 v-10 a3 3 0 0 1 3 -3 Z" />
          <path d="M49 41 h9 M49 45 h6" opacity="0.55" />
        </g>
      );
    case "bintang": // bintang menaik + tangga
      return (
        <g {...g}>
          <path d="M18 58 h10 v-8 h10 v-8 h10 v-8 h10" />
          <path d="M52 16 l2.2 5.8 5.8 2.2 -5.8 2.2 -2.2 5.8 -2.2 -5.8 -5.8 -2.2 5.8 -2.2 Z" />
          <path d="M52 24 v0" />
        </g>
      );
    default:
      return null;
  }
}

/* ---------- Ornamen sudut bingkai ---------- */

function OrnamenSudut() {
  const sudut = [
    "left-2 top-2",
    "right-2 top-2 rotate-90",
    "bottom-2 right-2 rotate-180",
    "bottom-2 left-2 -rotate-90",
  ];
  return (
    <>
      {sudut.map((s, i) => (
        <svg
          key={i}
          viewBox="0 0 16 16"
          aria-hidden="true"
          className={`absolute h-4 w-4 ${s}`}
          fill="none"
        >
          <path d="M1 8 V1 H8" stroke="var(--myst-line)" strokeWidth="1" />
          <circle cx="12" cy="12" r="1" fill="var(--myst-violet)" />
        </svg>
      ))}
    </>
  );
}

/* ---------- Motif punggung kartu (pola geometris ungu) ---------- */

function PolaPunggung() {
  return (
    <svg aria-hidden="true" className="absolute inset-0 h-full w-full opacity-[0.16]">
      <defs>
        <pattern id="pola-tarot" width="28" height="28" patternUnits="userSpaceOnUse">
          <path
            d="M14 2 L26 14 L14 26 L2 14 Z"
            fill="none"
            stroke="var(--myst-violet)"
            strokeWidth="1"
          />
          <circle cx="14" cy="14" r="1.2" fill="var(--myst-smoke)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#pola-tarot)" />
    </svg>
  );
}

/* ---------- Satu kartu ---------- */

const SUDUT_KIPAS = [-6, -2, 2, 6];

function SatuKartu({ kartu, indeks, terbuka, onBalik, reduksiGerak }) {
  const tiltRef = useRef(null);
  const target = useRef({ x: 0, y: 0 });
  const halus = useRef({ x: 0, y: 0 });
  const rafId = useRef(null);

  // Tilt 3D dengan peredaman (lerp). Hanya aktif di perangkat ber-kursor.
  useEffect(() => {
    if (reduksiGerak) return;
    const el = tiltRef.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    function loop() {
      halus.current.x += (target.current.x - halus.current.x) * 0.12;
      halus.current.y += (target.current.y - halus.current.y) * 0.12;
      el.style.transform = `rotateX(${halus.current.x.toFixed(2)}deg) rotateY(${halus.current.y.toFixed(2)}deg)`;

      // Berhenti kalau sudah sangat dekat dengan target — supaya loop tidak
      // berjalan selamanya (boros baterai) setelah pointer pergi.
      const selesai =
        Math.abs(target.current.x - halus.current.x) < 0.05 &&
        Math.abs(target.current.y - halus.current.y) < 0.05;
      if (selesai) {
        rafId.current = null;
        return;
      }
      rafId.current = requestAnimationFrame(loop);
    }

    function onMove(e) {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      target.current = { x: py * -10, y: px * 10 }; // maksimal ±10°
      if (rafId.current == null) loop();
    }

    function onLeave() {
      target.current = { x: 0, y: 0 };
    }

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      if (rafId.current != null) cancelAnimationFrame(rafId.current);
      rafId.current = null;
    };
  }, [reduksiGerak]);

  const idIsi = `tarot-isi-${kartu.no}`;

  return (
    <Reveal delay={indeks * 90} className="shrink-0">
      <div
        className={`tarot-fan ${terbuka ? "tarot-terbuka" : ""}`}
        style={{
          "--fan": `${SUDUT_KIPAS[indeks] ?? 0}deg`,
          "--fanY": `${Math.abs(SUDUT_KIPAS[indeks] ?? 0) * 2.4}px`,
        }}
      >
        <button
          type="button"
          onClick={onBalik}
          aria-expanded={terbuka}
          aria-controls={idIsi}
          className="group/tarot tarot-scene block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-myst-lilac focus-visible:ring-offset-2 focus-visible:ring-offset-myst-void"
        >
          <div ref={tiltRef} style={{ transformStyle: "preserve-3d" }}>
            <div
              className={`tarot-inner relative h-[360px] w-[240px] lg:h-[375px] lg:w-[250px] ${
                terbuka && !reduksiGerak ? "tarot-flipped" : ""
              }`}
            >
              {/* ===== Sisi depan ===== */}
              <div
                className={`tarot-face overflow-hidden rounded-2xl border border-myst-line bg-myst-raised transition-opacity duration-150 ${
                  reduksiGerak && terbuka ? "opacity-0" : "opacity-100"
                }`}
                style={{
                  boxShadow:
                    "0 24px 48px -20px rgba(0,0,0,0.7), 0 0 0 1px rgba(201,169,255,0.05)",
                }}
              >
                {/* bingkai garis ganda */}
                <div className="absolute inset-2 rounded-xl border border-myst-line" />
                <div className="absolute inset-3.5 rounded-lg border border-myst-line/50" />
                <OrnamenSudut />

                {/* angka romawi */}
                <span className="label-mono absolute left-5 top-5 !text-myst-lilac">
                  {kartu.no}
                </span>
                <Kilau4 size={11} className="absolute right-5 top-5 text-myst-lilac/70" />

                {/* emblem dalam lingkaran busur */}
                <div className="absolute inset-x-0 top-[24%] flex justify-center">
                  <div className="relative flex h-32 w-32 items-center justify-center md:h-36 md:w-36">
                    <svg viewBox="0 0 80 80" aria-hidden="true" className="absolute inset-0 h-full w-full" fill="none">
                      <circle cx="40" cy="40" r="37" stroke="var(--myst-line)" strokeWidth="1" strokeDasharray="4 6" />
                      <circle cx="40" cy="40" r="30" stroke="var(--myst-line)" strokeWidth="1" />
                    </svg>
                    <svg viewBox="0 0 80 72" className="h-20 w-20 md:h-24 md:w-24">
                      <Emblem jenis={kartu.emblem} />
                    </svg>
                  </div>
                </div>

                {/* nama arcana + subjudul */}
                <div className="absolute inset-x-0 bottom-7 px-4 text-center">
                  <div className="mx-auto mb-3 h-px w-10 bg-myst-line" />
                  <p className="font-display whitespace-nowrap text-[15px] uppercase tracking-[0.1em] text-myst-text md:text-[17px]">
                    {kartu.arcana}
                  </p>
                  <p className="mt-1 text-[13px] font-semibold text-myst-lilac">
                    {kartu.judul}
                  </p>
                  <p className="label-mono mt-2.5">{kartu.mono}</p>
                </div>

                {/* kilau holografik */}
                <span className="tarot-foil" aria-hidden="true" />
              </div>

              {/* ===== Sisi belakang ===== */}
              <div
                id={idIsi}
                className={`tarot-face tarot-back overflow-hidden rounded-2xl border border-myst-violet/40 bg-myst-raised transition-opacity duration-150 ${
                  reduksiGerak ? (terbuka ? "opacity-100" : "opacity-0") : ""
                }`}
                style={
                  reduksiGerak ? { transform: "none", zIndex: terbuka ? 1 : -1 } : undefined
                }
              >
                <PolaPunggung />
                <div className="absolute inset-2 rounded-xl border border-myst-line" />
                <div className="relative flex h-full flex-col items-center justify-center gap-5 px-7 text-center">
                  <span className="label-mono !text-myst-lilac">{kartu.no} · {kartu.arcana}</span>
                  <p className="text-sm leading-relaxed text-myst-text">
                    {kartu.belakang}
                  </p>
                  <Link
                    href="/cara-kerja"
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs font-semibold text-myst-lilac underline decoration-myst-lilac/40 underline-offset-4 transition-colors hover:text-myst-text"
                  >
                    Lihat cara kerjanya →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </button>
      </div>
    </Reveal>
  );
}

/* ---------- Preferensi "kurangi gerak" ---------- */

// Dibaca lewat useSyncExternalStore, bukan useState + useEffect: nilainya
// hidup di luar React (media query milik peramban), dan cara ini menghindari
// render berantai sekaligus memberi jawaban yang benar di server (false).
const KUERI_GERAK = "(prefers-reduced-motion: reduce)";

function langganiGerak(beriTahu) {
  const mq = window.matchMedia(KUERI_GERAK);
  mq.addEventListener("change", beriTahu);
  return () => mq.removeEventListener("change", beriTahu);
}

const bacaGerakKlien = () => window.matchMedia(KUERI_GERAK).matches;
const bacaGerakServer = () => false;

function usePreferensiKurangiGerak() {
  return useSyncExternalStore(langganiGerak, bacaGerakKlien, bacaGerakServer);
}

/* ---------- Tumpukan tangga (layar sempit) ---------- */

// Tinggi satu kartu tangga dan jarak turunnya, dalam piksel. Selisih keduanya
// adalah bagian yang tertutup kartu berikutnya.
const TINGGI_TANGGA = 132;
const LANGKAH_TANGGA = 96;

function KartuTangga({ kartu, indeks, naik, onPilih }) {
  return (
    <button
      type="button"
      onClick={onPilih}
      aria-haspopup="dialog"
      className="tangga-kartu absolute inset-x-0 top-0 rounded-2xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-myst-lilac focus-visible:ring-offset-2 focus-visible:ring-offset-myst-void"
      style={{
        height: TINGGI_TANGGA + "px",
        // Kartu yang dipilih naik ke slot paling atas dan sedikit membesar.
        "--tangga-y": naik ? "0px" : indeks * LANGKAH_TANGGA + "px",
        "--tangga-skala": naik ? 1.04 : 1 - indeks * 0.018,
        zIndex: naik ? 20 : indeks + 1,
      }}
    >
      <div className="relative h-full overflow-hidden rounded-2xl border border-myst-line bg-myst-raised shadow-[0_18px_40px_-18px_rgba(0,0,0,0.8)]">
        <PolaPunggung />
        <div className="absolute inset-1.5 rounded-xl border border-myst-line" />
        <div className="absolute inset-2.5 rounded-lg border border-myst-line/45" />
        <OrnamenSudut />

        {/* Isi diletakkan di JALUR ATAS kartu — itulah bagian yang tetap
            terlihat saat kartu berikutnya menutupi bagian bawahnya. */}
        <div className="relative flex h-full items-start gap-4 px-5 pt-6">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
            <svg
              viewBox="0 0 80 80"
              aria-hidden="true"
              className="absolute inset-0 h-full w-full"
              fill="none"
            >
              <circle
                cx="40"
                cy="40"
                r="37"
                stroke="var(--myst-line)"
                strokeWidth="1"
                strokeDasharray="4 6"
              />
            </svg>
            <svg viewBox="0 0 80 72" className="h-9 w-9">
              <Emblem jenis={kartu.emblem} />
            </svg>
          </div>

          <div className="min-w-0 flex-1">
            <span className="label-mono !text-myst-lilac">{kartu.no}</span>
            <p className="font-display mt-0.5 truncate text-[15px] uppercase tracking-[0.08em] text-myst-text">
              {kartu.arcana}
            </p>
            <p className="mt-0.5 truncate text-[12.5px] font-semibold text-myst-lilac">
              {kartu.judul}
            </p>
          </div>

          <Kilau4 size={11} className="shrink-0 text-myst-lilac/70" />
        </div>
      </div>
    </button>
  );
}

/* ---------- Modal isi kartu (layar sempit) ---------- */

function ModalKartu({ kartu, onTutup }) {
  const panelRef = useRef(null);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onTutup();
    }
    document.addEventListener("keydown", onKey);
    panelRef.current?.focus();

    // Kunci gulir latar selama modal terbuka. Lewat overflow di <body>, bukan
    // position: fixed — cara fixed memaksa scrollY menjadi 0, jadi halaman
    // akan melompat ke puncak begitu modal ditutup.
    const sebelum = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = sebelum;
    };
  }, [onTutup]);

  return (
    <div
      className="modal-tarot fixed inset-0 z-50 flex items-center justify-center px-5 py-8 lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label={kartu.arcana + " — " + kartu.judul}
    >
      <button
        type="button"
        aria-label="Tutup"
        onClick={onTutup}
        className="modal-tarot-tirai absolute inset-0 bg-myst-void/80 backdrop-blur-md"
      />

      <div
        ref={panelRef}
        tabIndex={-1}
        className="modal-tarot-panel relative w-full max-w-sm overflow-hidden rounded-2xl border border-myst-violet/40 bg-myst-raised focus:outline-none"
      >
        <PolaPunggung />
        <div className="absolute inset-2 rounded-xl border border-myst-line" />
        <OrnamenSudut />

        <div className="relative flex flex-col items-center gap-5 px-7 py-9 text-center">
          <span className="label-mono !text-myst-lilac">
            {kartu.no} · {kartu.arcana}
          </span>

          <div className="relative flex h-28 w-28 items-center justify-center">
            <svg
              viewBox="0 0 80 80"
              aria-hidden="true"
              className="absolute inset-0 h-full w-full"
              fill="none"
            >
              <circle
                cx="40"
                cy="40"
                r="37"
                stroke="var(--myst-line)"
                strokeWidth="1"
                strokeDasharray="4 6"
              />
              <circle
                cx="40"
                cy="40"
                r="30"
                stroke="var(--myst-line)"
                strokeWidth="1"
              />
            </svg>
            <svg viewBox="0 0 80 72" className="h-16 w-16">
              <Emblem jenis={kartu.emblem} />
            </svg>
          </div>

          <div>
            <p className="font-display text-[19px] uppercase tracking-[0.08em] text-myst-text">
              {kartu.judul}
            </p>
            <p className="label-mono mt-2">{kartu.mono}</p>
          </div>

          <div className="h-px w-10 bg-myst-line" />

          <p className="text-sm leading-relaxed text-myst-text">
            {kartu.belakang}
          </p>

          <Link
            href="/cara-kerja"
            className="text-xs font-semibold text-myst-lilac underline decoration-myst-lilac/40 underline-offset-4 transition-colors hover:text-myst-text"
          >
            Lihat cara kerjanya →
          </Link>

          <button
            type="button"
            onClick={onTutup}
            className="mt-1 rounded-full border border-myst-line px-6 py-2 text-xs font-semibold text-myst-muted transition-colors hover:border-myst-lilac/60 hover:text-myst-text"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Dek: susunan 4 kartu ---------- */

// Jeda antara kartu mulai naik dan modal muncul. Disamakan dengan durasi
// transisi .tangga-kartu di globals.css.
const JEDA_NAIK = 350;

export default function DekTarot({ kartu }) {
  const [terbukaNo, setTerbukaNo] = useState(null);
  const [naikNo, setNaikNo] = useState(null);
  const [modalNo, setModalNo] = useState(null);
  const reduksiGerak = usePreferensiKurangiGerak();
  const jedaRef = useRef(null);

  useEffect(() => () => clearTimeout(jedaRef.current), []);

  function pilihTangga(no) {
    setNaikNo(no);
    if (reduksiGerak) {
      setModalNo(no); // tanpa animasi, modal langsung muncul
      return;
    }
    clearTimeout(jedaRef.current);
    jedaRef.current = setTimeout(() => setModalNo(no), JEDA_NAIK);
  }

  function tutupModal() {
    clearTimeout(jedaRef.current);
    setModalNo(null);
    setNaikNo(null);
  }

  const kartuModal = kartu.find((k) => k.no === modalNo) ?? null;
  const tinggiTumpukan =
    TINGGI_TANGGA + (kartu.length - 1) * LANGKAH_TANGGA;

  return (
    <>
      {/* ===== Layar sempit: tumpukan tangga ===== */}
      <div
        className="relative lg:hidden"
        style={{ height: tinggiTumpukan + "px" }}
        role="group"
        aria-label="Empat fitur utama FiLUP"
      >
        {kartu.map((k, i) => (
          <KartuTangga
            key={k.no}
            kartu={k}
            indeks={i}
            naik={naikNo === k.no}
            onPilih={() => pilihTangga(k.no)}
          />
        ))}
      </div>

      {/* ===== Layar lebar: kipas ===== */}
      <div
        className="hidden lg:flex lg:justify-center lg:space-x-[-28px] lg:pb-10 lg:pt-6"
        role="group"
        aria-label="Empat fitur utama FiLUP"
      >
        {kartu.map((k, i) => (
          <SatuKartu
            key={k.no}
            kartu={k}
            indeks={i}
            terbuka={terbukaNo === k.no}
            reduksiGerak={reduksiGerak}
            onBalik={() => setTerbukaNo((t) => (t === k.no ? null : k.no))}
          />
        ))}
      </div>

      {kartuModal && <ModalKartu kartu={kartuModal} onTutup={tutupModal} />}
    </>
  );
}
