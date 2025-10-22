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
  const netFormatted = formatAmount(netFlow);
  const expenseFormatted = formatAmount(-expenseTotal);

  const [topCategoryKey, topCategoryValue] =
    (Object.entries(stats.byCategory)
      .sort(([, a], [, b]) => (a > b ? -1 : 1))[0] as [keyof typeof CATEGORY_META, number] | undefined) ??
    ["other", 0];
  const topCategoryMeta = CATEGORY_META[topCategoryKey];

  const lastExpense = expenses[0];

  return (
    <div className="grid gap-3 md:grid-cols-3">
      <div className="rounded-2xl border-4 border-pixel-border bg-pixel-abyss/80 p-4 shadow-inner shadow-black/30 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-pixel-amber">Net flow</p>
        <p className={`mt-3 text-3xl font-semibold ${netClass}`}>{netFormatted}</p>
        <p className="mt-4 text-[11px] text-pixel-gold sm:text-xs">
          Income: <span className="font-medium text-pixel-amber">{formatAmount(incomeTotal)}</span>
        </p>
        <p className="mt-1 text-[11px] text-pixel-gold sm:text-xs">
          Expenses: <span className="font-medium text-pixel-red">{expenseFormatted}</span>
        </p>
        <p className="mt-4 text-[10px] font-semibold uppercase tracking-wide text-pixel-cyan">
          Currency: {currencyLabel}
        </p>
      </div>
      <div className="rounded-2xl border-4 border-pixel-border bg-pixel-abyss/80 p-4 shadow-inner shadow-black/30 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-pixel-amber">Top category</p>
        <p className="mt-3 text-2xl font-semibold text-pixel-gold">{topCategoryMeta.label}</p>
        <p className="mt-3 text-sm text-pixel-gold">
          {formatAmount(topCategoryValue)} {CATEGORY_META[topCategoryKey].type === "income" ? "received" : "spent"}.
        </p>
      </div>
      <div className="rounded-2xl border-4 border-pixel-border bg-pixel-abyss/80 p-4 shadow-inner shadow-black/30 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-pixel-amber">Latest activity</p>
        {lastExpense != null ? (
          <>
            <p className="mt-3 text-3xl font-semibold text-pixel-gold">{formatAmount(lastExpense.amount)}</p>
            <p className="mt-3 text-sm text-pixel-gold">
              {CATEGORY_META[lastExpense.category].label} on {format(new Date(lastExpense.date), "MMM d, yyyy")}
            </p>
          </>
        ) : (
          <p className="mt-3 text-lg font-semibold text-pixel-gold">Add your first entry</p>
        )}
      </div>
    </div>
  );
};




