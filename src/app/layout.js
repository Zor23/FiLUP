import "./globals.css";
import { AuthProvider } from "@/contexts/AuthProvider";
import { DataProvider } from "@/contexts/DataProvider";
import { SosialProvider } from "@/contexts/SosialProvider";

// Font (Plus Jakarta Sans + JetBrains Mono + Bodoni Moda) di-import di
// globals.css lewat paket npm @fontsource-variable, jadi file font-nya
// tersimpan di dalam project — tidak butuh koneksi ke Google Fonts saat build
// maupun saat diakses pengguna.

// Alamat produksi dipakai untuk membentuk URL absolut pada tag Open Graph.
// Diatur lewat NEXT_PUBLIC_SITE_URL saat deploy; saat pengembangan jatuh ke
// localhost supaya tidak ada peringatan metadataBase dari Next.js.
const alamatSitus =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(alamatSitus),
  title: {
    default: "FiLUP — Finance Level Up",
    template: "%s — FiLUP",
  },
  description:
    "Asisten keuangan pelajar bergaya game berbasis kecerdasan buatan. Catat transaksi otomatis dari foto struk, selesaikan misi tabungan, naik level.",
  applicationName: "FiLUP",
  keywords: [
    "keuangan pelajar",
    "catat pengeluaran",
    "scan struk AI",
    "misi tabungan",
    "aplikasi keuangan gamifikasi",
    "Bali AI Tech Fest",
  ],
  authors: [{ name: "Tim STIBAJRA" }],
  creator: "Tim STIBAJRA — SMK TI Bali Global Jimbaran",
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "FiLUP",
    title: "FiLUP — Catat sekali, naik level seterusnya",
    description:
      "Aplikasi keuangan bergaya game untuk pelajar. Foto struknya, AI yang mencatat, kamu yang naik level.",
  },
  twitter: {
    card: "summary_large_image",
    title: "FiLUP — Catat sekali, naik level seterusnya",
    description:
      "Aplikasi keuangan bergaya game untuk pelajar. Foto struknya, AI yang mencatat.",
  },
  // Halaman aplikasi berisi data pribadi — jangan sampai terindeks.
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  themeColor: "#0a0710",
  colorScheme: "dark",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-filup-bg font-sans text-filup-text">
        <AuthProvider>
          <DataProvider>
            <SosialProvider>{children}</SosialProvider>
          </DataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
