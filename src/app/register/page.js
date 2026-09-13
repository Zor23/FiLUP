"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import AuthLayout from "@/components/AuthLayout";
import { useAuth } from "@/contexts/AuthProvider";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoggedIn, loading: authLoading, demoMode } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && isLoggedIn && !demoMode) router.replace("/dashboard");
  }, [authLoading, isLoggedIn, demoMode, router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Kata sandi minimal 6 karakter.");
      return;
    }

    setSubmitting(true);
    const res = await register(name.trim(), email, password);

    if (res.ok) {
      router.push("/dashboard");
    } else {
      setError(res.error);
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Buat akun baru"
      subtitle="Gratis, dan kamu langsung mulai dari Level 1."
      footer={
        <>
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="font-semibold text-filup-primary hover:underline"
          >
            Masuk di sini
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
            htmlFor="name"
            className="mb-1.5 block text-xs font-semibold text-filup-muted"
          >
            Nama Lengkap
          </label>
          <input
            id="name"
            type="text"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama kamu"
            className="w-full rounded-xl border border-filup-border bg-filup-bg-2 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-filup-primary"
          />
        </div>

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
            htmlFor="new-password"
            className="mb-1.5 block text-xs font-semibold text-filup-muted"
          >
            Kata Sandi
          </label>
          <input
            id="new-password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimal 6 karakter"
            className="w-full rounded-xl border border-filup-border bg-filup-bg-2 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-filup-primary"
          />
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting ? "Membuat akun..." : "Daftar & Mulai Level 1"}
        </Button>

        {demoMode && (
          <p className="text-center text-[11px] leading-relaxed text-filup-xp">
            Mode demo aktif — akun belum benar-benar dibuat sampai Firebase
            dikonfigurasi.
          </p>
        )}
      </form>
    </AuthLayout>
  );
}
