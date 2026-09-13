// Data contoh untuk mode demo — dipakai saat Firebase belum dikonfigurasi,
// supaya aplikasi tetap bisa dijelajahi tanpa kredensial maupun internet.
//
// Tanggalnya dihitung relatif terhadap hari ini, bukan ditulis tetap. Alasannya:
// analisis keuangan membandingkan tujuh hari terakhir dengan tujuh hari
// sebelumnya, dan tenggat misi dihitung dalam sisa hari. Tanggal tetap akan
// basi seiring waktu dan membuat demo menampilkan "0 hari lagi" di mana-mana.
//
// Aman dari hydration mismatch karena data ini hanya masuk ke state React di
// dalam useEffect milik DataProvider — tidak pernah ikut ter-render di server.

const SEHARI = 86400000;

/** Tanggal n hari yang lalu, dalam format ISO. */
function hariLalu(n, jam = 12) {
  const d = new Date(Date.now() - n * SEHARI);
  d.setHours(jam, 0, 0, 0);
  return d.toISOString();
}

/** Tanggal n hari ke depan, format YYYY-MM-DD (sesuai bentuk deadline misi). */
function hariDepan(n) {
  return new Date(Date.now() + n * SEHARI).toISOString().slice(0, 10);
}

export const mockUser = {
  name: "Rafa",
  level: 4,
  xp: 320,
  xpToNextLevel: 500,
  balance: 185000,
  streakDays: 6,
  totalSaved: 365000,
};

export const mockMissions = [
  {
    id: "m1",
    title: "Sepatu Basket Baru",
    icon: "sepatu",
    targetAmount: 450000,
    currentAmount: 270000,
    deadline: hariDepan(24),
    status: "active",
  },
  {
    id: "m2",
    title: "Senar Gitar",
    icon: "musik",
    targetAmount: 60000,
    currentAmount: 60000,
    deadline: hariDepan(-16),
    status: "completed",
  },
  {
    id: "m3",
    title: "Top Up Game",
    icon: "permainan",
    targetAmount: 100000,
    currentAmount: 35000,
    deadline: hariDepan(9),
    status: "active",
  },
];

// Disusun dari yang terbaru ke terlama, sama seperti urutan dari Firestore.
// Sebarannya sengaja menutupi dua pekan supaya perbandingan tren pada halaman
// Wawasan AI punya bahan untuk dibandingkan.
export const mockTransactions = [
  {
    id: "t1",
    merchant: "Indomaret",
    amount: 18000,
    type: "expense",
    category: "Jajan",
    source: "struk",
    createdAt: hariLalu(1, 9),
  },
  {
    id: "t2",
    merchant: "Warung Bu Sri",
    amount: 15000,
    type: "expense",
    category: "Makanan",
    source: "struk",
    createdAt: hariLalu(2, 12),
  },
  {
    id: "t3",
    merchant: "Ojek Online",
    amount: 12000,
    type: "expense",
    category: "Transport",
    source: "transfer",
    createdAt: hariLalu(3, 16),
  },
  {
    id: "t4",
    merchant: "Kantin Sekolah",
    amount: 10000,
    type: "expense",
    category: "Makanan",
    source: "manual",
    createdAt: hariLalu(5, 10),
  },
  {
    id: "t5",
    merchant: "Top Up Kuota",
    amount: 25000,
    type: "expense",
    category: "Internet",
    source: "transfer",
    createdAt: hariLalu(6, 20),
  },
  {
    id: "t6",
    merchant: "Uang Saku Mingguan",
    amount: 100000,
    type: "income",
    category: "Uang Saku",
    source: "manual",
    createdAt: hariLalu(7, 7),
  },
  {
    id: "t7",
    merchant: "Indomaret",
    amount: 23000,
    type: "expense",
    category: "Jajan",
    source: "struk",
    createdAt: hariLalu(9, 15),
  },
  {
    id: "t8",
    merchant: "Ojek Online",
    amount: 14000,
    type: "expense",
    category: "Transport",
    source: "transfer",
    createdAt: hariLalu(11, 17),
  },
  {
    id: "t9",
    merchant: "Fotokopi Sekolah",
    amount: 8000,
    type: "expense",
    category: "Sekolah",
    source: "manual",
    createdAt: hariLalu(12, 11),
  },
  {
    id: "t10",
    merchant: "Uang Saku Mingguan",
    amount: 100000,
    type: "income",
    category: "Uang Saku",
    source: "manual",
    createdAt: hariLalu(13, 7),
  },
];

export const mockBadges = [
  {
    id: "b1",
    name: "Misi Pertama",
    desc: "Menyelesaikan 1 misi tabungan",
    unlocked: true,
    icon: "misi",
  },
  {
    id: "b2",
    name: "7 Hari Beruntun",
    desc: "Mencatat 7 hari tanpa jeda",
    unlocked: false,
    icon: "beruntun",
  },
  {
    id: "b3",
    name: "Hemat Champion",
    desc: "Pengeluaran turun 2 minggu berturut",
    unlocked: true,
    icon: "piala",
  },
  {
    id: "b4",
    name: "Level 5",
    desc: "Mencapai level 5",
    unlocked: false,
    icon: "rayakan",
  },
];

export const mockChat = [
  {
    role: "assistant",
    text: "Halo Rafa! Aku FiLUP Coach kamu. Ada yang mau ditanyain soal keuangan hari ini?",
  },
  {
    role: "user",
    text: "Misi sepatu basketku kapan selesai ya kira-kira?",
  },
  {
    role: "assistant",
    text: "Sisa target kamu Rp180.000 lagi dari total Rp450.000. Kalau kamu sisihkan Rp30.000 per minggu seperti biasanya, misi ini bisa selesai dalam 6 minggu lagi — sekitar akhir September. Semangat!",
  },
];

// Ikon & warna per kategori, dipakai untuk chip di daftar transaksi.
export const CATEGORY_STYLE = {
  Jajan: { icon: "jajan", tint: "text-filup-accent" },
  Makanan: { icon: "makanan", tint: "text-filup-red" },
  Transport: { icon: "transport", tint: "text-filup-accent" },
  "Uang Saku": { icon: "uangSaku", tint: "text-filup-green" },
  Belanja: { icon: "belanja", tint: "text-filup-primary" },
  Lainnya: { icon: "lainnya", tint: "text-filup-muted" },
};

export function formatRupiah(amount) {
  return "Rp" + amount.toLocaleString("id-ID");
}

// ---------------------------------------------------------------------------
// Sosial (mode demo): teman & misi bersama
// ---------------------------------------------------------------------------

/** Kode teman milik pengguna demo. */
export const mockKodeSaya = "RAFA4K";

/**
 * "Direktori" kode yang bisa dicoba di mode demo. PUTU64 milik orang yang
 * sudah lebih dulu mengirim permintaan — memasukkannya langsung menerima
 * permintaan itu.
 */
//
// Kodenya WAJIB memakai alfabet yang sama dengan kode sungguhan (tanpa O, I,
// 0, 1). Versi pertama memakai BIMA27 dan SARI58 — keduanya mengandung "I",
// sehingga ditolak oleh validator aplikasi sendiri.
export const mockDirektoriKode = {
  BAYU27: { uid: "demo-bayu", nama: "Bayu Pratama", level: 2 },
  SEKAR5: { uid: "demo-sekar", nama: "Sekar Wulandari", level: 6 },
  PUTU64: { uid: "demo-putu", nama: "Putu Ayu", level: 4 },
};

export const mockPertemanan = [
  {
    id: "demo_demo-komang",
    anggota: ["demo", "demo-komang"],
    pengirim: "demo-komang",
    penerima: "demo",
    status: "diterima",
    profil: { nama: "Komang Adi", level: 5 },
  },
  {
    id: "demo_demo-dewi",
    anggota: ["demo", "demo-dewi"],
    pengirim: "demo",
    penerima: "demo-dewi",
    status: "diterima",
    profil: { nama: "Dewi Lestari", level: 3 },
  },
  {
    id: "demo_demo-putu",
    anggota: ["demo", "demo-putu"],
    pengirim: "demo-putu",
    penerima: "demo",
    status: "menunggu",
    profil: { nama: "Putu Ayu", level: 4 },
  },
];

export const mockMisiBersama = [
  {
    id: "mb1",
    judul: "Liburan Kelas ke Bedugul",
    icon: "transport",
    targetAmount: 600000,
    deadline: hariDepan(40),
    pembuat: "demo-komang",
    anggota: ["demo-komang", "demo", "demo-dewi"],
    namaAnggota: {
      "demo-komang": "Komang Adi",
      demo: "Rafa",
      "demo-dewi": "Dewi Lestari",
    },
    kontribusi: { "demo-komang": 120000, demo: 85000, "demo-dewi": 60000 },
    dibuat: hariLalu(9),
  },
  {
    id: "mb2",
    judul: "Kado untuk Wali Kelas",
    icon: "rayakan",
    targetAmount: 150000,
    deadline: hariDepan(12),
    pembuat: "demo",
    anggota: ["demo", "demo-dewi"],
    namaAnggota: { demo: "Rafa", "demo-dewi": "Dewi Lestari" },
    kontribusi: { demo: 40000, "demo-dewi": 55000 },
    dibuat: hariLalu(3),
  },
];
