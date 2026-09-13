"use client";

import Emblem from "@/components/Emblem";
import { useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import TransactionRow from "@/components/TransactionRow";
import { useData } from "@/contexts/DataProvider";
import { formatRupiah } from "@/lib/mockData";

const FILTERS = [
  { key: "all", label: "Semua" },
  { key: "income", label: "Pemasukan" },
  { key: "expense", label: "Pengeluaran" },
];

export default function RiwayatPage() {
  const [filter, setFilter] = useState("all");
  const { transactions, totalIncome, totalExpense, loading } = useData();

  const filtered = useMemo(() => {
    if (filter === "all") return transactions;
    return transactions.filter((tx) => tx.type === filter);
  }, [filter, transactions]);

  const selisih = totalIncome - totalExpense;

  // Ringkasan per kategori untuk grafik batang sederhana.
  const byCategory = useMemo(() => {
    const map = {};
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        map[t.category] = (map[t.category] ?? 0) + t.amount;
      });
    const max = Math.max(...Object.values(map), 1);
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value, pct: (value / max) * 100 }));
  }, [transactions]);

  return (
    <AppShell>
      <div className="space-y-5">
        <section className="stagger">
          <span className="label-mono">CATATAN · ARSIP</span>
          <h1 className="font-display mt-2 text-[28px] leading-tight tracking-tight md:text-[38px]">
            Riwayat Transaksi
          </h1>
          <p className="mt-1.5 text-sm text-filup-muted">
            Semua transaksi yang sudah kamu catat.
          </p>
          <div className="hairline mt-4" />
        </section>

        {/* Ringkasan */}
        <section
          className="stagger grid grid-cols-2 gap-3 md:grid-cols-3"
          style={{ animationDelay: "60ms" }}
        >
          <SummaryCard
            label="Pemasukan"
            value={`+${formatRupiah(totalIncome)}`}
            tint="text-filup-green"
            icon="↓"
          />
          <SummaryCard
            label="Pengeluaran"
            value={`−${formatRupiah(totalExpense)}`}
            tint="text-filup-red"
            icon="↑"
          />
          <SummaryCard
            label="Selisih"
            value={`${selisih >= 0 ? "+" : "−"}${formatRupiah(Math.abs(selisih))}`}
            tint={selisih >= 0 ? "text-filup-xp" : "text-filup-red"}
            icon="="
            className="col-span-2 md:col-span-1"
          />
        </section>

        <div className="md:grid md:grid-cols-3 md:items-start md:gap-6">
          {/* Daftar transaksi */}
          <div className="md:col-span-2">
            {/* Filter */}
            <section
              className="stagger mb-3 flex gap-2"
              style={{ animationDelay: "120ms" }}
            >
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    filter === f.key
                      ? "btn-gradient text-white"
                      : "border border-filup-border bg-filup-surface-2/60 text-filup-muted hover:text-filup-text"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </section>

            <section
              className="stagger card px-4 py-1"
              style={{ animationDelay: "180ms" }}
            >
              {loading ? (
                <p className="py-10 text-center text-sm text-filup-muted">
                  Memuat transaksi...
                </p>
              ) : filtered.length === 0 ? (
                <div className="py-10 text-center">
                  <Emblem nama="arsip" size={28} className="text-filup-muted" />
                  <p className="mt-2 text-sm font-semibold">
                    Belum ada transaksi
                  </p>
                  <p className="mt-1 text-xs text-filup-muted">
                    Coba ubah filter atau catat transaksi baru.
                  </p>
                </div>
              ) : (
                filtered.map((tx) => <TransactionRow key={tx.id} tx={tx} />)
              )}
            </section>
          </div>

          {/* Pengeluaran per kategori */}
          <section
            className="stagger mt-5 md:col-span-1 md:mt-0"
            style={{ animationDelay: "240ms" }}
          >
            <h2 className="label-mono mb-3 block">
              Pengeluaran per Kategori
            </h2>
            <div className="card space-y-3.5 p-4">
              {byCategory.length === 0 && (
                <p className="py-2 text-center text-xs text-filup-muted">
                  Belum ada pengeluaran tercatat.
                </p>
              )}
              {byCategory.map((c) => (
                <div key={c.name}>
                  <div className="mb-1.5 flex items-baseline justify-between">
                    <span className="text-xs font-semibold">{c.name}</span>
                    <span className="font-mono text-[11px] text-filup-muted">
                      {formatRupiah(c.value)}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-filup-bg-2 ring-1 ring-inset ring-white/5">
                    <div
                      className="progress-fill h-full rounded-full transition-[width] duration-700"
                      style={{ width: `${c.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}

function SummaryCard({ label, value, tint, icon, className = "" }) {
  return (
    <div className={`card p-4 ${className}`}>
      <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-filup-muted">
        <span className={tint}>{icon}</span>
        {label}
      </p>
      <p className={`mt-1.5 font-mono text-base font-extrabold ${tint}`}>
        {value}
      </p>
    </div>
  );
}
