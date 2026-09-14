<div align="center">
FiLUP — Finance Level Up

Aplikasi web keuangan bergaya game untuk pelajar. Foto struknya, AI yang mencatat, kamu yang naik level.

Karya Tim STIBAJRA — SMK TI Bali Global Jimbaran untuk Bali AI Tech Fest 2026 · AI Web Innovation Challenge

Demo langsung · Cara kerja · Tentang

</div>
Masalah

Menurut SNLIK 2026 (OJK), tingkat literasi keuangan nasional berada di 69,57%, tetapi kelompok pelajar dan mahasiswa hanya 62,72% — di bawah rata-rata nasional.

Akar masalahnya bukan kemalasan. Kami mencobanya sendiri: buku catatan, aplikasi keuangan untuk orang dewasa, catatan di HP — semuanya berhenti di minggu kedua. Dua hambatannya selalu sama:

Mencatat itu merepotkan. Mengetik nominal, memilih kategori, mengulang setiap kali jajan.
Mencatat tidak ada hadiahnya. Hasilnya cuma daftar angka yang tidak memberi rasa maju.
Solusi

FiLUP menghapus kedua hambatan itu sekaligus.

Foto struknya, AI yang mengetik. Struk belanja atau bukti transfer difoto langsung dari kamera HP. Gemini membaca nama toko, nominal, dan kategorinya, lalu menyodorkan formulir yang sudah terisi — pengguna tinggal memeriksa dan menyimpan.

Setiap catatan memberi XP. Naik level, naik rank, buka lencana, kejar misi tabungan untuk barang impian. Kebiasaan baik jadi terasa seperti naik level, bukan seperti tugas.

Tautan: https://filup.jokuster.com

<!-- ISI: tambahkan 3 tangkapan layar di sini setelah deploy, mis. ![Beranda](docs/beranda.png) ![Dashboard](docs/dashboard.png) ![Scan struk](docs/scan.png) -->
Fitur

Pencatatan otomatis dari foto Scan struk atau bukti transfer m-banking. Gambar dikompresi di browser sebelum dikirim supaya tetap cepat di data seluler.

Misi tabungan Buat target untuk barang impian lengkap dengan nominal dan tenggat. Progres dan sisa hari terlihat, dan aplikasi menghitung berapa yang harus disisihkan per minggu.

Misi bersama Menabung patungan bersama teman — untuk kado, acara kelas, atau barang yang dipakai bersama. Setiap anggota melihat kontribusi masing-masing.

Teman lewat kode unik Setiap pengguna punya kode enam karakter. Tidak ada pencarian berdasarkan nama atau email, jadi tidak ada orang asing yang bisa menemukanmu.

Asisten AI Bertanya soal kondisi keuangan sendiri dan mendapat jawaban yang memakai saldo dan misi yang sebenarnya, bukan jawaban umum.

Wawasan AI Analisis pola pengeluaran mingguan, plus satu saran misi tabungan yang realistis dibanding saldo pengguna.

Kuis harian Satu pertanyaan literasi keuangan per hari. Menjawab saja sudah dapat XP — tujuannya belajar, bukan ujian.

Level, rank, dan lencana XP dari mencatat (10), menyelesaikan misi (50), kuis benar (15), dan menabung bersama (5). Lima tingkat rank bertema uang jajan: Receh → Celengan → Dompet Tebal → Brankas → Sultan. Lencana dihitung dari data nyata, bukan daftar tetap.

Bisa dipasang di layar utama Sudah berupa PWA — bisa ditambahkan ke home screen HP dan dibuka tanpa bilah alamat.

Implementasi AI

FiLUP memakai Google Gemini di tiga tempat, masing-masing lewat API route Next.js di sisi server sehingga API key tidak pernah sampai ke browser.

Route	Fungsi	Masukan
POST /api/scan-receipt	Membaca gambar struk (visi) → JSON berisi merchant, nominal, kategori, jenis	Gambar
POST /api/chat	Asisten keuangan percakapan	Pesan + saldo & misi aktif
POST /api/wawasan	Analisis pola pengeluaran + saran misi	Statistik yang sudah dihitung aplikasi

Empat keputusan teknis yang kami anggap penting:

1. AI membaca, manusia memutuskan. Hasil pembacaan struk tidak pernah langsung disimpan. Selalu ditampilkan sebagai formulir yang bisa dikoreksi lebih dulu. AI di sini mempercepat pengetikan, bukan mengambil alih pencatatan keuangan seseorang.
=======

# FiLUP — Finance Level Up

**Aplikasi web keuangan bergaya game untuk pelajar. Foto struknya, AI yang mencatat, kamu yang naik level.**

Karya **Tim STIBAJRA** — SMK TI Bali Global Jimbaran
untuk **Bali AI Tech Fest 2026 · AI Web Innovation Challenge**

[Coba langsung](https://filup.jokuster.com) · [Cara kerja]([https://ISI-DOMAIN-KAMU/cara-kerja](https://filup.jokuster.com/cara-kerja)) · [Tentang](https://filup.jokuster.com/tentang)

</div>

---

## Masalah

Menurut **SNLIK 2026 (OJK)**, tingkat literasi keuangan nasional berada di **69,57%**, tetapi kelompok **pelajar dan mahasiswa hanya 62,72%** — di bawah rata-rata nasional.

Akar masalahnya bukan kemalasan. Kami mencobanya sendiri: buku catatan, aplikasi keuangan untuk orang dewasa, catatan di HP — semuanya berhenti di minggu kedua. Dua hambatannya selalu sama:

1. **Mencatat itu merepotkan.** Mengetik nominal, memilih kategori, mengulang setiap kali jajan.
2. **Mencatat tidak ada hadiahnya.** Hasilnya cuma daftar angka yang tidak memberi rasa maju.

## Solusi

FiLUP menghapus kedua hambatan itu sekaligus.

**Foto struknya, AI yang mengetik.** Struk belanja atau bukti transfer difoto langsung dari kamera HP. Gemini membaca nama toko, nominal, dan kategorinya, lalu menyodorkan formulir yang sudah terisi — pengguna tinggal memeriksa dan menyimpan.

**Setiap catatan memberi XP.** Naik level, naik rank, buka lencana, kejar misi tabungan untuk barang impian. Kebiasaan baik jadi terasa seperti naik level, bukan seperti tugas.

---

## Fitur

**Pencatatan otomatis dari foto**
Scan struk atau bukti transfer m-banking. Gambar dikompresi di browser sebelum dikirim supaya tetap cepat di data seluler.

**Misi tabungan**
Buat target untuk barang impian lengkap dengan nominal dan tenggat. Progres dan sisa hari terlihat, dan aplikasi menghitung berapa yang harus disisihkan per minggu.

**Misi bersama**
Menabung patungan bersama teman — untuk kado, acara kelas, atau barang yang dipakai bersama. Setiap anggota melihat kontribusi masing-masing.

**Teman lewat kode unik**
Setiap pengguna punya kode enam karakter. Tidak ada pencarian berdasarkan nama atau email, jadi tidak ada orang asing yang bisa menemukanmu.

**Asisten AI**
Bertanya soal kondisi keuangan sendiri dan mendapat jawaban yang memakai saldo dan misi yang sebenarnya, bukan jawaban umum.

**Wawasan AI**
Analisis pola pengeluaran mingguan, plus satu saran misi tabungan yang realistis dibanding saldo pengguna.

**Kuis harian**
Satu pertanyaan literasi keuangan per hari. Menjawab saja sudah dapat XP — tujuannya belajar, bukan ujian.

**Level, rank, dan lencana**
XP dari mencatat (10), menyelesaikan misi (50), kuis benar (15), dan menabung bersama (5). Lima tingkat rank bertema uang jajan: **Receh → Celengan → Dompet Tebal → Brankas → Sultan**. Lencana dihitung dari data nyata, bukan daftar tetap.

**Bisa dipasang di layar utama**
Sudah berupa PWA — bisa ditambahkan ke home screen HP dan dibuka tanpa bilah alamat.

---

## Implementasi AI

FiLUP memakai **Google Gemini** di tiga tempat, masing-masing lewat API route Next.js di sisi server sehingga API key tidak pernah sampai ke browser.

| Route | Fungsi | Masukan |
|---|---|---|
| `POST /api/scan-receipt` | Membaca gambar struk (visi) → JSON berisi merchant, nominal, kategori, jenis | Gambar |
| `POST /api/chat` | Asisten keuangan percakapan | Pesan + saldo & misi aktif |
| `POST /api/wawasan` | Analisis pola pengeluaran + saran misi | Statistik yang sudah dihitung aplikasi |

Empat keputusan teknis yang kami anggap penting:

**1. AI membaca, manusia memutuskan.**
Hasil pembacaan struk tidak pernah langsung disimpan. Selalu ditampilkan sebagai formulir yang bisa dikoreksi lebih dulu. AI di sini mempercepat pengetikan, bukan mengambil alih pencatatan keuangan seseorang.

**2. AI tidak pernah menghitung angka.**
Ini yang membedakan halaman Wawasan dari sekadar menempelkan chatbot. Seluruh angka — total pemasukan, pengeluaran per kategori, rata-rata harian — dihitung aplikasi secara deterministik di `src/lib/analisis.js`. Gemini hanya menerima fakta yang sudah jadi, dengan instruksi tegas untuk **menyalin nominal persis dan dilarang menghitung ulang**. Model bahasa tidak bisa diandalkan untuk aritmetika, dan angka keuangan yang salah lebih berbahaya daripada tidak ada angka sama sekali.

**3. Rantai model cadangan, tanpa mengganggu pengguna.**
Kalau Gemini menjawab 503 karena sedang ramai, permintaan diulang dengan jeda bertambah, lalu otomatis berpindah ke model berikutnya: `gemini-3.7-flash → 3.6-flash → 3.5-flash → 3.5-flash-lite`. Indikator "AI sedang membaca" tetap berjalan — pengguna tidak pernah melihat pesan teknis soal model sibuk. Masalah yang memang tidak bisa diperbaiki dengan mengulang (API key salah, kuota habis) langsung dilaporkan apa adanya. Lihat `src/lib/geminiFetch.js`.

**4. Label kejujuran.**
Kalau `GEMINI_API_KEY` belum diisi, hasil scan dan jawaban chat diberi label kuning **"Hasil simulasi"**. Fitur AI tidak pernah dibuat terlihat aktif padahal belum.

---
>>>>>>> Stashed changes

2. AI tidak pernah menghitung angka. Ini yang membedakan halaman Wawasan dari sekadar menempelkan chatbot. Seluruh angka — total pemasukan, pengeluaran per kategori, rata-rata harian — dihitung aplikasi secara deterministik di src/lib/analisis.js. Gemini hanya menerima fakta yang sudah jadi, dengan instruksi tegas untuk menyalin nominal persis dan dilarang menghitung ulang. Model bahasa tidak bisa diandalkan untuk aritmetika, dan angka keuangan yang salah lebih berbahaya daripada tidak ada angka sama sekali.

<<<<<<< Updated upstream
3. Rantai model cadangan, tanpa mengganggu pengguna. Kalau Gemini menjawab 503 karena sedang ramai, permintaan diulang dengan jeda bertambah, lalu otomatis berpindah ke model berikutnya: gemini-3.7-flash → 3.6-flash → 3.5-flash → 3.5-flash-lite. Indikator "AI sedang membaca" tetap berjalan — pengguna tidak pernah melihat pesan teknis soal model sibuk. Masalah yang memang tidak bisa diperbaiki dengan mengulang (API key salah, kuota habis) langsung dilaporkan apa adanya. Lihat src/lib/geminiFetch.js.

4. Label kejujuran. Kalau GEMINI_API_KEY belum diisi, hasil scan dan jawaban chat diberi label kuning "Hasil simulasi". Fitur AI tidak pernah dibuat terlihat aktif padahal belum.

Tech Stack
Bagian	Pilihan
Framework	Next.js 16 (App Router, JavaScript)
Styling	Tailwind CSS v4
Autentikasi	Firebase Authentication (email/password)
Database	Cloud Firestore
AI	Google Gemini API
Hosting	Hostinger Business (Node.js App)

Font (Plus Jakarta Sans, JetBrains Mono, Bodoni Moda) dipasang lewat paket npm @fontsource-variable/*, bukan next/font/google — supaya build tidak bergantung pada akses ke server Google Fonts dan halaman tidak memanggil domain pihak ketiga saat dibuka.

Menjalankan di lokal
bash
=======
| Bagian | Pilihan |
|---|---|
| Framework | Next.js 16 (App Router, JavaScript) |
| Styling | Tailwind CSS v4 |
| Autentikasi | Firebase Authentication (email/password) |
| Database | Cloud Firestore |
| AI | Google Gemini API |
| Hosting | Hostinger Business (Node.js App) |

Font (Plus Jakarta Sans, JetBrains Mono, Bodoni Moda) dipasang lewat paket npm `@fontsource-variable/*`, **bukan** `next/font/google` — supaya build tidak bergantung pada akses ke server Google Fonts dan halaman tidak memanggil domain pihak ketiga saat dibuka.

---

## Menjalankan di lokal

```bash
>>>>>>> Stashed changes
git clone https://github.com/Zor23/FiLUP.git
cd FiLUP
npm install
npm run dev

Buka http://localhost:3000.

<<<<<<< Updated upstream
Tanpa konfigurasi apa pun, aplikasi langsung jalan dalam mode demo memakai data contoh dari src/lib/mockData.js — halaman terproteksi bisa dibuka, form login terisi otomatis, dan hasil AI diganti contoh berlabel "simulasi". Ini disengaja supaya aplikasi tetap bisa diperagakan walau konfigurasi atau internet bermasalah.

Untuk menjalankan dengan backend sungguhan, salin .env.local.example menjadi .env.local lalu isi nilainya.

Environment variables
Variabel	Wajib	Keterangan
NEXT_PUBLIC_SITE_URL	untuk produksi	Alamat situs tanpa garis miring di akhir. Dipakai untuk Open Graph, sitemap.xml, dan robots.txt
NEXT_PUBLIC_FIREBASE_API_KEY	ya	Firebase Console → Project Settings → SDK setup
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN	ya	
NEXT_PUBLIC_FIREBASE_PROJECT_ID	ya	
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET	ya	
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID	ya	
NEXT_PUBLIC_FIREBASE_APP_ID	ya	
GEMINI_API_KEY	ya	https://aistudio.google.com/apikey — tanpa awalan NEXT_PUBLIC_, hanya dipakai di server
GEMINI_MODEL	tidak	Default gemini-3.7-flash
GEMINI_FALLBACK_MODELS	tidak	Dipisah koma. Model bisa diganti tanpa mengubah kode kalau Google menghentikannya

Variabel berawalan NEXT_PUBLIC_ ditanam saat build, bukan dibaca saat aplikasi berjalan — jadi isi dulu, baru jalankan npm run build.

Struktur folder
src/app/                     halaman (App Router)
  page.js                    beranda publik
  tentang/  cara-kerja/      halaman publik
  dashboard/  scan/  misi/   halaman aplikasi
  asisten/  riwayat/  profil/
  kuis/  teman/              kuis harian & sosial
  api/scan-receipt/          OCR struk via Gemini
  api/chat/                  asisten AI via Gemini
  api/wawasan/               analisis keuangan via Gemini

src/components/              komponen antarmuka
  publik/                    khusus halaman publik (kartu tarot, navigasi, footer)

src/contexts/
  AuthProvider.js            status login, profil, XP
  DataProvider.js            transaksi, misi, saldo
  SosialProvider.js          teman & misi bersama

src/lib/
  firebase.js                init Firebase + flag isFirebaseConfigured
  db.js                      operasi Firestore
  analisis.js                perhitungan statistik keuangan (deterministik)
  gamification.js            aturan XP & level
  ranks.js                   sistem rank
  kuisHarian.js              bank soal kuis
  geminiFetch.js             pemanggil Gemini + pengulangan + model cadangan
  geminiError.js             penerjemah error Gemini ke bahasa Indonesia
  kompresGambar.js           memperkecil foto struk sebelum diunggah
  mockData.js                data contoh untuk mode demo

firestore.rules              security rules — harus di-publish manual di Console
server.js                    titik masuk untuk Hostinger Node.js App

Halaman tidak pernah memanggil Firestore langsung — selalu lewat useData(), useAuth(), atau useSosial(), supaya mode demo tetap berfungsi.
=======
**Tanpa konfigurasi apa pun, aplikasi langsung jalan dalam mode demo** memakai data contoh dari `src/lib/mockData.js` — halaman terproteksi bisa dibuka, form login terisi otomatis, dan hasil AI diganti contoh berlabel "simulasi". Ini disengaja supaya aplikasi tetap bisa diperagakan walau konfigurasi atau internet bermasalah.

Untuk menjalankan dengan backend sungguhan, salin `.env.local.example` menjadi `.env.local` lalu isi nilainya.

### Environment variables

| Variabel | Wajib | Keterangan |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | untuk produksi | Alamat situs tanpa garis miring di akhir. Dipakai untuk Open Graph, `sitemap.xml`, dan `robots.txt` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | ya | Firebase Console → Project Settings → SDK setup |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | ya | |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | ya | |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | ya | |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | ya | |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | ya | |
| `GEMINI_API_KEY` | ya | https://aistudio.google.com/apikey — **tanpa** awalan `NEXT_PUBLIC_`, hanya dipakai di server |
| `GEMINI_MODEL` | tidak | Default `gemini-3.7-flash` |
| `GEMINI_FALLBACK_MODELS` | tidak | Dipisah koma. Model bisa diganti tanpa mengubah kode kalau Google menghentikannya |

Variabel berawalan `NEXT_PUBLIC_` **ditanam saat build**, bukan dibaca saat aplikasi berjalan — jadi isi dulu, baru jalankan `npm run build`.

---

## Struktur folder

```
src/app/                     halaman (App Router)
  page.js                    beranda publik
  tentang/  cara-kerja/      halaman publik
  dashboard/  scan/  misi/   halaman aplikasi
  asisten/  riwayat/  profil/
  kuis/  teman/              kuis harian & sosial
  api/scan-receipt/          OCR struk via Gemini
  api/chat/                  asisten AI via Gemini
  api/wawasan/               analisis keuangan via Gemini

src/components/              komponen antarmuka
  publik/                    khusus halaman publik (kartu tarot, navigasi, footer)

src/contexts/
  AuthProvider.js            status login, profil, XP
  DataProvider.js            transaksi, misi, saldo
  SosialProvider.js          teman & misi bersama

src/lib/
  firebase.js                init Firebase + flag isFirebaseConfigured
  db.js                      operasi Firestore
  analisis.js                perhitungan statistik keuangan (deterministik)
  gamification.js            aturan XP & level
  ranks.js                   sistem rank
  kuisHarian.js              bank soal kuis
  geminiFetch.js             pemanggil Gemini + pengulangan + model cadangan
  geminiError.js             penerjemah error Gemini ke bahasa Indonesia
  kompresGambar.js           memperkecil foto struk sebelum diunggah
  mockData.js                data contoh untuk mode demo

firestore.rules              security rules — harus di-publish manual di Console
server.js                    titik masuk untuk Hostinger Node.js App
```

Halaman tidak pernah memanggil Firestore langsung — selalu lewat `useData()`, `useAuth()`, atau `useSosial()`, supaya mode demo tetap berfungsi.

---

## Keamanan data

Aturan akses ada di `firestore.rules` dan **harus ditempel manual** di Firebase Console → Firestore → tab Rules → Publish.

- Catatan keuangan (`users/{uid}/...`) hanya bisa dibaca dan ditulis pemiliknya
- Yang bisa dilihat pengguna lain hanya profil publik: nama, level, dan kode teman
- Kode teman hanya bisa dibuat sekali dan tidak bisa diubah, jadi kode orang lain tidak bisa dibajak
- Pada misi bersama, setiap anggota hanya bisa **menambah** kontribusinya sendiri — tidak bisa menguranginya, dan tidak bisa menyentuh milik anggota lain
- Segala akses di luar aturan di atas ditolak

Saldo sengaja **tidak disimpan** sebagai field, melainkan selalu dihitung ulang dari daftar transaksi — sehingga tidak pernah ada angka saldo yang tidak cocok dengan riwayatnya.

---
>>>>>>> Stashed changes

Keamanan data

<<<<<<< Updated upstream
Aturan akses ada di firestore.rules dan harus ditempel manual di Firebase Console → Firestore → tab Rules → Publish.

Catatan keuangan (users/{uid}/...) hanya bisa dibaca dan ditulis pemiliknya
Yang bisa dilihat pengguna lain hanya profil publik: nama, level, dan kode teman
Kode teman hanya bisa dibuat sekali dan tidak bisa diubah, jadi kode orang lain tidak bisa dibajak
Pada misi bersama, setiap anggota hanya bisa menambah kontribusinya sendiri — tidak bisa menguranginya, dan tidak bisa menyentuh milik anggota lain
Segala akses di luar aturan di atas ditolak

Saldo sengaja tidak disimpan sebagai field, melainkan selalu dihitung ulang dari daftar transaksi — sehingga tidak pernah ada angka saldo yang tidak cocok dengan riwayatnya.

Deploy

Aplikasi ini dijalankan di Hostinger Business Web Hosting lewat fitur Node.js App di hPanel.

hPanel → Website → Node.js → Create Application
Node.js versi 22, Application startup file: server.js
Hubungkan ke repository ini lewat opsi Git
Isi seluruh Environment Variables terlebih dahulu (lihat tabel di atas)
Jalankan Install Dependencies, lalu Run NPM Build
Restart Application
Tambahkan domain ke Firebase Console → Authentication → Settings → Authorized domains

Langkah 4 harus dilakukan sebelum langkah 5. Kalau terbalik, konfigurasi Firebase kosong di hasil build dan aplikasi akan berjalan dalam mode demo di produksi.

Tim STIBAJRA

SMK TI Bali Global Jimbaran

Nama	Peran
Rafa Perfours Mita	Pengembangan aplikasi & integrasi AI
Komang Tri Saguna Narya Ardana	Desain & pengalaman pengguna

Dibuat untuk Bali AI Tech Fest 2026, kategori AI Web Innovation Challenge — "Create Smart Web Solutions with AI for Indonesia's Future".
=======
Aplikasi ini dijalankan di **Hostinger Business Web Hosting** lewat fitur Node.js App di hPanel.

1. hPanel → **Website → Node.js → Create Application**
2. Node.js versi 22, **Application startup file: `server.js`**
3. Hubungkan ke repository ini lewat opsi Git
4. **Isi seluruh Environment Variables terlebih dahulu** (lihat tabel di atas)
5. Jalankan **Install Dependencies**, lalu **Run NPM Build**
6. **Restart Application**
7. Tambahkan domain ke Firebase Console → Authentication → Settings → Authorized domains

Langkah 4 harus dilakukan sebelum langkah 5. Kalau terbalik, konfigurasi Firebase kosong di hasil build dan aplikasi akan berjalan dalam mode demo di produksi.

---

## Tim STIBAJRA

**SMK TI Bali Global Jimbaran**

| Nama | Peran |
|---|---|
| Rafa Perfours Mita | Pengembangan aplikasi & integrasi AI |
| Komang Tri Saguna Narya Ardana | Desain & pengalaman pengguna |

Dibuat untuk **Bali AI Tech Fest 2026**, kategori AI Web Innovation Challenge —
*"Create Smart Web Solutions with AI for Indonesia's Future"*.
>>>>>>> Stashed changes
