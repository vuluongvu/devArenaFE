import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, IconComponent],
  template: `
    <div class="auth-page-wrapper">
      <div class="auth-card">
        <!-- Logo & Header -->
        <div class="auth-header">
          <div class="auth-logo">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L3 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-9-4z"
                fill="var(--color-accent)"
                opacity="0.16"
                stroke="var(--color-accent)"
                stroke-width="1.8"
              />
              <path
                d="M9 10l-2 2 2 2M15 10l2 2-2 2"
                stroke="var(--color-accent)"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <h1 class="auth-title">Sign in to DevArena</h1>
          <p class="auth-subtitle">Resume your algorithmic practice session</p>
        </div>

        <!-- Error Alert -->
        <div *ngIf="errorMessage" class="auth-alert">
          <app-icon name="alert-circle" [size]="15" customClass="text-hard"></app-icon>
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Login Form -->
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-field">
            <label for="username" class="field-label">Username or Email</label>
            <input
              id="username"
              type="text"
              formControlName="username"
              placeholder="e.g. dev_engineer"
              class="form-input"
              [class.input-error]="isFieldInvalid('username')"
            />
            <span *ngIf="isFieldInvalid('username')" class="field-error-msg">
              Please enter your username or email
            </span>
          </div>

          <div class="form-field">
            <div class="label-row">
              <label for="password" class="field-label">Password</label>
            </div>
            <div class="input-password-wrapper">
              <input
                id="password"
                [type]="showPassword ? 'text' : 'password'"
                formControlName="password"
                placeholder="Enter password"
                class="form-input"
                [class.input-error]="isFieldInvalid('password')"
              />
              <button
                type="button"
                class="toggle-pwd-btn"
                (click)="showPassword = !showPassword"
                [attr.aria-label]="showPassword ? 'Hide password' : 'Show password'"
              >
                <app-icon [name]="showPassword ? 'eye-off' : 'eye'" [size]="14"></app-icon>
              </button>
            </div>
            <span *ngIf="isFieldInvalid('password')" class="field-error-msg">
              Password is required (min 6 characters)
            </span>
          </div>

          <button
            type="submit"
            class="submit-btn"
            [disabled]="loginForm.invalid || isLoading"
          >
            <div *ngIf="isLoading" class="spinner-sm light"></div>
            <span>{{ isLoading ? 'Signing in...' : 'Sign In' }}</span>
          </button>
        </form>

        <div class="auth-divider">
          <span>OR</span>
        </div>

        <!-- 1-Click Instant Demo Login -->
        <button
          type="button"
          class="demo-login-btn"
          (click)="onDemoLogin()"
        >
          <app-icon name="sparkles" [size]="14" customClass="text-accent"></app-icon>
          <span>One-Click Guest Demo Mode</span>
        </button>

        <!-- Footer Switch -->
        <div class="auth-footer">
          <span>Don't have an account?</span>
          <a routerLink="/register" class="auth-link">Create an account</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: calc(100vh - 180px);
      padding: 24px 16px;
    }
    .auth-card {
      width: 100%;
      max-width: 440px;
      background-color: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: 36px 32px;
      box-shadow: var(--shadow-md);
      display: flex;
      flex-direction: column;
      gap: 22px;
    }
    .auth-header {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }
    .auth-logo {
      margin-bottom: 4px;
    }
    .auth-title {
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.025em;
      color: var(--color-text-primary);
    }
    .auth-subtitle {
      font-size: 14px;
      color: var(--color-text-secondary);
    }
    .auth-alert {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 14px;
      background-color: var(--color-hard-bg);
      border: 1px solid var(--color-hard-border);
      border-radius: var(--radius-sm);
      font-size: 13px;
      color: var(--color-hard);
    }
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }
    .form-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .label-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .field-label {
      font-size: 13.5px;
      font-weight: 600;
      color: var(--color-text-secondary);
    }
    .input-password-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }
    .form-input {
      width: 100%;
      height: var(--control-height-md);
      padding: 0 14px;
      background-color: var(--color-bg);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      font-size: 14.5px;
      color: var(--color-text-primary);
      outline: none;
      transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
    }
    .form-input:focus {
      border-color: var(--color-accent);
      box-shadow: 0 0 0 1px var(--color-accent);
    }
    .form-input.input-error {
      border-color: var(--color-hard);
    }
    .toggle-pwd-btn {
      position: absolute;
      right: 12px;
      color: var(--color-text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
    }
    .toggle-pwd-btn:hover {
      color: var(--color-text-primary);
    }
    .field-error-msg {
      font-size: 12px;
      color: var(--color-hard);
    }
    .submit-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      height: var(--control-height-md);
      padding: 0 16px;
      background-color: var(--color-accent);
      color: #FFFFFF;
      font-size: 14px;
      font-weight: 600;
      border-radius: var(--radius-sm);
      transition: background-color var(--transition-fast);
      cursor: pointer;
      margin-top: 4px;
    }
    .submit-btn:hover:not(:disabled) {
      background-color: var(--color-accent-hover);
    }
    .submit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .spinner-sm {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #FFFFFF;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .auth-divider {
      position: relative;
      text-align: center;
      font-size: 11px;
      font-weight: 600;
      color: var(--color-text-muted);
    }
    .auth-divider::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background-color: var(--color-border);
      z-index: 1;
    }
    .auth-divider span {
      position: relative;
      background-color: var(--color-surface);
      padding: 0 10px;
      z-index: 2;
    }
    .demo-login-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 8px 14px;
      background-color: var(--color-sidebar);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      font-size: 12.5px;
      font-weight: 600;
      color: var(--color-text-primary);
      transition: all 0.15s ease;
    }
    .demo-login-btn:hover {
      background-color: var(--color-surface-hover);
      border-color: var(--color-border-hover);
    }
    .auth-footer {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      font-size: 12.5px;
      color: var(--color-text-secondary);
      border-top: 1px solid var(--color-border-subtle);
      padding-top: 14px;
    }
    .auth-link {
      font-weight: 600;
      color: var(--color-accent);
    }
    .auth-link:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  showPassword = false;
  isLoading = false;
  errorMessage = '';

  isFieldInvalid(field: string): boolean {
    const ctrl = this.loginForm.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const { username, password } = this.loginForm.value;
    this.authService.login({ username, password }).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/problems']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Invalid username or password. Please try again.';
      }
    });
  }

  onDemoLogin(): void {
    this.authService.loginAsGuest();
    this.router.navigate(['/problems']);
  }
}
