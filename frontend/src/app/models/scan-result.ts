import { Category, PaymentMethod } from './expense';

export interface ScanResult {
  title: string | null;
  amount: number | null;
  category: Category | null;
  date: string | null;
  notes: string | null;
  paymentMethod: PaymentMethod | null;
}
