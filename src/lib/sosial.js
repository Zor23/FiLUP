// Akses Firestore untuk fitur sosial: kode teman, pertemanan, misi bersama.
//
// Model datanya (lihat juga firestore.rules):
//
//   profilPublik/{uid}    { nama, level, kodeTeman }
//     Satu-satunya bagian profil yang boleh dibaca pengguna lain. Dokumen
//     users/{uid} tetap tertutup untuk siapa pun selain pemiliknya.
//
//   kodeTeman/{kode}      { uid }
//     Kode 6 karakter → uid. Hanya bisa dibuat sekali dan tidak bisa diubah,
//     jadi kode milik orang lain tidak bisa dibajak.
//
//   pertemanan/{a_b}      { anggota: [a, b], pengirim, penerima, status }
//     Satu dokumen per pasangan; id-nya dua uid yang diurutkan, jadi pasangan
//     yang sama tidak mungkin punya dua dokumen. status: "menunggu" |
//     "diterima". Menolak, membatalkan, dan memutus pertemanan = menghapus.
//
//   misiBersama/{id}      { judul, icon, targetAmount, deadline, pembuat,
//                           anggota: [uid], namaAnggota: {uid: nama},
//                           kontribusi: {uid: nominal} }
//     Total terkumpul TIDAK disimpan — dihitung dari `kontribusi` oleh
//     ringkasMisiBersama() di analisis.js, sama seperti saldo.
//
// Kueri sengaja TANPA orderBy. `array-contains` + `orderBy` butuh indeks
// gabungan yang harus dibuat manual di Firebase Console; daftarnya kecil,
// jadi pengurutan cukup dilakukan di klien.

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  increment,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// Tanpa O, I, 0, dan 1 — empat karakter yang paling sering tertukar saat kode
// dibacakan atau diketik ulang dari layar teman. 32 karakter, jadi
// `acak % 32` tidak berat sebelah.
export const HURUF_KODE = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const POLA_KODE = /^[A-HJ-NP-Z2-9]{6}$/;

/** Merapikan masukan pengguna: "filup-7k3 q9p" → "7K3Q9P". */
export function rapikanKode(teks = "") {
  return String(teks)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .replace(/^FILUP/, "")
    .slice(0, 6);
}

function buatKode() {
  const acak = new Uint32Array(6);
  crypto.getRandomValues(acak);
  return Array.from(acak, (n) => HURUF_KODE[n % HURUF_KODE.length]).join("");
}

/** Id dokumen pertemanan: dua uid yang diurutkan, digabung garis bawah. */
export function idPertemanan(a, b) {
  return a < b ? `${a}_${b}` : `${b}_${a}`;
}

function tanggalIso(nilai) {
  if (!nilai) return null;
  if (typeof nilai === "string") return nilai;
  if (typeof nilai?.toDate === "function") return nilai.toDate().toISOString();
  return null;
}

// ---------------------------------------------------------------------------
// Profil publik & kode teman
// ---------------------------------------------------------------------------

/**
 * Memastikan pengguna punya profil publik dan kode teman. Nama dan level
 * disegarkan kalau berubah.
 * @returns kode teman pengguna
 */
export async function pastikanProfilPublik(uid, nama, level) {
  const ref = doc(db, "profilPublik", uid);
  const snap = await getDoc(ref);

  if (snap.exists() && snap.data().kodeTeman) {
    const lama = snap.data();
    if (lama.nama !== nama || lama.level !== level) {
      await setDoc(ref, { nama, level, kodeTeman: lama.kodeTeman });
    }
    return lama.kodeTeman;
  }

  // Kode yang sudah dipakai orang lain membuat setDoc menjadi "update", dan
  // update pada kodeTeman selalu ditolak rules — itulah tanda untuk mencoba
  // kode lain. Peluang tabrakan per percobaan sekitar satu per satu miliar.
  for (let percobaan = 0; percobaan < 5; percobaan++) {
    const kode = buatKode();
    try {
      await setDoc(doc(db, "kodeTeman", kode), { uid });
    } catch (err) {
      if (err?.code === "permission-denied") continue;
      throw err;
    }
    await setDoc(ref, { nama, level, kodeTeman: kode });
    return kode;
  }
  throw new Error("Gagal membuat kode teman setelah beberapa percobaan.");
}

export async function ambilProfilPublik(uid) {
  const snap = await getDoc(doc(db, "profilPublik", uid));
  return snap.exists() ? snap.data() : null;
}

/** Mencari pemilik kode teman. @returns { uid, nama, level } atau null */
export async function cariKodeTeman(kode) {
  const snap = await getDoc(doc(db, "kodeTeman", kode));
  if (!snap.exists()) return null;
  const { uid } = snap.data();
  const profil = await ambilProfilPublik(uid);
  return {
    uid,
    nama: profil?.nama ?? "Pengguna FiLUP",
    level: profil?.level ?? null,
  };
}

// ---------------------------------------------------------------------------
// Pertemanan
// ---------------------------------------------------------------------------

export function langganiPertemanan(uid, onData, onError) {
  const q = query(
    collection(db, "pertemanan"),
    where("anggota", "array-contains", uid)
  );
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError
  );
}

export async function kirimPermintaanTeman(uidSaya, uidTeman) {
  await setDoc(doc(db, "pertemanan", idPertemanan(uidSaya, uidTeman)), {
    anggota: [uidSaya, uidTeman].sort(),
    pengirim: uidSaya,
    penerima: uidTeman,
    status: "menunggu",
    dibuat: serverTimestamp(),
  });
}

export async function terimaPermintaanTeman(id) {
  await updateDoc(doc(db, "pertemanan", id), { status: "diterima" });
}

/** Menolak, membatalkan, atau memutus pertemanan. */
export async function hapusPertemanan(id) {
  await deleteDoc(doc(db, "pertemanan", id));
}

// ---------------------------------------------------------------------------
// Misi bersama
// ---------------------------------------------------------------------------

function normalisasiMisiBersama(id, data) {
  const kontribusi = {};
  for (const [uid, nilai] of Object.entries(data.kontribusi ?? {})) {
    kontribusi[uid] = Number(nilai) || 0;
  }
  return {
    id,
    ...data,
    targetAmount: Number(data.targetAmount) || 0,
    kontribusi,
    dibuat: tanggalIso(data.dibuat),
  };
}

export function langganiMisiBersama(uid, onData, onError) {
  const q = query(
    collection(db, "misiBersama"),
    where("anggota", "array-contains", uid)
  );
  return onSnapshot(
    q,
    (snap) =>
      onData(snap.docs.map((d) => normalisasiMisiBersama(d.id, d.data()))),
    onError
  );
}

export async function buatMisiBersama(uid, misi) {
  return addDoc(collection(db, "misiBersama"), {
    judul: misi.judul,
    icon: misi.icon ?? "misi",
    targetAmount: Number(misi.targetAmount) || 0,
    deadline: misi.deadline ?? null,
    pembuat: uid,
    anggota: misi.anggota,
    namaAnggota: misi.namaAnggota,
    kontribusi: {},
    dibuat: serverTimestamp(),
  });
}

/**
 * Menambah kontribusi pengguna. Memakai `increment` di server, jadi dua
 * anggota yang menabung pada detik yang sama tidak saling menimpa.
 */
export async function tabungMisiBersama(uid, id, nominal) {
  await updateDoc(doc(db, "misiBersama", id), {
    [`kontribusi.${uid}`]: increment(nominal),
    diperbarui: serverTimestamp(),
  });
}

export async function hapusMisiBersama(id) {
  await deleteDoc(doc(db, "misiBersama", id));
}
