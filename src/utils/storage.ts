import type { Expense } from '../types';

const EXPENSES_KEY = 'money-map-expenses-v1';

export const readExpensesFromStorage = (): Expense[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(EXPENSES_KEY);
    if (raw == null) return [];
    const parsed = JSON.parse(raw) as Expense[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((expense) => ({
      ...expense,
      id: expense.id ?? crypto.randomUUID(),
      amount: Number(expense.amount),
      date: expense.date ?? new Date().toISOString(),
      createdAt: expense.createdAt ?? expense.date ?? new Date().toISOString(),
      updatedAt: expense.updatedAt ?? expense.date ?? new Date().toISOString()
    }));
  } catch (error) {
    console.warn('Unable to parse expenses from localStorage', error);
    return [];
  }
};

export const writeExpensesToStorage = (expenses: Expense[]): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  } catch (error) {
    console.warn('Unable to persist expenses to localStorage', error);
  }
};

export const clearExpensesStorage = (): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(EXPENSES_KEY);
  } catch (error) {
    console.warn('Unable to clear expenses storage', error);
  }
};

export const hasStoredExpenses = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(EXPENSES_KEY) != null;
};
