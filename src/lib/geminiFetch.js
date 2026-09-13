// Pemanggil Gemini API dengan dua lapis ketahanan:
//
// 1. PENGULANGAN — kalau Gemini menjawab 503 UNAVAILABLE ("This model is
//    currently experiencing high demand"), permintaan diulang dengan jeda
//    bertambah. Error seperti ini sifatnya sementara.
// 2. RANTAI MODEL CADANGAN — kalau satu model tetap gagal setelah diulang,
//    otomatis pindah ke model berikutnya. Model terbaru biasanya paling ramai
//    dipakai, sementara model satu generasi sebelumnya lebih longgar.
//
// Tujuannya: fitur AI tidak mati gara-gara gangguan sesaat di sisi Google —
// terutama saat demo di depan juri.
//
// Yang sengaja TIDAK dicoba ulang / dialihkan: API key tidak valid, akses
// ditolak, dan kuota habis. Mengulangnya hanya membuang kuota tanpa hasil.

const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

// Layak diulang pada model yang sama (gangguan server sementara).
const RETRYABLE_STATUS = [500, 502, 503, 504];

// Tidak ada gunanya mencoba model lain — masalahnya ada di key/kuota.
const FATAL_STATUS = [400, 401, 403, 429];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Daftar model yang dicoba berurutan.
 * Diatur lewat .env.local:
 *   GEMINI_MODEL           → model utama
 *   GEMINI_FALLBACK_MODELS → cadangan, dipisah koma
 */
export function getModelChain(skipModels = []) {
  const primary = (process.env.GEMINI_MODEL || "gemini-3.7-flash").trim();

  const raw =
    process.env.GEMINI_FALLBACK_MODELS ??
    "gemini-3.6-flash,gemini-3.5-flash,gemini-3.5-flash-lite";
  const fallbacks = raw
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);

  // Hindari mencoba model yang sama dua kali.
  const chain = [primary, ...fallbacks.filter((m) => m !== primary)];

  // Model yang sudah diketahui sibuk pada percobaan sebelumnya dilewati.
  const filtered = chain.filter((m) => !skipModels.includes(m));

  // Kalau semuanya sudah dilewati, kembali pakai rantai penuh daripada kosong.
  return filtered.length > 0 ? filtered : chain;
}

/**
 * Memanggil Gemini dengan payload tertentu, melalui rantai model.
 *
 * @param {string} apiKey
 * @param {object} payload  body JSON untuk generateContent
 * @returns {Promise<{ res: Response, model: string, attempts: number }>}
 *          `res` belum dibaca, jadi pemanggil bebas res.json()/res.text().
 */
export async function callGemini(
  apiKey,
  payload,
  { retriesPerModel = 1, baseDelayMs = 700, skipModels = [] } = {}
) {
  const models = getModelChain(skipModels);
  const body = JSON.stringify(payload);
  const tried = [];
  let attempts = 0;

  for (let mi = 0; mi < models.length; mi++) {
    const model = models[mi];
    const isLastModel = mi === models.length - 1;
    tried.push(model);

    for (let attempt = 0; attempt <= retriesPerModel; attempt++) {
      attempts++;
      const res = await fetch(`${API_BASE}/${model}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      if (res.ok) {
        if (mi > 0 || attempt > 0) {
          console.info(
            `Gemini berhasil dengan model "${model}" pada percobaan ke-${attempts}.`
          );
        }
        return { res, model, attempts, tried };
      }

      if (FATAL_STATUS.includes(res.status)) {
        return { res, model, attempts, tried }; // berhenti, tidak perlu model lain
      }

      const isLastAttempt = attempt >= retriesPerModel;
      const adaYangBisaDicoba = !isLastAttempt || !isLastModel;

      // Kalau ini benar-benar percobaan terakhir, kembalikan responsnya utuh
      // supaya detail error masih bisa dibaca pemanggil.
      if (!adaYangBisaDicoba) return { res, model, attempts, tried };

      try {
        await res.text(); // lepaskan koneksi respons yang dibuang
      } catch {
        /* diabaikan */
      }

      if (!isLastAttempt && RETRYABLE_STATUS.includes(res.status)) {
        const delay = baseDelayMs * 2 ** attempt;
        console.warn(
          `Gemini HTTP ${res.status} pada "${model}" — ulangi dalam ${delay}ms.`
        );
        await sleep(delay);
        continue; // ulangi model yang sama
      }

      console.warn(
        `Gemini HTTP ${res.status} pada "${model}" — beralih ke model berikutnya.`
      );
      break; // pindah ke model cadangan
    }
  }

  // Secara logika tidak akan sampai sini, tapi disiapkan agar aman.
  throw new Error("Tidak ada model Gemini yang bisa dihubungi.");
}
