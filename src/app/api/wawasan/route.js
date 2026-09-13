import { NextResponse } from "next/server";
import { callGemini } from "@/lib/geminiFetch";
import { hitungStatistik, wawasanCadangan, rupiah } from "@/lib/analisis";

// Lambang yang boleh dipakai model untuk saran misi. Sengaja dibatasi ke
// daftar yang sama dengan pemilih lambang di halaman "Buat Misi Baru".
const LAMBANG_MISI = [
  "misi",
  "sepatu",
  "permainan",
  "musik",
  "buku",
  "belanja",
  "transport",
  "piala",
];

// POST /api/wawasan
//
// Menghasilkan "Wawasan AI": ringkasan kondisi keuangan, beberapa temuan, dan
// satu saran misi tabungan yang bisa langsung dibuat oleh pengguna.
//
// Pembagian tugas yang disengaja:
//   - SELURUH angka dihitung di server oleh src/lib/analisis.js.
//   - Gemini hanya menerima angka yang sudah jadi, lalu menceritakannya.
// Model bahasa tidak diminta berhitung sama sekali, karena kesalahan aritmetika
// pada aplikasi keuangan jauh lebih merugikan daripada kalimat yang kaku.
//
// Route ini SELALU menjawab 200. Kalau kunci API belum diisi atau Gemini
// bermasalah, yang dikirim adalah wawasan hasil hitungan murni (sumber:
// "hitungan"). Halaman tidak pernah menampilkan pesan gagal.
//
// Body JSON: { transactions: [...], missions: [...], skipModels?: [...] }

const SKEMA_WAWASAN = {
  type: "OBJECT",
  properties: {
    ringkasan: { type: "STRING" },
    temuan: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          judul: { type: "STRING" },
          isi: { type: "STRING" },
          nada: { type: "STRING", enum: ["baik", "netral", "peringatan"] },
        },
        required: ["judul", "isi", "nada"],
      },
    },
    saranMisi: {
      type: "OBJECT",
      properties: {
        judul: { type: "STRING" },
        ikon: { type: "STRING" },
        targetAmount: { type: "NUMBER" },
        alasan: { type: "STRING" },
      },
      required: ["judul", "ikon", "targetAmount", "alasan"],
    },
  },
  required: ["ringkasan", "temuan", "saranMisi"],
};

/** Menyusun daftar fakta yang sudah terhitung, siap dibacakan oleh model. */
function susunFakta(stat) {
  const baris = [
    `Jumlah transaksi tercatat: ${stat.jumlahTransaksi}`,
    `Rentang data: ${stat.rentangHari} hari terakhir`,
    `Total pemasukan: ${rupiah(stat.totalMasuk)}`,
    `Total pengeluaran: ${rupiah(stat.totalKeluar)}`,
    `Saldo saat ini: ${rupiah(stat.saldo)}`,
    `Rata-rata pengeluaran per hari: ${rupiah(stat.rataHarian)}`,
    `Jumlah misi tabungan yang berjalan: ${stat.jumlahMisiAktif}`,
    `Total yang sudah ditabung ke misi: ${rupiah(stat.totalTerkumpul)} (${stat.rasioTabungan}% dari pemasukan)`,
  ];

  if (stat.kategori.length > 0) {
    const rincian = stat.kategori
      .map((k) => `${k.nama} ${rupiah(k.total)} (${k.persen}%)`)
      .join(", ");
    baris.push(`Pengeluaran per kategori: ${rincian}`);
  }

  if (stat.trenPersen !== null) {
    baris.push(
      `Pengeluaran 7 hari terakhir ${rupiah(stat.keluarPekanIni)}, tujuh hari sebelumnya ${rupiah(stat.keluarPekanLalu)} — perubahan ${stat.trenPersen > 0 ? "+" : ""}${stat.trenPersen}%`
    );
  }

  const misi = stat.misiTerdekat;
  if (misi) {
    if (misi.lewatTenggat) {
      baris.push(
        `Misi dengan tenggat terdekat: "${misi.judul}", tenggatnya SUDAH LEWAT dengan sisa ${rupiah(misi.sisaNominal)} yang belum terkumpul`
      );
    } else if (misi.sisaHari === 0) {
      baris.push(
        `Misi dengan tenggat terdekat: "${misi.judul}", jatuh tempo HARI INI dengan sisa ${rupiah(misi.sisaNominal)}`
      );
    } else {
      baris.push(
        `Misi dengan tenggat terdekat: "${misi.judul}", sisa ${rupiah(misi.sisaNominal)} dalam ${misi.sisaHari} hari (perlu ${rupiah(misi.butuhPerHari)} per hari)`
      );
    }
  }

  return baris.map((b) => `- ${b}`).join("\n");
}

function susunPerintah(stat) {
  return `Kamu adalah penganalisis keuangan untuk FiLUP, aplikasi pencatat keuangan bergaya game untuk pelajar SMA/SMK di Indonesia.

Di bawah ini adalah fakta keuangan seorang pengguna yang SUDAH DIHITUNG dengan benar. Tugasmu hanya menjelaskannya, bukan menghitung ulang.

ATURAN KETAT:
1. Jangan pernah menghitung, menjumlah, atau memperkirakan angka baru. Pakai hanya nominal yang tertulis di daftar fakta, disalin persis.
2. Tulis seluruh jawaban dalam bahasa Indonesia yang ringkas, jelas, dan menyemangati — bukan menggurui atau menakut-nakuti.
3. "ringkasan": satu sampai dua kalimat tentang kondisi keuangan pengguna secara keseluruhan.
4. "temuan": dua sampai empat pola yang paling berguna diketahui. Setiap temuan punya judul singkat (maksimal 6 kata), penjelasan satu sampai dua kalimat, dan "nada" bernilai "baik", "netral", atau "peringatan".
5. "saranMisi": satu misi tabungan yang realistis untuk pelajar. "targetAmount" harus berupa angka bulat rupiah antara 50000 dan 1000000, masuk akal dibanding saldo pengguna, dan merupakan kelipatan 10000. "ikon" HARUS dipilih persis dari daftar ini, tanpa mengarang nama baru dan tanpa emoji: ${LAMBANG_MISI.join(", ")}. "alasan" menjelaskan dalam satu kalimat mengapa target itu masuk akal.

FAKTA KEUANGAN PENGGUNA:
${susunFakta(stat)}`;
}

/** Memastikan saran misi dari model tetap dalam batas yang wajar. */
function bersihkanSaranMisi(saran) {
  if (!saran || typeof saran !== "object") return null;

  const judul = String(saran.judul ?? "").trim().slice(0, 60);
  if (!judul) return null;

  let target = Number(saran.targetAmount);
  if (!Number.isFinite(target)) return null;
  target = Math.round(target / 10000) * 10000;
  target = Math.min(1000000, Math.max(50000, target));

  // Nama lambang divalidasi terhadap daftar tertutup. Model bahasa gemar
  // mengembalikan emoji walau sudah diminta sebaliknya, dan satu emoji lolos
  // akan menjadi satu-satunya benda di dashboard yang keluar dari tema.
  const ikonMentah = String(saran.ikon ?? "").trim();
  const ikon = LAMBANG_MISI.includes(ikonMentah) ? ikonMentah : "misi";

  return {
    judul,
    ikon,
    targetAmount: target,
    alasan: String(saran.alasan ?? "").trim().slice(0, 220),
  };
}

/** Memvalidasi seluruh keluaran model; kembalikan null kalau bentuknya salah. */
function bersihkanWawasan(mentah) {
  if (!mentah || typeof mentah !== "object") return null;

  const ringkasan = String(mentah.ringkasan ?? "").trim();
  if (!ringkasan) return null;

  const nadaSah = ["baik", "netral", "peringatan"];
  const temuan = Array.isArray(mentah.temuan)
    ? mentah.temuan
        .map((t) => ({
          judul: String(t?.judul ?? "").trim().slice(0, 60),
          isi: String(t?.isi ?? "").trim().slice(0, 260),
          nada: nadaSah.includes(t?.nada) ? t.nada : "netral",
        }))
        .filter((t) => t.judul && t.isi)
        .slice(0, 4)
    : [];

  if (temuan.length === 0) return null;

  return {
    ringkasan: ringkasan.slice(0, 320),
    temuan,
    saranMisi: bersihkanSaranMisi(mentah.saranMisi),
    sumber: "ai",
  };
}

export async function POST(request) {
  let stat = null;

  try {
    const body = await request.json();
    const {
      transactions = [],
      missions = [],
      skipModels = [],
    } = body || {};

    // Statistik dihitung di server, bukan diterima jadi dari klien.
    stat = hitungStatistik(
      Array.isArray(transactions) ? transactions : [],
      Array.isArray(missions) ? missions : []
    );

    // Tanpa transaksi tidak ada yang bisa dianalisis — tidak perlu memanggil AI.
    if (stat.jumlahTransaksi === 0) {
      return NextResponse.json({ wawasan: wawasanCadangan(stat), stat });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ wawasan: wawasanCadangan(stat), stat });
    }

    const { res, model } = await callGemini(
      apiKey,
      {
        contents: [{ role: "user", parts: [{ text: susunPerintah(stat) }] }],
        generationConfig: {
          temperature: 0.4,
          responseMimeType: "application/json",
          responseSchema: SKEMA_WAWASAN,
        },
      },
      { skipModels: Array.isArray(skipModels) ? skipModels : [] }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error(`Wawasan: Gemini HTTP ${res.status} model=${model}:`, errText);
      return NextResponse.json({ wawasan: wawasanCadangan(stat), stat });
    }

    const data = await res.json();
    const teks = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    let terurai = null;
    try {
      terurai = JSON.parse(teks);
    } catch {
      console.error("Wawasan: keluaran model bukan JSON yang sah.");
    }

    const wawasan = bersihkanWawasan(terurai);
    if (!wawasan) {
      return NextResponse.json({ wawasan: wawasanCadangan(stat), stat });
    }

    return NextResponse.json({ wawasan, stat, model });
  } catch (err) {
    console.error("wawasan error:", err);
    // Tetap 200: pengguna mendapat wawasan hasil hitungan, bukan pesan gagal.
    return NextResponse.json({
      wawasan: wawasanCadangan(stat ?? hitungStatistik([], [])),
      stat: stat ?? hitungStatistik([], []),
    });
  }
}
