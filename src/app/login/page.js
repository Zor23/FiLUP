"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import AuthLayout from "@/components/AuthLayout";
import { useAuth } from "@/contexts/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoggedIn, loading: authLoading, demoMode } = useAuth();

  // Di mode demo, kolomnya sudah terisi sejak render pertama supaya bisa
  // langsung masuk dengan satu klik. Diisi lewat state AWAL, bukan lewat
  // useEffect: `demoMode` berasal dari konfigurasi yang dibaca saat modul
  // dimuat, jadi nilainya sama di server maupun di peramban — tidak ada
  // risiko hydration mismatch, dan tidak ada render berantai.
  const [email, setEmail] = useState(demoMode ? "demo@filup.app" : "");
  const [password, setPassword] = useState(demoMode ? "demo1234" : "");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Kalau sudah login, tidak perlu melihat halaman ini lagi.
  useEffect(() => {
    if (!authLoading && isLoggedIn && !demoMode) router.replace("/dashboard");
  }, [authLoading, isLoggedIn, demoMode, router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const res = await login(email, password);

    if (res.ok) {
      router.push("/dashboard");
    } else {
      setError(res.error);
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Selamat datang kembali"
      subtitle="Masuk untuk melanjutkan misi tabunganmu."
      footer={
        <>
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="font-semibold text-filup-primary hover:underline"
          >
            Daftar gratis
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="card space-y-4 p-5">
        {error && (
          <div className="animate-pop rounded-xl border border-filup-red/30 bg-filup-red/10 px-3 py-2.5">
            <p className="text-xs font-medium text-filup-red">{error}</p>
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-xs font-semibold text-filup-muted"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="kamu@email.com"
            className="w-full rounded-xl border border-filup-border bg-filup-bg-2 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-filup-primary"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-xs font-semibold text-filup-muted"
          >
            Kata Sandi
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-xl border border-filup-border bg-filup-bg-2 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-filup-primary"
          />
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting ? "Memproses..." : "Masuk"}
        </Button>

        {demoMode && (
          <p className="text-center text-[11px] leading-relaxed text-filup-xp">
            Mode demo aktif — tombol ini langsung membuka dashboard dengan data
            contoh.
          </p>
        )}
      </form>
    </AuthLayout>
  );
}
