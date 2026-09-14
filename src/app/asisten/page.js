"use client";

import Emblem from "@/components/Emblem";
import { useEffect, useMemo, useRef, useState } from "react";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/contexts/AuthProvider";
import { useData } from "@/contexts/DataProvider";
import { mockChat } from "@/lib/mockData";

// Sapaan pembuka untuk akun sungguhan. Percakapan contoh di mockChat hanya
// dipakai saat mode demo — kalau ikut tampil di akun nyata, pengguna baru
// seolah-olah sudah pernah bertanya soal misi yang tidak pernah dia buat.
function sapaan(nama) {
  const panggilan =
    nama && nama !== "Pengguna" ? ` ${nama.split(" ")[0]}` : "";
  return `Halo${panggilan}! Aku FiLUP Coach kamu. Ada yang mau ditanyain soal keuangan hari ini?`;
}

const SUGGESTIONS = [
  "Misi sepatuku kapan selesai?",
  "Pengeluaranku minggu ini boros tidak?",
  "Bagaimana cara menabung dari uang saku?",
];

// Jawaban contoh kalau GEMINI_API_KEY belum diisi.
const DEMO_REPLY =
  "Aku catat ya. Coba sisihkan sedikit demi sedikit setiap kamu menerima uang saku — konsisten Rp10.000 per hari sudah cukup membuat misimu bergerak maju.";

export default function AsistenPage() {
  const { profile, demoMode } = useAuth();
  const { balance, activeMissions } = useData();
  // State hanya menyimpan percakapan yang benar-benar terjadi. Sapaan pembuka
  // dihitung saat render supaya namanya ikut terisi begitu profil selesai
  // dimuat, tanpa perlu menimpa isi percakapan.
  const [percakapan, setPercakapan] = useState(() => (demoMode ? mockChat : []));
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [simulated, setSimulated] = useState(false);
  const [apiError, setApiError] = useState("");
  const endRef = useRef(null);

  const messages = useMemo(
    () =>
      demoMode
        ? percakapan
        : [{ role: "assistant", text: sapaan(profile.name) }, ...percakapan],
    [demoMode, percakapan, profile.name]
  );

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);


  async function send(text) {
    if (!text.trim() || loading) return;

    // Riwayat sebelum pesan baru — dipakai AI sebagai konteks percakapan.
    const history = messages;
    setPercakapan((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setApiError("");
    setLoading(true);

    // Konteks keuangan nyata supaya jawaban AI relevan, bukan saran umum.
    const activeMission = activeMissions[0];
    const context = {
      balance,
      missionName: activeMission?.title ?? "-",
      missionTarget: activeMission?.targetAmount ?? 0,
      missionDaysLeft: activeMission
        ? Math.max(
            0,
            Math.ceil(
              (new Date(activeMission.deadline) - new Date()) /
                (1000 * 60 * 60 * 24)
            )
          )
        : "-",
    };

    function reply(textOut) {
      setPercakapan((prev) => [...prev, { role: "assistant", text: textOut }]);
      setLoading(false);
    }

    // Model yang sibuk dicoba ulang tanpa memberi tahu pengguna: indikator
    // "mengetik" tetap berjalan sementara aplikasi berpindah ke model lain.
    // Pengguna tidak perlu tahu urusan teknis di baliknya.
    const MAX_SILENT_RETRIES = 2;
    let skipModels = [];

    for (let attempt = 0; ; attempt++) {
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, history, context, skipModels }),
        });
        const data = await res.json();

        if (res.ok) {
          reply(data.reply);
          return;
        }

        if (data.code === "NO_API_KEY") {
          setSimulated(true);
          reply(DEMO_REPLY);
          return;
        }

        // Semua model sedang penuh → tunggu sebentar dan coba lagi diam-diam,
        // kali ini melewati model yang baru saja gagal.
        if (data.code === "MODEL_BUSY" && attempt < MAX_SILENT_RETRIES) {
          skipModels = [...new Set([...skipModels, ...(data.tried ?? [])])];
          await new Promise((r) => setTimeout(r, 1500));
          continue;
        }

        if (data.code === "MODEL_BUSY") {
          // Sudah beberapa kali dicoba dan tetap penuh. Sampaikan dengan
          // bahasa biasa, bukan pesan teknis.
          reply(
            "Maaf, aku sedang menerima banyak pertanyaan sekaligus. Coba tanya lagi sebentar, ya."
          );
          return;
        }

        // Error yang perlu ditindaklanjuti (API key, kuota, model dihentikan)
        // tetap ditampilkan sebagai panel teknis supaya bisa diperbaiki.
        setApiError(data.error ?? "Gagal menghubungi Gemini API.");
        setLoading(false);
        return;
      } catch {
        if (attempt < MAX_SILENT_RETRIES) {
          await new Promise((r) => setTimeout(r, 1500));
          continue;
        }
        setApiError(
          "Koneksi ke server terputus. Periksa internetmu lalu coba lagi."
        );
        setLoading(false);
        return;
      }
    }
  }

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-11rem)] flex-col md:mx-auto md:h-[calc(100vh-9rem)] md:max-w-2xl">
        {/* Header */}
        <section className="stagger mb-4 flex items-center gap-3">
          <span className="glow-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-filup-primary/15 text-filup-primary ring-1 ring-inset ring-filup-primary/30">
            <Emblem nama="kecerdasan" size={22} />
          </span>
          <div>
            <h1 className="font-display text-xl leading-tight tracking-tight md:text-2xl">
              FiLUP Coach
            </h1>
            {simulated ? (
              <p className="flex items-center gap-1.5 text-xs text-filup-xp">
                <span className="h-1.5 w-1.5 rounded-full bg-filup-xp" />
                Jawaban simulasi · GEMINI_API_KEY belum diisi
              </p>
            ) : (
              <p className="flex items-center gap-1.5 text-xs text-filup-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-filup-green" />
                Siap membantu · didukung Gemini AI
              </p>
            )}
          </div>
        </section>

        {/* Pesan */}
        <div className="-mx-1 flex-1 space-y-3 overflow-y-auto px-1 pb-3">
          {messages.map((m, i) => (
            <ChatBubble key={i} role={m.role} text={m.text} />
          ))}
          {loading && <TypingBubble />}
          <div ref={endRef} />
        </div>

        {/* Peringatan teknis — ditaruh di luar percakapan supaya tidak
            tertukar dengan jawaban AI */}
        {apiError && (
          <div className="animate-pop mb-2 flex items-start gap-2 rounded-xl border border-filup-red/30 bg-filup-red/10 px-3 py-2.5">
            <Emblem nama="peringatan" size={16} className="mt-px shrink-0 text-filup-red" />
            <div className="min-w-0">
              <p className="text-xs font-medium leading-relaxed text-filup-red">
                {apiError}
              </p>
              <button
                onClick={() => {
                  const lastUser = [...messages]
                    .reverse()
                    .find((m) => m.role === "user");
                  setApiError("");
                  if (lastUser) send(lastUser.text);
                }}
                className="mt-1.5 text-xs font-semibold text-filup-text underline"
              >
                Coba kirim ulang
              </button>
            </div>
          </div>
        )}

        {/* Saran pertanyaan */}
        {messages.length <= 3 && !apiError && (
          <div className="mb-2 flex flex-wrap gap-2 pb-1">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="shrink-0 rounded-full border border-filup-border bg-filup-surface-2/70 px-3 py-1.5 text-xs text-filup-muted transition-colors hover:border-filup-primary/50 hover:text-filup-text"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2 rounded-2xl border border-filup-border bg-filup-surface/80 p-2 backdrop-blur"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tulis pertanyaanmu..."
            className="flex-1 bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-filup-muted"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Kirim"
            className="btn-gradient flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white disabled:opacity-40"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </form>
      </div>
    </AppShell>
  );
}

function ChatBubble({ role, text }) {
  const isUser = role === "user";

  return (
    <div
      className={`animate-fade-up flex items-end gap-2 ${
        isUser ? "flex-row-reverse" : ""
      }`}
    >
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ${
          isUser
            ? "bg-filup-surface-2 text-filup-muted ring-white/10"
            : "bg-filup-primary/15 text-filup-primary ring-filup-primary/30"
        }`}
      >
        <Emblem nama={isUser ? "profil" : "kecerdasan"} size={15} />
      </span>
      <div
        className={`max-w-[80%] px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "btn-gradient rounded-2xl rounded-br-md text-white"
            : "rounded-2xl rounded-bl-md border border-white/10 bg-filup-surface text-filup-text"
        }`}
      >
        {text}
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="animate-fade-up flex items-end gap-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-filup-primary/15 text-filup-primary ring-1 ring-inset ring-filup-primary/30">
        <Emblem nama="kecerdasan" size={15} />
      </span>
      <div className="rounded-2xl rounded-bl-md border border-white/10 bg-filup-surface px-4 py-3">
        <span className="flex gap-1">
          {[0, 150, 300].map((d) => (
            <span
              key={d}
              className="h-1.5 w-1.5 animate-bounce rounded-full bg-filup-muted"
              style={{ animationDelay: `${d}ms` }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}
