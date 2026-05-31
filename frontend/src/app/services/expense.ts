import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Expense } from '../models/expense';
import { PagedResult } from '../models/paged-result';

export interface ExpenseQuery {
  search?: string;
  category?: string;
  paymentMethod?: string;
  from?: string;
  to?: string;
  sortBy?: string;
  sortDir?: string;
  page?: number;
  pageSize?: number;
}

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private http = inject(HttpClient);
  private url = '/api/expenses';

  getAll(query: ExpenseQuery = {}) {
    let params = new HttpParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params = params.set(k, String(v));
    });
    return this.http.get<PagedResult<Expense>>(this.url, { params });
  }

  getById(id: number) {
    return this.http.get<Expense>(`${this.url}/${id}`);
  }

  create(expense: Omit<Expense, 'id'>) {
    return this.http.post<Expense>(this.url, expense);
  }

  update(id: number, expense: Expense) {
    return this.http.put<void>(`${this.url}/${id}`, expense);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  export(query: ExpenseQuery = {}) {
    let params = new HttpParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params = params.set(k, String(v));
    });
    return this.http.get(`${this.url}/export`, { params, responseType: 'blob' });
  }
}
