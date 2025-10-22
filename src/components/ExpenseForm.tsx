import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { formatISO } from 'date-fns';
import { CATEGORY_META, INCOME_CATEGORIES, type Expense, type ExpenseDraft } from '../types';

interface ExpenseFormValues {
  amount: number | string;
  category: ExpenseDraft['category'];
  date: string;
  note: string;
}

interface ExpenseFormProps {
  mode?: 'create' | 'edit';
  initialExpense?: Expense | null;
  onSubmit: (draft: ExpenseDraft) => void;
  onCancel?: () => void;
  currencySymbol: string;
}

const DEFAULT_CATEGORY: ExpenseDraft['category'] = 'living_home_groceries';

const expenseOptions = (
  Object.entries(CATEGORY_META) as Array<
    [ExpenseDraft['category'], (typeof CATEGORY_META)[ExpenseDraft['category']]]
  >
).filter(([, meta]) => meta.type === 'expense');

const incomeOptions = INCOME_CATEGORIES.map((key) => [key, CATEGORY_META[key].label] as const);

const toFormValues = (expense?: Expense | null): ExpenseFormValues => {
  if (expense == null) {
    return {
      amount: '',
      category: DEFAULT_CATEGORY,
      date: formatISO(new Date(), { representation: 'date' }),
      note: ''
    };
  }

  return {
    amount: expense.amount,
    category: expense.category,
    date: formatISO(new Date(expense.date), { representation: 'date' }),
    note: expense.note
  };
};

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  mode = 'create',
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
    mode: 'onBlur',
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
    if (mode === 'create') {
      reset(toFormValues());
    }
  };

  return (
    <form
      onSubmit={handleSubmit(submitHandler)}
      className="space-y-5 text-brand-highlight"
      aria-label={mode === 'edit' ? 'Edit entry form' : 'Add entry form'}
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-brand-neutral">
            Amount *
          </span>
          <input
            type="number"
            step="0.01"
            inputMode="decimal"
            {...register('amount', {
              required: 'Enter an amount',
              valueAsNumber: true,
              min: { value: 0.01, message: 'Amount must be above zero' }
            })}
            className="w-full border border-brand-line bg-brand-midnight px-4 py-2 text-sm text-brand-highlight placeholder:text-brand-neutral/60 focus:border-brand-highlight focus:outline-none focus:ring-0"
            placeholder={`${currencySymbol}45.20`}
          />
          {errors.amount != null ? (
            <span className="text-[11px] text-brand-accent">{errors.amount.message}</span>
          ) : null}
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-brand-neutral">
            Category *
          </span>
          <select
            {...register('category', { required: true })}
            className="w-full border border-brand-line bg-brand-midnight px-4 py-2 text-sm text-brand-highlight focus:border-brand-highlight focus:outline-none focus:ring-0"
          >
            <optgroup label="Income">
              {incomeOptions.map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
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
        <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-brand-neutral">
          Date *
        </span>
        <input
          type="date"
          {...register('date', { required: true })}
          className="w-full border border-brand-line bg-brand-midnight px-4 py-2 text-sm text-brand-highlight focus:border-brand-highlight focus:outline-none focus:ring-0"
        />
        {errors.date != null ? (
          <span className="text-[11px] text-brand-accent">Select a date</span>
        ) : null}
      </label>
      <label className="flex flex-col gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-brand-neutral">
          Note
        </span>
        <textarea
          rows={3}
          {...register('note', { maxLength: 240 })}
          className="w-full resize-none border border-brand-line bg-brand-midnight px-4 py-2 text-sm text-brand-highlight focus:border-brand-highlight focus:outline-none focus:ring-0"
          placeholder="Why did you spend this?"
        />
        {errors.note != null ? (
          <span className="text-[11px] text-brand-accent">Keep the note under 240 characters</span>
        ) : null}
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center border border-brand-line bg-brand-highlight px-4 py-2 text-[11px] font-semibold text-brand-midnight transition hover:bg-brand-amber disabled:cursor-not-allowed disabled:bg-brand-slate/60"
        >
          {mode === 'edit' ? 'Update entry' : 'Add entry'}
        </button>
        {mode === 'edit' && onCancel != null ? (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center justify-center border border-brand-line px-4 py-2 text-[11px] font-semibold text-brand-highlight transition hover:text-brand-amber"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
};
