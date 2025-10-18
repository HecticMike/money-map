import { format } from "date-fns";
import { CATEGORY_META, type Expense, type ExpenseStats } from "../types";

interface SummaryGridProps {
  stats: ExpenseStats;
  expenses: Expense[];
  formatAmount: (value: number) => string;
  currencyLabel: string;
}

export const SummaryGrid: React.FC<SummaryGridProps> = ({ stats, expenses, formatAmount, currencyLabel }) => {
  const monthsCount = new Set(stats.monthlyTotals.map((item) => item.month)).size || 1;
  const averagePerMonth = stats.total / monthsCount;

  const [topCategoryKey, topCategoryValue] =
    (Object.entries(stats.byCategory)
      .sort(([, a], [, b]) => (a > b ? -1 : 1))[0] as [keyof typeof CATEGORY_META, number] | undefined) ??
    ["other", 0];
  const topCategoryMeta = CATEGORY_META[topCategoryKey];

  const lastExpense = expenses[0];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-2xl border border-white/10 bg-white/10 p-6 shadow-inner shadow-white/5">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-300">Total spent</p>
        <p className="mt-3 text-3xl font-semibold text-white">{formatAmount(stats.total)}</p>
        <p className="mt-4 text-sm text-slate-200">
          Average per month: <span className="font-medium text-white/90">{formatAmount(averagePerMonth)}</span>
        </p>
        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Currency: {currencyLabel}
        </p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/10 p-6 shadow-inner shadow-white/5">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-300">Top category</p>
        <p className="mt-3 text-2xl font-semibold text-white">{topCategoryMeta.label}</p>
        <p className="mt-3 text-sm text-slate-200">
          {formatAmount(topCategoryValue)} spent here - keep an eye on it.
        </p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/10 p-6 shadow-inner shadow-white/5">
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
