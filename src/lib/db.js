// Lapisan akses data Firestore untuk FiLUP.
//
// Semua fungsi di sini menerima `uid` dan bekerja di bawah dokumen pengguna
// masing-masing (users/{uid}/...), sesuai aturan di firestore.rules.

import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { applyXP, XP_REWARD } from "@/lib/gamification";
import { kunciKemarin } from "@/lib/kuisHarian";

/** Firestore menyimpan waktu sebagai Timestamp — diubah ke string ISO. */
function normalizeDate(value) {
  if (!value) return new Date().toISOString();
  if (typeof value === "string") return value;
  if (typeof value?.toDate === "function") return value.toDate().toISOString();
  return new Date().toISOString();
}

function txCollection(uid) {
  return collection(db, "users", uid, "transactions");
}

function missionCollection(uid) {
  return collection(db, "users", uid, "missions");
}

/**
 * Berlangganan daftar transaksi (terbaru di atas).
 * @returns fungsi untuk berhenti berlangganan
 */
export function subscribeTransactions(uid, onData, onError) {
  const q = query(txCollection(uid), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => {
      onData(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
            amount: Number(data.amount) || 0,
            createdAt: normalizeDate(data.createdAt),
          };
        })
      );
    },
    onError
  );
}

/** Berlangganan daftar misi (dibuat terbaru di atas). */
export function subscribeMissions(uid, onData, onError) {
  const q = query(missionCollection(uid), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => {
      onData(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
            targetAmount: Number(data.targetAmount) || 0,
            currentAmount: Number(data.currentAmount) || 0,
          };
        })
      );
    },
    onError
  );
}

/** Menyimpan transaksi baru. */
export async function createTransaction(uid, tx) {
  return addDoc(txCollection(uid), {
    merchant: tx.merchant,
    amount: Number(tx.amount) || 0,
    type: tx.type === "income" ? "income" : "expense",
    category: tx.category ?? "Lainnya",
    source: tx.source ?? "manual",
    createdAt: serverTimestamp(),
  });
}

/** Menyimpan misi baru. */
export async function createMission(uid, mission) {
  return addDoc(missionCollection(uid), {
    title: mission.title,
    icon: mission.icon ?? "misi",
    targetAmount: Number(mission.targetAmount) || 0,
    currentAmount: 0,
    deadline: mission.deadline,
    status: "active",
    createdAt: serverTimestamp(),
  });
}

/** Menambah tabungan ke sebuah misi, dan menandai selesai bila target tercapai. */
export async function addToMission(uid, mission, amount) {
  const nextAmount = (Number(mission.currentAmount) || 0) + Number(amount);
  const selesai = nextAmount >= Number(mission.targetAmount);

  await updateDoc(doc(db, "users", uid, "missions", mission.id), {
    currentAmount: nextAmount,
    status: selesai ? "completed" : "active",
  });

  return { selesai, nextAmount };
}

/**
 * Menambahkan XP ke profil pengguna, sekaligus menaikkan level bila cukup.
 * @param profile dokumen users/{uid} saat ini (butuh level & xp)
 * @returns hasil perhitungan { level, xp, levelUp, levelGained }
 */
export async function awardXP(uid, profile, amount) {
  const hasil = applyXP(
    Number(profile?.level) || 1,
    Number(profile?.xp) || 0,
    amount
  );

  await updateDoc(doc(db, "users", uid), {
    level: hasil.level,
    xp: hasil.xp,
  });

  return hasil;
}

/** Memperbarui hitungan hari beruntun (streak) berdasarkan tanggal terakhir mencatat. */
export async function touchStreak(uid, profile) {
  const hariIni = new Date().toISOString().slice(0, 10);
  const terakhir = profile?.lastActiveDate ?? null;

  if (terakhir === hariIni) return profile?.streakDays ?? 1;

  const kemarin = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const streakBaru = terakhir === kemarin ? (profile?.streakDays ?? 0) + 1 : 1;

  await updateDoc(doc(db, "users", uid), {
    streakDays: streakBaru,
    lastActiveDate: hariIni,
  });

  return streakBaru;
}

/**
 * Menyimpan jawaban kuis harian, memperbarui hitungan beruntun, dan menambah
 * XP — dalam SATU penulisan, supaya catatan kuis dan XP tidak mungkin
 * tersimpan setengah.
 *
 * @param profile dokumen users/{uid} saat ini
 * @returns { level, xp, levelUp, levelGained, xpDidapat, beruntun }
 */
export async function simpanJawabanKuis(uid, profile, { tanggal, jawaban, benar }) {
  // Sudah dijawab hari ini (misalnya dari tab lain): jangan beri XP dua kali.
  if (profile?.kuis?.tanggal === tanggal) {
    return {
      level: Number(profile?.level) || 1,
      xp: Number(profile?.xp) || 0,
      levelUp: false,
      levelGained: 0,
      xpDidapat: 0,
      beruntun: Number(profile?.kuisBeruntun) || 1,
    };
  }

  const lanjut = profile?.kuis?.tanggal === kunciKemarin();
  const beruntun = lanjut ? (Number(profile?.kuisBeruntun) || 0) + 1 : 1;
  const xpDidapat = benar ? XP_REWARD.kuisBenar : XP_REWARD.kuisIkut;
  const hasil = applyXP(
    Number(profile?.level) || 1,
    Number(profile?.xp) || 0,
    xpDidapat
  );

  await updateDoc(doc(db, "users", uid), {
    kuis: { tanggal, jawaban, benar },
    kuisBeruntun: beruntun,
    level: hasil.level,
    xp: hasil.xp,
  });

  return { ...hasil, xpDidapat, beruntun };
}
