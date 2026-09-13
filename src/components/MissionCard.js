import Emblem from "@/components/Emblem";
import { formatRupiah } from "@/lib/mockData";

export default function MissionCard({ mission }) {
  const pct = Math.min(
    100,
    Math.round((mission.currentAmount / mission.targetAmount) * 100)
  );
  const isDone = mission.status === "completed";
  const sisa = Math.max(0, mission.targetAmount - mission.currentAmount);

  const deadline = new Date(mission.deadline);
  const daysLeft = Math.max(
    0,
    Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24))
  );

  return (
    <div className="card card-hover group overflow-hidden p-4">
      <div className="flex items-start gap-3">
        {/* Ikon misi */}
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset transition-transform duration-300 group-hover:scale-110 ${
            isDone
              ? "bg-filup-green/12 text-filup-green ring-filup-green/30"
              : "bg-filup-primary/12 text-filup-primary ring-filup-primary/30"
          }`}
        >
          <Emblem nama={mission.icon ?? "misi"} size={22} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate font-bold tracking-tight text-filup-text">
              {mission.title}
            </h3>
            {isDone ? (
              <span className="flex shrink-0 items-center gap-1 rounded-full bg-filup-green/15 px-2 py-0.5 text-[11px] font-semibold text-filup-green ring-1 ring-inset ring-filup-green/30">
                <Emblem nama="rayakan" size={12} />
                Selesai
              </span>
            ) : (
              <span className="shrink-0 rounded-full bg-filup-surface-2 px-2 py-0.5 text-[11px] font-semibold text-filup-muted ring-1 ring-inset ring-white/10">
                {daysLeft} hari lagi
              </span>
            )}
          </div>

          <p className="mt-0.5 text-[11px] text-filup-muted">
            {isDone
              ? "Target tercapai penuh"
              : `Sisa ${formatRupiah(sisa)} lagi`}
          </p>
        </div>
      </div>

      {/* Progres */}
      <div className="mt-4">
        <div className="mb-1.5 flex items-baseline justify-between">
          <span className="font-mono text-sm font-bold text-filup-text">
            {formatRupiah(mission.currentAmount)}
          </span>
          <span className="font-mono text-xs text-filup-muted">
            / {formatRupiah(mission.targetAmount)}
          </span>
        </div>

        <div className="h-2.5 w-full overflow-hidden rounded-full bg-filup-bg-2 ring-1 ring-inset ring-white/5">
          <div
            className={`h-full rounded-full transition-[width] duration-700 ease-out ${
              isDone ? "progress-fill-done" : "progress-fill"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>

        <p className="mt-1.5 text-right text-[11px] font-semibold text-filup-muted">
          {pct}%
        </p>
      </div>
    </div>
  );
}
