import { Category, PaymentMethod } from './expense';

export type RecurringFrequency = 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';

export interface RecurringExpense {
  id: number;
  title: string;
  amount: number;
  category: Category;
  paymentMethod: PaymentMethod | null;
  frequency: RecurringFrequency;
  startDate: string;
  endDate: string | null;
  lastExecutedDate: string | null;
}
