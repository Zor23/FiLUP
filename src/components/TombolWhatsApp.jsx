"use client";

// Tombol kontak WhatsApp di pojok kiri bawah (beranda publik & dashboard).
//
// Dirender lewat PORTAL ke <body>, bukan di tempat komponennya dipanggil.
// Isi setiap halaman dibungkus `.transisi-halaman` yang memakai `transform`
// selama animasi masuk — dan transform menjadikan pembungkus itu containing
// block untuk elemen `position: fixed` di dalamnya. Tanpa portal, tombol ini
// akan ikut bergeser bersama isi halaman selama 620 ms pertama.
//
// Portal butuh `document`, jadi tombolnya baru muncul setelah hydrate.
//
// Warnanya mengikuti tema (indigo), bukan hijau khas WhatsApp: yang membuat
// tombol ini dikenali adalah bentuk ikonnya, dan hijau terang akan menjadi
// satu-satunya warna di halaman yang keluar dari palet.

import { createPortal } from "react-dom";
import Emblem from "@/components/Emblem";
import { useSudahDiKlien } from "@/lib/diKlien";

// 0813-3837-8848 dalam format internasional untuk wa.me (tanpa 0 di depan).
const NOMOR = "6281338378848";
const NOMOR_TAMPIL = "0813-3837-8848";

const LETAK = {
  // Beranda publik: pojok kiri bawah biasa.
  publik: "bottom-5 left-5 md:bottom-6 md:left-6",
  // Halaman aplikasi: di HP naik di atas navigasi bawah; di PC bergeser ke
  // kanan sidebar (lebar 16rem) supaya tidak menutupi kartu pengguna.
  aplikasi: "bottom-24 left-4 md:bottom-6 md:left-[17.5rem]",
};

export default function TombolWhatsApp({
  posisi = "publik",
  pesan = "Halo FiLUP, saya ingin bertanya tentang aplikasinya.",
}) {
  const diKlien = useSudahDiKlien();
  if (!diKlien) return null;

  const tautan = `https://wa.me/${NOMOR}?text=${encodeURIComponent(pesan)}`;

  return createPortal(
    <a
      href={tautan}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Hubungi FiLUP lewat WhatsApp di ${NOMOR_TAMPIL} (membuka tab baru)`}
      title={`WhatsApp ${NOMOR_TAMPIL}`}
      className={`tombol-wa fixed z-40 md:px-4 ${LETAK[posisi] ?? LETAK.publik}`}
    >
      <Emblem nama="whatsapp" size={22} />
      <span className="hidden md:inline">Tanya lewat WhatsApp</span>
    </a>,
    document.body
  );
}
