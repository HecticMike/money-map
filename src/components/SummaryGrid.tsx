import { format } from "date-fns";
import { CATEGORY_META, type Expense, type ExpenseStats } from "../types";

interface SummaryGridProps {
  stats: ExpenseStats;
  expenses: Expense[];
  formatAmount: (value: number) => string;
  currencyLabel: string;
  incomeTotal: number;
  expenseTotal: number;
}

export const SummaryGrid: React.FC<SummaryGridProps> = ({
  stats,
  expenses,
  formatAmount,
  currencyLabel,
  incomeTotal,
  expenseTotal
}) => {
  const netFlow = incomeTotal - expenseTotal;
  const netClass = netFlow >= 0 ? "text-emerald-300" : "text-rose-300";
  const netPrefix = netFlow >= 0 ? "+" : "-";
  const netAmount = Math.abs(netFlow);

  const [topCategoryKey, topCategoryValue] =
    (Object.entries(stats.byCategory)
      .sort(([, a], [, b]) => (a > b ? -1 : 1))[0] as [keyof typeof CATEGORY_META, number] | undefined) ??
    ["other", 0];
  const topCategoryMeta = CATEGORY_META[topCategoryKey];

  const lastExpense = expenses[0];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-6 shadow-inner shadow-black/20">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-300">Net flow</p>
        <p className={`mt-3 text-3xl font-semibold ${netClass}`}>{`${netPrefix}${formatAmount(netAmount)}`}</p>
        <p className="mt-4 text-sm text-slate-200">
          Income: <span className="font-medium text-white/90">{formatAmount(incomeTotal)}</span>
        </p>
        <p className="mt-1 text-sm text-slate-200">
          Expenses: <span className="font-medium text-rose-200">-{formatAmount(expenseTotal)}</span>
        </p>
        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Currency: {currencyLabel}
        </p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-6 shadow-inner shadow-black/20">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-300">Top category</p>
        <p className="mt-3 text-2xl font-semibold text-white">{topCategoryMeta.label}</p>
        <p className="mt-3 text-sm text-slate-200">
          {formatAmount(topCategoryValue)} {CATEGORY_META[topCategoryKey].type === "income" ? "received" : "spent"}.
        </p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-6 shadow-inner shadow-black/20">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-300">Latest activity</p>
        {lastExpense != null ? (
          <>
            <p className="mt-3 text-3xl font-semibold text-white">{formatAmount(lastExpense.amount)}</p>
            <p className="mt-3 text-sm text-slate-200">
              {CATEGORY_META[lastExpense.category].label} on {format(new Date(lastExpense.date), "MMM d, yyyy")}
            </p>
          </>
        ) : (
          <p className="mt-3 text-lg font-semibold text-slate-200">Add your first entry</p>
        )}
      </div>
    </div>
  );
};



