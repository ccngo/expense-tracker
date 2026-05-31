import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BudgetPlan, BudgetSummary } from '../models/budget-plan';

@Injectable({ providedIn: 'root' })
export class BudgetService {
  private http = inject(HttpClient);
  private url = '/api/budgets';

  getAll() {
    return this.http.get<BudgetPlan[]>(this.url);
  }

  getSummary() {
    return this.http.get<BudgetSummary[]>(`${this.url}/summary`);
  }

  create(plan: Omit<BudgetPlan, 'id'>) {
    return this.http.post<BudgetPlan & { replaced: boolean }>(this.url, plan);
  }

  update(id: number, plan: BudgetPlan) {
    return this.http.put<void>(`${this.url}/${id}`, plan);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
