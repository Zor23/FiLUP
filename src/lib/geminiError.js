// Menerjemahkan kegagalan panggilan Gemini API menjadi pesan yang bisa
// langsung ditindaklanjuti, bukan sekadar "gagal menghubungi API".
//
// Dipakai oleh src/app/api/scan-receipt/route.js dan src/app/api/chat/route.js.

export function explainGeminiError(httpStatus, bodyText, modelUsed) {
  let detail = "";
  let googleStatus = "";

  try {
    const parsed = JSON.parse(bodyText);
    detail = parsed?.error?.message ?? "";
    googleStatus = parsed?.error?.status ?? "";
  } catch {
    detail = String(bodyText ?? "").slice(0, 300);
  }

  const model = modelUsed || process.env.GEMINI_MODEL || "gemini-3.7-flash";
  const haystack = `${googleStatus} ${detail}`;

  // Model tidak ada / tidak tersedia untuk key ini — paling sering terjadi
  // setelah Google menghentikan sebuah model.
  if (httpStatus === 404 || googleStatus === "NOT_FOUND") {
    return {
      code: "MODEL_NOT_FOUND",
      message:
        `Model "${model}" tidak tersedia untuk API key ini. Buka .env.local, isi ` +
        `GEMINI_MODEL dengan model yang masih aktif (misalnya gemini-3.6-flash), ` +
        `lalu jalankan ulang server.`,
      detail,
    };
  }

  if (/API_KEY_INVALID|API key not valid/i.test(haystack)) {
    return {
      code: "INVALID_KEY",
      message:
        "GEMINI_API_KEY tidak valid. Pastikan key tersalin utuh, tanpa spasi " +
        "atau tanda kutip, lalu jalankan ulang server.",
      detail,
    };
  }

  if (/SERVICE_DISABLED|has not been used in project|is disabled/i.test(haystack)) {
    return {
      code: "API_DISABLED",
      message:
        "Generative Language API belum aktif di project Google Cloud milik key ini. " +
        "Aktifkan dulu, atau buat API key baru lewat aistudio.google.com/apikey.",
      detail,
    };
  }

  if (httpStatus === 403 || googleStatus === "PERMISSION_DENIED") {
    return {
      code: "FORBIDDEN",
      message:
        "Akses ditolak. Kemungkinan API key dibatasi (restriction) atau tidak " +
        "punya izin memakai Gemini API.",
      detail,
    };
  }

  if (httpStatus === 429 || googleStatus === "RESOURCE_EXHAUSTED") {
    return {
      code: "QUOTA_EXCEEDED",
      message:
        "Kuota gratis sedang habis. Tunggu satu menit (batas per menit) atau " +
        "coba lagi besok (batas per hari). Cek di aistudio.google.com/rate-limit.",
      detail,
    };
  }

  if (httpStatus === 400) {
    return {
      code: "BAD_REQUEST",
      message:
        "Permintaan ditolak Gemini. Kalau ini terjadi saat scan struk, coba " +
        "gambar lain dengan ukuran lebih kecil.",
      detail,
    };
  }

  // 503 UNAVAILABLE = model sedang kebanjiran permintaan. Sudah dicoba ulang
  // otomatis beberapa kali sebelum sampai ke sini.
  if (httpStatus === 503 || googleStatus === "UNAVAILABLE") {
    return {
      code: "MODEL_BUSY",
      message:
        `Semua model Gemini yang dicoba sedang ramai dipakai (terakhir: ` +
        `"${model}"). Aplikasi sudah otomatis mengulang dan mencoba model ` +
        `cadangan. Coba lagi sebentar — biasanya pulih dalam beberapa menit.`,
      detail,
    };
  }

  if (httpStatus >= 500) {
    return {
      code: "UPSTREAM_ERROR",
      message: "Server Gemini sedang bermasalah. Coba lagi beberapa saat.",
      detail,
    };
  }

  return {
    code: "UNKNOWN",
    message: "Gagal menghubungi Gemini API.",
    detail,
  };
}
