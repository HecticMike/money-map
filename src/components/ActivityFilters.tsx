import { type ChangeEvent, useMemo } from "react";
import { CATEGORY_META, EXPENSE_USERS, type ExpenseCategory, type ExpenseUser } from "../types";

export type ActivityFiltersState = {
  query: string;
  type: "all" | "income" | "expense";
  category: ExpenseCategory | "all";
  user: ExpenseUser | "all" | "unassigned";
};

interface ActivityFiltersProps {
  value: ActivityFiltersState;
  onChange: (updates: Partial<ActivityFiltersState>) => void;
  onReset: () => void;
}

const incomeCategories = Object.entries(CATEGORY_META).filter(([, meta]) => meta.type === "income");
const expenseCategories = Object.entries(CATEGORY_META).filter(([, meta]) => meta.type === "expense");

export const ActivityFilters: React.FC<ActivityFiltersProps> = ({ value, onChange, onReset }) => {
  const hasActiveFilters =
    value.type !== "all" ||
    value.category !== "all" ||
    value.user !== "all" ||
    value.query.trim().length > 0;

  const categoryGroups = useMemo(() => {
    const groups: Array<{ label: string; options: typeof expenseCategories }> = [];

    if (value.type !== "expense") {
      groups.push({ label: "Income", options: incomeCategories });
    }

    if (value.type !== "income") {
      groups.push({ label: "Expenses", options: expenseCategories });
    }

    return groups;
  }, [value.type]);

  const handleSelectChange =
    <Field extends "type" | "category" | "user">(field: Field) =>
    (event: ChangeEvent<HTMLSelectElement>) => {
      const nextValue = event.target.value as ActivityFiltersState[Field];
      onChange({ [field]: nextValue } as Partial<ActivityFiltersState>);
    };

  const handleQueryChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ query: event.target.value });
  };

  return (
    <div className="space-y-4 border border-brand-line bg-brand-midnight/60 px-4 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand-amber">
          Filters
        </h3>
        <button
          type="button"
          onClick={onReset}
          disabled={!hasActiveFilters}
          className="text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-highlight transition hover:text-brand-amber disabled:cursor-not-allowed disabled:text-brand-neutral"
        >
          Clear Filters
        </button>
      </div>

      <label className="flex flex-col gap-2 text-brand-highlight">
        <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-brand-neutral">
          Search
        </span>
        <input
          value={value.query}
          onChange={handleQueryChange}
          placeholder="Find by note or category"
          className="w-full border border-brand-line bg-brand-midnight px-3 py-2 text-sm text-brand-highlight placeholder:text-brand-neutral/60 focus:border-brand-highlight focus:outline-none focus:ring-0"
          type="search"
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-2 text-brand-highlight">
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-brand-neutral">
            Type
          </span>
          <select
            value={value.type}
            onChange={handleSelectChange("type")}
            className="w-full border border-brand-line bg-brand-midnight px-3 py-2 text-sm text-brand-highlight focus:border-brand-highlight focus:outline-none focus:ring-0"
          >
            <option value="all">All entries</option>
            <option value="income">Income</option>
            <option value="expense">Expenses</option>
          </select>
        </label>

        <label className="flex flex-col gap-2 text-brand-highlight">
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-brand-neutral">
            Category
          </span>
          <select
            value={value.category}
            onChange={handleSelectChange("category")}
            className="w-full border border-brand-line bg-brand-midnight px-3 py-2 text-sm text-brand-highlight focus:border-brand-highlight focus:outline-none focus:ring-0"
          >
            <option value="all">All categories</option>
            {categoryGroups.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.options.map(([key, meta]) => (
                  <option key={key} value={key}>
                    {meta.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-brand-highlight">
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-brand-neutral">
            Person
          </span>
          <select
            value={value.user}
            onChange={handleSelectChange("user")}
            className="w-full border border-brand-line bg-brand-midnight px-3 py-2 text-sm text-brand-highlight focus:border-brand-highlight focus:outline-none focus:ring-0"
          >
            <option value="all">All</option>
            {EXPENSE_USERS.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
            <option value="unassigned">Not set</option>
          </select>
        </label>
      </div>
    </div>
  );
};
