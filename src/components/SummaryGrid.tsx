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

  const topExpenseEntry = Object.entries(stats.byCategory)
    .map(([key, value]) => [key as keyof typeof CATEGORY_META, value] as const)
    .filter(([, value]) => value > 0)
    .filter(([key]) => CATEGORY_META[key].type === "expense")
    .sort(([, a], [, b]) => (a > b ? -1 : 1))[0];
  const topCategoryMeta = topExpenseEntry != null ? CATEGORY_META[topExpenseEntry[0]] : null;
  const topCategoryValue = topExpenseEntry?.[1] ?? 0;

  const lastExpense = expenses[0];

  return (
    <div className="grid gap-3 md:grid-cols-3">
      <div className="border border-brand-line bg-brand-ocean/70 px-4 py-5 sm:px-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-neutral">Net flow</p>
        <p className={`mt-3 text-3xl font-semibold ${netClass}`}>{netFormatted}</p>
        <p className="mt-4 text-xs text-brand-highlight">
          Income: <span className="font-medium text-brand-neutral">{formatAmount(incomeTotal)}</span>
        </p>
        <p className="mt-1 text-xs text-brand-highlight">
          Expenses: <span className="font-medium text-brand-accent">{expenseFormatted}</span>
        </p>
        <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.28em] text-brand-neutral/70">
          Currency: {currencyLabel}
        </p>
      </div>
      <div className="border border-brand-line bg-brand-ocean/70 px-4 py-5 sm:px-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-neutral">Top category</p>
        <p className="mt-3 text-2xl font-semibold text-brand-highlight">
          {topCategoryMeta != null ? topCategoryMeta.label : 'No expense category yet'}
        </p>
        <p className="mt-3 text-xs text-brand-highlight">
          {topCategoryMeta != null
            ? `${formatAmount(-topCategoryValue)} spent.`
            : 'Log expenses to reveal your biggest spend area.'}
        </p>
      </div>
      <div className="border border-brand-line bg-brand-ocean/70 px-4 py-5 sm:px-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-neutral">Latest activity</p>
        {lastExpense != null ? (
          <>
            <p className="mt-3 text-3xl font-semibold text-brand-highlight">
              {formatAmount(lastExpense.amount)}
            </p>
            <p className="mt-3 text-xs text-brand-highlight">
              {CATEGORY_META[lastExpense.category].label} on{' '}
              {format(new Date(lastExpense.date), 'MMM d, yyyy')}
            </p>
          </>
        ) : (
          <p className="mt-3 text-sm font-semibold text-brand-highlight">Add your first entry</p>
        )}
      </div>
    </div>
  );
};




