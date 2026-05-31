import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Expenses } from './pages/expenses/expenses';
import { AddExpense } from './pages/add-expense/add-expense';
import { Budget } from './pages/budget/budget';
import { Favorites } from './pages/favorites/favorites';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard },
  { path: 'expenses', component: Expenses },
  { path: 'add-expense', component: AddExpense },
  { path: 'expenses/edit/:id', component: AddExpense },
  { path: 'budget', component: Budget },
  { path: 'favorites', component: Favorites },
];
