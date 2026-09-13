// Aturan perayap mesin pencari.
//
// Hanya tiga halaman publik yang boleh diindeks. Halaman aplikasi berisi
// catatan keuangan pribadi, dan halaman masuk/daftar tidak berguna di hasil
// pencarian — keduanya ditutup. Route API juga ditutup.

const alamatSitus =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/dashboard",
        "/scan",
        "/misi",
        "/asisten",
        "/riwayat",
        "/profil",
        "/login",
        "/register",
      ],
    },
    sitemap: `${alamatSitus}/sitemap.xml`,
  };
}
