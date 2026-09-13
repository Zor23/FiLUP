// Mockup HP di hero beranda: tampilan dashboard FiLUP versi HP.
//
// Ini ILUSTRASI statis, bukan komponen dashboard sungguhan: beranda adalah
// halaman publik yang di-prerender, jadi tidak boleh bergantung pada data
// pengguna atau jam peramban. Tidak ada tanggal di dalamnya karena alasan
// yang sama.
//
// Angkanya tetap harus masuk akal — pengunjung yang teliti akan menjumlahkan:
// saldo Rp75.000 = masuk Rp200.000 − keluar Rp125.000, dan misi 60% =
// Rp270.000 dari Rp450.000 (sisa Rp180.000). Sama dengan data mode demo, jadi
// yang dilihat di sini sama dengan yang ditemui juri setelah masuk.
//
// Seluruh isinya disembunyikan dari pembaca layar; yang dibacakan hanya satu
// kalimat ringkasan di aria-label.
//
// Tampil sebagai HP 3D yang DIAM dengan layar menghadap ke kiri — ke arah
// judul di sebelahnya. Susunannya:
//   .ponsel-panggung  memberi perspektif (kedalaman)
//   .ponsel           badan HP yang diputar rotateY negatif
//   .ponsel-sisi      sisi kanan HP (ketebalan), diputar 90° ke belakang
//   .ponsel-kilap     pantulan cahaya tipis di atas layar
//   .ponsel-bayang    bayangan di "lantai", tidak ikut diputar

import Emblem from "@/components/Emblem";

const AKSI = [
  { icon: "scan", label: "Scan" },
  { icon: "misi", label: "Misi" },
  { icon: "asisten", label: "Tanya AI" },
  { icon: "riwayat", label: "Riwayat" },
];

const AKTIVITAS = [
  { icon: "jajan", nama: "Indomaret", ket: "Jajan · 10.24", nominal: "−Rp18.000", masuk: false },
  { icon: "uangSaku", nama: "Uang saku", ket: "Uang Saku · 06.30", nominal: "+Rp50.000", masuk: true },
  { icon: "makanan", nama: "Warung Bu Sri", ket: "Makanan · kemarin", nominal: "−Rp15.000", masuk: false },
];

const NAV = ["beranda", "misi", null, "asisten", "profil"];

export default function PonselDashboard({ className = "" }) {
  return (
    <div
      role="img"
      aria-label="Contoh tampilan dashboard FiLUP di HP: saldo Rp75.000, misi Sepatu Basket Baru sudah 60 persen, dan daftar aktivitas terbaru."
      className={`ponsel-panggung relative ${className}`}
    >
      <span aria-hidden="true" className="ponsel-bayang" />
      <div aria-hidden="true" className="ponsel relative w-[272px] sm:w-[292px]">
        <span className="ponsel-sisi" />
      <div className="ponsel-layar">
        {/* status bar + pulau kamera */}
        <div className="relative flex items-center justify-between px-6 pt-3 text-[10px] font-semibold text-white/85">
          <span>09.41</span>
          <span className="absolute left-1/2 top-2.5 h-[18px] w-[76px] -translate-x-1/2 rounded-full bg-black" />
          <span className="flex items-center gap-1">
            <span className="flex items-end gap-[1.5px]">
              {[4, 6, 8, 10].map((h) => (
                <span key={h} className="w-[2.5px] rounded-sm bg-white/85" style={{ height: h }} />
              ))}
            </span>
            <span className="ml-1 h-[9px] w-[18px] rounded-[3px] border border-white/70 p-[1.5px]">
              <span className="block h-full w-3/4 rounded-[1px] bg-white/85" />
            </span>
          </span>
        </div>

        <div className="px-3.5 pt-4">
          {/* kepala */}
          <div className="flex items-center justify-between">
            <span className="avatar-inisial flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold">
              R
            </span>
            <span className="text-center leading-tight">
              <span className="block text-[9px] text-filup-muted">Halo,</span>
              <span className="block text-[12px] font-bold">Rafa</span>
            </span>
            <span className="flex h-8 items-center gap-0.5 rounded-full bg-white/[0.08] px-2 text-[10px] font-bold text-filup-xp ring-1 ring-inset ring-white/10">
              <Emblem nama="beruntun" size={11} />6
            </span>
          </div>

          {/* kartu saldo */}
          <div className="kartu-saldo mt-3 px-3 pb-3 pt-4 text-center" style={{ borderRadius: "1.25rem" }}>
            <p className="text-[9px] font-medium text-[#5a4f78]">Saldo kamu</p>
            <p className="mt-1 text-[24px] font-bold leading-none tracking-tight text-[#1a1233]">
              <span className="text-[#8a80ad]">Rp</span>75.000
            </p>
            <p className="mt-1.5 flex justify-center gap-2 text-[8.5px] font-semibold">
              <span className="text-emerald-800">+Rp200.000</span>
              <span className="text-red-700">−Rp125.000</span>
            </p>
            <div className="mt-3 grid grid-cols-4">
              {AKSI.map((a) => (
                <span key={a.label} className="flex flex-col items-center gap-1">
                  <span className="tombol-bulat" style={{ height: "2.2rem", width: "2.2rem" }}>
                    <Emblem nama={a.icon} size={14} />
                  </span>
                  <span className="text-[8px] font-semibold text-[#2a1f55]">{a.label}</span>
                </span>
              ))}
            </div>
          </div>

          {/* misi aktif */}
          <div className="mt-3.5 flex items-center justify-between">
            <span className="text-[11px] font-bold">Misi aktif</span>
            <span className="text-[9px] text-filup-muted">Lihat semua</span>
          </div>
          <div className="kartu-misi-geser mt-2 flex items-center gap-2.5 p-2.5" style={{ borderRadius: "1rem" }}>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-filup-lavender text-[#2a1f55]">
              <Emblem nama="sepatu" size={15} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex justify-between text-[10px] font-bold">
                Sepatu Basket Baru <span>60%</span>
              </span>
              <span className="block text-[8.5px] text-filup-muted">Sisa Rp180.000 · 24 hari</span>
              <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-white/10">
                <span className="progress-fill block h-full w-[60%] rounded-full" />
              </span>
            </span>
          </div>
        </div>

        {/* lembar aktivitas */}
        <div className="lembar mt-3.5 px-3.5 pb-16 pt-2" style={{ borderRadius: "1.25rem 1.25rem 0 0" }}>
          <span className="mx-auto block h-[3px] w-7 rounded-full bg-white/15" />
          <p className="mt-2 text-[11px] font-bold">Aktivitas terbaru</p>
          <ul className="mt-1">
            {AKTIVITAS.map((t) => (
              <li key={t.nama} className="flex items-center gap-2 border-b border-white/[0.06] py-2 last:border-0">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.07] ${
                    t.masuk ? "text-filup-green" : "text-filup-accent"
                  }`}
                >
                  <Emblem nama={t.icon} size={13} />
                </span>
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="block truncate text-[10px] font-semibold">{t.nama}</span>
                  <span className="block text-[8.5px] text-filup-muted">{t.ket}</span>
                </span>
                <span className={`text-[10px] font-semibold ${t.masuk ? "text-filup-green" : "text-filup-red"}`}>
                  {t.nominal}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* navigasi bawah */}
        <div className="absolute inset-x-0 bottom-0 grid grid-cols-5 items-end border-t border-white/[0.08] bg-[#120c1f]/95 px-2 pb-2.5 pt-1.5">
          {NAV.map((n, i) =>
            n === null ? (
              <span key="scan" className="flex justify-center">
                <span className="fab-scan -translate-y-3 flex items-center justify-center" style={{ height: "2.5rem", width: "2.5rem", boxShadow: "0 0 0 3px #120c1f, 0 8px 18px -6px rgba(91,95,240,.85)" }}>
                  <Emblem nama="scan" size={16} />
                </span>
              </span>
            ) : (
              <span key={n} className={`flex justify-center ${i === 0 ? "text-filup-periwinkle" : "text-filup-muted"}`}>
                <Emblem nama={n} size={15} />
              </span>
            )
          )}
        </div>

        {/* pantulan cahaya — di atas seluruh isi layar */}
        <span className="ponsel-kilap" />
      </div>
      </div>
    </div>
  );
}
