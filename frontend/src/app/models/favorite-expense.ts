import { Category, PaymentMethod } from './expense';

export interface FavoriteExpense {
  id: number;
  title: string;
  amount: number;
  category: Category;
  paymentMethod?: PaymentMethod;
}
