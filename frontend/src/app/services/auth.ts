import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private token = signal<string | null>(this.getTokenFromStorage());
  isAuthenticated = computed(() => this.token() !== null && !this.isTokenExpired());

  login(password: string): Observable<{ token: string; expiresAt: string }> {
    return this.http.post<{ token: string; expiresAt: string }>('/api/auth/login', { password })
      .pipe(
        tap(response => {
          localStorage.setItem('auth_token', response.token);
          localStorage.setItem('token_expiry', response.expiresAt);
          this.token.set(response.token);
        })
      );
  }

  hasPassword(): Observable<{ hasPassword: boolean }> {
    return this.http.get<{ hasPassword: boolean }>('/api/settings/has-password');
  }

  setPassword(password: string): Observable<void> {
    return this.http.post<void>('/api/settings/password', { password })
      .pipe(
        tap(() => {
          // After setting password, clear existing token (user will need to log in)
          this.logout();
        })
      );
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('token_expiry');
    this.token.set(null);
  }

  getToken(): string | null {
    return this.token();
  }

  private getTokenFromStorage(): string | null {
    const token = localStorage.getItem('auth_token');
    const expiry = localStorage.getItem('token_expiry');

    if (!token || !expiry) {
      return null;
    }

    if (this.isTokenExpiredString(expiry)) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('token_expiry');
      return null;
    }

    return token;
  }

  private isTokenExpired(): boolean {
    const expiry = localStorage.getItem('token_expiry');
    return !expiry || this.isTokenExpiredString(expiry);
  }

  private isTokenExpiredString(expiryString: string): boolean {
    try {
      const expiryTime = new Date(expiryString).getTime();
      return Date.now() > expiryTime;
    } catch {
      return true;
    }
  }
}
