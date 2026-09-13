// Peta situs — hanya memuat halaman publik, sejalan dengan robots.js.

const alamatSitus =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function sitemap() {
  const diperbarui = new Date();

  return [
    {
      url: `${alamatSitus}/`,
      lastModified: diperbarui,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${alamatSitus}/cara-kerja`,
      lastModified: diperbarui,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${alamatSitus}/tentang`,
      lastModified: diperbarui,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}
