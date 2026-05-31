export type BudgetType = 'Overall' | 'CreditCard' | 'Food' | 'Transport' | 'Housing' | 'Health' | 'Entertainment' | 'Other';
export type BudgetPeriod = 'Weekly' | 'Monthly';

export interface BudgetPlan {
  id: number;
  type: BudgetType;
  period: BudgetPeriod;
  limit: number;
}

export interface BudgetSummary {
  id: number;
  type: BudgetType;
  period: BudgetPeriod;
  limit: number;
  spent: number;
  percentage: number;
}
