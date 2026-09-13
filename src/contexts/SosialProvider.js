"use client";

// Data sosial FiLUP: teman dan misi bersama.
//
// Dipisah dari DataProvider karena sumbernya berbeda: data di DataProvider
// milik satu pengguna (users/{uid}/...), sedangkan data di sini DIBAGI antar
// pengguna (pertemanan/, misiBersama/). Aturan aksesnya pun berbeda — lihat
// firestore.rules.
//
// Pola yang sama dengan DataProvider:
//   - Mode demo memakai data contoh dan baru "ada" setelah React selesai
//     hydrate (data demo memakai tanggal relatif hari ini).
//   - Hasil langganan Firestore disimpan bersama uid-nya, jadi data milik
//     pengguna sebelumnya tidak pernah sempat terlihat pengguna berikutnya.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "@/contexts/AuthProvider";
import { awardXP } from "@/lib/db";
import { useSudahDiKlien } from "@/lib/diKlien";
import { XP_REWARD } from "@/lib/gamification";
import {
  mockDirektoriKode,
  mockKodeSaya,
  mockMisiBersama,
  mockPertemanan,
} from "@/lib/mockData";
import {
  POLA_KODE,
  ambilProfilPublik,
  buatMisiBersama as simpanMisiBersamaBaru,
  cariKodeTeman,
  hapusMisiBersama as hapusMisiBersamaDb,
  hapusPertemanan,
  idPertemanan,
  kirimPermintaanTeman,
  langganiMisiBersama,
  langganiPertemanan,
  pastikanProfilPublik,
  rapikanKode,
  tabungMisiBersama,
  terimaPermintaanTeman,
} from "@/lib/sosial";

const SosialContext = createContext(null);

const KOSONG = [];
const PROFIL_CADANGAN = { nama: "Pengguna FiLUP", level: null };

/** Satu misi bersama paling banyak enam orang, termasuk pembuatnya. */
export const MAKS_ANGGOTA = 6;

// Hasil aksi memakai `xpDidapat`, BUKAN `xp`: hasil applyXP() juga punya
// kolom `xp` (total XP setelah ditambah), dan kalau keduanya disebar ke
// objek yang sama, salah satunya diam-diam menimpa yang lain.

// Nominal terbesar untuk sekali menabung. Dijaga juga oleh firestore.rules.
const MAKS_SEKALI_TABUNG = 10_000_000;

let demoCounter = 0;

function pesanGalat(err) {
  return err?.code === "permission-denied"
    ? "Akses ditolak. Pastikan isi firestore.rules terbaru sudah di-publish di Firebase Console."
    : "Gagal terhubung ke server. Periksa koneksi internetmu.";
}

export function SosialProvider({ children }) {
  const { user, profile, rawProfile, demoMode, isLoggedIn, applyDemoXP } =
    useAuth();
  const diKlien = useSudahDiKlien();

  const uid = !demoMode && isLoggedIn ? user?.uid ?? null : null;
  const uidSaya = demoMode ? "demo" : uid;
  const demoAktif = demoMode && diKlien;
  const namaSaya = profile.name;
  const levelSaya = profile.level;

  // ---- Mode demo ----
  const [demo, setDemo] = useState(() => ({
    pertemanan: mockPertemanan,
    misiBersama: mockMisiBersama,
  }));

  // ---- Mode sungguhan ----
  const [kode, setKode] = useState({ uid: null, nilai: null, galat: "" });
  const [langgananTeman, setLanggananTeman] = useState({
    uid: null,
    data: null,
    galat: "",
  });
  const [langgananMisi, setLanggananMisi] = useState({
    uid: null,
    data: null,
    galat: "",
  });
  const [profilTeman, setProfilTeman] = useState({});

  // Profil publik + kode teman. Nama dan level disegarkan kalau berubah.
  useEffect(() => {
    if (!uid) return;
    let batal = false;
    pastikanProfilPublik(uid, namaSaya, levelSaya)
      .then((nilai) => {
        if (!batal) setKode({ uid, nilai, galat: "" });
      })
      .catch((err) => {
        console.error("Profil publik:", err);
        if (!batal) setKode({ uid, nilai: null, galat: pesanGalat(err) });
      });
    return () => {
      batal = true;
    };
  }, [uid, namaSaya, levelSaya]);

  useEffect(() => {
    if (!uid) return;
    const stopTeman = langganiPertemanan(
      uid,
      (data) => setLanggananTeman({ uid, data, galat: "" }),
      (err) => {
        console.error("Pertemanan:", err);
        setLanggananTeman({ uid, data: [], galat: pesanGalat(err) });
      }
    );
    const stopMisi = langganiMisiBersama(
      uid,
      (data) => setLanggananMisi({ uid, data, galat: "" }),
      (err) => {
        console.error("Misi bersama:", err);
        setLanggananMisi({ uid, data: [], galat: pesanGalat(err) });
      }
    );
    return () => {
      stopTeman();
      stopMisi();
    };
  }, [uid]);

  const pertemananMentah = demoAktif
    ? demo.pertemanan
    : (langgananTeman.uid === uid && langgananTeman.data) || KOSONG;
  const misiMentah = demoAktif
    ? demo.misiBersama
    : (langgananMisi.uid === uid && langgananMisi.data) || KOSONG;

  // Nama dan level teman diambil dari profilPublik, sekali per teman.
  useEffect(() => {
    if (!uid) return;
    const kurang = [
      ...new Set(pertemananMentah.map((p) => p.anggota.find((a) => a !== uid))),
    ].filter((u) => u && !(u in profilTeman));
    if (kurang.length === 0) return;

    let batal = false;
    Promise.all(
      kurang.map((u) =>
        ambilProfilPublik(u)
          .then((p) => [u, p ?? PROFIL_CADANGAN])
          .catch(() => [u, PROFIL_CADANGAN])
      )
    ).then((pasangan) => {
      if (!batal) {
        setProfilTeman((lama) => ({ ...lama, ...Object.fromEntries(pasangan) }));
      }
    });
    return () => {
      batal = true;
    };
  }, [uid, pertemananMentah, profilTeman]);

  // ---- Bentuk data yang dipakai halaman ----
  const daftar = useMemo(
    () =>
      pertemananMentah.map((p) => {
        const temanUid = p.anggota.find((a) => a !== uidSaya) ?? null;
        const prof = demoAktif ? p.profil : profilTeman[temanUid];
        return {
          id: p.id,
          temanUid,
          status: p.status,
          arah:
            p.status === "diterima"
              ? null
              : p.pengirim === uidSaya
                ? "keluar"
                : "masuk",
          nama: prof?.nama ?? "Memuat…",
          level: prof?.level ?? null,
        };
      }),
    [pertemananMentah, uidSaya, demoAktif, profilTeman]
  );

  const teman = useMemo(
    () =>
      daftar
        .filter((d) => d.status === "diterima")
        .sort((a, b) => a.nama.localeCompare(b.nama, "id")),
    [daftar]
  );
  const permintaanMasuk = useMemo(
    () => daftar.filter((d) => d.arah === "masuk"),
    [daftar]
  );
  const permintaanKeluar = useMemo(
    () => daftar.filter((d) => d.arah === "keluar"),
    [daftar]
  );
  const misiBersama = useMemo(
    () =>
      [...misiMentah].sort((a, b) =>
        String(b.dibuat ?? "").localeCompare(String(a.dibuat ?? ""))
      ),
    [misiMentah]
  );

  const kodeSaya = demoMode ? mockKodeSaya : kode.uid === uid ? kode.nilai : null;
  const galatKode = !demoMode && kode.uid === uid ? kode.galat : "";
  const galat = uid ? langgananTeman.galat || langgananMisi.galat : "";
  const loading = demoMode
    ? !diKlien
    : Boolean(uid) &&
      !galat &&
      (langgananTeman.uid !== uid || langgananMisi.uid !== uid);

  // ---- Aksi: teman ----

  /** Menambah teman lewat kode. Mengembalikan { ok, pesan } atau { ok, error }. */
  const tambahTeman = useCallback(
    async (masukan) => {
      const k = rapikanKode(masukan);
      if (!POLA_KODE.test(k)) {
        return {
          ok: false,
          error:
            "Kode teman berisi 6 huruf atau angka. Huruf O dan I serta angka 0 dan 1 tidak dipakai.",
        };
      }
      if (k === kodeSaya) {
        return {
          ok: false,
          error: "Itu kode milikmu sendiri. Minta kode temanmu, lalu masukkan di sini.",
        };
      }

      let calon;
      if (demoMode) {
        calon = mockDirektoriKode[k] ?? null;
        if (!calon) {
          return {
            ok: false,
            error: `Kode ${k} tidak ditemukan. Di mode demo, coba BAYU27, SEKAR5, atau PUTU64.`,
          };
        }
      } else {
        if (!uid) return { ok: false, error: "Kamu belum masuk." };
        try {
          calon = await cariKodeTeman(k);
        } catch (err) {
          console.error("Cari kode teman:", err);
          return { ok: false, error: pesanGalat(err) };
        }
        if (!calon) {
          return { ok: false, error: `Kode ${k} tidak ditemukan. Periksa lagi hurufnya.` };
        }
        if (calon.uid === uid) {
          return {
            ok: false,
            error: "Itu kode milikmu sendiri. Minta kode temanmu, lalu masukkan di sini.",
          };
        }
      }

      const ada = daftar.find((d) => d.temanUid === calon.uid);
      if (ada?.status === "diterima") {
        return { ok: false, error: `Kamu sudah berteman dengan ${calon.nama}.` };
      }
      if (ada?.arah === "keluar") {
        return {
          ok: false,
          error: `Permintaan ke ${calon.nama} sudah terkirim. Tunggu dia menerimanya.`,
        };
      }
      const sudahDiminta = ada?.arah === "masuk";
      const pesanTerhubung = `${calon.nama} sudah lebih dulu mengirim permintaan. Sekarang kalian berteman.`;

      if (demoMode) {
        if (sudahDiminta) {
          setDemo((d) => ({
            ...d,
            pertemanan: d.pertemanan.map((p) =>
              p.id === ada.id ? { ...p, status: "diterima" } : p
            ),
          }));
          return { ok: true, pesan: pesanTerhubung };
        }
        const id = idPertemanan("demo", calon.uid);
        setDemo((d) => ({
          ...d,
          pertemanan: [
            ...d.pertemanan,
            {
              id,
              anggota: ["demo", calon.uid].sort(),
              pengirim: "demo",
              penerima: calon.uid,
              status: "menunggu",
              profil: { nama: calon.nama, level: calon.level },
            },
          ],
        }));
        // Di mode demo tidak ada orang sungguhan di seberang, jadi "teman"
        // menerima sendiri setelah 3 detik — supaya alurnya bisa diperagakan
        // sampai selesai di depan juri.
        setTimeout(() => {
          setDemo((d) => ({
            ...d,
            pertemanan: d.pertemanan.map((p) =>
              p.id === id ? { ...p, status: "diterima" } : p
            ),
          }));
        }, 3000);
        return { ok: true, pesan: `Permintaan terkirim ke ${calon.nama}.` };
      }

      try {
        if (sudahDiminta) {
          await terimaPermintaanTeman(ada.id);
          return { ok: true, pesan: pesanTerhubung };
        }
        await kirimPermintaanTeman(uid, calon.uid);
        setProfilTeman((lama) => ({
          ...lama,
          [calon.uid]: { nama: calon.nama, level: calon.level },
        }));
        return {
          ok: true,
          pesan: `Permintaan terkirim ke ${calon.nama}. Kalian berteman setelah dia menerimanya.`,
        };
      } catch (err) {
        console.error("Tambah teman:", err);
        return { ok: false, error: pesanGalat(err) };
      }
    },
    [demoMode, uid, kodeSaya, daftar]
  );

  const terimaTeman = useCallback(
    async (id) => {
      if (demoMode) {
        setDemo((d) => ({
          ...d,
          pertemanan: d.pertemanan.map((p) =>
            p.id === id ? { ...p, status: "diterima" } : p
          ),
        }));
        return { ok: true };
      }
      try {
        await terimaPermintaanTeman(id);
        return { ok: true };
      } catch (err) {
        console.error("Terima teman:", err);
        return { ok: false, error: pesanGalat(err) };
      }
    },
    [demoMode]
  );

  /** Menolak permintaan, membatalkan permintaan, atau memutus pertemanan. */
  const hapusTeman = useCallback(
    async (id) => {
      if (demoMode) {
        setDemo((d) => ({
          ...d,
          pertemanan: d.pertemanan.filter((p) => p.id !== id),
        }));
        return { ok: true };
      }
      try {
        await hapusPertemanan(id);
        return { ok: true };
      } catch (err) {
        console.error("Hapus teman:", err);
        return { ok: false, error: pesanGalat(err) };
      }
    },
    [demoMode]
  );

  // ---- Aksi: misi bersama ----

  const buatMisiBersama = useCallback(
    async ({ judul, icon, targetAmount, deadline, temanUids }) => {
      const target = Math.round(Number(targetAmount) || 0);
      const pilihan = [...new Set(temanUids)].filter((u) =>
        teman.some((t) => t.temanUid === u)
      );

      if (!judul?.trim()) return { ok: false, error: "Beri nama misinya dulu." };
      if (target <= 0) return { ok: false, error: "Target nominal harus lebih dari Rp0." };
      if (pilihan.length === 0) {
        return { ok: false, error: "Pilih minimal satu teman untuk diajak menabung." };
      }
      if (pilihan.length > MAKS_ANGGOTA - 1) {
        return {
          ok: false,
          error: `Satu misi bersama paling banyak ${MAKS_ANGGOTA} orang, termasuk kamu.`,
        };
      }

      const namaAnggota = { [uidSaya]: namaSaya };
      for (const u of pilihan) {
        namaAnggota[u] = teman.find((t) => t.temanUid === u)?.nama ?? "Teman";
      }
      const data = {
        judul: judul.trim(),
        icon: icon ?? "misi",
        targetAmount: target,
        deadline: deadline || null,
        anggota: [uidSaya, ...pilihan],
        namaAnggota,
      };

      if (demoMode) {
        demoCounter += 1;
        const id = `mb-demo-${demoCounter}`;
        setDemo((d) => ({
          ...d,
          misiBersama: [
            {
              id,
              ...data,
              pembuat: "demo",
              kontribusi: {},
              dibuat: new Date().toISOString(),
            },
            ...d.misiBersama,
          ],
        }));
        const naik = applyDemoXP(XP_REWARD.buatMisi);
        return { ...(naik ?? {}), ok: true, id, xpDidapat: XP_REWARD.buatMisi };
      }

      if (!uid) return { ok: false, error: "Kamu belum masuk." };
      try {
        const ref = await simpanMisiBersamaBaru(uid, data);
        const hasil = await awardXP(uid, rawProfile, XP_REWARD.buatMisi);
        return { ...hasil, ok: true, id: ref.id, xpDidapat: XP_REWARD.buatMisi };
      } catch (err) {
        console.error("Buat misi bersama:", err);
        return { ok: false, error: pesanGalat(err) };
      }
    },
    [demoMode, uid, uidSaya, namaSaya, teman, rawProfile, applyDemoXP]
  );

  const tabungBersama = useCallback(
    async (misi, nominal) => {
      const n = Math.round(Number(nominal) || 0);
      if (n <= 0) return { ok: false, error: "Masukkan nominal lebih dari Rp0." };
      if (n > MAKS_SEKALI_TABUNG) {
        return { ok: false, error: "Nominalnya terlalu besar untuk sekali menabung." };
      }

      if (demoMode) {
        setDemo((d) => ({
          ...d,
          misiBersama: d.misiBersama.map((m) =>
            m.id === misi.id
              ? {
                  ...m,
                  kontribusi: {
                    ...m.kontribusi,
                    demo: (Number(m.kontribusi?.demo) || 0) + n,
                  },
                }
              : m
          ),
        }));
        const naik = applyDemoXP(XP_REWARD.tabungBersama);
        return { ...(naik ?? {}), ok: true, xpDidapat: XP_REWARD.tabungBersama };
      }

      if (!uid) return { ok: false, error: "Kamu belum masuk." };
      try {
        await tabungMisiBersama(uid, misi.id, n);
        const hasil = await awardXP(uid, rawProfile, XP_REWARD.tabungBersama);
        return { ...hasil, ok: true, xpDidapat: XP_REWARD.tabungBersama };
      } catch (err) {
        console.error("Tabung misi bersama:", err);
        return { ok: false, error: pesanGalat(err) };
      }
    },
    [demoMode, uid, rawProfile, applyDemoXP]
  );

  const hapusMisiBersama = useCallback(
    async (misi) => {
      if (misi.pembuat !== uidSaya) {
        return { ok: false, error: "Hanya pembuat misi yang bisa menghapusnya." };
      }
      if (demoMode) {
        setDemo((d) => ({
          ...d,
          misiBersama: d.misiBersama.filter((m) => m.id !== misi.id),
        }));
        return { ok: true };
      }
      try {
        await hapusMisiBersamaDb(misi.id);
        return { ok: true };
      } catch (err) {
        console.error("Hapus misi bersama:", err);
        return { ok: false, error: pesanGalat(err) };
      }
    },
    [demoMode, uidSaya]
  );

  const value = useMemo(
    () => ({
      uidSaya,
      demoMode,
      loading,
      galat,
      kodeSaya,
      galatKode,
      teman,
      permintaanMasuk,
      permintaanKeluar,
      misiBersama,
      tambahTeman,
      terimaTeman,
      hapusTeman,
      buatMisiBersama,
      tabungBersama,
      hapusMisiBersama,
    }),
    [
      uidSaya,
      demoMode,
      loading,
      galat,
      kodeSaya,
      galatKode,
      teman,
      permintaanMasuk,
      permintaanKeluar,
      misiBersama,
      tambahTeman,
      terimaTeman,
      hapusTeman,
      buatMisiBersama,
      tabungBersama,
      hapusMisiBersama,
    ]
  );

  return <SosialContext.Provider value={value}>{children}</SosialContext.Provider>;
}

export function useSosial() {
  const ctx = useContext(SosialContext);
  if (!ctx) throw new Error("useSosial harus dipakai di dalam <SosialProvider>");
  return ctx;
}
