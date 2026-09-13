"use client";

import { useEffect, useRef, useState } from "react";

// Efek-efek kecil untuk halaman landing.
//
// Semuanya dibuat sendiri dengan IntersectionObserver + CSS transition —
// tanpa library animasi tambahan, supaya halaman tetap ringan dan tidak
// menambah dependensi. Preferensi "reduce motion" pengguna dihormati lewat
// aturan global di globals.css.

/**
 * Membungkus konten yang muncul lembut saat di-scroll ke dalam layar.
 * @param delay  jeda milidetik, untuk efek berurutan antar elemen
 */
export function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [terlihat, setTerlihat] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTerlihat(true);
          observer.disconnect(); // sekali muncul, tidak perlu diamati lagi
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`fx-reveal ${terlihat ? "fx-visible" : ""} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

/**
 * Angka yang menghitung naik saat pertama kali terlihat.
 * @param end       nilai akhir
 * @param decimals  jumlah angka di belakang koma (format Indonesia: koma)
 * @param suffix    teks setelah angka, misal "%" atau " fitur"
 * @param duration  lama animasi (ms)
 */
export function Counter({ end, decimals = 0, suffix = "", duration = 1400 }) {
  const ref = useRef(null);
  const [nilai, setNilai] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const mulai = performance.now();
        function tick(now) {
          const t = Math.min(1, (now - mulai) / duration);
          // easing keluar: cepat di awal, melambat di akhir
          const eased = 1 - Math.pow(1 - t, 3);
          setNilai(end * eased);
          if (t < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration]);

  const teks = nilai.toLocaleString("id-ID", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={ref}>
      {teks}
      {suffix}
    </span>
  );
}

/**
 * Kata di judul yang bergantian dengan efek naik-turun lembut.
 */
export function RotatingWord({ words, interval = 2200, className = "" }) {
  const [idx, setIdx] = useState(0);
  const [keluar, setKeluar] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setKeluar(true);
      setTimeout(() => {
        setIdx((i) => (i + 1) % words.length);
        setKeluar(false);
      }, 260);
    }, interval);
    return () => clearInterval(timer);
  }, [words.length, interval]);

  // Lebar dipesan seukuran kata terpanjang supaya judul tidak bergeser-geser
  // setiap kali katanya berganti.
  const terpanjang = words.reduce((a, b) => (b.length > a.length ? b : a), "");

  return (
    <span className="relative inline-block whitespace-nowrap align-baseline">
      <span aria-hidden="true" className="invisible">
        {terpanjang}
      </span>
      {/* Catatan: kelas gradasi teks harus menempel LANGSUNG di sini —
          background-clip: text milik elemen induk tidak melukis teks pada
          anak yang diposisikan absolut. */}
      <span
        className={`absolute inset-0 text-center transition-all duration-300 ${className} ${
          keluar ? "-translate-y-2 opacity-0" : "translate-y-0 opacity-100"
        }`}
      >
        {words[idx]}
      </span>
    </span>
  );
}
