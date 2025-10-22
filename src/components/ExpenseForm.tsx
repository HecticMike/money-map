import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { formatISO } from "date-fns";
import { CATEGORY_META, INCOME_CATEGORIES, type Expense, type ExpenseDraft } from "../types";

interface ExpenseFormValues {
  amount: number | string;
  category: ExpenseDraft["category"];
  date: string;
  note: string;
}

interface ExpenseFormProps {
  mode?: "create" | "edit";
  initialExpense?: Expense | null;
  onSubmit: (draft: ExpenseDraft) => void;
  onCancel?: () => void;
  currencySymbol: string;
}

const DEFAULT_CATEGORY: ExpenseDraft["category"] = "living_home_groceries";
const expenseOptions = (Object.entries(CATEGORY_META) as Array<[ExpenseDraft["category"], (typeof CATEGORY_META)[ExpenseDraft["category"]]]>).filter(
  ([, meta]) => meta.type === "expense"
);
const incomeOptions = INCOME_CATEGORIES.map((key) => [key, CATEGORY_META[key].label.replace('Income · ', '')] as const);

const toFormValues = (expense?: Expense | null): ExpenseFormValues => {
  if (expense == null) {
    return {
      amount: "",
      category: DEFAULT_CATEGORY,
      date: formatISO(new Date(), { representation: "date" }),
      note: ""
    };
  }

  return {
    amount: expense.amount,
    category: expense.category,
    date: formatISO(new Date(expense.date), { representation: "date" }),
    note: expense.note
  };
};

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  mode = "create",
  initialExpense = null,
  onSubmit,
  onCancel,
  currencySymbol
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<ExpenseFormValues>({
    mode: "onBlur",
    defaultValues: toFormValues(initialExpense)
  });

  useEffect(() => {
    reset(toFormValues(initialExpense));
  }, [initialExpense, reset]);

  const submitHandler = (values: ExpenseFormValues) => {
    const dateISO = values.date ? formatISO(new Date(values.date)) : formatISO(new Date());
    onSubmit({
      amount: Number(values.amount),
      category: values.category,
      date: dateISO,
      note: values.note.trim()
    });
    if (mode === "create") {
      reset(toFormValues());
    }
  };

  return (
    <form
      onSubmit={handleSubmit(submitHandler)}
      className="space-y-6"
      aria-label={mode === "edit" ? "Edit entry form" : "Add entry form"}
    >
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-pixel-amber">
            Amount *
          </span>
          <input
            type="number"
            step="0.01"
            inputMode="decimal"
            {...register("amount", {
              required: "Enter an amount",
              valueAsNumber: true,
              min: { value: 0.01, message: "Amount must be above zero" }
            })}
            className="w-full rounded-lg border-2 border-pixel-border bg-pixel-dusk/60 px-4 py-3 text-sm text-pixel-gold placeholder:text-pixel-cyan/60 shadow-sm focus:border-pixel-amber focus:outline-none focus:ring-2 focus:ring-pixel-amber/30"
            placeholder={`${currencySymbol}45.20`}
          />
          {errors.amount != null ? (
            <span className="text-[11px] text-pixel-red">{errors.amount.message}</span>
          ) : null}
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-pixel-amber">
            Category *
          </span>
          <select
            {...register("category", { required: true })}
            className="w-full rounded-lg border-2 border-pixel-border bg-pixel-dusk/60 px-4 py-3 text-sm text-pixel-gold shadow-sm focus:border-pixel-amber focus:outline-none focus:ring-2 focus:ring-pixel-amber/30"
          >
            <optgroup label="Income">
              {incomeOptions.map(([key, originalLabel]) => (
                <option key={key} value={key}>
                  {originalLabel}
                </option>
              ))}
            </optgroup>
            <optgroup label="Expenses">
              {expenseOptions.map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.label}
                </option>
              ))}
            </optgroup>
          </select>
        </label>
      </div>
      <label className="flex flex-col gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-pixel-amber">
          Date *
        </span>
        <input
          type="date"
          {...register("date", { required: true })}
          className="w-full rounded-lg border-2 border-pixel-border bg-pixel-dusk/60 px-4 py-3 text-sm text-pixel-gold shadow-sm focus:border-pixel-amber focus:outline-none focus:ring-2 focus:ring-pixel-amber/30"
        />
        {errors.date != null ? <span className="text-[11px] text-pixel-red">Select a date</span> : null}
      </label>
      <label className="flex flex-col gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-pixel-amber">
          Note
        </span>
        <textarea
          rows={3}
          {...register("note", { maxLength: 240 })}
          className="w-full resize-none rounded-lg border-2 border-pixel-border bg-pixel-dusk/60 px-4 py-3 text-sm text-pixel-gold shadow-sm focus:border-pixel-amber focus:outline-none focus:ring-2 focus:ring-pixel-amber/30"
          placeholder="Why did you spend this?"
        />
        {errors.note != null ? (
          <span className="text-[11px] text-pixel-red">Keep the note under 240 characters</span>
        ) : null}
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-lg border-2 border-pixel-border bg-pixel-amber px-5 py-3 text-[11px] font-semibold text-pixel-midnight shadow-lg shadow-pixel-amber/30 transition hover:bg-pixel-gold disabled:cursor-not-allowed disabled:border-pixel-border disabled:bg-pixel-dusk disabled:text-pixel-gold/40"
        >
          {mode === "edit" ? "Update entry" : "Add entry"}
        </button>
        {mode === "edit" && onCancel != null ? (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center justify-center rounded-lg border-2 border-pixel-border px-5 py-3 text-[11px] font-semibold text-pixel-gold transition hover:border-pixel-amber hover:text-pixel-amber"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
};




