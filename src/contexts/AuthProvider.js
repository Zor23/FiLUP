"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";

import { auth, db, isFirebaseConfigured } from "@/lib/firebase";
import { mockUser } from "@/lib/mockData";
import { applyXP, xpToNextLevel } from "@/lib/gamification";

const AuthContext = createContext(null);

/** Mengubah kode error Firebase menjadi pesan berbahasa Indonesia. */
function translateAuthError(code) {
  const map = {
    "auth/invalid-email": "Format email tidak valid.",
    "auth/user-disabled": "Akun ini dinonaktifkan.",
    "auth/user-not-found": "Email belum terdaftar.",
    "auth/wrong-password": "Kata sandi salah.",
    "auth/invalid-credential": "Email atau kata sandi salah.",
    "auth/email-already-in-use": "Email ini sudah terdaftar. Coba masuk saja.",
    "auth/weak-password": "Kata sandi minimal 6 karakter.",
    "auth/too-many-requests":
      "Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.",
    "auth/network-request-failed":
      "Gagal terhubung ke server. Periksa koneksi internetmu.",
  };
  return map[code] ?? "Terjadi kesalahan. Coba lagi sebentar.";
}

export function AuthProvider({ children }) {
  // Mode demo: Firebase belum dikonfigurasi → pakai data contoh.
  const demoMode = !isFirebaseConfigured;

  // Di mode demo, pengguna contoh diisi langsung pada render pertama supaya
  // penjaga halaman di AppShell tidak keliru menganggap belum login.
  const [user, setUser] = useState(() =>
    demoMode
      ? { uid: "demo", email: "demo@filup.app", displayName: mockUser.name }
      : null
  );
  const [profile, setProfile] = useState(() =>
    demoMode ? { ...mockUser } : null
  );
  const [loading, setLoading] = useState(!demoMode);

  // ---- Mode sungguhan: pantau status login dari Firebase ----
  useEffect(() => {
    if (demoMode) return;

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser);

      if (!fbUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      // Pastikan dokumen profil ada (misalnya akun dibuat sebelum fitur ini).
      const ref = doc(db, "users", fbUser.uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, {
          name: fbUser.displayName ?? "Pengguna FiLUP",
          email: fbUser.email,
          level: 1,
          xp: 0,
          streakDays: 0,
          createdAt: serverTimestamp(),
        });
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [demoMode]);

  // ---- Dengarkan perubahan dokumen profil secara real-time ----
  useEffect(() => {
    if (demoMode || !user?.uid) return;

    const unsubscribe = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (snap.exists()) setProfile({ id: snap.id, ...snap.data() });
    });

    return unsubscribe;
  }, [demoMode, user?.uid]);

  // ---- Aksi ----

  const register = useCallback(
    async (name, email, password) => {
      if (demoMode) return { ok: true };

      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: name });
        await setDoc(doc(db, "users", cred.user.uid), {
          name,
          email,
          level: 1,
          xp: 0,
          streakDays: 0,
          createdAt: serverTimestamp(),
        });
        return { ok: true };
      } catch (err) {
        return { ok: false, error: translateAuthError(err.code) };
      }
    },
    [demoMode]
  );

  const login = useCallback(
    async (email, password) => {
      if (demoMode) return { ok: true };

      try {
        await signInWithEmailAndPassword(auth, email, password);
        return { ok: true };
      } catch (err) {
        return { ok: false, error: translateAuthError(err.code) };
      }
    },
    [demoMode]
  );

  const logout = useCallback(async () => {
    if (demoMode) return { ok: true };

    try {
      await signOut(auth);
      return { ok: true };
    } catch {
      return { ok: false, error: "Gagal keluar. Coba lagi." };
    }
  }, [demoMode]);

  /**
   * Menambah XP di MODE DEMO saja (tersimpan di memori, bukan Firestore).
   * Tanpa ini, bar XP tidak pernah bergerak saat demo — padahal justru itu
   * bagian yang paling perlu diperagakan.
   */
  const applyDemoXP = useCallback(
    (amount) => {
      if (!demoMode) return null;
      const base = profile ?? mockUser;
      const hasil = applyXP(
        Number(base.level) || 1,
        Number(base.xp) || 0,
        amount
      );
      setProfile({ ...base, level: hasil.level, xp: hasil.xp });
      return hasil;
    },
    [demoMode, profile]
  );

  // Data profil yang siap dipakai komponen (selalu punya nilai default aman).
  const safeProfile = useMemo(() => {
    const level = profile?.level ?? 1;
    return {
      name: profile?.name ?? user?.displayName ?? "Pengguna",
      level,
      xp: profile?.xp ?? 0,
      xpToNextLevel: xpToNextLevel(level),
      streakDays: profile?.streakDays ?? 0,
      balance: profile?.balance ?? 0,
      totalSaved: profile?.totalSaved ?? 0,
    };
  }, [profile, user]);

  const value = useMemo(
    () => ({
      user,
      profile: safeProfile,
      rawProfile: profile,
      loading,
      demoMode,
      isLoggedIn: Boolean(user),
      register,
      login,
      logout,
      applyDemoXP,
    }),
    [
      user,
      safeProfile,
      profile,
      loading,
      demoMode,
      register,
      login,
      logout,
      applyDemoXP,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam <AuthProvider>");
  return ctx;
}
