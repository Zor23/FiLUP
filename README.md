# FiLUP — Finance Level Up

Aplikasi web pencatatan & edukasi keuangan bergaya game untuk pelajar, dibuat oleh **Tim STIBAJRA (SMK TI Bali Global Jimbaran)** untuk **Bali AI Tech Fest 2026 — AI Web Innovation Challenge**.

FiLUP membantu pelajar mencatat pemasukan/pengeluaran secara otomatis lewat AI (foto struk/bukti transfer langsung terbaca), membuat "misi" tabungan untuk barang impian, naik level lewat sistem XP, dan bertanya ke asisten AI soal kondisi keuangannya.

## Status Proyek

Frontend (Next.js + Tailwind) sudah lengkap untuk semua halaman utama.

- ✅ **Firebase Authentication aktif** — daftar, masuk, keluar, proteksi halaman
- ✅ **Integrasi Gemini AI aktif di tiga tempat** — Scan Struk, Asisten AI, dan Wawasan AI
- ✅ **Firestore aktif** — transaksi, misi, XP, level, dan streak tersimpan permanen dan tersinkron real-time
- ✅ **Siap dipasang sebagai PWA** — bisa ditambahkan ke layar utama HP dan dibuka tanpa bilah alamat
- ⏳ Sisa: push ke GitHub, deploy ke Hostinger, rekam demo, lengkapi materi submission

### Tiga tempat AI bekerja

| Halaman | Route server | Peran AI |
|---|---|---|
| Scan | `/api/scan-receipt` | membaca gambar struk (visi) |
| Asisten | `/api/chat` | menjawab pertanyaan keuangan |
| Beranda aplikasi | `/api/wawasan` | menceritakan analisis keuangan |

**AI tidak pernah berhitung.** Seluruh angka — total per kategori, rata-rata
harian, tren pekan ini dibanding pekan lalu, sisa hari misi — dihitung di
`src/lib/analisis.js`, lalu dikirim ke Gemini sebagai fakta jadi untuk
diceritakan. Model bahasa cukup sering keliru menjumlah, dan satu angka salah
pada aplikasi keuangan lebih merugikan daripada kalimat yang kaku.

Keluaran Wawasan AI diminta dalam JSON terstruktur, lalu masih divalidasi:
nominal saran misi dibulatkan ke kelipatan 10.000 dan dijepit ke rentang
Rp50.000–Rp1.000.000. Route-nya selalu menjawab HTTP 200 — bila kunci API
kosong atau Gemini bermasalah, yang dikirim adalah wawasan hasil hitungan
murni, dan kartunya menyebut apa adanya dari mana isinya berasal.

### Model Gemini & ketahanan terhadap gangguan

Rantai model default:

```
gemini-3.7-flash  →  gemini-3.6-flash  →  gemini-3.5-flash
    (utama)              (cadangan 1)         (cadangan 2)
```

Model lama `gemini-2.0-flash` sudah dihentikan Google pada 1 Juni 2026

Tiga lapis pengaman, dan **semuanya berjalan tanpa terlihat pengguna**:

1. **Pengulangan** (server, `src/lib/geminiFetch.js`) — error 503 `UNAVAILABLE` diulang dengan jeda bertambah.
2. **Model cadangan** (server) — kalau satu model tetap gagal, otomatis pindah ke model berikutnya.
3. **Pengulangan senyap** (browser) — kalau seluruh rantai penuh, halaman mencoba lagi hingga 2 kali sambil **melewati model yang tadi sibuk** (`skipModels`). Indikator "mengetik" / "AI sedang membaca" tetap berjalan, dan tidak ada pesan teknis yang muncul.

Pengguna hanya diberi tahu kalau seluruh usaha itu gagal — dan pesannya pakai bahasa biasa ("aku sedang menerima banyak pertanyaan"), bukan istilah teknis.

Yang **tidak** diulang: API key tidak valid, akses ditolak, dan kuota habis — mengulangnya hanya membuang kuota. Ketiganya justru ditampilkan sebagai panel teknis, karena itu masalah yang harus kamu perbaiki, bukan gangguan sesaat. Model yang dihentikan (404) langsung dilewati tanpa pengulangan.

Semuanya bisa diatur tanpa ubah kode, lewat `.env.local`:

```
GEMINI_MODEL=              # kosongkan untuk pakai default
GEMINI_FALLBACK_MODELS=    # kosongkan untuk pakai default
```

Daftar model aktif: [ai.google.dev/gemini-api/docs/deprecations](https://ai.google.dev/gemini-api/docs/deprecations).

### Kenapa tetap Gemini, bukan penyedia lain?

Panduan lomba mengizinkan OpenAI, Hugging Face, dan TensorFlow.js. Tapi untuk kebutuhan FiLUP — **membaca gambar struk** pada tier gratis — Gemini masih yang paling longgar: sekitar 1.500 permintaan/hari, dibanding OpenRouter yang hanya ~50/hari. OpenAI tidak punya tier gratis untuk API, sedangkan Groq, Mistral, dan Cerebras belum mendukung input gambar di tier gratisnya.

Karena itu redundansi dibangun di **tingkat model** (rantai di atas), bukan dengan menambah penyedia kedua yang justru lebih terbatas.

### Mode Demo (otomatis)

Aplikasi mendeteksi sendiri apakah kredensial Firebase sudah diisi:

| | Firebase belum diisi | Firebase sudah diisi |
|---|---|---|
| Status | **Mode Demo** (ada penanda kuning di aplikasi) | Mode Normal |
| Login | Form terisi otomatis, satu klik langsung masuk | Login sungguhan ke Firebase Auth |
| Halaman terproteksi | Bisa dibuka bebas (untuk presentasi) | Wajib login, kalau belum akan dialihkan ke `/login` |
| Data profil | Data contoh | Dari dokumen Firestore `users/{uid}` |
| Transaksi & misi | Data contoh, perubahan hanya di memori | Tersimpan di Firestore, sinkron real-time |
| XP & level | Ikut bertambah (biar bisa diperagakan) | Tersimpan permanen di Firestore |

Fitur AI juga punya perilaku serupa berdasarkan `GEMINI_API_KEY`:

| | `GEMINI_API_KEY` kosong | Sudah diisi |
|---|---|---|
| Scan struk | Muncul hasil simulasi + label kuning **"Hasil simulasi"** | Gambar benar-benar dikirim ke Gemini dan dibaca |
| Asisten AI | Jawaban contoh + label **"Jawaban simulasi"** | Jawaban asli dari Gemini, memakai konteks saldo & misi aktif |

Labelnya sengaja ditampilkan supaya tidak pernah ada kesan fitur AI sudah aktif padahal belum.

Artinya kamu bisa langsung `npm run dev` dan mendemokan seluruh tampilan tanpa menyiapkan apa pun.

## Tech Stack

- **Next.js** (App Router, JavaScript) — frontend & API routes dalam satu project
- **Tailwind CSS v4** — styling
- **Firebase** — Authentication (email/password) & Firestore (database)
- **Google Gemini API** — baca gambar struk (visi), asisten AI, & analisis keuangan
- **Hostinger (Business Web Hosting)** — hosting/deploy

Detail lengkap arsitektur, struktur data, alur integrasi AI, dan roadmap ada di dokumen `RANCANGAN_TEKNIS_FiLUP.md`.

## Menjalankan di Lokal

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## Struktur Folder Penting

```
src/app/                 halaman-halaman (landing, login, register, dashboard, scan, misi, asisten, riwayat, profil)
src/app/not-found.js     halaman 404 bertema
src/app/error.js         halaman galat tak terduga
src/app/manifest.js      manifest PWA (bisa dipasang ke layar utama HP)
src/app/robots.js        robots.txt — halaman berisi data pribadi ditutup dari mesin pencari
src/app/sitemap.js       sitemap.xml (hanya halaman publik)
src/app/api/             API routes (scan-receipt, chat, wawasan) — pemanggil Gemini API
src/components/          komponen reusable (AppShell, AuthLayout, Logo, Button, XPBar, MissionCard, TransactionRow, WawasanAI)
src/components/publik/   komponen khusus halaman publik (nav, footer, kartu tarot)
src/contexts/            AuthProvider (status login) & DataProvider (transaksi, misi, XP)
src/lib/analisis.js      SELURUH hitungan statistik keuangan (AI tidak pernah berhitung)
src/lib/db.js            operasi Firestore
src/lib/firebase.js      konfigurasi Firebase + deteksi mode demo
src/lib/gamification.js  aturan XP & level
src/lib/ranks.js         lima jenjang rank (Receh → Sultan)
src/lib/geminiFetch.js   pemanggil Gemini + pengulangan & model cadangan
src/lib/geminiError.js   penerjemah error Gemini ke bahasa Indonesia
src/lib/mockData.js      data contoh untuk mode demo (tanggalnya relatif hari ini)
firestore.rules          security rules Firestore
```

## Menghubungkan Backend (Firebase & Gemini)

1. Salin `.env.local.example` menjadi `.env.local`, lalu isi:
   - `NEXT_PUBLIC_FIREBASE_*` — didapat dari Firebase Console (Project Settings > General > Your apps).
   - `GEMINI_API_KEY` — didapat dari [aistudio.google.com/apikey](https://aistudio.google.com/apikey).
   - `NEXT_PUBLIC_SITE_URL` — alamat situs saat sudah online (tanpa garis miring
     di akhir). Wajib diisi saat deploy karena dipakai untuk tag Open Graph,
     `sitemap.xml`, dan `robots.txt`.
2. Di Firebase Console, aktifkan **Authentication** (metode Email/Password) dan **Firestore Database**.
3. Pasang security rules: buka Firestore → tab **Rules**, tempel isi file `firestore.rules` di project ini, klik **Publish**. Aturan ini memastikan setiap pengguna hanya bisa mengakses datanya sendiri.
4. Setelah itu login/daftar/keluar sudah langsung berfungsi — **tidak perlu ubah kode lagi**.

Setelah keempat langkah di atas, **seluruh fitur langsung aktif — tidak ada lagi kode yang perlu diubah.** Login, penyimpanan transaksi, misi, XP, level, dan streak semuanya sudah tersambung.

### Struktur data & gamifikasi

```
users/{uid}                      → name, email, level, xp, streakDays, lastActiveDate
users/{uid}/transactions/{id}    → merchant, amount, type, category, source, createdAt
users/{uid}/missions/{id}        → title, icon, targetAmount, currentAmount, deadline, status
```

- `src/lib/db.js` — semua operasi Firestore (langganan real-time, simpan, tambah XP, hitung streak)
- `src/contexts/DataProvider.js` — satu sumber data untuk semua halaman, sekaligus menangani mode demo. Semua halaman cukup memakai `useData()`
- `src/lib/gamification.js` — aturan XP: `xpToNextLevel(level) = 100 + level × 100`, dan `XP_REWARD` (catat transaksi +10, buat misi +5, selesaikan misi +50). Naik level bisa lebih dari satu tingkat sekaligus
- Saldo **tidak** disimpan sebagai angka tersendiri, melainkan dihitung dari total transaksi — supaya tidak pernah tidak sinkron

### Struktur Auth

- `src/lib/firebase.js` — inisialisasi Firebase + flag `isFirebaseConfigured`
- `src/contexts/AuthProvider.js` — state login global, hook `useAuth()`, pesan error berbahasa Indonesia
- `src/components/AppShell.js` — sekaligus penjaga halaman; setiap halaman yang dibungkus AppShell otomatis terproteksi
- `firestore.rules` — security rules Firestore
- Dokumen profil dibuat otomatis saat daftar: `users/{uid}` → `{ name, email, level: 1, xp: 0, streakDays: 0, createdAt }`

## Deploy

Lihat bagian "8. Deploy ke Hostinger" di `RANCANGAN_TEKNIS_FiLUP.md` untuk langkah lengkap deploy ke Hostinger Business Web Hosting (via Node.js App di hPanel).

## Tim

**STIBAJRA — SMK TI Bali Global Jimbaran**
Rafa Perfours Mita · Komang Tri Saguna Narya Ardana
