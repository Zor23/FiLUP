import { rankForLevel } from "@/lib/ranks";

// Lambang rank FiLUP — digambar sendiri sebagai SVG (bukan gambar dari luar),
// supaya tajam di semua ukuran layar dan warnanya konsisten dengan tema.
//
// Setiap rank punya perisai heksagonal dengan gradasi warna khasnya dan
// simbol berbeda di tengah: koin, celengan, dompet, pintu brankas, mahkota.

const HEX = "M32 3 L58 18 V46 L32 61 L6 46 V18 Z";
const HEX_INNER = "M32 9 L53 21 V43 L32 55 L11 43 V21 Z";

/** Simbol putih di tengah perisai, satu per rank. */
function Glyph({ id }) {
  const stroke = {
    fill: "none",
    stroke: "rgba(255,255,255,0.95)",
    strokeWidth: 3,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  switch (id) {
    case "receh": // koin dengan garis celah
      return (
        <g {...stroke}>
          <circle cx="32" cy="32" r="11" />
          <circle cx="32" cy="32" r="5.5" opacity="0.7" />
        </g>
      );
    case "celengan": // celengan: badan bulat, telinga, kaki, celah koin
      return (
        <g {...stroke}>
          <ellipse cx="32" cy="34" rx="12" ry="9" />
          <path d="M22 30 L18 26" />
          <path d="M26 42 v3 M38 42 v3" />
          <path d="M28 24 h8" strokeWidth="3.5" />
        </g>
      );
    case "dompet": // dompet dengan lipatan dan kancing
      return (
        <g {...stroke}>
          <rect x="20" y="24" width="24" height="17" rx="4" />
          <path d="M20 30 h24" opacity="0.7" />
          <circle cx="39" cy="35" r="1.6" fill="rgba(255,255,255,0.95)" stroke="none" />
        </g>
      );
    case "brankas": // roda pintu brankas
      return (
        <g {...stroke}>
          <circle cx="32" cy="32" r="11" />
          <circle cx="32" cy="32" r="4" opacity="0.7" />
          <path d="M32 21 v-4 M32 43 v4 M21 32 h-4 M43 32 h4" />
          <path d="M24.5 24.5 l-3 -3 M39.5 24.5 l3 -3 M24.5 39.5 l-3 3 M39.5 39.5 l3 3" opacity="0.7" />
        </g>
      );
    case "sultan": // mahkota tiga puncak dengan permata
      return (
        <g {...stroke}>
          <path d="M20 40 L20 26 L27 33 L32 23 L37 33 L44 26 L44 40 Z" />
          <path d="M22 44 h20" strokeWidth="3.5" />
          <circle cx="32" cy="37" r="1.6" fill="rgba(255,255,255,0.95)" stroke="none" />
        </g>
      );
    default:
      return null;
  }
}

/**
 * @param level      level pengguna — rank dihitung otomatis
 * @param rank       (opsional) objek rank langsung, mengalahkan `level`
 * @param size       ukuran piksel (default 40)
 * @param withGlow   beri cahaya lembut sesuai warna rank
 */
export default function RankBadge({ level = 1, rank, size = 40, withGlow = false }) {
  const r = rank ?? rankForLevel(level);
  const gradId = `rank-grad-${r.id}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label={`Rank ${r.name}`}
      style={withGlow ? { filter: `drop-shadow(0 0 ${size / 4}px ${r.glow})` } : undefined}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={r.from} />
          <stop offset="100%" stopColor={r.to} />
        </linearGradient>
      </defs>

      {/* Perisai */}
      <path d={HEX} fill={`url(#${gradId})`} />
      <path d={HEX} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
      <path d={HEX_INNER} fill="rgba(0,0,0,0.28)" />

      {/* Kilau di sisi atas */}
      <path d="M32 3 L58 18 L32 30 L6 18 Z" fill="rgba(255,255,255,0.14)" />

      <Glyph id={r.id} />
    </svg>
  );
}
