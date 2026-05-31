export type Category = 'Food' | 'Transport' | 'Housing' | 'Health' | 'Entertainment' | 'Other';
export type PaymentMethod = 'Cash' | 'CreditCard' | 'DebitCard' | 'BankTransfer' | 'EWallet';

export interface Expense {
  id: number;
  title: string;
  amount: number;
  category: Category;
  date: string;
  notes?: string;
  paymentMethod?: PaymentMethod;
}
