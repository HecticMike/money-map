import { format } from "date-fns";
import { CATEGORY_META, type Expense } from "../types";

interface ExpenseCardProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
  formatAmount: (value: number) => string;
}

export const ExpenseCard: React.FC<ExpenseCardProps> = ({ expense, onEdit, onDelete, formatAmount }) => {
  const categoryMeta = CATEGORY_META[expense.category];
  const formattedDate = format(new Date(expense.date), "MMM d, yyyy");

  return (
    <article
      className="flex w-full flex-col gap-3 rounded-2xl border border-white/10 bg-white/8 p-4 text-slate-100 shadow-[0_12px_30px_rgba(15,23,42,0.35)] transition hover:-translate-y-0.5 hover:bg-white/12"
      style={{ borderLeft: `6px solid ${categoryMeta.color}` }}
    >
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-center justify-between gap-3">
          <span className="text-lg font-semibold text-white">{formatAmount(expense.amount)}</span>
          <span
            className="inline-flex items-center rounded-lg bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide"
            style={{ color: categoryMeta.color }}
          >
            {categoryMeta.label}
          </span>
        </div>
        {expense.note.length > 0 ? (
          <p className="text-sm text-slate-200">{expense.note}</p>
        ) : null}
      </div>
      <div className="flex flex-col items-end justify-between gap-3 text-xs text-slate-400 sm:flex-row sm:items-center">
        <div className="font-medium uppercase tracking-wide">{formattedDate}</div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              onEdit(expense);
            }}
            className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-slate-100 transition hover:bg-white/10"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => {
              onDelete(expense);
            }}
            className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/20"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
};
