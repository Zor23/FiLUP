"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

import { useAuth } from "@/contexts/AuthProvider";
import { mockMissions, mockTransactions } from "@/lib/mockData";
import { XP_REWARD } from "@/lib/gamification";
import {
  addToMission,
  awardXP,
  createMission,
  createTransaction,
  subscribeMissions,
  subscribeTransactions,
  touchStreak,
} from "@/lib/db";

const DataContext = createContext(null);

// Satu larik kosong yang dipakai ulang. Larik baru setiap render akan membuat
// useMemo di bawahnya menghitung ulang terus-menerus tanpa alasan.
const KOSONG = [];

// Bentuk awal state langganan Firestore. Semuanya disimpan dalam SATU objek
// supaya data milik pengguna sebelumnya tidak pernah sempat terlihat oleh
// pengguna berikutnya: kalau `uid` di dalamnya tidak cocok dengan uid yang
// sedang aktif, seluruh isinya dianggap belum ada.
const LANGGANAN_KOSONG = {
  uid: null,
  transactions: null,
  missions: null,
  galat: "",
};

// Membuat id sederhana untuk data di mode demo (tidak menyentuh Firestore).
let demoCounter = 0;
function demoId(prefix) {
  demoCounter += 1;
  return `${prefix}-demo-${demoCounter}`;
}

// --- Penanda "sudah di peramban" -------------------------------------------
//
// Data demo memakai tanggal relatif terhadap hari ini (lihat mockData.js).
// Halaman aplikasi di-prerender saat build, jadi tanggal hasil build akan
// berbeda dengan tanggal saat halaman dibuka — kalau data itu ikut ter-render
// di server, hasilnya hydration mismatch.
//
// Karena itu data demo baru dianggap ada setelah React selesai hydrate.
// useSyncExternalStore adalah cara resmi menanyakan hal ini: `false` di server
// dan pada render hydrate, `true` sesudahnya — tanpa setState di dalam efek.
const langganiKosong = () => () => {};
const sudahDiKlien = () => true;
const belumDiKlien = () => false;

export function DataProvider({ children }) {
  const { user, rawProfile, demoMode, isLoggedIn, applyDemoXP } = useAuth();

  const diKlien = useSyncExternalStore(
    langganiKosong,
    sudahDiKlien,
    belumDiKlien
  );

  // uid yang benar-benar boleh dilanggani ke Firestore. Di mode demo atau saat
  // belum masuk nilainya null, dan seluruh cabang Firestore ikut mati.
  const uid = !demoMode && isLoggedIn ? user?.uid ?? null : null;

  const demoAktif = demoMode && diKlien;

  // ---- Mode demo: data contoh, perubahan hanya tersimpan di memori ----
  const [dataDemo, setDataDemo] = useState(() => ({
    transactions: mockTransactions,
    missions: mockMissions,
  }));

  // ---- Mode sungguhan: hasil langganan real-time ke Firestore ----
  const [langganan, setLangganan] = useState(LANGGANAN_KOSONG);

  useEffect(() => {
    if (!uid) return;

    // Selalu ditulis bersama uid-nya, jadi jawaban langganan lama yang datang
    // terlambat tidak bisa menimpa data pengguna yang sekarang.
    function terapkan(bagian) {
      setLangganan((sebelum) =>
        sebelum.uid === uid
          ? { ...sebelum, ...bagian }
          : { ...LANGGANAN_KOSONG, uid, ...bagian }
      );
    }

    function tanganiError(err) {
      console.error("Firestore error:", err);
      terapkan({
        galat:
          err?.code === "permission-denied"
            ? "Akses data ditolak. Pastikan isi firestore.rules sudah di-publish di Firebase Console."
            : "Gagal memuat data. Periksa koneksi internetmu.",
      });
    }

    const stopTx = subscribeTransactions(
      uid,
      (rows) => terapkan({ transactions: rows }),
      tanganiError
    );

    const stopMisi = subscribeMissions(
      uid,
      (rows) => terapkan({ missions: rows }),
      tanganiError
    );

    return () => {
      stopTx();
      stopMisi();
    };
  }, [uid]);

  // ---- Data yang dipakai halaman ----
  const langgananCocok = langganan.uid === uid;

  const transactions = demoAktif
    ? dataDemo.transactions
    : (langgananCocok && langganan.transactions) || KOSONG;

  const missions = demoAktif
    ? dataDemo.missions
    : (langgananCocok && langganan.missions) || KOSONG;

  const dataError = langgananCocok ? langganan.galat : "";

  // Masih memuat selama salah satu langganan belum mengirim data pertamanya
  // dan belum ada galat. Tanpa uid tidak ada yang perlu ditunggu.
  const loading = demoMode
    ? !diKlien
    : Boolean(uid) &&
      !dataError &&
      !(langgananCocok && langganan.transactions && langganan.missions);

  // ---- Angka turunan ----
  const { balance, totalIncome, totalExpense } = useMemo(() => {
    let masuk = 0;
    let keluar = 0;
    for (const t of transactions) {
      if (t.type === "income") masuk += Number(t.amount) || 0;
      else keluar += Number(t.amount) || 0;
    }
    return {
      totalIncome: masuk,
      totalExpense: keluar,
      balance: masuk - keluar,
    };
  }, [transactions]);

  const totalSaved = useMemo(
    () => missions.reduce((s, m) => s + (Number(m.currentAmount) || 0), 0),
    [missions]
  );

  // ---- Aksi ----

  /** Menyimpan transaksi hasil scan/manual, lalu menambah XP. */
  const addTransaction = useCallback(
    async (tx) => {
      if (demoMode) {
        setDataDemo((d) => ({
          ...d,
          transactions: [
            {
              id: demoId("tx"),
              ...tx,
              amount: Number(tx.amount) || 0,
              createdAt: new Date().toISOString(),
            },
            ...d.transactions,
          ],
        }));
        const naik = applyDemoXP(XP_REWARD.catatTransaksi);
        return {
          ok: true,
          xp: XP_REWARD.catatTransaksi,
          demo: true,
          ...(naik ?? {}),
        };
      }

      if (!uid) return { ok: false, error: "Kamu belum masuk." };

      try {
        await createTransaction(uid, tx);
        const hasil = await awardXP(uid, rawProfile, XP_REWARD.catatTransaksi);
        await touchStreak(uid, rawProfile);
        return { ok: true, xp: XP_REWARD.catatTransaksi, ...hasil };
      } catch (err) {
        console.error("addTransaction:", err);
        return { ok: false, error: "Gagal menyimpan transaksi." };
      }
    },
    [demoMode, uid, rawProfile, applyDemoXP]
  );

  /** Membuat misi baru, lalu menambah XP. */
  const addMission = useCallback(
    async (mission) => {
      if (demoMode) {
        setDataDemo((d) => ({
          ...d,
          missions: [
            {
              id: demoId("m"),
              icon: mission.icon ?? "misi",
              ...mission,
              targetAmount: Number(mission.targetAmount) || 0,
              currentAmount: 0,
              status: "active",
            },
            ...d.missions,
          ],
        }));
        const naik = applyDemoXP(XP_REWARD.buatMisi);
        return { ok: true, xp: XP_REWARD.buatMisi, demo: true, ...(naik ?? {}) };
      }

      if (!uid) return { ok: false, error: "Kamu belum masuk." };

      try {
        await createMission(uid, mission);
        const hasil = await awardXP(uid, rawProfile, XP_REWARD.buatMisi);
        return { ok: true, xp: XP_REWARD.buatMisi, ...hasil };
      } catch (err) {
        console.error("addMission:", err);
        return { ok: false, error: "Gagal menyimpan misi." };
      }
    },
    [demoMode, uid, rawProfile, applyDemoXP]
  );

  /** Menambah tabungan ke misi; kalau target tercapai, dapat XP bonus. */
  const saveToMission = useCallback(
    async (mission, amount) => {
      const nominal = Number(amount) || 0;
      if (nominal <= 0) return { ok: false, error: "Nominal tidak valid." };

      if (demoMode) {
        // Dihitung DI LUAR pembaru state. React boleh menjalankan fungsi
        // pembaru itu belakangan (saat render berikutnya), jadi nilai yang
        // ditulis dari dalamnya belum tentu sudah ada saat baris di bawah
        // membacanya — dan XP-nya bisa salah jumlah.
        const jumlahBaru = (Number(mission.currentAmount) || 0) + nominal;
        const selesai = jumlahBaru >= Number(mission.targetAmount);

        setDataDemo((d) => ({
          ...d,
          missions: d.missions.map((m) =>
            m.id === mission.id
              ? {
                  ...m,
                  currentAmount: jumlahBaru,
                  status: selesai ? "completed" : "active",
                }
              : m
          ),
        }));
        const xpDemo = selesai
          ? XP_REWARD.selesaikanMisi
          : Math.round(XP_REWARD.catatTransaksi / 2);
        const naik = applyDemoXP(xpDemo);
        return { ok: true, selesai, xp: xpDemo, demo: true, ...(naik ?? {}) };
      }

      if (!uid) return { ok: false, error: "Kamu belum masuk." };

      try {
        const { selesai } = await addToMission(uid, mission, nominal);
        const xp = selesai
          ? XP_REWARD.selesaikanMisi
          : Math.round(XP_REWARD.catatTransaksi / 2);
        const hasil = await awardXP(uid, rawProfile, xp);
        return { ok: true, selesai, xp, ...hasil };
      } catch (err) {
        console.error("saveToMission:", err);
        return { ok: false, error: "Gagal memperbarui misi." };
      }
    },
    [demoMode, uid, rawProfile, applyDemoXP]
  );

  const value = useMemo(
    () => ({
      transactions,
      missions,
      activeMissions: missions.filter((m) => m.status === "active"),
      completedMissions: missions.filter((m) => m.status === "completed"),
      balance,
      totalIncome,
      totalExpense,
      totalSaved,
      loading,
      dataError,
      demoMode,
      addTransaction,
      addMission,
      saveToMission,
    }),
    [
      transactions,
      missions,
      balance,
      totalIncome,
      totalExpense,
      totalSaved,
      loading,
      dataError,
      demoMode,
      addTransaction,
      addMission,
      saveToMission,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData harus dipakai di dalam <DataProvider>");
  return ctx;
}
