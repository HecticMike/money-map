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
  const isIncome = categoryMeta.type === "income";
  const amountDisplay = formatAmount(isIncome ? expense.amount : -expense.amount);

  return (
    <article
      className="flex w-full flex-col gap-2 rounded-2xl border border-white/10 bg-slate-950/50 p-3 text-slate-100 shadow-[0_12px_24px_rgba(15,23,42,0.35)] transition hover:-translate-y-0.5 hover:bg-slate-900/60 sm:p-4"
      style={{ borderLeft: `6px solid ${categoryMeta.color}` }}
    >
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <span className={`text-lg font-semibold ${isIncome ? "text-emerald-200" : "text-white"}`}>{amountDisplay}</span>
          <span
            className="inline-flex items-center rounded-lg bg-slate-900/60 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide"
            style={{ color: categoryMeta.color }}
          >
            {categoryMeta.label}
          </span>
        </div>
        {expense.note.length > 0 ? <p className="text-xs text-slate-300 sm:text-sm">{expense.note}</p> : null}
      </div>
      <div className="flex flex-col items-end justify-between gap-2 text-[11px] text-slate-500 sm:flex-row sm:items-center sm:text-xs">
        <div className="font-medium uppercase tracking-wide">{formattedDate}</div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              onEdit(expense);
            }}
            className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-slate-100 transition hover:bg-slate-900/60"
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

