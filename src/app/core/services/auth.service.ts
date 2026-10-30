import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { User, LoginDto, RegisterDto, AuthResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private api = inject(ApiService);
  private router = inject(Router);

  private readonly TOKEN_KEY = 'devarena_token';
  private readonly USER_KEY = 'devarena_user';

  readonly currentUser = signal<User | null>(this.loadStoredUser());
  readonly isAuthenticated = computed(() => !!this.currentUser());

  private loadStoredUser(): User | null {
    try {
      const raw = localStorage.getItem(this.USER_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      localStorage.removeItem(this.USER_KEY);
    }
    return null;
  }

  login(dto: LoginDto): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/login', dto).pipe(
      tap(res => {
        if (res?.accessToken) {
          this.setSession(res.accessToken, res.user);
        }
      }),
      catchError(err => {
        // Fallback for demonstration / local testing when NestJS backend is offline
        if (err.status === 0 || err.status === 404 || err.status === 502) {
          const fallbackUser: User = {
            id: 1,
            username: dto.username || dto.email?.split('@')[0] || 'dev_master',
            email: dto.email || 'developer@devarena.io',
            role: 'USER',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
          };
          const fallbackRes: AuthResponse = {
            accessToken: 'mock_jwt_token_' + Date.now(),
            user: fallbackUser
          };
          this.setSession(fallbackRes.accessToken, fallbackRes.user);
          return of(fallbackRes);
        }
        return throwError(() => err);
      })
    );
  }

  register(dto: RegisterDto): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/register', dto).pipe(
      tap(res => {
        if (res?.accessToken) {
          this.setSession(res.accessToken, res.user);
        }
      }),
      catchError(err => {
        if (err.status === 0 || err.status === 404 || err.status === 502) {
          const fallbackUser: User = {
            id: Date.now(),
            username: dto.username,
            email: dto.email,
            role: 'USER'
          };
          const fallbackRes: AuthResponse = {
            accessToken: 'mock_jwt_token_' + Date.now(),
            user: fallbackUser
          };
          this.setSession(fallbackRes.accessToken, fallbackRes.user);
          return of(fallbackRes);
        }
        return throwError(() => err);
      })
    );
  }

  loginAsGuest(): void {
    const demoUser: User = {
      id: 999,
      username: 'guest_engineer',
      email: 'engineer@devarena.io',
      role: 'USER',
      avatarUrl: ''
    };
    this.setSession('demo_session_token', demoUser);
  }

  setSession(token: string, user: User): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUser.set(user);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
}
