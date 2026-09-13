// Kuis literasi keuangan harian.
//
// Soal-soalnya DITULIS TANGAN, bukan dikarang AI. Alasannya sama dengan
// aturan "AI tidak pernah berhitung" di seluruh aplikasi: soal keuangan yang
// keliru — jawaban kunci yang salah, angka yang meleset — lebih merugikan
// daripada tidak ada soal sama sekali. Setiap angka di bawah sudah dihitung
// ulang secara manual.
//
// Semua pengguna mendapat soal yang sama pada hari yang sama: urutannya
// ditentukan oleh nomor hari sejak 1 Januari 1970 menurut tanggal lokal,
// jadi teman sekelas bisa membahas soal yang sama.
//
// Catatan yang disengaja: kunci jawaban ikut terkirim ke peramban. Ini kuis
// belajar dengan hadiah XP kecil, bukan ujian — memindahkan penilaian ke
// server menambah satu route dan satu titik gagal untuk manfaat yang kecil.

const SOAL_MENTAH = [
  {
    topik: "Menabung",
    tanya: "Kamu baru menerima uang saku Rp50.000. Mana yang sebaiknya didahulukan?",
    pilihan: [
      "Jajan dulu, sisanya ditabung",
      "Sisihkan tabungan dulu, sisanya untuk keperluan",
      "Pakai semua, menabung bisa bulan depan",
      "Pinjam uang teman supaya bisa menabung",
    ],
    benar: 1,
    penjelasan:
      "Ini disebut \"bayar dirimu dulu\". Kalau menunggu sisa di akhir, uangnya hampir selalu sudah habis. Menyisihkan di awal membuat menabung jadi kebiasaan, bukan sisa.",
  },
  {
    topik: "Kebutuhan vs keinginan",
    tanya: "Mana yang termasuk KEBUTUHAN bagi pelajar?",
    pilihan: [
      "Skin game edisi terbatas",
      "Minuman kekinian setiap hari",
      "Ongkos pergi ke sekolah",
      "Sepatu kedua dengan model yang sama",
    ],
    benar: 2,
    penjelasan:
      "Kebutuhan adalah hal yang harus ada agar kegiatan penting tetap berjalan. Ongkos sekolah termasuk kebutuhan; tiga pilihan lain adalah keinginan — boleh, tapi setelah kebutuhan terpenuhi.",
  },
  {
    topik: "Menghitung tabungan",
    tanya: "Kamu menabung Rp5.000 setiap hari. Berapa tabunganmu setelah 30 hari?",
    pilihan: ["Rp35.000", "Rp100.000", "Rp120.000", "Rp150.000"],
    urutanTetap: true,
    benar: 3,
    penjelasan:
      "Rp5.000 × 30 hari = Rp150.000. Nominal kecil yang konsisten ternyata cukup besar kalau dijumlahkan.",
  },
  {
    topik: "Keamanan",
    tanya: "Seseorang mengaku petugas bank dan meminta kode OTP yang masuk ke HP-mu. Apa yang harus kamu lakukan?",
    pilihan: [
      "Berikan, karena dia petugas resmi",
      "Berikan setengah kodenya saja",
      "Jangan berikan kepada siapa pun",
      "Tanyakan dulu namanya, lalu berikan",
    ],
    benar: 2,
    penjelasan:
      "Petugas bank tidak pernah meminta OTP. Siapa pun yang meminta OTP hampir pasti penipu — dengan kode itu, dia bisa masuk ke akunmu.",
  },
  {
    topik: "Pinjaman online",
    tanya: "Mana ciri pinjaman online (pinjol) ILEGAL?",
    pilihan: [
      "Terdaftar dan diawasi OJK",
      "Meminta akses ke seluruh kontak dan galeri HP",
      "Menjelaskan bunga dan biaya di awal",
      "Punya alamat kantor dan layanan pengaduan",
    ],
    benar: 1,
    penjelasan:
      "Pinjol legal hanya boleh mengakses kamera, mikrofon, dan lokasi. Yang meminta kontak dan galeri biasanya memakainya untuk menagih dengan cara mempermalukan peminjam.",
  },
  {
    topik: "Inflasi",
    tanya: "Apa arti inflasi?",
    pilihan: [
      "Harga barang naik secara umum, sehingga uang yang sama bisa membeli lebih sedikit",
      "Jumlah uang di tabunganmu bertambah sendiri",
      "Harga semua barang turun",
      "Bank menaikkan biaya administrasi",
    ],
    benar: 0,
    penjelasan:
      "Karena inflasi, Rp10.000 hari ini bisa membeli lebih banyak daripada Rp10.000 beberapa tahun lagi. Itu sebabnya uang yang hanya didiamkan perlahan kehilangan daya belinya.",
  },
  {
    topik: "Dana darurat",
    tanya: "Untuk apa dana darurat sebaiknya dipakai?",
    pilihan: [
      "Membeli barang yang sedang diskon besar",
      "Keperluan mendadak yang tidak terduga, seperti HP rusak atau sakit",
      "Traktir teman saat ulang tahun",
      "Top up game saat ada event",
    ],
    benar: 1,
    penjelasan:
      "Dana darurat adalah bantalan untuk kejadian tak terduga. Kalau dipakai untuk diskon atau hiburan, ia tidak ada saat benar-benar dibutuhkan.",
  },
  {
    topik: "Anggaran",
    tanya: "Dalam aturan anggaran 50/30/20, angka 20 biasanya untuk apa?",
    pilihan: ["Kebutuhan", "Keinginan", "Tabungan", "Pajak"],
    benar: 2,
    penjelasan:
      "Aturan 50/30/20 membagi pemasukan menjadi 50% kebutuhan, 30% keinginan, dan 20% tabungan. Angkanya bisa disesuaikan, tapi idenya: tabungan punya jatah tetap.",
  },
  {
    topik: "Diskon",
    tanya: "Sebuah kaos seharga Rp80.000 didiskon 20%. Berapa yang harus dibayar?",
    pilihan: ["Rp60.000", "Rp64.000", "Rp66.000", "Rp72.000"],
    urutanTetap: true,
    benar: 1,
    penjelasan:
      "20% dari Rp80.000 adalah Rp16.000. Jadi harganya Rp80.000 − Rp16.000 = Rp64.000.",
  },
  {
    topik: "Promo",
    tanya: "Ada promo \"beli 2 gratis 1\", padahal kamu hanya butuh satu barang. Pilihan paling bijak?",
    pilihan: [
      "Ambil promonya, lumayan dapat tiga",
      "Beli satu saja sesuai kebutuhan",
      "Beli tiga paket sekaligus mumpung murah",
      "Pinjam uang supaya bisa ikut promo",
    ],
    benar: 1,
    penjelasan:
      "Promo baru disebut hemat kalau barangnya memang dibutuhkan. Membeli yang tidak perlu karena \"mumpung murah\" tetap saja pengeluaran tambahan.",
  },
  {
    topik: "Paylater",
    tanya: "Apa sebenarnya paylater (bayar nanti)?",
    pilihan: [
      "Hadiah dari toko online",
      "Utang yang harus dibayar nanti, sering dengan biaya atau denda",
      "Tabungan otomatis",
      "Diskon khusus pelajar",
    ],
    benar: 1,
    penjelasan:
      "Paylater adalah utang. Kalau telat membayar, biasanya ada denda — dan catatan tunggakan bisa menyulitkanmu mengajukan pinjaman saat dewasa.",
  },
  {
    topik: "Bunga majemuk",
    tanya: "Uang Rp100.000 disimpan dengan bunga 10% per tahun yang dihitung majemuk. Berapa jumlahnya setelah 2 tahun?",
    pilihan: ["Rp102.000", "Rp110.000", "Rp120.000", "Rp121.000"],
    urutanTetap: true,
    benar: 3,
    penjelasan:
      "Tahun pertama: Rp100.000 + 10% = Rp110.000. Tahun kedua bunganya dihitung dari Rp110.000: Rp110.000 + Rp11.000 = Rp121.000. Bunga ikut berbunga — itulah bunga majemuk.",
  },
  {
    topik: "Lembaga keuangan",
    tanya: "Lembaga apa yang menjamin simpanan nasabah di bank di Indonesia?",
    pilihan: ["OJK", "LPS", "Bank Indonesia", "Kementerian Keuangan"],
    benar: 1,
    penjelasan:
      "LPS (Lembaga Penjamin Simpanan) menjamin simpanan hingga Rp2 miliar per nasabah per bank, selama syaratnya dipenuhi — misalnya bunga yang diterima tidak melebihi tingkat bunga penjaminan LPS.",
  },
  {
    topik: "Lembaga keuangan",
    tanya: "Lembaga apa yang mengawasi pinjaman online dan investasi yang legal?",
    pilihan: ["LPS", "OJK", "Kominfo", "Pegadaian"],
    benar: 1,
    penjelasan:
      "OJK (Otoritas Jasa Keuangan) mengawasi layanan keuangan, termasuk pinjol dan investasi. Sebelum memakai layanan keuangan, cek dulu apakah terdaftar di OJK.",
  },
  {
    topik: "Membandingkan harga",
    tanya: "Botol 250 ml seharga Rp5.000, atau botol 1 liter seharga Rp18.000. Mana yang lebih murah per mililiter?",
    pilihan: [
      "Botol 250 ml",
      "Botol 1 liter",
      "Sama saja",
      "Tidak bisa dibandingkan",
    ],
    benar: 1,
    penjelasan:
      "Botol kecil: Rp5.000 ÷ 250 ml = Rp20 per ml. Botol besar: Rp18.000 ÷ 1.000 ml = Rp18 per ml. Yang besar lebih murah — asal isinya memang habis terpakai.",
  },
  {
    topik: "Belanja impulsif",
    tanya: "Kamu tiba-tiba ingin membeli barang yang tidak direncanakan. Cara paling ampuh menahannya?",
    pilihan: [
      "Langsung beli sebelum kehabisan",
      "Tunggu 24 jam, lalu putuskan lagi",
      "Beli yang lebih mahal supaya awet",
      "Minta teman membelikan dulu",
    ],
    benar: 1,
    penjelasan:
      "Keinginan mendadak sering hilang setelah ditunda sehari. Kalau besok masih merasa perlu, berarti barang itu memang layak dipertimbangkan.",
  },
  {
    topik: "Investasi bodong",
    tanya: "Ada tawaran investasi \"pasti untung 30% per bulan, tanpa risiko\". Kemungkinan besar ini…",
    pilihan: [
      "Kesempatan langka yang harus diambil",
      "Investasi bodong atau penipuan",
      "Tabungan bank biasa",
      "Program resmi pemerintah",
    ],
    benar: 1,
    penjelasan:
      "Untung besar yang \"pasti\" dan \"tanpa risiko\" adalah tanda bahaya. Investasi yang wajar selalu punya risiko, dan hasilnya tidak bisa dijanjikan setinggi itu.",
  },
  {
    topik: "Mencatat keuangan",
    tanya: "Apa manfaat utama mencatat setiap pengeluaran?",
    pilihan: [
      "Supaya terlihat rajin",
      "Supaya tahu ke mana uang pergi dan bisa memperbaiki kebiasaan",
      "Supaya bisa pamer ke teman",
      "Tidak ada manfaatnya",
    ],
    benar: 1,
    penjelasan:
      "Tanpa catatan, pengeluaran kecil mudah terlupakan. Dengan catatan, kamu bisa melihat pola — misalnya jajan ternyata menghabiskan separuh uang saku.",
  },
  {
    topik: "Target tabungan",
    tanya: "Target tabunganmu Rp300.000 dalam 10 minggu. Berapa yang perlu ditabung setiap minggu?",
    pilihan: ["Rp30.000", "Rp33.000", "Rp40.000", "Rp60.000"],
    urutanTetap: true,
    benar: 0,
    penjelasan:
      "Rp300.000 ÷ 10 minggu = Rp30.000 per minggu. Memecah target besar menjadi target mingguan membuatnya terasa lebih ringan.",
  },
  {
    topik: "Menabung di bank",
    tanya: "Apa kelebihan menabung di bank dibanding menyimpan uang di laci?",
    pilihan: [
      "Uangnya bisa dipakai kapan saja tanpa batas",
      "Lebih aman dari hilang, dan simpanannya bisa dijamin LPS",
      "Pasti bertambah dua kali lipat",
      "Tidak ada kelebihannya",
    ],
    benar: 1,
    penjelasan:
      "Uang di laci bisa hilang, rusak, atau terpakai tanpa sadar. Uang di bank lebih aman, dan simpanan di bank peserta LPS dijamin sesuai ketentuan.",
  },
  {
    topik: "Keamanan",
    tanya: "Kamu menerima pesan \"Selamat! Klik tautan ini untuk klaim saldo gratis\" dari nomor tak dikenal. Apa yang sebaiknya dilakukan?",
    pilihan: [
      "Klik, siapa tahu benar",
      "Teruskan ke teman-teman",
      "Abaikan dan jangan klik tautannya",
      "Balas dengan data diri supaya hadiah dikirim",
    ],
    benar: 2,
    penjelasan:
      "Tautan \"hadiah\" dari nomor tak dikenal biasanya phishing: halaman palsu untuk mencuri kata sandi atau data akunmu. Abaikan saja.",
  },
  {
    topik: "Menghitung pengeluaran",
    tanya: "Kamu jajan Rp15.000 setiap hari sekolah. Kalau sebulan ada 20 hari sekolah, berapa total jajanmu?",
    pilihan: ["Rp150.000", "Rp200.000", "Rp300.000", "Rp450.000"],
    urutanTetap: true,
    benar: 2,
    penjelasan:
      "Rp15.000 × 20 hari = Rp300.000 sebulan. Mengurangi Rp5.000 per hari saja sudah menghemat Rp100.000 sebulan.",
  },
  {
    topik: "Arus kas",
    tanya: "Apa sebutan untuk keadaan saat pengeluaran lebih besar daripada pemasukan?",
    pilihan: ["Surplus", "Defisit", "Investasi", "Dividen"],
    benar: 1,
    penjelasan:
      "Defisit berarti uang keluar lebih banyak daripada uang masuk. Kalau dibiarkan, kekurangannya biasanya ditutup dengan utang.",
  },
  {
    topik: "Struk belanja",
    tanya: "Mengapa struk belanja sebaiknya diperiksa sebelum dibuang?",
    pilihan: [
      "Untuk dikoleksi",
      "Untuk mengecek harga yang ditagih dan mencatat pengeluaran",
      "Supaya dapat diskon otomatis",
      "Tidak perlu diperiksa",
    ],
    benar: 1,
    penjelasan:
      "Struk memastikan harga yang ditagih sesuai harga yang tertera, dan menjadi catatan pengeluaranmu — seperti yang dibaca AI di halaman Scan.",
  },
  {
    topik: "Menghitung tabungan",
    tanya: "Kamu menabung Rp2.000 setiap hari selama setahun (365 hari). Berapa jumlahnya?",
    pilihan: ["Rp730.000", "Rp750.000", "Rp1.000.000", "Rp1.460.000"],
    urutanTetap: true,
    benar: 0,
    penjelasan:
      "Rp2.000 × 365 hari = Rp730.000. Seharga kira-kira satu gelas minuman per hari, ternyata jadi ratusan ribu dalam setahun.",
  },
  {
    topik: "Biaya kecil",
    tanya: "Sebuah layanan memotong biaya Rp5.000 setiap bulan. Berapa total biayanya dalam setahun?",
    pilihan: ["Rp50.000", "Rp60.000", "Rp65.000", "Rp120.000"],
    urutanTetap: true,
    benar: 1,
    penjelasan:
      "Rp5.000 × 12 bulan = Rp60.000. Biaya kecil yang rutin — langganan, biaya admin — sering luput dari perhatian karena nominal per bulannya kecil.",
  },
  {
    topik: "Nilai waktu uang",
    tanya: "Mana yang lebih bernilai: Rp10.000 hari ini, atau Rp10.000 setahun lagi?",
    pilihan: [
      "Rp10.000 hari ini",
      "Rp10.000 setahun lagi",
      "Nilainya pasti sama",
      "Tidak bisa ditentukan sama sekali",
    ],
    benar: 0,
    penjelasan:
      "Karena inflasi, daya beli uang cenderung turun. Uang yang ada hari ini juga bisa ditabung dan bertambah, jadi nilainya lebih tinggi daripada jumlah yang sama di masa depan.",
  },
  {
    topik: "Diversifikasi",
    tanya: "Apa arti diversifikasi dalam menyimpan atau menginvestasikan uang?",
    pilihan: [
      "Menaruh semua uang di satu tempat",
      "Membagi uang ke beberapa jenis simpanan atau investasi",
      "Menghabiskan uang secepatnya",
      "Meminjam dari banyak orang",
    ],
    benar: 1,
    penjelasan:
      "Diversifikasi artinya \"jangan taruh semua telur dalam satu keranjang\". Kalau satu tempat bermasalah, uang di tempat lain tetap aman.",
  },
  {
    topik: "Meminjam uang",
    tanya: "Kamu meminjam uang dari teman. Sikap paling bertanggung jawab?",
    pilihan: [
      "Tunggu sampai teman menagih",
      "Catat, lalu kembalikan tepat waktu sesuai janji",
      "Kembalikan kalau ada uang lebih saja",
      "Anggap saja hadiah",
    ],
    benar: 1,
    penjelasan:
      "Mencatat dan menepati janji menjaga kepercayaan — dalam pertemanan maupun kelak dengan bank. Kebiasaan ini mulai dibentuk dari pinjaman kecil.",
  },
  {
    topik: "Menabung bersama",
    tanya: "Kamu dan dua teman menabung bersama untuk target Rp300.000, masing-masing sama banyak. Berapa bagian setiap orang?",
    pilihan: ["Rp50.000", "Rp75.000", "Rp100.000", "Rp150.000"],
    urutanTetap: true,
    benar: 2,
    penjelasan:
      "Rp300.000 ÷ 3 orang = Rp100.000 per orang. Menabung bersama membuat target besar lebih cepat tercapai — asal setiap orang menepati bagiannya.",
  },
];

// Posisi jawaban benar diratakan ke A–D. Saat ditulis, kuncinya menumpuk di
// B (18 dari 30) — pola yang cepat ditangkap pelajar: "kalau ragu, pilih B",
// dan kuisnya berhenti mengukur pemahaman.
//
// Soal berangka (`urutanTetap`) tidak disentuh: pilihan angka harus tetap urut
// dari kecil ke besar supaya mudah dibaca, dan posisi kuncinya sudah diatur
// merata saat ditulis. Soal lainnya dipindah bergiliran ke A, B, C, D dengan
// menukar jawaban benar ke posisi tujuannya. Tanpa acak — hasilnya selalu sama
// di server maupun di setiap peramban.
function ratakanKunci(daftar) {
  let giliran = 0;
  return daftar.map((soal) => {
    if (soal.urutanTetap) return soal;
    const tujuan = giliran++ % 4;
    if (tujuan === soal.benar) return soal;
    const pilihan = [...soal.pilihan];
    [pilihan[soal.benar], pilihan[tujuan]] = [pilihan[tujuan], pilihan[soal.benar]];
    return { ...soal, pilihan, benar: tujuan };
  });
}

export const BANK_SOAL = ratakanKunci(SOAL_MENTAH);

const pad = (n) => String(n).padStart(2, "0");

/** Tanggal lokal dalam format YYYY-MM-DD. */
export function kunciHari(d = new Date()) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Tanggal kemarin (lokal) dalam format YYYY-MM-DD. */
export function kunciKemarin(d = new Date()) {
  return kunciHari(new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1));
}

/** Soal untuk tanggal tertentu — sama untuk semua pengguna pada hari itu. */
export function soalUntuk(kunci) {
  const [y, m, d] = kunci.split("-").map(Number);
  const nomorHari = Math.floor(Date.UTC(y, m - 1, d) / 86400000);
  const n = BANK_SOAL.length;
  return BANK_SOAL[((nomorHari % n) + n) % n];
}

/**
 * Hitungan beruntun yang MASIH berlaku. Angka yang tersimpan bisa basi: kalau
 * jawaban terakhir lebih lama dari kemarin, rentetannya sudah putus.
 */
export function beruntunAktif(catatan, beruntun, hariIni = kunciHari()) {
  if (!catatan?.tanggal) return 0;
  if (catatan.tanggal !== hariIni && catatan.tanggal !== kunciKemarin()) return 0;
  return Number(beruntun) || 0;
}

// ---- Catatan kuis di mode demo (localStorage) ----
//
// Di mode demo tidak ada Firestore. Jawaban hari ini disimpan di peramban
// supaya kuis tidak bisa dijawab ulang hanya dengan memuat ulang halaman.

const KUNCI_DEMO = "filup:kuis-demo";

export function bacaCatatanDemo() {
  try {
    const teks = window.localStorage.getItem(KUNCI_DEMO);
    return teks ? JSON.parse(teks) : null;
  } catch {
    return null;
  }
}

export function simpanCatatanDemo(catatan) {
  try {
    window.localStorage.setItem(KUNCI_DEMO, JSON.stringify(catatan));
  } catch {
    // Penyimpanan diblokir peramban: kuis tetap jalan, hanya tidak diingat.
  }
}
