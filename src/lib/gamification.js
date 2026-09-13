// Aturan XP & level FiLUP — dikumpulkan di satu file supaya mudah diubah
// dan konsisten dipakai di seluruh aplikasi.

/** XP yang dibutuhkan untuk naik dari level tertentu ke level berikutnya. */
export function xpToNextLevel(level) {
  return 100 + level * 100; // Level 1 → 200 XP, Level 4 → 500 XP, dst.
}

/** Nilai XP untuk setiap aksi pengguna. */
export const XP_REWARD = {
  catatTransaksi: 10,
  selesaikanMisi: 50,
  buatMisi: 5,
  streakHarian: 5,
  // Kuis harian: menjawab saja sudah dihargai, supaya pengguna tidak takut
  // salah — tujuannya belajar, bukan ujian.
  kuisBenar: 15,
  kuisIkut: 5,
  // Setiap setoran ke misi bersama.
  tabungBersama: 5,
};

/**
 * Menambahkan XP dan menghitung kenaikan level (bisa naik lebih dari satu
 * level sekaligus kalau XP yang didapat besar).
 *
 * @returns {{ level: number, xp: number, levelUp: boolean, levelGained: number }}
 */
export function applyXP(currentLevel, currentXp, amount) {
  let level = currentLevel;
  let xp = currentXp + amount;
  let levelGained = 0;

  while (xp >= xpToNextLevel(level)) {
    xp -= xpToNextLevel(level);
    level += 1;
    levelGained += 1;
  }

  return { level, xp, levelUp: levelGained > 0, levelGained };
}
