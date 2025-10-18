import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { formatISO } from "date-fns";
import { CATEGORY_META, type Expense, type ExpenseDraft } from "../types";

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
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-200">
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
            className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-base text-slate-200 placeholder:text-slate-500 shadow-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/30"
            placeholder={`${currencySymbol}45.20`}
          />
          {errors.amount != null ? (
            <span className="text-sm text-rose-400">{errors.amount.message}</span>
          ) : null}
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-200">
            Category *
          </span>
          <select
            {...register("category", { required: true })}
            className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-base text-slate-200 shadow-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/30"
          >
            {Object.entries(CATEGORY_META).map(([key, meta]) => (
              <option key={key} value={key}>
                {meta.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-200">
          Date *
        </span>
        <input
          type="date"
          {...register("date", { required: true })}
          className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-base text-slate-200 shadow-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/30"
        />
        {errors.date != null ? <span className="text-sm text-rose-400">Select a date</span> : null}
      </label>
      <label className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-200">
          Note
        </span>
        <textarea
          rows={3}
          {...register("note", { maxLength: 240 })}
          className="w-full resize-none rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-base text-slate-200 shadow-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/30"
          placeholder="Why did you spend this?"
        />
        {errors.note != null ? (
          <span className="text-sm text-rose-400">Keep the note under 240 characters</span>
        ) : null}
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-xl bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-sky-400/20 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:bg-slate-500 disabled:text-slate-300"
        >
          {mode === "edit" ? "Update entry" : "Add entry"}
        </button>
        {mode === "edit" && onCancel != null ? (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center justify-center rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-white/40 hover:text-white"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
};


