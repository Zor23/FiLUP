import Emblem from "@/components/Emblem";
import { formatRupiah, CATEGORY_STYLE } from "@/lib/mockData";

const SOURCE_LABEL = {
  struk: "Struk",
  transfer: "Transfer",
  manual: "Manual",
};

export default function TransactionRow({ tx }) {
  const isIncome = tx.type === "income";
  const style = CATEGORY_STYLE[tx.category] ?? CATEGORY_STYLE.Lainnya;

  const date = new Date(tx.createdAt);
  const dateLabel = date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });

  return (
    <div className="group flex items-center gap-3 border-b border-white/5 py-3 last:border-0">
      {/* Ikon kategori */}
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-filup-surface-2 ring-1 ring-inset ring-white/10 transition-transform duration-300 group-hover:scale-110 ${style.tint}`}
      >
        <Emblem nama={style.icon} size={20} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-filup-text">
          {tx.merchant}
        </p>
        {/* Satu baris ringkas supaya tidak pecah saat kolom sempit */}
        <p className="mt-0.5 truncate text-[11px] text-filup-muted">
          <span className={style.tint}>{tx.category}</span>
          {" · "}
          {SOURCE_LABEL[tx.source]}
          {" · "}
          {dateLabel}
        </p>
      </div>

      <p
        className={`shrink-0 whitespace-nowrap font-mono text-sm font-bold ${
          isIncome ? "text-filup-green" : "text-filup-red"
        }`}
      >
        {isIncome ? "+" : "−"}
        {formatRupiah(tx.amount)}
      </p>
    </div>
  );
}
