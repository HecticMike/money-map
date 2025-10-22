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
      <div className="border border-brand-line bg-brand-ocean/70 px-5 py-8 text-center text-[11px] text-brand-highlight">
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
