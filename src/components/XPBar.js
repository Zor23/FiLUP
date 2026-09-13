import RankBadge from "@/components/RankBadge";
import { rankForLevel, nextRank } from "@/lib/ranks";

export default function XPBar({ level, xp, xpToNextLevel, size = "md" }) {
  const pct = Math.min(100, Math.round((xp / xpToNextLevel) * 100));
  const remaining = Math.max(0, xpToNextLevel - xp);
  const height = size === "sm" ? "h-2" : "h-3";

  const rank = rankForLevel(level);
  const berikutnya = nextRank(level);

  return (
    <div className="w-full">
      <div className="mb-2 flex items-end justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <RankBadge level={level} size={36} withGlow />
          <span className="leading-tight">
            <span className="block text-[11px] font-medium uppercase tracking-wider text-filup-muted">
              Level {level}
            </span>
            <span className="gradient-text-xp block text-sm font-bold">
              {rank.name}
            </span>
          </span>
        </div>
        <span className="font-mono text-xs text-filup-muted">
          <span className="font-semibold text-filup-text">{xp}</span> /{" "}
          {xpToNextLevel} XP
        </span>
      </div>

      <div
        className={`w-full ${height} overflow-hidden rounded-full bg-filup-bg-2 ring-1 ring-inset ring-white/5`}
      >
        <div
          className="xp-fill h-full rounded-full transition-[width] duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="mt-1.5 text-[11px] text-filup-muted">
        {remaining} XP lagi ke Level {level + 1}
        {berikutnya && (
          <>
            {" · "}rank berikutnya:{" "}
            <span className="font-semibold text-filup-xp">
              {berikutnya.name}
            </span>{" "}
            (Level {berikutnya.minLevel})
          </>
        )}
      </p>
    </div>
  );
}
