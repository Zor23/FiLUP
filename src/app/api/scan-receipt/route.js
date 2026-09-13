import { NextResponse } from "next/server";
import { explainGeminiError } from "@/lib/geminiError";
import { callGemini } from "@/lib/geminiFetch";

// POST /api/scan-receipt
// Menerima gambar struk/bukti transfer (multipart/form-data, field "image"),
// mengirimnya ke Gemini API (vision) untuk dibaca, dan mengembalikan hasil
// ekstraksi dalam format JSON siap pakai oleh form di halaman /scan.
//
// Env var yang dibutuhkan: GEMINI_API_KEY (lihat .env.local.example)

// Pemilihan model, pengulangan otomatis, dan rantai model cadangan diatur di
// src/lib/geminiFetch.js (env var: GEMINI_MODEL dan GEMINI_FALLBACK_MODELS).
// Catatan: gemini-2.0-flash sudah dihentikan Google (1 Juni 2026).

const EXTRACTION_PROMPT = `Kamu membaca gambar struk belanja atau bukti transfer. Ekstrak informasi berikut dan balas HANYA dalam format JSON, tanpa markdown, tanpa penjelasan tambahan:
{
  "merchant": "nama toko atau sumber transaksi",
  "amount": <nominal total sebagai angka, tanpa titik/koma/simbol mata uang>,
  "category": "pilih salah satu: makanan, transport, jajan, belanja, uang saku, lainnya",
  "type": "expense atau income"
}
Jika gambar bukan struk/bukti transfer atau tidak dapat terbaca, balas: {"error": "tidak dapat membaca gambar"}`;

export async function POST(request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Kode NO_API_KEY dipakai frontend untuk beralih ke hasil simulasi
      // (mode demo) supaya tampilan tetap bisa dipresentasikan.
      return NextResponse.json(
        { error: "GEMINI_API_KEY belum diatur di server.", code: "NO_API_KEY" },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("image");
    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "Field 'image' (file) wajib diisi." },
        { status: 400 }
      );
    }

    // Pengaman kalau kompresi di sisi browser gagal atau dilewati: tolak lebih
    // awal dengan pesan yang jelas, daripada permintaan diputus proxy hosting
    // dan pengguna melihat error yang membingungkan.
    const BATAS_BYTE = 8 * 1024 * 1024; // 8 MB
    if (typeof file.size === "number" && file.size > BATAS_BYTE) {
      return NextResponse.json(
        {
          error:
            "Ukuran fotonya terlalu besar. Coba foto ulang dengan resolusi lebih kecil.",
          code: "FILE_TERLALU_BESAR",
        },
        { status: 413 }
      );
    }

    const bytes = await file.arrayBuffer();
    const base64Image = Buffer.from(bytes).toString("base64");
    const mimeType = file.type || "image/jpeg";

    // Model yang sudah diketahui sibuk (dikirim frontend saat mencoba lagi).
    const skipRaw = formData.get("skipModels");
    const skipModels =
      typeof skipRaw === "string" && skipRaw ? skipRaw.split(",") : [];

    const { res: geminiRes, model, tried } = await callGemini(
      apiKey,
      {
        contents: [
        {
          parts: [
            { text: EXTRACTION_PROMPT },
            { inline_data: { mime_type: mimeType, data: base64Image } },
            ],
          },
        ],
        generationConfig: { temperature: 0.2 },
      },
      { skipModels }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error(
        `Gemini API error (HTTP ${geminiRes.status}) model=${model}:`,
        errText
      );
      const info = explainGeminiError(geminiRes.status, errText, model);
      return NextResponse.json(
        { error: info.message, code: info.code, detail: info.detail, tried },
        { status: 502 }
      );
    }

    const data = await geminiRes.json();
    const rawText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";

    // Gemini kadang membungkus JSON dengan ```json ... ``` meski sudah diminta tidak.
    const cleaned = rawText.replace(/^```json\s*|^```\s*|```$/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: "Balasan AI tidak dapat dibaca sebagai JSON.", raw: rawText },
        { status: 502 }
      );
    }

    if (parsed.error) {
      return NextResponse.json({ error: parsed.error }, { status: 422 });
    }

    return NextResponse.json({ ...parsed, model });
  } catch (err) {
    console.error("scan-receipt error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
