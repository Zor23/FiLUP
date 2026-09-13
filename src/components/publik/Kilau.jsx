// Ornamen bintang FiLUP.
//
// - Kilau4      bintang empat sudut bersisi cekung — penanda kecil di kartu tarot.
// - RasiTegak   gugus memanjang: pusaran, garis bertitik, bola kecil, dan
//               bintang bersinar panjang. Untuk tepi kiri/kanan halaman.
// - RasiSudut   gugus kecil untuk sudut kotak atau sisi elemen.
// - RasiPita    pemisah mendatar: garis bertitik dengan bintang di tengah.
//
// Gayanya mengikuti referensi sketsa bintang-dan-pusaran bergaris tipis, tapi
// komposisinya digambar sendiri. Semuanya:
//   - DIAM. Tidak ada animasi yang berulang — gerak tanpa henti di belakang
//     angka mengganggu fokus, dan WCAG 2.2.2 meminta gerak otomatis lebih dari
//     lima detik bisa dihentikan.
//   - Hiasan murni: aria-hidden, pointer-events-none, warna lewat currentColor.
//   - Hanya dipakai di halaman publik dan panel masuk/daftar, TIDAK di halaman
//     aplikasi — di sana angka tidak boleh punya saingan.
//   - Koordinatnya ditulis tetap, tidak acak (nilai acak = hydration mismatch).

const GARIS = {
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

/** Bintang empat sudut dengan sisi cekung. */
export function Kilau4({ size = 16, className = "", opacity = 1, tebal = 0 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      style={{ opacity }}
    >
      <path
        d="M12 0 C12.6 7.4 16.6 11.4 24 12 C16.6 12.6 12.6 16.6 12 24 C11.4 16.6 7.4 12.6 0 12 C7.4 11.4 11.4 7.4 12 0 Z"
        fill={tebal ? "none" : "currentColor"}
        stroke={tebal ? "currentColor" : "none"}
        strokeWidth={tebal}
      />
    </svg>
  );
}

/* ---------------------------------------------------------------------------
   Potongan penyusun
   --------------------------------------------------------------------------- */

/**
 * Bintang bersinar: empat sinar cekung, sinar tegak lebih panjang dari sinar
 * mendatar, dengan titik kecil di ujung sinar tegak.
 */
function Sinar({ x, y, t, l, w = 1.1, titik = true }) {
  const k = Math.max(1.2, t * 0.07);
  const d = `M${x} ${y - t}Q${x + k} ${y - k} ${x + l} ${y}Q${x + k} ${y + k} ${x} ${y + t}Q${x - k} ${y + k} ${x - l} ${y}Q${x - k} ${y - k} ${x} ${y - t}Z`;
  return (
    <g>
      <path {...GARIS} d={d} strokeWidth={w} />
      <circle cx={x} cy={y} r={Math.max(1, t * 0.05)} fill="currentColor" />
      {titik && (
        <>
          <circle cx={x} cy={y - t - 5} r="1.1" fill="currentColor" />
          <circle cx={x} cy={y + t + 5} r="1.1" fill="currentColor" />
        </>
      )}
    </g>
  );
}

/** Bintang delapan sinar setipis rambut; sinar diagonal lebih pendek. */
function Bintang8({ x, y, r, w = 0.9 }) {
  const dg = r * 0.55;
  return (
    <path
      {...GARIS}
      strokeWidth={w}
      d={`M${x} ${y - r}V${y + r}M${x - r} ${y}H${x + r}M${x - dg} ${y - dg}L${x + dg} ${y + dg}M${x + dg} ${y - dg}L${x - dg} ${y + dg}`}
    />
  );
}

/** Garis bertitik: stroke dengan dasharray 0 dan ujung bulat. */
function Titik({ d, jarak = 7, w = 2 }) {
  return (
    <path
      {...GARIS}
      d={d}
      strokeWidth={w}
      strokeDasharray={`0 ${jarak}`}
    />
  );
}

function Svg({ viewBox, className, opacity, children }) {
  return (
    <svg
      viewBox={viewBox}
      aria-hidden="true"
      focusable="false"
      className={`pointer-events-none ${className}`}
      style={{ opacity }}
    >
      {children}
    </svg>
  );
}

/* ---------------------------------------------------------------------------
   Gugus siap pakai
   --------------------------------------------------------------------------- */

/** Gugus memanjang (rasio 1 : 2,1). Atur ukurannya lewat kelas h-* / w-*. */
export function RasiTegak({ className = "", opacity = 0.6, balik = false }) {
  return (
    <Svg
      viewBox="0 0 200 420"
      className={`${balik ? "-scale-x-100" : ""} ${className}`}
      opacity={opacity}
    >
      {/* pusaran utama: aliran S dari atas ke bawah */}
      <path
        {...GARIS}
        strokeWidth="1.3"
        d="M150 112C196 160 150 214 104 206C74 200 84 164 112 168C130 171 128 190 114 192"
      />
      <path
        {...GARIS}
        strokeWidth="1.6"
        d="M118 226C66 236 30 270 52 306C72 338 132 314 156 336C180 358 158 396 118 398C92 399 78 382 88 368"
      />
      <path {...GARIS} strokeWidth="0.9" d="M126 236C84 250 60 276 70 300" />
      <path {...GARIS} strokeWidth="0.9" d="M146 328C166 344 164 372 142 384" />
      <path {...GARIS} strokeWidth="1" d="M88 368C84 356 98 350 104 360" />

      {/* garis bertitik yang menyambung gugus */}
      <Titik d="M52 128C70 96 104 84 128 90" />
      <Titik d="M104 206C126 216 150 214 170 228" jarak={8} />
      <Titik d="M38 356V404" />
      <Titik d="M178 58C186 76 186 96 176 110" jarak={6} w={1.6} />

      {/* bintang bersinar */}
      <Sinar x={128} y={52} t={44} l={24} w={1.2} />
      <Sinar x={58} y={150} t={28} l={17} />
      <Sinar x={104} y={270} t={26} l={16} />
      <Sinar x={160} y={286} t={17} l={10} titik={false} />
      <Bintang8 x={180} y={150} r={12} />
      <Bintang8 x={38} y={338} r={11} />

      {/* bola & gelembung */}
      <circle cx="104" cy="92" r="3" fill="currentColor" />
      <circle cx="150" cy="112" r="4.5" {...GARIS} strokeWidth="1" />
      <circle cx="170" cy="228" r="3.5" {...GARIS} strokeWidth="1" />
      <circle cx="182" cy="240" r="2.2" {...GARIS} strokeWidth="0.9" />
      <circle cx="176" cy="252" r="1.4" fill="currentColor" />
      <circle cx="62" cy="248" r="2.6" {...GARIS} strokeWidth="0.9" />
      <circle cx="120" cy="330" r="1.8" fill="currentColor" />
      <circle cx="38" cy="412" r="2.6" {...GARIS} strokeWidth="0.9" />
    </Svg>
  );
}

/** Gugus kecil persegi untuk sudut atau sisi elemen. */
export function RasiSudut({ className = "", opacity = 0.6, balik = false }) {
  return (
    <Svg
      viewBox="0 0 160 160"
      className={`${balik ? "-scale-x-100" : ""} ${className}`}
      opacity={opacity}
    >
      <path
        {...GARIS}
        strokeWidth="1.3"
        d="M20 126C34 88 76 78 96 100C112 118 94 142 78 132C66 124 76 110 86 116"
      />
      <path {...GARIS} strokeWidth="0.9" d="M30 138C50 110 80 104 98 118" />
      <Titik d="M104 94C118 72 132 60 146 58" jarak={7} />
      <Sinar x={112} y={40} t={30} l={17} />
      <Bintang8 x={40} y={50} r={11} />
      <circle cx="146" cy="58" r="3.6" {...GARIS} strokeWidth="1" />
      <circle cx="136" cy="104" r="2.4" {...GARIS} strokeWidth="0.9" />
      <circle cx="144" cy="114" r="1.4" fill="currentColor" />
      <circle cx="62" cy="84" r="1.8" fill="currentColor" />
    </Svg>
  );
}

/** Pemisah mendatar selebar wadahnya (rasio 10 : 1). */
export function RasiPita({ className = "", opacity = 0.6 }) {
  return (
    <Svg viewBox="0 0 400 40" className={className} opacity={opacity}>
      <Titik d="M20 20H168" jarak={8} w={1.8} />
      <Titik d="M232 20H380" jarak={8} w={1.8} />
      <path {...GARIS} strokeWidth="1" d="M168 20C176 8 190 10 186 20" />
      <path {...GARIS} strokeWidth="1" d="M232 20C224 32 210 30 214 20" />
      <Sinar x={200} y={20} t={16} l={9} titik={false} />
      <circle cx="14" cy="20" r="2.4" {...GARIS} strokeWidth="0.9" />
      <circle cx="386" cy="20" r="2.4" {...GARIS} strokeWidth="0.9" />
    </Svg>
  );
}
