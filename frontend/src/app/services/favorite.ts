import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FavoriteExpense } from '../models/favorite-expense';

@Injectable({ providedIn: 'root' })
export class FavoriteService {
  private http = inject(HttpClient);
  private url = '/api/favorites';

  getAll() {
    return this.http.get<FavoriteExpense[]>(this.url);
  }

  create(fav: Omit<FavoriteExpense, 'id'>) {
    return this.http.post<FavoriteExpense>(this.url, fav);
  }

  update(id: number, fav: FavoriteExpense) {
    return this.http.put<void>(`${this.url}/${id}`, fav);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
