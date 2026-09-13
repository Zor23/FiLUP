// Manifest PWA — membuat FiLUP bisa dipasang ke layar utama HP dan terbuka
// tanpa bilah alamat browser. Penting karena sasaran penggunanya adalah pelajar
// yang mencatat lewat HP, sering sambil berdiri di depan kasir.

export default function manifest() {
  return {
    name: "FiLUP — Finance Level Up",
    short_name: "FiLUP",
    description:
      "Aplikasi keuangan bergaya game untuk pelajar. Foto struknya, AI yang mencatat, kamu yang naik level.",
    lang: "id",
    dir: "ltr",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0a0710",
    theme_color: "#0a0710",
    categories: ["finance", "education", "productivity"],
    icons: [
      {
        src: "/ikon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/ikon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/ikon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Scan struk",
        short_name: "Scan",
        description: "Langsung foto struk untuk dicatat AI",
        url: "/scan",
      },
      {
        name: "Misi tabungan",
        short_name: "Misi",
        description: "Lihat progres misi tabunganmu",
        url: "/misi",
      },
    ],
  };
}
