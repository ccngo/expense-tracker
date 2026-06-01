import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RecurringExpense } from '../models/recurring-expense';

@Injectable({ providedIn: 'root' })
export class RecurringService {
  private http = inject(HttpClient);
  private url = '/api/recurring';

  getAll() {
    return this.http.get<RecurringExpense[]>(this.url);
  }

  create(recurring: Omit<RecurringExpense, 'id' | 'lastExecutedDate'>) {
    return this.http.post<RecurringExpense>(this.url, recurring);
  }

  update(id: number, recurring: RecurringExpense) {
    return this.http.put<void>(`${this.url}/${id}`, recurring);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
