// Sistem RANK FiLUP — pangkat unik bertema uang jajan, di atas sistem level.
//
// Level tetap naik satu-satu lewat XP (lihat gamification.js). Rank adalah
// "gelar besar" yang dicapai setiap beberapa level, masing-masing dengan
// lambang dan warna sendiri (digambar di components/RankBadge.js).
//
// Nama-namanya sengaja diambil dari istilah sehari-hari pelajar Indonesia
// supaya terasa dekat dan mudah diingat: dari "Receh" sampai "Sultan".
//
// Warnanya semua berada di dalam keluarga ungu-malam yang sama. Dulu tangganya
// memakai tembaga lalu emas, dan dua warna hangat itu satu-satunya hal di
// dashboard yang keluar dari tema. Sekarang urutannya dibaca dari GELAP ke
// MENYALA — batu kusam, perak dingin, lilac, es, lalu putih arcane — jadi
// naik rank tetap terasa seperti naik derajat tanpa perlu warna hangat.

export const RANKS = [
  {
    id: "receh",
    name: "Receh",
    minLevel: 1,
    desc: "Semua orang mulai dari sini — koin demi koin.",
    // batu ungu kusam — paling redup di tangga
    from: "#8b7ca8",
    to: "#4a4160",
    glow: "rgba(139, 124, 168, 0.35)",
  },
  {
    id: "celengan",
    name: "Celengan",
    minLevel: 3,
    desc: "Sudah rajin menyisihkan, tabungan mulai berisi.",
    // warna perak
    from: "#cdd6e6",
    to: "#7e8aa5",
    glow: "rgba(205, 214, 230, 0.4)",
  },
  {
    id: "dompet",
    name: "Dompet Tebal",
    minLevel: 5,
    desc: "Arus uang terkendali, catatan tidak pernah bolong.",
    // lilac
    from: "#c9a9ff",
    to: "#6d28d9",
    glow: "rgba(201, 169, 255, 0.5)",
  },
  {
    id: "brankas",
    name: "Brankas",
    minLevel: 8,
    desc: "Disiplin tingkat tinggi — targetmu hampir selalu tercapai.",
    // warna platina kebiruan
    from: "#8fd8ff",
    to: "#2f7fb8",
    glow: "rgba(53, 208, 255, 0.45)",
  },
  {
    id: "sultan",
    name: "Sultan",
    minLevel: 11,
    desc: "Puncak tertinggi. Uang jajan tunduk padamu.",
    // putih arcane — paling menyala, sewarna dengan bar XP
    from: "#ffffff",
    to: "#c084fc",
    glow: "rgba(233, 213, 255, 0.65)",
  },
];

/** Rank yang sedang dipegang pada level tertentu. */
export function rankForLevel(level) {
  const lv = Number(level) || 1;
  let current = RANKS[0];
  for (const r of RANKS) {
    if (lv >= r.minLevel) current = r;
  }
  return current;
}

/** Rank berikutnya (null kalau sudah Sultan). */
export function nextRank(level) {
  const lv = Number(level) || 1;
  return RANKS.find((r) => r.minLevel > lv) ?? null;
}
