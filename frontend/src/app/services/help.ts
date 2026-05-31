import { Injectable, signal } from '@angular/core';

export type HelpTab = 'dashboard' | 'expenses' | 'add-expense' | 'budget' | 'favorites';

export const HELP_CONTENT: Record<HelpTab, { title: string; icon: string; description: string; tips: string[] }> = {
  dashboard: {
    title: 'Dashboard',
    icon: 'dashboard',
    description: 'Your spending overview at a glance.',
    tips: [
      'Total spent, expense count and top category are shown as summary cards.',
      'Budget warnings appear in yellow (80%+) or red (100%+) when limits are breached.',
      'The donut chart breaks down spending by category with percentages.',
      'The bar chart shows your monthly spending trend over the last 6 months.',
    ]
  },
  expenses: {
    title: 'Expenses',
    icon: 'list',
    description: 'View and manage all your recorded expenses.',
    tips: [
      'Use the search box to filter by title keyword.',
      'Filter by category, payment method, or date range.',
      'Click column headers to sort by title, category, amount or date.',
      'Use the paginator at the bottom to navigate through large lists.',
      'Hit Clear to reset all filters at once.',
    ]
  },
  'add-expense': {
    title: 'Add Expense',
    icon: 'add_circle',
    description: 'Record a new expense entry.',
    tips: [
      'Use Quick Fill to autofill from a saved favorite — just pick the date and save.',
      'Payment method is optional but helps with credit card budget tracking.',
      'Notes are optional and for your own reference.',
    ]
  },
  budget: {
    title: 'Budget',
    icon: 'account_balance_wallet',
    description: 'Set spending limits to keep your finances in check.',
    tips: [
      'Overall budget tracks all expenses regardless of payment method.',
      'Credit Card budget only tracks expenses paid by credit card.',
      'If you add a plan with the same type and period, it replaces the existing one.',
      'Warnings appear on the dashboard when you reach 80% or 100% of a limit.',
    ]
  },
  favorites: {
    title: 'Favorites',
    icon: 'star',
    description: 'Save recurring expense templates for quick entry.',
    tips: [
      'Add things you buy regularly like coffee, transport, or subscriptions.',
      'Favorites appear in the Quick Fill menu on the Add Expense page.',
      'Selecting a favorite pre-fills the title, amount, category and payment method.',
      'You still pick the date and can edit any field before saving.',
    ]
  },
};

@Injectable({ providedIn: 'root' })
export class HelpService {
  isOpen = signal(false);
  activeTab = signal<HelpTab>('dashboard');

  open(tab: HelpTab) {
    this.activeTab.set(tab);
    this.isOpen.set(true);
  }

  close() {
    this.isOpen.set(false);
  }
}
