// Analisis keuangan deterministik — SELURUH angka di FiLUP dihitung di sini,
// bukan oleh AI.
//
// Alasannya: model bahasa sering keliru saat menjumlah atau membagi, dan
// kesalahan hitung pada aplikasi keuangan jauh lebih fatal daripada kalimat
// yang kurang enak dibaca. Jadi pembagian tugasnya tegas:
//
//   file ini   → menghitung fakta (nominal, persentase, rata-rata, tren)
//   Gemini     → menceritakan fakta itu dengan bahasa yang enak dibaca
//
// Fungsi `wawasanCadangan()` di bagian bawah menghasilkan wawasan yang bisa
// dibaca tanpa AI sama sekali. Dipakai kalau kunci API belum diisi atau
// Gemini sedang bermasalah — supaya halaman tidak pernah kosong saat demo.

/** Mengubah nilai apa pun menjadi angka yang aman dipakai. */
function angka(nilai) {
  const n = Number(nilai);
  return Number.isFinite(n) ? n : 0;
}

/** Selisih hari antara dua tanggal (dibulatkan ke bawah, minimal 0). */
function selisihHari(dari, sampai) {
  const ms = sampai.getTime() - dari.getTime();
  return Math.max(0, Math.floor(ms / 86400000));
}

/** Format rupiah tanpa desimal — dipakai juga di dalam kalimat cadangan. */
export function rupiah(nilai) {
  return `Rp${angka(nilai).toLocaleString("id-ID")}`;
}

/** Format rupiah ringkas untuk ruang sempit (label grafik): Rp18 rb, Rp1,2 jt. */
export function rupiahSingkat(nilai) {
  const n = angka(nilai);
  const mutlak = Math.abs(n);
  const f = (x) => x.toLocaleString("id-ID", { maximumFractionDigits: 1 });
  if (mutlak >= 1e6) return `Rp${f(n / 1e6)} jt`;
  if (mutlak >= 1e3) return `Rp${f(n / 1e3)} rb`;
  return `Rp${f(n)}`;
}

/**
 * Total pengeluaran per hari untuk `jumlahHari` hari terakhir (termasuk hari
 * ini), urut dari yang paling lama. Dipakai grafik batang di dashboard.
 *
 * Hari dihitung menurut zona waktu perangkat, bukan UTC — transaksi pukul
 * 06.00 WITA harus jatuh di hari yang sama dengan yang dilihat penggunanya.
 * Hari tanpa pengeluaran tetap muncul dengan total 0, supaya jarak antar
 * batang di grafik mencerminkan waktu yang sebenarnya.
 *
 * @returns {Array<{ tanggal: string, total: number, jumlah: number, hariIni: boolean }>}
 *          `tanggal` berformat YYYY-MM-DD
 */
export function pengeluaranHarian(transactions = [], jumlahHari = 14, sekarang = new Date()) {
  const kunci = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const hari = [];
  const indeks = {};
  for (let i = jumlahHari - 1; i >= 0; i--) {
    const d = new Date(sekarang.getFullYear(), sekarang.getMonth(), sekarang.getDate() - i);
    const k = kunci(d);
    indeks[k] = hari.length;
    hari.push({ tanggal: k, total: 0, jumlah: 0, hariIni: i === 0 });
  }

  for (const t of transactions) {
    if (!t || t.type === "income") continue;
    const tanggal = t.createdAt ? new Date(t.createdAt) : null;
    if (!tanggal || Number.isNaN(tanggal.getTime())) continue;
    const i = indeks[kunci(tanggal)];
    if (i === undefined) continue;
    hari[i].total += angka(t.amount);
    hari[i].jumlah += 1;
  }

  return hari;
}

/**
 * Menghitung seluruh statistik yang dibutuhkan halaman Wawasan.
 *
 * @param {Array}  transactions daftar transaksi ({ amount, type, category, createdAt })
 * @param {Array}  missions     daftar misi ({ targetAmount, currentAmount, deadline, status })
 * @param {Date}   [sekarang]   titik waktu acuan — bisa diisi agar mudah diuji
 */
export function hitungStatistik(transactions = [], missions = [], sekarang = new Date()) {
  const txValid = transactions.filter((t) => t && Number.isFinite(Number(t.amount)));

  let totalMasuk = 0;
  let totalKeluar = 0;
  const perKategori = {};
  let tanggalTerlama = null;

  // Jendela 7 hari terakhir dan 7 hari sebelumnya, untuk melihat tren.
  const batasPekanIni = new Date(sekarang.getTime() - 7 * 86400000);
  const batasPekanLalu = new Date(sekarang.getTime() - 14 * 86400000);
  let keluarPekanIni = 0;
  let keluarPekanLalu = 0;

  for (const t of txValid) {
    const nominal = angka(t.amount);
    const tanggal = t.createdAt ? new Date(t.createdAt) : null;
    const tanggalSah = tanggal && !Number.isNaN(tanggal.getTime());

    if (tanggalSah && (!tanggalTerlama || tanggal < tanggalTerlama)) {
      tanggalTerlama = tanggal;
    }

    if (t.type === "income") {
      totalMasuk += nominal;
      continue;
    }

    totalKeluar += nominal;
    const kategori = t.category || "Lainnya";
    perKategori[kategori] = (perKategori[kategori] ?? 0) + nominal;

    if (tanggalSah) {
      if (tanggal >= batasPekanIni) keluarPekanIni += nominal;
      else if (tanggal >= batasPekanLalu) keluarPekanLalu += nominal;
    }
  }

  const saldo = totalMasuk - totalKeluar;

  // Kategori diurutkan dari yang paling menguras.
  const kategori = Object.entries(perKategori)
    .map(([nama, total]) => ({
      nama,
      total,
      persen: totalKeluar > 0 ? Math.round((total / totalKeluar) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total);

  // Rentang hari data yang tersedia — dipakai untuk rata-rata harian.
  const rentangHari = tanggalTerlama
    ? Math.max(1, selisihHari(tanggalTerlama, sekarang) + 1)
    : 1;
  const rataHarian = Math.round(totalKeluar / rentangHari);

  // Tren pengeluaran pekan ini dibanding pekan lalu.
  let trenPersen = null; // null = data belum cukup untuk dibandingkan
  if (keluarPekanLalu > 0) {
    trenPersen = Math.round(((keluarPekanIni - keluarPekanLalu) / keluarPekanLalu) * 100);
  }

  // ---- Misi ----
  const misiAktif = missions.filter((m) => m?.status === "active");
  const totalTerkumpul = missions.reduce((s, m) => s + angka(m.currentAmount), 0);

  // Misi aktif dengan tenggat paling dekat, beserta kebutuhan menabung harian.
  let misiTerdekat = null;
  for (const m of misiAktif) {
    if (!m.deadline) continue;
    const tenggat = new Date(m.deadline);
    if (Number.isNaN(tenggat.getTime())) continue;
    if (!misiTerdekat || tenggat < misiTerdekat.tenggat) {
      const sisaNominal = Math.max(0, angka(m.targetAmount) - angka(m.currentAmount));
      const sisaHari = selisihHari(sekarang, tenggat);
      // Tenggat yang sudah lewat juga menghasilkan sisaHari 0, jadi keduanya
      // dibedakan lewat penanda tersendiri agar kalimatnya tidak menyesatkan.
      const lewatTenggat = tenggat < sekarang && sisaHari === 0;
      misiTerdekat = {
        judul: m.title,
        tenggat,
        sisaNominal,
        sisaHari,
        lewatTenggat,
        butuhPerHari: sisaHari > 0 ? Math.ceil(sisaNominal / sisaHari) : sisaNominal,
      };
    }
  }

  // Rasio menabung: berapa persen uang masuk yang berhasil disisihkan ke misi.
  // Dibatasi 100% karena tabungan bisa berasal dari uang yang masuk sebelum
  // rentang data ini — angka di atas 100% hanya membingungkan pembacanya.
  const rasioTabungan =
    totalMasuk > 0
      ? Math.min(100, Math.round((totalTerkumpul / totalMasuk) * 100))
      : 0;

  return {
    jumlahTransaksi: txValid.length,
    totalMasuk,
    totalKeluar,
    saldo,
    rentangHari,
    rataHarian,
    kategori,
    kategoriTerbesar: kategori[0] ?? null,
    keluarPekanIni,
    keluarPekanLalu,
    trenPersen,
    jumlahMisiAktif: misiAktif.length,
    totalTerkumpul,
    rasioTabungan,
    misiTerdekat: misiTerdekat
      ? { ...misiTerdekat, tenggat: misiTerdekat.tenggat.toISOString().slice(0, 10) }
      : null,
  };
}

/**
 * Menyusun wawasan tanpa AI, murni dari statistik di atas.
 *
 * Bentuk kembaliannya SAMA PERSIS dengan yang diminta dari Gemini, jadi
 * komponen tampilan tidak perlu tahu wawasan ini datang dari mana.
 */
export function wawasanCadangan(stat) {
  if (!stat || stat.jumlahTransaksi === 0) {
    return {
      ringkasan:
        "Belum ada transaksi yang bisa dianalisis. Catat beberapa pengeluaran dulu, lalu buka lagi halaman ini.",
      temuan: [],
      saranMisi: null,
      sumber: "hitungan",
    };
  }

  const temuan = [];

  if (stat.kategoriTerbesar) {
    temuan.push({
      judul: `${stat.kategoriTerbesar.nama} paling menguras`,
      isi: `Kategori ini memakan ${stat.kategoriTerbesar.persen}% dari total pengeluaranmu, yaitu ${rupiah(stat.kategoriTerbesar.total)}.`,
      nada: stat.kategoriTerbesar.persen >= 50 ? "peringatan" : "netral",
    });
  }

  temuan.push({
    judul: "Rata-rata pengeluaran harian",
    isi: `Dalam ${stat.rentangHari} hari terakhir kamu menghabiskan sekitar ${rupiah(stat.rataHarian)} per hari.`,
    nada: "netral",
  });

  if (stat.trenPersen !== null) {
    const naik = stat.trenPersen > 0;
    temuan.push({
      judul: naik ? "Pengeluaran pekan ini naik" : "Pengeluaran pekan ini turun",
      isi: `Pekan ini ${rupiah(stat.keluarPekanIni)}, dibanding ${rupiah(stat.keluarPekanLalu)} pekan lalu — ${naik ? "naik" : "turun"} ${Math.abs(stat.trenPersen)}%.`,
      nada: naik ? "peringatan" : "baik",
    });
  }

  const misi = stat.misiTerdekat;
  if (misi && misi.sisaNominal > 0) {
    let judul;
    let isi;

    if (misi.lewatTenggat) {
      judul = `Misi "${misi.judul}" lewat tenggat`;
      isi = `Targetnya sudah terlewat dengan sisa ${rupiah(misi.sisaNominal)}. Perpanjang tenggatnya atau turunkan targetnya supaya tetap terkejar.`;
    } else if (misi.sisaHari === 0) {
      judul = `Misi "${misi.judul}" jatuh tempo hari ini`;
      isi = `Tinggal ${rupiah(misi.sisaNominal)} lagi untuk menutup target hari ini.`;
    } else {
      judul = `Misi "${misi.judul}" mendekati tenggat`;
      isi = `Sisa ${rupiah(misi.sisaNominal)} dalam ${misi.sisaHari} hari — sekitar ${rupiah(misi.butuhPerHari)} per hari.`;
    }

    temuan.push({
      judul,
      isi,
      nada: misi.sisaHari <= 3 ? "peringatan" : "netral",
    });
  }

  // Saran misi: sekitar seperempat pemasukan, dibulatkan ke puluhan ribu.
  //
  // Patokannya pemasukan, bukan saldo, karena misi dikejar selama sekitar
  // 30 hari ke depan — bukan dibayar lunas hari ini. Kalau pengeluaran sedang
  // melebihi pemasukan, saran menabung ditahan dulu: menyuruh menabung saat
  // keuangan sedang minus bukan saran yang membantu.
  let saranMisi = null;
  if (stat.totalMasuk >= 50000 && stat.saldo > 0) {
    const target = Math.max(
      50000,
      Math.round((stat.totalMasuk * 0.25) / 10000) * 10000
    );
    saranMisi = {
      judul: "Dana Darurat Kecil",
      ikon: "perisai",
      targetAmount: target,
      alasan: `Dari pemasukan ${rupiah(stat.totalMasuk)}, menyisihkan ${rupiah(target)} membuatmu punya cadangan tanpa mengganggu pengeluaran harian.`,
    };
  }

  const ringkasan =
    stat.saldo >= 0
      ? `Dari ${stat.jumlahTransaksi} transaksi, uang masukmu ${rupiah(stat.totalMasuk)} dan keluar ${rupiah(stat.totalKeluar)}, menyisakan ${rupiah(stat.saldo)}.`
      : `Dari ${stat.jumlahTransaksi} transaksi, pengeluaranmu ${rupiah(stat.totalKeluar)} melebihi pemasukan ${rupiah(stat.totalMasuk)} sebesar ${rupiah(Math.abs(stat.saldo))}.`;

  return { ringkasan, temuan, saranMisi, sumber: "hitungan" };
}

/**
 * Ringkasan misi bersama. Total terkumpul DIHITUNG dari setoran tiap anggota,
 * tidak pernah disimpan — sama seperti saldo — jadi tidak mungkin berbeda
 * dengan jumlah setorannya.
 *
 * @returns {{ target, terkumpul, sisa, persen, selesai,
 *             perAnggota: Array<{ uid, nama, jumlah, persen }> }}
 *          `perAnggota[].persen` = porsi dari total terkumpul, diurutkan dari
 *          setoran terbesar.
 */
export function ringkasMisiBersama(misi) {
  const target = angka(misi?.targetAmount);
  const anggota = Array.isArray(misi?.anggota) ? misi.anggota : [];
  const kontribusi = misi?.kontribusi ?? {};

  const perAnggota = anggota.map((uid) => ({
    uid,
    nama: misi?.namaAnggota?.[uid] ?? "Anggota",
    jumlah: angka(kontribusi[uid]),
  }));
  const terkumpul = perAnggota.reduce((s, a) => s + a.jumlah, 0);
  for (const a of perAnggota) {
    a.persen = terkumpul > 0 ? Math.round((a.jumlah / terkumpul) * 100) : 0;
  }
  perAnggota.sort((a, b) => b.jumlah - a.jumlah);

  return {
    target,
    terkumpul,
    sisa: Math.max(0, target - terkumpul),
    persen: target > 0 ? Math.min(100, Math.round((terkumpul / target) * 100)) : 0,
    selesai: target > 0 && terkumpul >= target,
    perAnggota,
  };
}
