import { format } from 'date-fns';
import { CATEGORY_META, type Expense } from '../types';

interface ExpenseCardProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
  formatAmount: (value: number) => string;
}

export const ExpenseCard: React.FC<ExpenseCardProps> = ({ expense, onEdit, onDelete, formatAmount }) => {
  const categoryMeta = CATEGORY_META[expense.category];
  const formattedDate = format(new Date(expense.date), 'MMM d, yyyy');
  const isIncome = categoryMeta.type === 'income';
  const amountDisplay = formatAmount(isIncome ? expense.amount : -expense.amount);
  const personLabel = expense.user ?? 'Not set';

  return (
    <article
      className="flex w-full flex-col gap-1 border border-brand-line bg-brand-midnight/80 px-4 py-3 text-brand-highlight shadow-panel"
      style={{ borderLeftColor: categoryMeta.color }}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <span className={`text-base font-semibold ${isIncome ? 'text-emerald-300' : 'text-brand-highlight'}`}>
            {isIncome ? `+${amountDisplay}` : amountDisplay}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="border border-brand-line bg-brand-ocean/70 px-2 py-[3px] text-[10px] font-semibold uppercase tracking-[0.25em]"
              style={{ color: categoryMeta.color }}
            >
              {categoryMeta.label}
            </span>
            <span className="border border-brand-line/80 bg-brand-ocean/50 px-2 py-[3px] text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-neutral">
              {personLabel}
            </span>
          </div>
        </div>
        {expense.note.length > 0 ? (
          <p className="text-[11px] text-brand-neutral">{expense.note}</p>
        ) : null}
      </div>
      <div className="flex flex-col items-end justify-between gap-2 text-[10px] text-brand-neutral/80 sm:flex-row sm:items-center">
        <div className="uppercase tracking-[0.25em]">{formattedDate}</div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(expense)}
            className="border border-brand-line px-3 py-1 text-[10px] font-semibold text-brand-highlight transition hover:text-brand-amber"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(expense)}
            className="border border-brand-line px-3 py-1 text-[10px] font-semibold text-brand-accent transition hover:bg-brand-accent/10"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
};
