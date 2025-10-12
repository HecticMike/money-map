import { format } from 'date-fns';
import { CATEGORY_META, type Expense } from '../types';

interface ExpenseCardProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

export const ExpenseCard: React.FC<ExpenseCardProps> = ({ expense, onEdit, onDelete }) => {
  const categoryMeta = CATEGORY_META[expense.category];
  const formattedDate = format(new Date(expense.date), 'MMM d, yyyy');

  return (
    <article
      className="flex w-full flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-2xl sm:flex-row sm:items-center sm:justify-between"
      style={{
        borderLeft: `6px solid ${categoryMeta.color}`
      }}
    >
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-center justify-between gap-3">
          <span className="text-lg font-semibold text-slate-800">${expense.amount.toFixed(2)}</span>
          <span
            className="inline-flex items-center rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600"
            style={{ backgroundColor: `${categoryMeta.color}1a`, color: categoryMeta.color }}
          >
            {categoryMeta.label}
          </span>
        </div>
        {expense.note.length > 0 ? (
          <p className="text-sm text-slate-500">{expense.note}</p>
        ) : null}
      </div>
      <div className="flex flex-col items-end justify-between gap-3 sm:flex-row sm:items-center">
        <div className="text-sm font-medium text-slate-400">{formattedDate}</div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              onEdit(expense);
            }}
            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-200"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => {
              onDelete(expense);
            }}
            className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-200"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
};
