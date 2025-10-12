import { format } from 'date-fns';
import { CATEGORY_META, type Expense, type ExpenseStats } from '../types';

interface SummaryGridProps {
  stats: ExpenseStats;
  expenses: Expense[];
}

const currency = (value: number) =>
  value.toLocaleString(undefined, { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });

export const SummaryGrid: React.FC<SummaryGridProps> = ({ stats, expenses }) => {
  const monthsCount = new Set(stats.monthlyTotals.map((item) => item.month)).size || 1;
  const averagePerMonth = stats.total / monthsCount;

  const [topCategoryKey, topCategoryValue] =
    (Object.entries(stats.byCategory)
      .sort(([, a], [, b]) => (a > b ? -1 : 1))[0] as [keyof typeof CATEGORY_META, number] | undefined) ??
    ['other', 0];
  const topCategoryMeta = CATEGORY_META[topCategoryKey];

  const lastExpense = expenses[0];

  return (
    <div className="grid gap-5 md:grid-cols-3">
      <div className="rounded-2xl bg-white p-6 shadow-card">
        <p className="text-sm font-medium uppercase tracking-wider text-slate-500">Total spent</p>
        <p className="mt-2 text-3xl font-semibold text-slate-900">{currency(stats.total)}</p>
        <p className="mt-3 text-sm text-slate-500">
          Average per month: <span className="font-medium text-slate-700">{currency(averagePerMonth)}</span>
        </p>
      </div>
      <div className="rounded-2xl bg-white p-6 shadow-card">
        <p className="text-sm font-medium uppercase tracking-wider text-slate-500">Top category</p>
        <p className="mt-2 text-3xl font-semibold text-slate-900">{topCategoryMeta.label}</p>
        <p className="mt-3 text-sm text-slate-500">
          {currency(topCategoryValue)} spent here — keep an eye on it.
        </p>
      </div>
      <div className="rounded-2xl bg-white p-6 shadow-card">
        <p className="text-sm font-medium uppercase tracking-wider text-slate-500">Latest activity</p>
        {lastExpense != null ? (
          <>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {currency(lastExpense.amount)}
            </p>
            <p className="mt-3 text-sm text-slate-500">
              {CATEGORY_META[lastExpense.category].label} on{' '}
              {format(new Date(lastExpense.date), 'MMM d, yyyy')}
            </p>
          </>
        ) : (
          <p className="mt-2 text-lg font-semibold text-slate-600">Add your first expense</p>
        )}
      </div>
    </div>
  );
};
