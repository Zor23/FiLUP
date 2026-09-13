// Logo FiLUP — dipakai di seluruh aplikasi supaya konsisten.
//
// Sumber gambar: public/logo-filup.png (latar gelapnya sudah dihapus,
// jadi aman dipakai di atas latar apa pun).
//
// Titik pakai: navigasi publik, footer, sidebar aplikasi, layar tunggu,
// halaman masuk/daftar, dan favicon (src/app/icon.png).

import Image from "next/image";
import Link from "next/link";

/**
 * @param size      ukuran gambar logo dalam piksel
 * @param teks      tampilkan wordmark "FiLUP" di samping logo
 * @param serif     wordmark memakai serif Didone (untuk halaman publik)
 * @param href      kalau diisi, seluruh logo menjadi tautan
 */
export default function Logo({
  size = 32,
  teks = true,
  serif = false,
  href = null,
  className = "",
}) {
  const isi = (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <Image
        src="/logo-filup.png"
        alt="Logo FiLUP"
        width={size}
        height={size}
        priority
        className="shrink-0"
        // Tinggi dibiarkan "auto", bukan dikunci ke `size`. Aturan bawaan
        // Tailwind `img { max-width: 100% }` bisa mengecilkan lebarnya di
        // wadah yang sempit; kalau tingginya tetap, gambarnya menjadi gepeng
        // dan next/image memperingatkannya di konsol. Berkas sumbernya persegi
        // (512x512), jadi tinggi otomatis hasilnya sama persis.
        style={{ width: size, height: "auto" }}
      />
      {teks &&
        (serif ? (
          <span
            className="font-display tracking-tight"
            style={{ fontSize: size * 0.72 }}
          >
            FiLUP
          </span>
        ) : (
          <span
            className="font-extrabold tracking-tight"
            style={{ fontSize: size * 0.6 }}
          >
            Fi<span className="gradient-text">LUP</span>
          </span>
        ))}
    </span>
  );

  return href ? (
    <Link href={href} className="inline-flex">
      {isi}
    </Link>
  ) : (
    isi
  );
}
