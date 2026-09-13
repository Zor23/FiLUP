import { NextResponse } from "next/server";
import { explainGeminiError } from "@/lib/geminiError";
import { callGemini } from "@/lib/geminiFetch";

// POST /api/chat
// Menerima pesan user + sedikit konteks keuangan (saldo, misi aktif), lalu
// meneruskannya ke Gemini API dengan system prompt sebagai "AI Coach" FiLUP.
//
// Body JSON yang diharapkan:
// {
//   message: string,
//   history: [{ role: "user" | "assistant", text: string }, ...],
//   context: { balance, missionName, missionTarget, missionDaysLeft }
// }
//
// Env var yang dibutuhkan: GEMINI_API_KEY (lihat .env.local.example)

// Pemilihan model & pengulangan otomatis diatur di src/lib/geminiFetch.js
// (env var: GEMINI_MODEL dan GEMINI_FALLBACK_MODELS).

function buildSystemPrompt(context = {}) {
  const {
    balance = 0,
    missionName = "-",
    missionTarget = 0,
    missionDaysLeft = "-",
  } = context;

  return `Kamu adalah asisten keuangan yang santai dan suportif untuk aplikasi FiLUP, ditujukan untuk pelajar SMA/SMK. Gunakan bahasa yang ringan tapi tetap sopan.
Saldo pengguna saat ini: Rp${balance}. Misi aktif: "${missionName}" dengan target Rp${missionTarget}, sisa waktu ${missionDaysLeft} hari.
Berikan saran yang realistis, dan hitung proyeksi sederhana kalau relevan (misalnya berapa harus ditabung per minggu). Jawab singkat, maksimal 4-5 kalimat.`;
}

export async function POST(request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Lihat catatan di src/app/api/scan-receipt/route.js soal kode ini.
      return NextResponse.json(
        { error: "GEMINI_API_KEY belum diatur di server.", code: "NO_API_KEY" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { message, history = [], context = {}, skipModels = [] } = body || {};

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Field 'message' wajib diisi." },
        { status: 400 }
      );
    }

    const contents = [
      ...history.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.text }],
      })),
      { role: "user", parts: [{ text: message }] },
    ];

    const { res: geminiRes, model, tried } = await callGemini(
      apiKey,
      {
        systemInstruction: {
          parts: [{ text: buildSystemPrompt(context) }],
        },
        contents,
        generationConfig: { temperature: 0.6 },
      },
      { skipModels: Array.isArray(skipModels) ? skipModels : [] }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error(
        `Gemini API error (HTTP ${geminiRes.status}) model=${model}:`,
        errText
      );
      const info = explainGeminiError(geminiRes.status, errText, model);
      return NextResponse.json(
        {
          error: info.message,
          code: info.code,
          detail: info.detail,
          tried, // dipakai frontend untuk melewati model ini saat mencoba lagi
        },
        { status: 502 }
      );
    }

    const data = await geminiRes.json();
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ??
      "Maaf, aku belum bisa menjawab itu sekarang.";

    // `model` dikembalikan supaya terlihat model mana yang benar-benar dipakai
    // (berguna saat model utama sedang sibuk dan cadangan yang menjawab).
    return NextResponse.json({ reply, model });
  } catch (err) {
    console.error("chat error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
