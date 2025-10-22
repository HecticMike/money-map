import { useCallback, useEffect, useMemo, useState } from "react";
import { formatISO, parseISO, startOfMonth } from "date-fns";
import { CATEGORY_META, INCOME_CATEGORIES, type Expense, type ExpenseDraft, type ExpenseStats } from "../types";
import { readExpensesFromStorage, writeExpensesToStorage } from "../utils/storage";

const createExpense = (draft: ExpenseDraft): Expense => {
  const timestamp = draft.date ?? new Date().toISOString();
  const base = typeof timestamp === "string" ? timestamp : new Date(timestamp).toISOString();
  return {
    id:
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2),
    amount: Number(draft.amount),
    category: draft.category,
    date: base,
    note: draft.note,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

const normaliseExpense = (expense: Expense): Expense => ({
  ...expense,
  amount: Number(expense.amount),
  date: formatISO(new Date(expense.date)),
  createdAt: expense.createdAt ?? formatISO(new Date(expense.date)),
  updatedAt: expense.updatedAt ?? formatISO(new Date())
});

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>(() => readExpensesFromStorage().map(normaliseExpense));
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    writeExpensesToStorage(expenses);
  }, [expenses, isHydrated]);

  const addExpense = useCallback((draft: ExpenseDraft) => {
    setExpenses((previous) => {
      const next = [createExpense(draft), ...previous];
      return next.sort((a, b) => (a.date < b.date ? 1 : -1));
    });
  }, []);

  const updateExpense = useCallback((id: string, updates: Partial<ExpenseDraft>) => {
    setExpenses((previous) => {
      const next = previous.map((expense) =>
        expense.id === id
          ? {
              ...expense,
              ...updates,
              amount: updates.amount != null ? Number(updates.amount) : expense.amount,
              updatedAt: new Date().toISOString()
            }
          : expense
      );
      return next.sort((a, b) => (a.date < b.date ? 1 : -1));
    });
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setExpenses((previous) => previous.filter((expense) => expense.id !== id));
  }, []);

  const replaceExpenses = useCallback((incoming: Expense[]) => {
    setExpenses(incoming.map(normaliseExpense).sort((a, b) => (a.date < b.date ? 1 : -1)));
  }, []);

  const stats: ExpenseStats = useMemo(() => {
    const byCategory = Object.keys(CATEGORY_META).reduce<Record<string, number>>((acc, key) => {
      acc[key] = 0;
      return acc;
    }, {});
    const monthlyMap = new Map<string, number>();
    let total = 0;

    expenses.forEach((expense) => {
      const amount = Number(expense.amount);
      total += amount;
      byCategory[expense.category] = (byCategory[expense.category] ?? 0) + amount;

      const monthKey = formatISO(startOfMonth(parseISO(expense.date)));
      monthlyMap.set(monthKey, (monthlyMap.get(monthKey) ?? 0) + amount);
    });

    const monthlyTotals = Array.from(monthlyMap.entries())
      .map(([month, value]) => ({
        month,
        total: value
      }))
      .sort((a, b) => (a.month > b.month ? 1 : -1));

    return {
      total,
      byCategory: byCategory as ExpenseStats["byCategory"],
      monthlyTotals
    };
  }, [expenses]);

  const incomeTotal = useMemo(
    () =>
      expenses.reduce((sum, entry) => {
        return INCOME_CATEGORIES.includes(entry.category) ? sum + entry.amount : sum;
      }, 0),
    [expenses]
  );

  const expenseTotal = useMemo(
    () =>
      expenses.reduce((sum, entry) => {
        return INCOME_CATEGORIES.includes(entry.category) ? sum : sum + entry.amount;
      }, 0),
    [expenses]
  );

  return {
    expenses,
    stats,
    incomeTotal,
    expenseTotal,
    addExpense,
    updateExpense,
    deleteExpense,
    replaceExpenses
  };
};

export type UseExpensesReturn = ReturnType<typeof useExpenses>;
