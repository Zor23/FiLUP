// Pustaka lambang FiLUP — pengganti seluruh emoji di aplikasi.
//
// Alasan emoji dibuang: bentuk dan warnanya ditentukan oleh sistem operasi,
// bukan oleh kita. Emoji yang sama tampil oranye-mengkilap di Windows, datar
// di Android, dan tiga dimensi di iOS — tiga rasa yang semuanya bertabrakan
// dengan tema ungu-malam, dan satu-satunya bagian aplikasi yang tidak bisa
// kita samakan. Emoji juga membawa warna hangat (kuning, oranye) yang justru
// sedang dihapus dari seluruh antarmuka.
//
// Semua lambang di sini digambar sendiri sebagai SVG dengan bahasa bentuk yang
// sama seperti publik/Kilau.jsx: geometris, garis setipis rambut, elips
// presisi — editorial, bukan ikon aplikasi kebanyakan.
//
// Semuanya mewarisi warna lewat `currentColor`, jadi warnanya diatur dengan
// kelas `text-*` seperti teks biasa. Tidak ada satu pun warna yang ditulis
// tetap di dalam berkas ini.
//
// Pemakaian:
//     <Emblem nama="misi" size={24} />
//
// Nama lambang dipakai juga sebagai DATA (mis. `icon: "sepatu"` di mockData,
// Firestore, dan jawaban route AI). Nama yang tidak dikenal — misalnya emoji
// lama yang sudah tersimpan di Firestore pengguna — jatuh ke lambang cadangan,
// jadi data lama tidak pernah membuat halaman kosong.

const G = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

// Bintang empat sudut, motif yang sama dengan Kilau4 di halaman publik.
// Dipakai berulang sebagai "inti" beberapa lambang supaya satu keluarga.
const inti = (cx, cy, r) => (
  <path
    d={`M${cx} ${cy - r}Q${cx + r * 0.22} ${cy - r * 0.22} ${cx + r} ${cy}Q${
      cx + r * 0.22
    } ${cy + r * 0.22} ${cx} ${cy + r}Q${cx - r * 0.22} ${cy + r * 0.22} ${
      cx - r
    } ${cy}Q${cx - r * 0.22} ${cy - r * 0.22} ${cx} ${cy - r}Z`}
    fill="currentColor"
    stroke="none"
  />
);

/* ---------------------------------------------------------------------------
   Daftar lambang

   Semua digambar di dalam kotak 24x24 dengan tepi aman 2px, supaya ukurannya
   terasa seragam saat disandingkan.
   --------------------------------------------------------------------------- */
const LAMBANG = {
  /* ---- Navigasi ---- */
  beranda: (
    <>
      <path {...G} d="M3.2 10.8 12 3.6l8.8 7.2" />
      <path {...G} d="M5.6 9.4V20.4h12.8V9.4" />
      <path {...G} d="M9.8 20.4v-5.2h4.4v5.2" />
    </>
  ),
  scan: (
    <>
      <path {...G} d="M3.2 8V4.8a1.6 1.6 0 0 1 1.6-1.6H8" />
      <path {...G} d="M16 3.2h3.2a1.6 1.6 0 0 1 1.6 1.6V8" />
      <path {...G} d="M20.8 16v3.2a1.6 1.6 0 0 1-1.6 1.6H16" />
      <path {...G} d="M8 20.8H4.8a1.6 1.6 0 0 1-1.6-1.6V16" />
      <path {...G} d="M6.6 12h10.8" />
      {inti(12, 12, 1.5)}
    </>
  ),
  misi: (
    <>
      <circle {...G} cx="12" cy="12" r="8.4" />
      <circle {...G} cx="12" cy="12" r="4.6" />
      {inti(12, 12, 1.9)}
    </>
  ),
  asisten: (
    <>
      <path
        {...G}
        d="M4 10.4a5.6 5.6 0 0 1 5.6-5.6h4.8A5.6 5.6 0 0 1 20 10.4v1.6a5.6 5.6 0 0 1-5.6 5.6H10l-4.2 3v-3.6A5.6 5.6 0 0 1 4 12z"
      />
      <circle cx="9.2" cy="11.4" r="1" fill="currentColor" />
      <circle cx="12" cy="11.4" r="1" fill="currentColor" />
      <circle cx="14.8" cy="11.4" r="1" fill="currentColor" />
    </>
  ),
  profil: (
    <>
      <circle {...G} cx="12" cy="8.4" r="3.8" />
      <path {...G} d="M4.6 20.4a7.4 7.4 0 0 1 14.8 0" />
    </>
  ),
  riwayat: (
    <>
      <path {...G} d="M6.6 3.6h11a1.8 1.8 0 0 1 1.8 1.8v13a2 2 0 0 1-2 2h-11" />
      <path {...G} d="M6.4 3.6a1.8 1.8 0 0 0 0 3.6h2.2" />
      <path {...G} d="M6.4 20.4a1.8 1.8 0 0 1 0-3.6h2.2" />
      <path {...G} d="M10.6 9.4h6M10.6 12.6h6M10.6 15.8h3.4" />
    </>
  ),
  pengaturan: (
    <>
      <path
        {...G}
        d="M12 3.4 15.6 5v3l2.6 1.5 2.6-1.1v3.2l-2.6 1.5v3L15.6 19v3L12 20.6 8.4 22v-3L5.8 17.5v-3L3.2 13V9.8L5.8 8.9 8.4 8V5z"
      />
      <circle {...G} cx="12" cy="12.4" r="3.2" />
    </>
  ),
  catatan: (
    <>
      <path {...G} d="M6 3.6h8.4L19 8.2v12.2H6z" />
      <path {...G} d="M14.2 3.6v4.8H19" />
      <path {...G} d="M9 12.6h6M9 16h4" />
    </>
  ),

  /* ---- Keadaan & umpan balik ---- */
  beruntun: (
    <>
      <path
        {...G}
        d="M12 2.8c3.4 3.4 5.8 6.2 5.8 9.6a5.8 5.8 0 1 1-11.6 0c0-2 .9-3.8 2.4-5.6.6 1.2 1.4 2 2.4 2.4-.6-2.4-.3-4.4 1-6.4"
      />
      {inti(12, 14.6, 2.4)}
    </>
  ),
  kecerdasan: (
    <>
      <path {...G} d="M12 2.9 20 7.4v9.2L12 21.1 4 16.6V7.4z" />
      <circle cx="12" cy="8.6" r="1.35" fill="currentColor" />
      <circle cx="8.4" cy="14.6" r="1.35" fill="currentColor" />
      <circle cx="15.6" cy="14.6" r="1.35" fill="currentColor" />
      <path {...G} d="M12 8.6 8.4 14.6h7.2z" />
    </>
  ),
  peringatan: (
    <>
      <path {...G} d="M12 3.6 21.2 20H2.8z" />
      <path {...G} d="M12 9.8v4.4" />
      <circle cx="12" cy="17" r="1.1" fill="currentColor" />
    </>
  ),
  centang: <path {...G} d="M4.4 12.6 9.6 17.8 19.6 6.8" />,
  gagasan: (
    <>
      <path
        {...G}
        d="M8.2 15.4a5.6 5.6 0 1 1 7.6 0v2.2H8.2z"
      />
      <path {...G} d="M9.8 20.4h4.4" />
      {inti(12, 10.6, 2)}
    </>
  ),
  uji: (
    <>
      <path {...G} d="M9.6 3.2v6.2L4.8 18a2.2 2.2 0 0 0 1.9 3.2h10.6a2.2 2.2 0 0 0 1.9-3.2l-4.8-8.6V3.2" />
      <path {...G} d="M8.4 3.2h7.2" />
      <path {...G} d="M7.2 14.6h9.6" />
    </>
  ),
  rayakan: (
    <>
      {inti(12, 12, 4.4)}
      <path {...G} d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2" />
      <path {...G} d="m5.4 5.4 1.6 1.6M17 17l1.6 1.6M18.6 5.4 17 7M7 17l-1.6 1.6" />
    </>
  ),
  piala: (
    <>
      <path {...G} d="M7.4 3.6h9.2v5.2a4.6 4.6 0 1 1-9.2 0z" />
      <path {...G} d="M7.4 5.2H4.6v1.6a3 3 0 0 0 3 3" />
      <path {...G} d="M16.6 5.2h2.8v1.6a3 3 0 0 1-3 3" />
      <path {...G} d="M12 13.4v3.6M8.6 20.4h6.8l-.8-3.4H9.4z" />
    </>
  ),
  brankas: (
    <>
      <rect {...G} x="3.2" y="4" width="17.6" height="16" rx="1.8" />
      <circle {...G} cx="10.6" cy="12" r="4" />
      {inti(10.6, 12, 1.4)}
      <path {...G} d="M17.2 9.6v4.8" />
    </>
  ),
  perisai: (
    <>
      <path {...G} d="M12 3 19.4 6v6.2c0 4-3 7.4-7.4 8.8-4.4-1.4-7.4-4.8-7.4-8.8V6z" />
      {inti(12, 11.6, 2.6)}
    </>
  ),
  arsip: (
    <>
      <path {...G} d="M3.4 7.6h17.2v11a1.8 1.8 0 0 1-1.8 1.8H5.2a1.8 1.8 0 0 1-1.8-1.8z" />
      <path {...G} d="M3.4 7.6 5.8 3.6h12.4l2.4 4" />
      <path {...G} d="M9.6 12h4.8" />
    </>
  ),
  tunjukBawah: (
    <>
      <path {...G} d="M12 4.6v14" />
      <path {...G} d="m6.6 13.4 5.4 5.4 5.4-5.4" />
    </>
  ),
  tekad: (
    <>
      <path {...G} d="M4 13.4a8 8 0 0 1 16 0v3.2a3.8 3.8 0 0 1-3.8 3.8H7.8A3.8 3.8 0 0 1 4 16.6z" />
      <path {...G} d="M8.4 13.4V8.2M12 13.4V6.4M15.6 13.4V8.2" />
    </>
  ),

  /* ---- Kategori transaksi ---- */
  jajan: (
    <>
      <rect {...G} x="7.6" y="8.4" width="8.8" height="7.2" rx="1.2" />
      <path {...G} d="M7.6 10.2 3.6 7.6v8.8l4-2.6" />
      <path {...G} d="M16.4 10.2l4-2.6v8.8l-4-2.6" />
    </>
  ),
  makanan: (
    <>
      <path {...G} d="M3.6 12h16.8a8.4 8.4 0 0 1-8.4 8.4A8.4 8.4 0 0 1 3.6 12z" />
      <path {...G} d="M9.4 8.4c0-1.4 1.2-1.8 1.2-3.2M14.6 8.4c0-1.4 1.2-1.8 1.2-3.2" />
    </>
  ),
  transport: (
    <>
      <circle {...G} cx="6" cy="16.6" r="3.4" />
      <circle {...G} cx="18" cy="16.6" r="3.4" />
      <path {...G} d="M6 16.6h5.2l3.6-7.4h3.2" />
      <path {...G} d="M12.4 9.2h3.4l2.2 7.4" />
      <path {...G} d="M14.2 5.6h2.6" />
    </>
  ),
  uangSaku: (
    <>
      <circle {...G} cx="12" cy="12" r="8.4" />
      <path {...G} d="M10 16.4V7.6h3a2.8 2.8 0 0 1 0 5.6h-3" />
      <path {...G} d="M8.6 14.2h3.6" />
    </>
  ),
  belanja: (
    <>
      <path {...G} d="M4.6 7.6h14.8l-1.2 12.8H5.8z" />
      <path {...G} d="M8.8 10V6.8a3.2 3.2 0 0 1 6.4 0V10" />
    </>
  ),
  lainnya: (
    <>
      <path {...G} d="M12 3.2 20.4 7.6v8.8L12 20.8 3.6 16.4V7.6z" />
      <path {...G} d="M3.6 7.6 12 12l8.4-4.4M12 12v8.8" />
    </>
  ),

  /* ---- Barang impian (pilihan cepat misi) ---- */
  sepatu: (
    <>
      <path {...G} d="M3.2 16.8V9.6h3.2l2.4 2.6 3.6 1 6 1.8a3 3 0 0 1 2.4 2.9v.9H3.2z" />
      <path {...G} d="M6.4 9.6v2.6M9.8 12.2l1.2 2.2M13.4 13.2l1.2 2.2" />
    </>
  ),
  permainan: (
    <>
      <rect {...G} x="2.8" y="7.4" width="18.4" height="9.6" rx="4.2" />
      <path {...G} d="M7.4 10.6v3.2M5.8 12.2H9" />
      <circle cx="15.6" cy="11.2" r="1.15" fill="currentColor" />
      <circle cx="18" cy="13.4" r="1.15" fill="currentColor" />
    </>
  ),
  musik: (
    <>
      <path {...G} d="M9.6 17.2V5.4l9-1.8v11.6" />
      <ellipse {...G} cx="7" cy="17.6" rx="2.6" ry="2.2" />
      <ellipse {...G} cx="16" cy="15.4" rx="2.6" ry="2.2" />
      <path {...G} d="M9.6 8.8l9-1.8" />
    </>
  ),
  buku: (
    <>
      <path {...G} d="M12 6.6C10.4 5 8.2 4.2 4.4 4.2v13c3.8 0 6 .8 7.6 2.4 1.6-1.6 3.8-2.4 7.6-2.4v-13c-3.8 0-6 .8-7.6 2.4z" />
      <path {...G} d="M12 6.6v13" />
    </>
  ),

  /* ---- Sosial, kuis, kontak ---- */
  teman: (
    <>
      <circle {...G} cx="9" cy="8.6" r="3.2" />
      <path {...G} d="M3.4 19.6a5.6 5.6 0 0 1 11.2 0" />
      <circle {...G} cx="16.6" cy="9.6" r="2.5" />
      <path {...G} d="M16 14.4a4.6 4.6 0 0 1 4.6 5.2" />
    </>
  ),
  bersama: (
    <>
      <circle {...G} cx="9.2" cy="12" r="5.8" />
      <circle {...G} cx="14.8" cy="12" r="5.8" />
      {inti(12, 12, 1.8)}
    </>
  ),
  kuis: (
    <>
      <circle {...G} cx="12" cy="12" r="8.4" />
      <path {...G} d="M9.6 9.7a2.4 2.4 0 1 1 3.5 2.1c-.7.4-1.1.9-1.1 1.6v.6" />
      <circle cx="12" cy="16.7" r="1.05" fill="currentColor" />
    </>
  ),
  whatsapp: (
    <>
      <path {...G} d="M7.8 19.3A8.3 8.3 0 1 0 4.7 16.1L3.6 20.4z" />
      <path
        {...G}
        d="M9.4 8.1c-.6.4-1 1.2-.6 2.3a8 8 0 0 0 4.8 4.8c1.1.4 1.9 0 2.3-.6l.3-.6-2-1.1-.9.8a5.4 5.4 0 0 1-2.6-2.6l.8-.9-1.1-2z"
      />
    </>
  ),
  kembali: (
    <>
      <path {...G} d="M19.2 12H4.8" />
      <path {...G} d="m10.2 6.6-5.4 5.4 5.4 5.4" />
    </>
  ),
  salin: (
    <>
      <rect {...G} x="8.4" y="8.4" width="11.6" height="11.6" rx="2" />
      <path {...G} d="M15.6 8.4V5.6a1.6 1.6 0 0 0-1.6-1.6H5.6A1.6 1.6 0 0 0 4 5.6V14a1.6 1.6 0 0 0 1.6 1.6h2.8" />
    </>
  ),
};

// Lambang cadangan untuk nama yang tidak dikenal — termasuk emoji lama yang
// mungkin masih tersimpan di Firestore milik pengguna.
const CADANGAN = "misi";

/** Semua nama lambang yang sah — dipakai untuk memvalidasi data dari luar. */
export const NAMA_EMBLEM = Object.keys(LAMBANG);

/** Benar kalau `nama` adalah lambang yang betul-betul ada. */
export function adaEmblem(nama) {
  return Object.prototype.hasOwnProperty.call(LAMBANG, nama);
}

/**
 * @param nama   salah satu dari NAMA_EMBLEM
 * @param size   sisi kotak dalam piksel
 * @param label  kalau diisi, lambang dibacakan pembaca layar dengan teks ini;
 *               kalau kosong, lambang dianggap hiasan dan disembunyikan
 */
export default function Emblem({ nama, size = 24, label = "", className = "" }) {
  const isi = LAMBANG[nama] ?? LAMBANG[CADANGAN];
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={`shrink-0 ${className}`}
      role={label ? "img" : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : "true"}
    >
      {isi}
    </svg>
  );
}
