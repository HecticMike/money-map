import { type Expense } from "../types";
import { ExpenseCard } from "./ExpenseCard";

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
  formatAmount: (value: number) => string;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onEdit, onDelete, formatAmount }) => {
  if (expenses.length === 0) {
    return (
      <div className="rounded-2xl border-4 border-pixel-border bg-pixel-abyss/70 px-6 py-10 text-center text-[11px] text-pixel-gold">
        No entries yet. Add your first entry to build your Money Map.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {expenses.map((expense) => (
        <ExpenseCard
          key={expense.id}
          expense={expense}
          onEdit={onEdit}
          onDelete={onDelete}
          formatAmount={formatAmount}
        />
      ))}
    </div>
  );
};
