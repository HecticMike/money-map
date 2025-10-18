export type ExpenseCategory =
  | 'living_home_rent'
  | 'living_home_utilities'
  | 'living_home_groceries'
  | 'living_home_home_garden'
  | 'mobility_transport_fuel'
  | 'mobility_transport_car_maintenance'
  | 'mobility_transport_car_insurance'
  | 'mobility_transport_travel_commuting'
  | 'personal_health_healthcare'
  | 'personal_health_personal_care'
  | 'personal_health_fitness'
  | 'personal_health_supplements'
  | 'family_education_school_fees'
  | 'family_education_childcare'
  | 'family_education_gifts_celebrations'
  | 'leisure_lifestyle_clothing'
  | 'leisure_lifestyle_eating_out'
  | 'leisure_lifestyle_entertainment'
  | 'leisure_lifestyle_travel_holidays'
  | 'leisure_lifestyle_subscriptions'
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
    { label: string; color: string }
  > = {
    living_home_rent: { label: 'Rent', color: '#6366f1' },
    living_home_utilities: { label: 'Utilities', color: '#facc15' },
    living_home_groceries: { label: 'Groceries', color: '#f97316' },
    living_home_home_garden: { label: 'Home & Garden', color: '#84cc16' },
    mobility_transport_fuel: { label: 'Fuel', color: '#22d3ee' },
    mobility_transport_car_maintenance: { label: 'Car Maintenance', color: '#0ea5e9' },
    mobility_transport_car_insurance: { label: 'Car Insurance', color: '#14b8a6' },
    mobility_transport_travel_commuting: { label: 'Travel & Commuting', color: '#38bdf8' },
    personal_health_healthcare: { label: 'Healthcare', color: '#10b981' },
    personal_health_personal_care: { label: 'Personal Care', color: '#f9a8d4' },
    personal_health_fitness: { label: 'Fitness', color: '#34d399' },
    personal_health_supplements: { label: 'Supplements', color: '#65a30d' },
    family_education_school_fees: { label: 'School Fees', color: '#9333ea' },
    family_education_childcare: { label: 'Childcare', color: '#c084fc' },
    family_education_gifts_celebrations: { label: 'Gifts & Celebrations', color: '#fbbf24' },
    leisure_lifestyle_clothing: { label: 'Clothing', color: '#f472b6' },
    leisure_lifestyle_eating_out: { label: 'Eating Out', color: '#fb923c' },
    leisure_lifestyle_entertainment: { label: 'Entertainment', color: '#ec4899' },
    leisure_lifestyle_travel_holidays: { label: 'Travel & Holidays', color: '#8b5cf6' },
    leisure_lifestyle_subscriptions: { label: 'Subscriptions', color: '#94a3b8' },
    other: { label: 'Other', color: '#94a3b8' },
  };
