// Memperkecil foto struk sebelum dikirim ke server.
//
// Alasannya: kamera HP sekarang menghasilkan foto 3–12 MB. Ukuran sebesar itu
// bermasalah di tiga tempat sekaligus —
//   1. unggahan lewat data seluler jadi lama (pengguna mengira aplikasi hang),
//   2. server/proxy hosting sering menolak body besar dengan error 413,
//   3. gambar diubah ke base64 sebelum dikirim ke Gemini, yang menambah ~33%.
//
// Struk hanya berisi teks hitam-putih, jadi lebar 1600px sudah lebih dari cukup
// untuk dibaca AI. Hasilnya biasanya turun dari ~8 MB menjadi ~300–500 KB tanpa
// mengurangi ketepatan pembacaan.

const LEBAR_MAKS = 1600;
const KUALITAS = 0.82;

/**
 * @param {File} file gambar asli dari input kamera/berkas
 * @returns {Promise<File>} versi yang sudah diperkecil; kalau proses gagal,
 *          file aslinya dikembalikan apa adanya supaya alur tidak putus.
 */
export async function kompresGambar(file) {
  // Berkas yang memang sudah kecil tidak perlu diproses ulang.
  if (!file || !file.type?.startsWith("image/") || file.size < 600 * 1024) {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);

    const skala = Math.min(1, LEBAR_MAKS / Math.max(bitmap.width, bitmap.height));
    const lebar = Math.round(bitmap.width * skala);
    const tinggi = Math.round(bitmap.height * skala);

    const kanvas = document.createElement("canvas");
    kanvas.width = lebar;
    kanvas.height = tinggi;

    const konteks = kanvas.getContext("2d");
    konteks.drawImage(bitmap, 0, 0, lebar, tinggi);
    bitmap.close?.();

    const blob = await new Promise((selesai) =>
      kanvas.toBlob(selesai, "image/jpeg", KUALITAS)
    );
    if (!blob) return file;

    // Kalau hasilnya justru lebih besar (jarang, tapi mungkin pada gambar
    // kecil beresolusi tinggi), pakai yang asli saja.
    if (blob.size >= file.size) return file;

    return new File([blob], "struk.jpg", {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } catch {
    // Browser lama tanpa createImageBitmap / canvas terbatas — jangan sampai
    // pengguna tidak bisa scan sama sekali hanya karena kompresi gagal.
    return file;
  }
}
