import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface AdminUser {
  id: string;
  username: string;
  nome: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = '/api/auth';
  // Chaves persistidas no browser para manter sessão após refresh.
  private tokenKey = 'admin_auth_token';
  private userKey = 'admin_auth_user';

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<{ token: string; admin: AdminUser }> {
    return this.http
      .post<{ token: string; admin: AdminUser }>(`${this.baseUrl}/login`, { username, password })
      .pipe(
        tap((res) => {
          // Guarda sessão local no browser.
          localStorage.setItem(this.tokenKey, res.token);
          localStorage.setItem(this.userKey, JSON.stringify(res.admin));
        })
      );
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  getToken(): string {
    return localStorage.getItem(this.tokenKey) || '';
  }

  isAuthenticated(): boolean {
    // Autenticado = existe token guardado.
    return this.getToken().length > 0;
  }

  getAdminUser(): AdminUser | null {
    const raw = localStorage.getItem(this.userKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
}
