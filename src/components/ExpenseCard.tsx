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
  const amountDisplay = isIncome
    ? `+${formatAmount(expense.amount)}`
    : formatAmount(-expense.amount);

  return (
    <article
      className="flex w-full flex-col gap-2 rounded-2xl border-4 border-pixel-border bg-pixel-abyss/75 p-3 text-pixel-gold shadow-[0_12px_24px_rgba(5,10,34,0.6)] transition hover:-translate-y-1 hover:bg-pixel-abyss/90 sm:p-4"
      style={{ borderLeftColor: categoryMeta.color }}
    >
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <span className={`text-lg font-semibold ${isIncome ? 'text-emerald-300' : 'text-pixel-gold'}`}>{amountDisplay}</span>
          <span
            className="inline-flex items-center rounded-lg border-2 border-pixel-border bg-pixel-midnight/80 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide"
            style={{ color: categoryMeta.color }}
          >
            {categoryMeta.label}
          </span>
        </div>
        {expense.note.length > 0 ? <p className="text-[11px] text-pixel-gold/80 sm:text-xs">{expense.note}</p> : null}
      </div>
      <div className="flex flex-col items-end justify-between gap-2 text-[10px] text-pixel-cyan sm:flex-row sm:items-center sm:text-[11px]">
        <div className="font-medium uppercase tracking-wide">{formattedDate}</div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              onEdit(expense);
            }}
            className="rounded-full border-2 border-pixel-border bg-pixel-abyss/70 px-3 py-1 text-[10px] font-semibold text-pixel-gold transition hover:border-pixel-amber hover:text-pixel-amber"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => {
              onDelete(expense);
            }}
            className="rounded-full border-2 border-pixel-border bg-pixel-abyss/70 px-3 py-1 text-[10px] font-semibold text-pixel-red transition hover:border-pixel-red hover:bg-pixel-red/10"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
};
