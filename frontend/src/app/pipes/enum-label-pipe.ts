import { Pipe, PipeTransform } from '@angular/core';

export const LABELS: Record<string, string> = {
  // Payment Methods
  Cash: 'Cash',
  CreditCard: 'Credit Card',
  DebitCard: 'Debit Card',
  BankTransfer: 'Bank Transfer',
  EWallet: 'E-Wallet',
  // Categories
  Food: 'Food',
  Transport: 'Transport',
  Housing: 'Housing',
  Health: 'Health',
  Entertainment: 'Entertainment',
  Other: 'Other',
  // Budget Types
  Overall: 'Overall',
  // Budget Periods
  Weekly: 'Weekly',
  Monthly: 'Monthly',
};

export const CATEGORY_ICONS: Record<string, string> = {
  Food: 'restaurant',
  Transport: 'directions_car',
  Housing: 'home',
  Health: 'favorite',
  Entertainment: 'movie',
  Other: 'category',
};

@Pipe({ name: 'enumLabel' })
export class EnumLabelPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '—';
    return LABELS[value] ?? value;
  }
}

@Pipe({ name: 'categoryIcon' })
export class CategoryIconPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return 'category';
    return CATEGORY_ICONS[value] ?? 'category';
  }
}
