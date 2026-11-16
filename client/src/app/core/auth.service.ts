import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface User {
  id?: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

interface AuthResponse {
  token: string;
  user: User;
}

const API = 'https://paint-visualizer-1.onrender.com/api/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  user = signal<User | null>(this.loadUser());

  private loadUser(): User | null {
    const raw = localStorage.getItem('pv_user');
    return raw ? JSON.parse(raw) : null;
  }

  get token(): string | null {
    return localStorage.getItem('pv_token');
  }

  get isLoggedIn(): boolean {
    return this.user() !== null && !!this.token;
  }

  get isAdmin(): boolean {
    return this.user()?.role === 'admin';
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${API}/login`, { email, password })
      .pipe(tap(res => this.saveSession(res)));
  }

  register(name: string, email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${API}/register`, { name, email, password })
      .pipe(tap(res => this.saveSession(res)));
  }

  logout() {
    localStorage.removeItem('pv_user');
    localStorage.removeItem('pv_token');
    this.user.set(null);
  }

  private saveSession(res: AuthResponse) {
    localStorage.setItem('pv_token', res.token);
    localStorage.setItem('pv_user', JSON.stringify(res.user));
    this.user.set(res.user);
  }
}