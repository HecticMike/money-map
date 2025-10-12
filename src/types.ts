export type ExpenseCategory =
  | 'housing'
  | 'utilities'
  | 'food'
  | 'transportation'
  | 'healthcare'
  | 'entertainment'
  | 'travel'
  | 'savings'
  | 'other';

export interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseDraft {
  amount: number;
  category: ExpenseCategory;
  date: string;
  note: string;
}

export interface ExpenseStats {
  total: number;
  byCategory: Record<ExpenseCategory, number>;
  monthlyTotals: Array<{ month: string; total: number }>;
}

export const CATEGORY_META: Record<
  ExpenseCategory,
  {
    label: string;
    color: string;
  }
> = {
  housing: {
    label: 'Housing',
    color: '#6366f1'
  },
  utilities: {
    label: 'Utilities',
    color: '#facc15'
  },
  food: {
    label: 'Food & Dining',
    color: '#f97316'
  },
  transportation: {
    label: 'Transportation',
    color: '#22d3ee'
  },
  healthcare: {
    label: 'Healthcare',
    color: '#10b981'
  },
  entertainment: {
    label: 'Entertainment',
    color: '#ec4899'
  },
  travel: {
    label: 'Travel',
    color: '#9333ea'
  },
  savings: {
    label: 'Savings & Investments',
    color: '#14b8a6'
  },
  other: {
    label: 'Other',
    color: '#94a3b8'
  }
};
