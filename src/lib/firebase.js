// Konfigurasi Firebase untuk FiLUP.
//
// Nilai-nilainya diambil dari environment variable (lihat .env.local.example).
// Jika belum diisi, aplikasi otomatis berjalan dalam MODE DEMO: memakai data
// contoh dari src/lib/mockData.js tanpa memanggil Firebase sama sekali.
// Dengan begitu tampilan tetap bisa dipresentasikan meski backend belum siap.

import { initializeApp, getApps, getApp } from "firebase/app";
import {
  browserLocalPersistence,
  getAuth,
  initializeAuth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Firebase dianggap siap hanya jika 3 kunci paling penting sudah terisi.
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId
);

let app = null;
let auth = null;
let db = null;

if (isFirebaseConfigured) {
  // getApps() mencegah inisialisasi ganda saat hot-reload di development.
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);

  // Status login sengaja disimpan di localStorage, bukan IndexedDB (bawaan
  // Firebase). Dua alasannya:
  //   1. IndexedDB memunculkan error "Database is closing" saat hot-reload
  //      Next.js di development.
  //   2. Browser dalam aplikasi (WhatsApp, Instagram) dan mode penyamaran
  //      sering memblokir IndexedDB — dengan bawaan Firebase, pengguna yang
  //      membuka tautan dari chat bisa gagal login tanpa pesan apa pun.
  if (typeof window === "undefined") {
    auth = getAuth(app);
  } else {
    try {
      auth = initializeAuth(app, { persistence: browserLocalPersistence });
    } catch {
      // Sudah pernah diinisialisasi (mis. hot-reload) — pakai yang ada.
      auth = getAuth(app);
    }
  }

  db = getFirestore(app);
} else if (typeof window !== "undefined") {
  console.info(
    "[FiLUP] Firebase belum dikonfigurasi — aplikasi berjalan dalam mode demo. " +
      "Salin .env.local.example menjadi .env.local dan isi kredensialnya untuk mengaktifkan login sungguhan."
  );
}

export { app, auth, db };
